"use client";
import { useState } from "react";
import { respondToReviewAction } from "@/lib/queries/review";
import { toast } from "sonner";

interface ReviewResponseModalProps {
  reviewId: string;
  isOpen: boolean;
  onClose: () => void;
  onResponseSent: () => void;
}

export default function ReviewResponseModal({
  reviewId,
  isOpen,
  onClose,
  onResponseSent,
}: ReviewResponseModalProps) {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!response.trim()) {
      toast.error("Veuillez entrer une réponse");
      return;
    }

    try {
      setIsLoading(true);

      const result = await respondToReviewAction(reviewId, response.trim());

      if (result.ok) {
        toast.success(result.message || "Réponse publiée avec succès");
        setResponse("");
        onResponseSent();
        onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-noir-700 rounded-xl border border-white/20 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-noir-700/80 to-noir-500/80 flex items-center justify-between sticky top-0">
          <h3 className="text-white font-semibold font-one text-lg">
            Répondre à l&apos;avis
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg
              className="w-5 h-5 text-white/70 hover:text-white"
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-one mb-2">
              Votre réponse
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Écrivez votre réponse à cet avis..."
              disabled={isLoading}
              rows={6}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-tertiary-500/50 focus:ring-2 focus:ring-tertiary-500/20 transition-colors disabled:opacity-50 font-one resize-none"
            />
            <p className="text-white/40 text-xs font-one mt-2">
              {response.length} caractères
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer flex-1 py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !response.trim()}
              className="cursor-pointer flex-1 py-2 px-4 bg-gradient-to-r from-tertiary-500 to-tertiary-600 hover:from-tertiary-600 hover:to-tertiary-700 text-white rounded-lg transition-all font-medium font-one text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Publier
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
