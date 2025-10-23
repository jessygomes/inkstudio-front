/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

interface Client {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface Appointment {
  id: string;
  title: string;
  client: Client;
  tatoueur: {
    name: string;
  };
}

interface FollowUpSubmission {
  id: string;
  rating: number;
  review?: string;
  photoUrl: string;
  createdAt: string;
  isAnswered: boolean;
  appointmentId: string;
  clientId: string;
  appointment: Appointment;
}

interface NotAnswerClientReplyPanelProps {
  selectedFollowUp: FollowUpSubmission;
  onClose: () => void;
  onReplySuccess: () => void;
}

export default function NotAnswerClientReplyPanel({
  selectedFollowUp,
  onClose,
  onReplySuccess,
}: NotAnswerClientReplyPanelProps) {
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const getRatingStars = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return "Très insatisfait";
      case 2:
        return "Insatisfait";
      case 3:
        return "Neutre";
      case 4:
        return "Satisfait";
      case 5:
        return "Très satisfait";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReplySubmit = async () => {
    if (!selectedFollowUp || !replyText.trim()) {
      toast.error("Veuillez saisir une réponse");
      return;
    }

    setIsReplying(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/follow-up/reply/${selectedFollowUp.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            response: replyText,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de l'envoi de la réponse"
        );
      }

      toast.success(
        "Réponse envoyée avec succès ! Le client va recevoir un email."
      );

      // Appeler le callback de succès
      onReplySuccess();

      // Fermer la modale
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de la réponse"
      );
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div
      data-modal
      className="fixed inset-0 z-50 bg-noir-700 lg:absolute lg:inset-0 lg:bg-transparent animate-in slide-in-from-bottom-4 lg:slide-in-from-right-4 duration-300"
      style={{ height: "100dvh", width: "100vw" }}
    >
      <div className="h-full w-full lg:h-fit lg:max-w-2xl lg:max-h-[90vh] bg-noir-700 lg:bg-gradient-to-br lg:from-noir-700/95 lg:via-noir-600/98 lg:to-noir-500/95 lg:backdrop-blur-md rounded-none lg:rounded-xl flex flex-col border-0 lg:border lg:border-white/10 shadow-2xl min-h-0">
        {/* Header compact */}
        <div className="relative p-4 lg:p-4 border-b border-white/10 bg-noir-700 lg:bg-gradient-to-r lg:from-noir-700/80 lg:to-noir-500/80">
          <div className="absolute inset-0 bg-transparent lg:bg-gradient-to-r lg:from-orange-400/5 lg:to-transparent"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">
                  {selectedFollowUp.appointment?.client?.firstName
                    ?.charAt(0)
                    .toUpperCase() || "?"}
                </span>
              </div>
              <div>
                <h2 className="text-lg lg:text-lg font-bold text-white font-one tracking-wide">
                  Répondre au suivi
                </h2>
                <p className="text-white/70 text-sm lg:text-xs font-one">
                  {selectedFollowUp.appointment?.client?.firstName}{" "}
                  {selectedFollowUp.appointment?.client?.lastName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer p-2 lg:p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <svg
                className="w-6 h-6 lg:w-5 lg:h-5 text-white/70 group-hover:text-white transition-colors"
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

        {/* Contenu avec design compact */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-4 space-y-4 lg:space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {/* Récapitulatif compact du suivi */}
          <div className="bg-gradient-to-r from-white/8 to-white/4 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 border border-white/20 flex-shrink-0">
                {selectedFollowUp.photoUrl ? (
                  <Image
                    src={selectedFollowUp.photoUrl}
                    alt="Photo de cicatrisation"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() =>
                      window.open(selectedFollowUp.photoUrl, "_blank")
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gray-400"
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
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-400 text-xs">
                    {getRatingStars(selectedFollowUp.rating)}
                  </span>
                  <span className="text-white/80 text-xs font-one">
                    {getRatingLabel(selectedFollowUp.rating)}
                  </span>
                </div>

                <p className="text-white font-one text-sm mb-1">
                  {selectedFollowUp.appointment?.title}
                </p>

                <p className="text-white/70 text-xs font-one">
                  {formatDate(selectedFollowUp.createdAt)}
                </p>

                {selectedFollowUp.review && (
                  <div className="mt-2 bg-white/10 p-2 rounded-lg border border-white/20">
                    <p className="text-white/90 text-xs font-one italic">
                      "{selectedFollowUp.review}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Zone de réponse compacte */}
          <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
            <h3 className="text-white font-one text-sm flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Votre réponse
            </h3>
            <div className="space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Rédigez votre réponse personnalisée pour le client..."
                className="w-full h-20 p-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none transition-colors"
                maxLength={500}
                disabled={isReplying}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-white/50 font-one">
                  Le client recevra votre réponse par email
                </p>
                <p className="text-xs text-white/50 font-one">
                  {replyText.length}/500
                </p>
              </div>

              {/* Suggestions compactes */}
              <div className="space-y-1">
                <p className="text-xs text-white/70 font-one">
                  💡 Suggestions :
                </p>
                {[
                  "Votre tatouage cicatrise parfaitement !",
                  "Merci pour cette belle photo !",
                  "La cicatrisation suit son cours normal.",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setReplyText(suggestion)}
                    disabled={isReplying}
                    className="cursor-pointer block w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 hover:border-orange-400/30 transition-all text-xs text-white/80 font-one disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer compact */}
        <div className="p-4 lg:p-3 border-t border-white/10 bg-white/5 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isReplying}
            className="cursor-pointer px-4 py-3 lg:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm lg:text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handleReplySubmit}
            disabled={isReplying || !replyText.trim()}
            className="cursor-pointer px-4 py-3 lg:py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-sm lg:text-xs flex items-center gap-2"
          >
            {isReplying ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Envoi...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3 h-3"
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
                <span>Envoyer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
