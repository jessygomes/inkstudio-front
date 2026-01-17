"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getRecentReviewsBySalon } from "@/lib/queries/review";
import { useScrollLock } from "@/lib/hook/useScrollLock";
import ReviewDetailsPanel from "./ReviewDetailsPanel";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  photos: string[];
  isVerified: boolean;
  createdAt: string;
  salonResponse?: string | null;
  salonRespondedAt?: string | null;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  appointment?: {
    id: string;
    date: string;
    prestation: string;
  };
}

export default function RecentReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useScrollLock(!!selectedReview);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getRecentReviewsBySalon();

        if (result.ok && result.data) {
          // Le backend retourne un objet avec { error, reviews, message }
          const responseData = Array.isArray(result.data)
            ? result.data[0]
            : result.data;

          if (
            responseData &&
            typeof responseData === "object" &&
            "reviews" in responseData &&
            Array.isArray(responseData.reviews)
          ) {
            setReviews(responseData.reviews);
          } else if (Array.isArray(result.data)) {
            setReviews(result.data);
          } else {
            setReviews([]);
          }
        } else {
          setError(result.message || "Impossible de charger les avis");
        }
      } catch (err) {
        setError("Erreur lors du chargement des avis");
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleOpenReview = (review: Review) => {
    setSelectedReview(review);
  };

  const handleCloseReview = () => {
    setSelectedReview(null);
  };

  const handleResponseSent = () => {
    // Recharger les avis après une réponse
    const fetchReviews = async () => {
      try {
        const result = await getRecentReviewsBySalon();
        if (result.ok && result.data) {
          const responseData = Array.isArray(result.data)
            ? result.data[0]
            : result.data;
          if (
            responseData &&
            typeof responseData === "object" &&
            "reviews" in responseData &&
            Array.isArray(responseData.reviews)
          ) {
            setReviews(responseData.reviews);
            // Mettre à jour la review sélectionnée
            const updated = responseData.reviews.find(
              (r: Review) => r.id === selectedReview?.id,
            );
            if (updated) {
              setSelectedReview(updated);
            }
          }
        }
      } catch (err) {
        console.error("Erreur lors du rechargement:", err);
      }
    };
    fetchReviews();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-noir-700 rounded-xl border border-white/20 p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white font-one">
            Derniers avis
          </h3>
          <div className="w-4 h-4 border-2 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-slate-300/10 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-noir-700 rounded-xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <svg
              className="w-8 h-8 text-red-400 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-white/60 text-sm font-one">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="h-[550px] bg-noir-700 rounded-xl border border-white/20 p-4 overflow-y-auto custom-scrollbar shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white font-one">
            Derniers avis
          </h3>
          <div className="px-2 py-1 bg-tertiary-500/20 text-tertiary-400 rounded-lg text-xs font-medium border border-tertiary-500/50">
            0
          </div>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Aucun avis récent</p>
          <p className="text-gray-500 text-xs mt-1">
            Les avis de vos clients apparaîtront ici
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[550px] bg-noir-700 rounded-xl border border-white/10 p-6 overflow-y-auto custom-scrollbar shadow-2xl relative lg:overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h3 className="text-white font-semibold font-one">Derniers avis</h3>
          <p className="text-white/60 text-xs font-one">
            {reviews.length} avis reçus récemment
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-2">
        {reviews.map((review) => (
          <div
            key={review.id}
            onClick={() => handleOpenReview(review)}
            className={`cursor-pointer border rounded-lg p-4 hover:bg-white/5 transition-all duration-200 ${
              selectedReview?.id === review.id
                ? "bg-blue-500/10 border-blue-500/50"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-start justify-between">
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
                  <p className="text-white/70 text-xs font-one truncate">
                    {review.title}
                  </p>
                  <p className="text-white/50 text-xs font-one mt-1">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-3 py-1.5 flex items-center gap-2 ml-2 flex-shrink-0">
                <svg
                  className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                </svg>
                <span className="text-yellow-300 font-semibold text-sm font-one">
                  {review.rating ? review.rating.toFixed(1) : "0.0"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Panel de détails */}
      {selectedReview && (
        <>
          {/* Version Desktop */}
          <div className="hidden lg:block absolute inset-0 z-50">
            <ReviewDetailsPanel
              selectedReview={selectedReview}
              onClose={handleCloseReview}
              onResponseSent={handleResponseSent}
            />
          </div>
          {/* Version Mobile */}
          <div className="lg:hidden fixed inset-0 z-50 bg-noir-700 overflow-hidden">
            <ReviewDetailsPanel
              selectedReview={selectedReview}
              onClose={handleCloseReview}
              onResponseSent={handleResponseSent}
            />
          </div>
        </>
      )}
    </div>
  );
}
