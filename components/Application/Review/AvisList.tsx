/* eslint-disable react/no-unescaped-entities */
"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  getAllReviewsBySalon,
  removeReviewResponseAction,
  respondToReviewAction,
} from "@/lib/queries/review";
import { getFavoriteCountBySalon } from "@/lib/queries/favorite";

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  photos?: string[];
  isVerified?: boolean;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    image?: string;
  };
  appointment?: {
    id: string;
    date: string;
    prestation: string;
  };
  salonResponse?: string | null;
}

interface PaginatedReviews {
  reviews?: Review[];
  items?: Review[];
  data?: Review[];
  total?: number;
  totalItems?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
  statistics?: ReviewStatistics;
  pagination?: {
    currentPage?: number;
    totalReviews?: number;
    totalPages?: number;
  };
}

interface ReviewStatistics {
  totalReviews?: number;
  averageRating?: number;
  ratingDistribution?: Record<string, number>;
  verifiedReviewsCount?: number;
}

export default function AvisList() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseValues, setResponseValues] = useState<Record<string, string>>(
    {},
  );
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [responseError, setResponseError] = useState<Record<string, string>>(
    {},
  );
  const [statistics, setStatistics] = useState<ReviewStatistics>({});
  const [favoriteCount, setFavoriteCount] = useState<number>(0);

  const pageSize = 10;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const openImage = (url: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatRating = (value?: number) => (value ?? 0).toFixed(1);

  const loadFavoriteCount = async () => {
    try {
      const result = await getFavoriteCountBySalon();
      if (result.ok && result.data) {
        // Vérifier que result.data est un objet et extraire favoritesCount
        if (
          typeof result.data === "object" &&
          "favoritesCount" in result.data
        ) {
          setFavoriteCount(result.data.favoritesCount ?? 0);
        } else if (typeof result.data === "number") {
          setFavoriteCount(result.data);
        } else {
          setFavoriteCount(0);
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement des favoris:", err);
      setFavoriteCount(0);
    }
  };

  const loadReviews = async (pageToLoad = 1) => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getAllReviewsBySalon(session.user.id, {
        page: pageToLoad,
        limit: pageSize,
        sortBy: "recent",
      });

      if (!result.ok || !result.data) {
        throw new Error(result.message || "Impossible de récupérer les avis");
      }

      const data = result.data as PaginatedReviews;
      const list = data.reviews || data.items || data.data;
      setReviews(list ?? []);
      setTotal(
        data.total ??
          data.totalItems ??
          data.statistics?.totalReviews ??
          data.pagination?.totalReviews ??
          null,
      );
      setTotalPages(
        data.totalPages ??
          data.pagination?.totalPages ??
          (data.total && pageSize ? Math.ceil(data.total / pageSize) : null),
      );
      setStatistics(data.statistics ?? {});
      setPage(data.page ?? data.pagination?.currentPage ?? pageToLoad);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const removeResponse = async (reviewId: string) => {
    try {
      setRemovingId(reviewId);
      setResponseError((prev) => ({ ...prev, [reviewId]: "" }));
      const result = await removeReviewResponseAction(reviewId);
      if (!result.ok) {
        throw new Error(result.message || "Impossible de supprimer la réponse");
      }
      await loadReviews(page);
      setExpandedId(null);
      setResponseValues((prev) => ({ ...prev, [reviewId]: "" }));
      setConfirmRemoveId(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setResponseError((prev) => ({ ...prev, [reviewId]: message }));
    } finally {
      setRemovingId(null);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadReviews(1);
      loadFavoriteCount();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const canPrev = useMemo(() => page > 1, [page]);
  const canNext = useMemo(
    () => (totalPages ? page < totalPages : reviews.length === pageSize),
    [page, totalPages, reviews.length],
  );

  const handlePrev = () => {
    if (canPrev) loadReviews(page - 1);
  };

  const handleNext = () => {
    if (canNext) loadReviews(page + 1);
  };

  const toggleResponse = (reviewId: string) => {
    setExpandedId((prev) => (prev === reviewId ? null : reviewId));
    setResponseError((prev) => ({ ...prev, [reviewId]: "" }));
  };

  const handleResponseChange = (reviewId: string, value: string) => {
    setResponseValues((prev) => ({ ...prev, [reviewId]: value }));
  };

  const submitResponse = async (reviewId: string) => {
    const text = responseValues[reviewId]?.trim();
    if (!text) {
      setResponseError((prev) => ({
        ...prev,
        [reviewId]: "La réponse ne peut pas être vide.",
      }));
      return;
    }

    try {
      setSubmittingId(reviewId);
      setResponseError((prev) => ({ ...prev, [reviewId]: "" }));
      const result = await respondToReviewAction(reviewId, text);
      if (!result.ok) {
        throw new Error(result.message || "Impossible d'envoyer la réponse");
      }
      await loadReviews(page);
      setExpandedId(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setResponseError((prev) => ({ ...prev, [reviewId]: message }));
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <section className="w-full pb-10 bg-noir-700">
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
        <div className="w-full flex items-center gap-3 sm:gap-4 mb-4 md:mb-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-tertiary-400 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6l1.5 3.5L17 11l-3.5 1.5L12 16l-1.5-3.5L7 11l3.5-1.5L12 6z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-white font-one tracking-wide uppercase">
              Avis clients
            </h1>
            <p className="text-white/70 text-xs font-one mt-1">
              Consultez et gérez les avis reçus sur votre salon.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/70 text-xs font-one bg-white/5 rounded-lg px-3 py-2 border border-white/10 whitespace-nowrap">
          <span>
            Page {page}
            {totalPages ? ` / ${totalPages}` : ""}
            {total ? ` • ${total} avis` : ""}
          </span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-white/60 text-xs font-one">Total avis</span>
          <span className="text-white text-xl font-one font-semibold">
            {statistics.totalReviews ?? total ?? 0}
          </span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-white/60 text-xs font-one">Note moyenne</span>
          <span className="text-white text-xl font-one font-semibold">
            {formatRating(statistics.averageRating)}
          </span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-white/60 text-xs font-one">Avis vérifiés</span>
          <span className="text-white text-xl font-one font-semibold">
            {statistics.verifiedReviewsCount ?? 0}
          </span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-white/60 text-xs font-one flex items-center gap-1">
            <svg
              className="w-3 h-3 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            Mis en favoris
          </span>
          <span className="text-white text-xl font-one font-semibold">
            {favoriteCount}
          </span>
          <span className="text-white/50 text-[10px] font-one -mt-1">
            clients ont ajouté
          </span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
          <span className="text-white/60 text-xs font-one">Répartition</span>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const value =
                statistics.ratingDistribution?.[star.toString()] ?? 0;
              const max = statistics.totalReviews ?? total ?? 0;
              const width = max > 0 ? Math.min(100, (value / max) * 100) : 0;
              return (
                <div
                  key={star}
                  className="flex items-center gap-2 text-white/70 text-[11px] font-one"
                >
                  <span className="w-3 text-right">{star}</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-tertiary-400"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="w-6 text-right">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0 animate-pulse"></div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded-lg w-32 animate-pulse"></div>
                    <div className="h-3 bg-white/10 rounded-lg w-48 animate-pulse"></div>
                    <div className="h-3 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 ml-2 flex-shrink-0">
                  <div className="h-7 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                  <div className="h-8 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="h-3 bg-white/10 rounded-lg w-full animate-pulse"></div>
                <div className="h-3 bg-white/10 rounded-lg w-5/6 animate-pulse"></div>
                <div className="h-3 bg-white/10 rounded-lg w-4/6 animate-pulse"></div>
              </div>

              <div className="mt-3 h-16 bg-white/10 rounded-lg animate-pulse"></div>

              <div className="mt-3 flex gap-2">
                <div className="w-12 h-12 rounded-lg bg-white/10 animate-pulse"></div>
                <div className="w-12 h-12 rounded-lg bg-white/10 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="w-full rounded-2xl shadow-xl border border-red-500/30 p-8 flex flex-col items-center gap-3 bg-red-500/10">
          <p className="text-red-300 font-one text-sm text-center">{error}</p>
          <button
            onClick={() => loadReviews(page)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg text-xs font-one font-medium border border-red-500/40 transition-all"
          >
            Réessayer
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="h-fit w-full flex bg-noir-700">
          <div className="w-full rounded-2xl shadow-xl border border-white/10 p-10 flex flex-col items-center justify-center gap-6 mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 rounded-full flex items-center justify-center mb-2">
              <svg
                className="w-10 h-10 text-tertiary-400 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6l1.5 3.5L17 11l-3.5 1.5L12 16l-1.5-3.5L7 11l3.5-1.5L12 6z"
                />
              </svg>
            </div>
            <h2 className="text-white font-one text-xl text-center">
              Aucun avis pour le moment
            </h2>
            <p className="text-white/60 font-two text-xs text-center max-w-md">
              Dès qu'un client laissera un avis, il s'affichera ici. Encouragez
              vos clients à partager leur expérience.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => loadReviews(1)}
                className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-one font-medium border border-white/20 transition-colors"
              >
                Rafraîchir
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-2xl border border-white/20 hover:border-tertiary-400/50 transition-all duration-300 shadow-xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {review.author?.image ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={review.author.image}
                        alt={review.author.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-300 font-semibold text-sm">
                        {review.author?.name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium text-sm font-one truncate">
                        {review.author?.name || "Client anonyme"}
                      </p>
                      {review.isVerified && (
                        <span className="bg-green-500/20 border border-green-500/50 rounded-full px-2 py-0.5 flex items-center gap-1">
                          <svg
                            className="w-3 h-3 text-green-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-green-400 text-xs font-one">
                            Vérifié
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-xs font-one mt-1 line-clamp-2">
                      {review.title}
                    </p>
                    <p className="text-white/50 text-xs font-one mt-1">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 ml-2 flex-shrink-0">
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                    </svg>
                    <span className="text-yellow-300 font-semibold text-sm font-one">
                      {formatRating(review.rating)}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleResponse(review.id)}
                    className="cursor-pointer px-3 py-1 text-xs font-one rounded-lg border border-white/20 text-white bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {expandedId === review.id
                      ? "Fermer"
                      : review.salonResponse
                        ? "Modifier la réponse"
                        : "Répondre"}
                  </button>
                </div>
              </div>

              {review.comment && (
                <p className="text-white/70 text-sm mt-3 font-one leading-relaxed">
                  {review.comment}
                </p>
              )}

              {review.appointment && (
                <div className="mt-3 bg-tertiary-500/10 border border-tertiary-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-tertiary-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-tertiary-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-tertiary-400 text-xs font-semibold font-one mb-1">
                        RDV : {review.appointment.prestation}
                      </p>
                      <p className="text-white/70 text-xs font-one">
                        {new Date(review.appointment.date).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {review.photos && review.photos.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {review.photos.map((image, idx) => (
                    <div
                      key={idx}
                      className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:border-blue-400/50 transition-colors"
                      onClick={() => openImage(image)}
                    >
                      <Image
                        src={image}
                        alt={`Review image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {review.salonResponse && (
                <div className="mt-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-blue-300 text-xs font-semibold font-one mb-1">
                        Réponse du salon
                      </p>
                      <p className="text-white/70 text-sm font-one">
                        {review.salonResponse}
                      </p>
                    </div>
                    <button
                      onClick={() => setConfirmRemoveId(review.id)}
                      disabled={removingId === review.id}
                      className="cursor-pointer px-3 py-1 text-[11px] font-one rounded-lg border border-red-400/50 text-red-200 bg-red-500/10 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {removingId === review.id
                        ? "Suppression..."
                        : "Supprimer"}
                    </button>
                  </div>
                  {responseError[review.id] && (
                    <p className="text-red-300 text-[11px] font-one mt-2">
                      {responseError[review.id]}
                    </p>
                  )}
                </div>
              )}

              {expandedId === review.id && (
                <div className="mt-3 bg-white/5 border border-white/15 rounded-lg p-3 space-y-2">
                  <p className="text-white/80 text-xs font-one">
                    {review.salonResponse
                      ? "Modifier votre réponse"
                      : "Ajouter une réponse"}
                  </p>
                  <textarea
                    value={
                      responseValues[review.id] ?? review.salonResponse ?? ""
                    }
                    onChange={(e) =>
                      handleResponseChange(review.id, e.target.value)
                    }
                    placeholder="Répondez au client ici..."
                    className="w-full min-h-[90px] rounded-lg bg-noir-700/60 border border-white/15 text-white text-sm p-3 focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400"
                  />
                  {responseError[review.id] && (
                    <p className="text-red-400 text-xs font-one">
                      {responseError[review.id]}
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleResponse(review.id)}
                      className="cursor-pointer px-3 py-2 text-xs font-one rounded-lg border border-white/20 text-white bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => submitResponse(review.id)}
                      disabled={
                        submittingId === review.id || removingId === review.id
                      }
                      className="cursor-pointer px-3 py-2 text-xs font-one rounded-lg border border-tertiary-500/50 bg-tertiary-500/80 hover:bg-tertiary-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingId === review.id ? "Envoi..." : "Publier"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            onClick={handlePrev}
            disabled={!canPrev}
            className="cursor-pointer px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-one font-medium border border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext}
            className="cursor-pointer px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-one font-medium border border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}

      {confirmRemoveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-noir-800 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-white font-one text-lg mb-2">
              Supprimer la réponse ?
            </h3>
            <p className="text-white/70 text-sm font-one mb-4">
              Cette action retirera votre réponse de l'avis. Vous pourrez en
              publier une nouvelle plus tard.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmRemoveId(null)}
                className="cursor-pointer px-4 py-2 text-sm font-one rounded-lg border border-white/20 text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => removeResponse(confirmRemoveId)}
                disabled={removingId === confirmRemoveId}
                className="cursor-pointer px-4 py-2 text-sm font-one rounded-lg border border-red-500/50 text-white bg-red-500/80 hover:bg-red-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {removingId === confirmRemoveId
                  ? "Suppression..."
                  : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
