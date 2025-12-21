"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { reviewSalonDocument } from "@/lib/queries/admin";
import { FiCheck, FiX } from "react-icons/fi";
import { toast } from "sonner";

interface DocumentReviewActionsProps {
  documentId: string;
  documentType: string;
  documentStatus?: string;
  onReviewed?: () => void;
}

export default function DocumentReviewActions({
  documentId,
  documentType,
  documentStatus,
  onReviewed,
}: DocumentReviewActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const rejectionReasons = [
    "Document illisible ou de mauvaise qualité",
    "Document expiré",
    "Document incomplet",
    "Mauvais type de document",
    "Document falsifié ou modifié",
    "Informations non conformes",
  ];

  const handleApprove = async () => {
    setLoading(true);
    try {
      const result = await reviewSalonDocument(documentId, "APPROVED");
      if (result.ok) {
        toast.success("Document approuvé avec succès");
        onReviewed?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Veuillez indiquer une raison de rejet");
      return;
    }

    setLoading(true);
    try {
      const result = await reviewSalonDocument(
        documentId,
        "REJECTED",
        rejectionReason
      );
      if (result.ok) {
        toast.success("Document rejeté");
        setShowRejectModal(false);
        setRejectionReason("");
        onReviewed?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erreur lors du rejet");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isApproved =
    documentStatus?.toLowerCase() === "approved" ||
    documentStatus?.toLowerCase() === "approuve" ||
    documentStatus?.toLowerCase() === "validé" ||
    documentStatus?.toLowerCase() === "valide";

  return (
    <>
      <div className="flex items-center gap-1.5">
        {!isApproved && (
          <button
            onClick={handleApprove}
            disabled={loading}
            className="cursor-pointer flex-1 px-2 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 hover:border-green-400/50 text-green-400 rounded transition-all duration-300 text-[10px] font-one font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            title="Approuver"
          >
            <FiCheck size={12} />
            Valider
          </button>
        )}

        <button
          onClick={() => setShowRejectModal(true)}
          disabled={loading}
          className={`cursor-pointer px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 text-red-400 rounded transition-all duration-300 text-[10px] font-one font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 ${
            isApproved ? "flex-1" : "flex-1"
          }`}
          title="Rejeter"
        >
          <FiX size={12} />
          Rejeter
        </button>
      </div>

      {/* Reject Modal - using portal to render at document body level */}
      {showRejectModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => !loading && setShowRejectModal(false)}
            />
            <div className="relative z-10 w-[90vw] max-w-md bg-noir-700 border border-white/10 rounded-xl overflow-hidden shadow-2xl p-5">
              <h3 className="text-white font-one font-bold text-lg mb-3">
                Rejeter le document
              </h3>
              <p className="text-white/70 text-sm font-one mb-4">
                Type: <span className="text-white">{documentType}</span>
              </p>

              <label className="block text-white/80 text-xs font-one mb-2">
                Raisons prédéfinies
              </label>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {rejectionReasons.map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectionReason(reason)}
                    className={`px-2 py-1 text-[10px] font-one rounded transition-colors ${
                      rejectionReason === reason
                        ? "bg-red-500/30 border border-red-400/50 text-red-300"
                        : "bg-white/10 border border-white/20 text-white/70 hover:bg-white/20"
                    }`}
                    disabled={loading}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <label className="block text-white/80 text-xs font-one mb-2">
                Raison du rejet (personnalisée) *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ou écrivez votre propre raison..."
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-red-400/50 transition-colors font-one resize-none"
                rows={3}
                disabled={loading}
              />

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-one disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-400 rounded-lg transition-colors font-one font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "En cours..." : "Confirmer le rejet"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
