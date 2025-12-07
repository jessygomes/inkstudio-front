"use client";
import Image from "next/image";
import { useState } from "react";
import { respondToReviewAction } from "@/lib/queries/review";
import { openImageInNewTab } from "@/lib/utils/openImage";
import { toast } from "sonner";

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

interface ReviewDetailsPanelProps {
  selectedReview: Review;
  onClose: () => void;
  onResponseSent: () => void;
}

export default function ReviewDetailsPanel({
  selectedReview,
  onClose,
  onResponseSent,
}: ReviewDetailsPanelProps) {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!response.trim()) {
      toast.error("Veuillez entrer une réponse");
      return;
    }

    try {
      setIsLoading(true);

      const result = await respondToReviewAction(
        selectedReview.id,
        response.trim()
      );

      if (result.ok) {
        toast.success(result.message || "Réponse publiée avec succès");
        setResponse("");
        onResponseSent();
      } else {
        toast.error(result.message || "Erreur lors de la publication");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-gradient-to-br from-noir-500/90 to-noir-500/85 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl h-full flex flex-col">
      {/* Header */}
      <div className="relative p-4 border-b border-white/10 bg-gradient-to-r rounded-t-xl from-noir-700/80 to-noir-500/80">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-transparent"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedReview.author?.image ? (
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={selectedReview.author.image}
                  alt={selectedReview.author.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-300 font-semibold text-sm">
                  {selectedReview.author?.name?.charAt(0) || "?"}
                </span>
              </div>
            )}
            <div>
              <h4 className="text-lg font-bold font-one text-white tracking-wide">
                {selectedReview.author?.name || "Client anonyme"}
              </h4>
              <div className="flex items-center gap-2">
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded px-2 py-0.5 flex items-center gap-1">
                  <svg
                    className="w-3 h-3 text-yellow-400 fill-yellow-400"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                  </svg>
                  <span className="text-yellow-300 font-semibold text-xs font-one">
                    {selectedReview.rating.toFixed(1)}
                  </span>
                </div>
                {selectedReview.isVerified && (
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
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <svg
              className="w-5 h-5 text-white/70 group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* Titre et commentaire */}
        {selectedReview.title && (
          <div>
            <h5 className="text-white font-semibold font-one mb-2">
              {selectedReview.title}
            </h5>
          </div>
        )}

        {selectedReview.comment && (
          <div className="bg-gradient-to-r from-white/8 to-white/4 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
            <p className="text-white/70 text-sm font-one leading-relaxed">
              {selectedReview.comment}
            </p>
            <p className="text-white/50 text-xs font-one mt-2">
              {formatDate(selectedReview.createdAt)}
            </p>
          </div>
        )}

        {/* Appointment Info */}
        {selectedReview.appointment && (
          <div className="bg-gradient-to-r from-tertiary-500/10 to-tertiary-500/10 rounded-xl p-3 border border-tertiary-500/30">
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
                  RDV : {selectedReview.appointment.prestation}
                </p>
                <p className="text-white/70 text-xs font-one">
                  {new Date(selectedReview.appointment.date).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Images */}
        {selectedReview.photos && selectedReview.photos.length > 0 && (
          <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
            <h5 className="text-white font-one text-sm mb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Photos
            </h5>
            <div className="flex gap-2 flex-wrap">
              {selectedReview.photos.map((image, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:border-blue-400/50 transition-colors"
                  onClick={() => openImageInNewTab(image)}
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
          </div>
        )}

        {/* Réponse existante */}
        {selectedReview.salonResponse && (
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/10 rounded-xl p-3 border border-blue-500/30">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-blue-300 text-xs font-semibold font-one mb-1">
                  Réponse du salon
                </p>
                <p className="text-white/70 text-sm font-one">
                  {selectedReview.salonResponse}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de réponse */}
        {!selectedReview.salonResponse && (
          <form onSubmit={handleSubmitResponse} className="space-y-3">
            <div>
              <label className="block text-white/80 text-xs font-one mb-2">
                Votre réponse
              </label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Écrivez votre réponse à cet avis..."
                disabled={isLoading}
                rows={4}
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-tertiary-500/50 focus:ring-2 focus:ring-tertiary-500/20 transition-colors disabled:opacity-50 font-one resize-none"
              />
              <p className="text-white/40 text-xs font-one mt-1">
                {response.length} caractères
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !response.trim()}
              className="cursor-pointer w-full py-2 px-4 bg-gradient-to-r from-tertiary-500 to-tertiary-400 hover:from-tertiary-500 hover:to-tertiary-500 text-white rounded-lg transition-all font-medium font-one text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi...
                </>
              ) : (
                <p>Publier</p>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 bg-white/5 rounded-b-xl">
        <button
          onClick={onClose}
          className="cursor-pointer w-full py-2 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one"
        >
          Retour à la liste
        </button>
      </div>
    </div>
  );
}
