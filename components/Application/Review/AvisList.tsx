"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import DashboardButton from "@/components/Shared/DashboardButton";
import { useSession } from "next-auth/react";
import {
  getAllReviewsBySalon,
  removeReviewResponseAction,
  respondToReviewAction,
} from "@/lib/queries/review";
import { getFavoriteCountBySalon } from "@/lib/queries/favorite";
import { Star, Heart, BadgeCheck, MessageSquare, CalendarDays, RefreshCw, Trash2, Send, LoaderCircle, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [favoriteCount, setFavoriteCount] = useState<number | null>(null);

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
      if (result.ok && result.data != null) {
        // Vérifier que result.data est un objet et extraire favoritesCount
        if (
          typeof result.data === "object" &&
          "favoritesCount" in result.data
        ) {
          setFavoriteCount(result.data.favoritesCount ?? 0);
        } else if (typeof result.data === "number") {
          setFavoriteCount(result.data);
        } else {
          setFavoriteCount(null);
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement des favoris:", err);
      setFavoriteCount(null);
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
    if (submittingId || removingId) return;
    const text = (responseValues[reviewId] ?? reviews.find((review) => review.id === reviewId)?.salonResponse ?? "").trim();
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
    <section className="w-full space-y-3 pb-10">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-white font-one">Avis clients</h1>
        <button type="button" onClick={() => loadReviews(page)} disabled={loading || Boolean(submittingId || removingId)} aria-label="Actualiser" title="Actualiser" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:border-tertiary-400/40 hover:text-white disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""} aria-hidden="true" /></button>
      </header>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-3xl font-semibold text-white font-one">{loading || error || statistics.averageRating == null ? "—" : formatRating(statistics.averageRating)}<span className="ml-1 text-sm font-normal text-white/35">/ 5</span></p>
            <div>
              <div className="flex gap-0.5 text-tertiary-400" aria-hidden="true">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} className={!loading && !error && star <= Math.round(statistics.averageRating ?? 0) ? "fill-current" : "text-white/15"} />)}</div>
              <p className="mt-1 text-[11px] text-white/45 font-two">Note moyenne du salon</p>
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-white/8 pt-3">
            <div><dt className="text-[10px] uppercase tracking-[0.12em] text-white/45 font-one">Avis reçus</dt><dd className="mt-0.5 text-base font-semibold text-white font-one">{loading || error ? "—" : statistics.totalReviews ?? total ?? "—"}</dd></div>
            <div><dt className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-white/45 font-one"><BadgeCheck size={12} aria-hidden="true" />Vérifiés</dt><dd className="mt-0.5 text-base font-semibold text-white font-one">{loading || error ? "—" : statistics.verifiedReviewsCount ?? "—"}</dd></div>
            <div><dt className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-white/45 font-one"><Heart size={12} aria-hidden="true" />Favoris</dt><dd className="mt-0.5 text-base font-semibold text-white font-one">{favoriteCount ?? "—"}</dd></div>
          </dl>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/45 font-one">Répartition des notes</h2>
          <div className="mt-3 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = statistics.ratingDistribution?.[String(star)];
              const reviewTotal = statistics.totalReviews ?? total ?? 0;
              const width = reviewTotal > 0 && count != null ? Math.min(100, count / reviewTotal * 100) : 0;
              return <div key={star} className="flex items-center gap-3 text-xs font-one" aria-label={`${star} étoiles : ${loading || error || count == null ? "non disponible" : count + " avis"}`}>
                <span className="flex w-7 items-center gap-1 text-white/60">{star}<Star size={12} aria-hidden="true" /></span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-tertiary-400 transition-all" style={{ width: loading || error ? "0%" : `${width}%` }} /></div>
                <span className="w-8 text-right tabular-nums text-white/45">{loading || error ? "—" : count ?? "—"}</span>
              </div>;
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-white font-one">Derniers avis</h2>
        <p className="text-xs text-white/45 font-two">Du plus récent au plus ancien</p>
      </div>

      {loading ? (
        <div role="status" aria-label="Chargement des avis" className="space-y-2.5">{[0, 1, 2].map((index) => <div key={index} aria-hidden="true" className="animate-pulse space-y-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4"><div className="flex items-center gap-3"><div className="size-9 rounded-xl bg-white/10" /><div className="h-4 w-32 rounded bg-white/10" /></div><div className="h-4 w-3/4 rounded bg-white/5" /><div className="h-4 w-1/2 rounded bg-white/5" /></div>)}</div>
      ) : error ? (
        <div role="alert" className="rounded-[22px] border border-red-400/20 bg-red-500/5 p-6"><p className="text-sm text-red-300 font-one">{error}</p><DashboardButton type="button" onClick={() => loadReviews(page)} variant="secondary" className="mt-4 !min-w-0 min-h-11">Réessayer</DashboardButton></div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center rounded-[22px] border border-dashed border-white/15 p-10 text-center"><MessageSquare size={30} className="mb-4 text-tertiary-400/60" aria-hidden="true" /><h3 className="text-base font-semibold text-white font-one">Vos premiers avis apparaîtront ici</h3><p className="mt-2 max-w-md text-sm leading-6 text-white/45 font-two">Invitez vos clients à partager leur expérience après leur rendez-vous.</p></div>
      ) : (
        <div className="space-y-2.5">
          {reviews.map((review) => {
            const busy = Boolean(submittingId || removingId);
            const draft = responseValues[review.id] ?? review.salonResponse ?? "";
            return (
              <article key={review.id} className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-3.5 transition-colors hover:border-white/15 sm:p-4">
                <header className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {review.author?.image ? <Image src={review.author.image} alt="" width={36} height={36} className="size-9 shrink-0 rounded-xl object-cover" /> : <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/20 bg-tertiary-500/10 text-sm font-semibold text-tertiary-400">{review.author?.name?.charAt(0).toUpperCase() || "?"}</span>}
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm font-semibold text-white font-one"><span className="break-words">{review.author?.name || "Client anonyme"}</span>{review.isVerified && <span title="Avis vérifié" className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300"><BadgeCheck size={11} aria-hidden="true" />Vérifié</span>}</p>
                      <time dateTime={review.createdAt} className="block text-[11px] text-white/40 font-two">{formatDate(review.createdAt)}</time>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-tertiary-400/25 bg-tertiary-500/10 px-2.5 py-1 text-xs font-semibold text-tertiary-400 font-one"><Star size={12} className="fill-current" aria-hidden="true" />{formatRating(review.rating)}</span>
                </header>

                {review.title && <h3 className="mt-3 break-words text-sm font-semibold text-white font-one">{review.title}</h3>}
                {review.comment && <p className="mt-1.5 whitespace-pre-wrap break-words text-[13px] leading-6 text-white/70 font-two">{review.comment}</p>}
                {review.photos && review.photos.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{review.photos.map((photo, index) => <DashboardButton type="button" key={`${photo}-${index}`} onClick={() => openImage(photo)} aria-label={`Ouvrir la photo ${index + 1} dans un nouvel onglet`} variant="secondary" className="relative !min-w-0 size-16 !p-0 overflow-hidden !rounded-xl focus-visible:outline-2 focus-visible:outline-tertiary-400 sm:size-20"><Image src={photo} alt={`Photo jointe à l’avis, ${index + 1}`} fill sizes="80px" className="object-cover" /></DashboardButton>)}</div>}
                {review.appointment && <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-white/40 font-two"><CalendarDays size={12} aria-hidden="true" /><span>{review.appointment.prestation}</span><span aria-hidden="true">·</span><span>RDV du {formatDate(review.appointment.date)}</span></p>}

                {review.salonResponse && expandedId !== review.id && <div className="mt-3 rounded-xl border-l-2 border-tertiary-400/40 bg-white/[0.03] px-3 py-2.5"><p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-tertiary-400 font-one"><MessageSquare size={12} aria-hidden="true" />Votre réponse</p><p className="whitespace-pre-wrap break-words text-[13px] leading-6 text-white/65 font-two">{review.salonResponse}</p></div>}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3">
                  <span className={`text-[11px] font-two ${review.salonResponse ? "text-white/40" : "text-tertiary-400/80"}`}>{review.salonResponse ? "Réponse publiée" : "En attente de votre réponse"}</span>
                  <div className="flex flex-wrap gap-2">
                    {review.salonResponse && <DashboardButton type="button" disabled={busy} onClick={() => setConfirmRemoveId(review.id)} variant="danger" className="!min-w-0 !min-h-9 !rounded-xl !px-3 !py-1.5 !text-xs"><Trash2 size={13} aria-hidden="true" />Supprimer</DashboardButton>}
                    <DashboardButton type="button" disabled={busy} onClick={() => toggleResponse(review.id)} aria-expanded={expandedId === review.id} aria-controls={`response-${review.id}`} variant="secondary" className="!min-w-0 !min-h-9 !rounded-xl !px-3 !py-1.5 !text-xs"><MessageSquare size={13} aria-hidden="true" />{expandedId === review.id ? "Fermer" : review.salonResponse ? "Modifier" : "Répondre"}</DashboardButton>
                  </div>
                </div>
                {expandedId === review.id && <form id={`response-${review.id}`} onSubmit={(event) => { event.preventDefault(); void submitResponse(review.id); }} className="mt-4 space-y-3 rounded-2xl border border-tertiary-400/20 bg-black/15 p-4">
                  <label htmlFor={`draft-${review.id}`} className="block text-sm font-medium text-white font-one">{review.salonResponse ? "Modifier votre réponse" : "Répondre au client"}</label>
                  <p className="text-xs text-white/45 font-two">Votre réponse sera publiée sous cet avis.</p>
                  <textarea id={`draft-${review.id}`} autoFocus disabled={busy} value={draft} onChange={(event) => handleResponseChange(review.id, event.target.value)} rows={4} placeholder="Remerciez votre client et répondez à ses remarques…" aria-invalid={Boolean(responseError[review.id])} aria-describedby={responseError[review.id] ? `response-error-${review.id}` : undefined} className="w-full resize-y rounded-xl border border-white/10 bg-black/15 px-3.5 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 font-two" />
                  <div className="flex flex-wrap justify-end gap-2"><DashboardButton type="button" disabled={busy} onClick={() => toggleResponse(review.id)} variant="secondary" className="!min-w-0 min-h-11">Annuler</DashboardButton><DashboardButton type="submit" disabled={busy || !draft.trim()} className="!min-w-0 min-h-11">{submittingId === review.id ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Send size={14} aria-hidden="true" />}{submittingId === review.id ? "Publication…" : "Publier la réponse"}</DashboardButton></div>
                </form>}
                {responseError[review.id] && <p id={`response-error-${review.id}`} role="alert" className="mt-3 text-xs text-red-300 font-two">{responseError[review.id]}</p>}
              </article>
            );
          })}
        </div>
      )}

      {!loading && !error && reviews.length > 0 && <nav aria-label="Pagination des avis" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 p-4"><p role="status" className="text-xs text-white/50 font-one">Page {page}{totalPages ? ` sur ${totalPages}` : ""}{total != null ? ` · ${total} avis` : ""}</p><div className="flex gap-2"><DashboardButton type="button" onClick={handlePrev} disabled={!canPrev || Boolean(submittingId || removingId)} variant="secondary" className="!min-w-0 min-h-11"><ChevronLeft size={15} aria-hidden="true" />Précédent</DashboardButton><DashboardButton type="button" onClick={handleNext} disabled={!canNext || Boolean(submittingId || removingId)} variant="secondary" className="!min-w-0 min-h-11">Suivant<ChevronRight size={15} aria-hidden="true" /></DashboardButton></div></nav>}

      {confirmRemoveId && <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm"><div role="alertdialog" aria-modal="true" aria-labelledby="remove-response-title" aria-describedby="remove-response-description" className="w-full max-w-md rounded-[22px] border border-white/10 bg-[#181818] p-6 shadow-2xl"><h3 id="remove-response-title" className="text-lg font-semibold text-white font-one">Supprimer votre réponse ?</h3><p id="remove-response-description" className="mt-2 text-sm leading-6 text-white/55 font-two">Votre réponse sera retirée de cet avis. Vous pourrez en publier une nouvelle plus tard.</p>{responseError[confirmRemoveId] && <p role="alert" className="mt-3 text-sm text-red-300">{responseError[confirmRemoveId]}</p>}<div className="mt-5 flex justify-end gap-2"><DashboardButton type="button" autoFocus disabled={Boolean(removingId)} onClick={() => setConfirmRemoveId(null)} variant="secondary" className="!min-w-0 min-h-11">Annuler</DashboardButton><DashboardButton type="button" onClick={() => removeResponse(confirmRemoveId)} disabled={Boolean(removingId)} variant="danger" className="!min-w-0 min-h-11">{removingId ? "Suppression…" : "Supprimer"}</DashboardButton></div></div></div>}
    </section>
  );
}
