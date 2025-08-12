/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from "react";
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

export default function NotAnswerClient({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [followUps, setFollowUps] = useState<FollowUpSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);

  // États pour la modale de réponse
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] =
    useState<FollowUpSubmission | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const fetchUnansweredFollowUps = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/follow-up/unanswered/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des suivis");
      }

      const data = await response.json();
      setFollowUps(data.followUps || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnansweredFollowUps();
  }, [userId]);

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

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "À l'instant";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  console.log("Follow-ups:", followUps);

  if (loading) {
    return (
      <div className="bg-noir-700 rounded-xl border border-white/20 p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white font-one">
            Suivis en attente
          </h3>
          <div className="w-4 h-4 border-2 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-slate-300/10 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-noir-700 rounded-xl border border-white/20 p-4 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4 font-one">
          Suivis en attente
        </h3>
        <div className="text-center py-6">
          <div className="w-10 h-10 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-400 mb-3 text-sm font-medium">{error}</p>
          <button
            onClick={fetchUnansweredFollowUps}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const handleReplyClick = (followUp: FollowUpSubmission) => {
    setSelectedFollowUp(followUp);
    setReplyText("");
    setIsReplyModalOpen(true);
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

      // Mettre à jour la liste des suivis
      await fetchUnansweredFollowUps();

      // Fermer la modale
      setIsReplyModalOpen(false);
      setSelectedFollowUp(null);
      setReplyText("");
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

  const handleCloseReplyModal = () => {
    setIsReplyModalOpen(false);
    setSelectedFollowUp(null);
    setReplyText("");
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

  return (
    <>
      <div className="h-[550px] bg-noir-700 rounded-xl border border-white/20 p-4 overflow-y-scroll custom-scrollbar shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white font-one">
            Suivis en attente
          </h3>
          <div className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-medium border border-orange-500/50">
            {followUps.length}
          </div>
        </div>

        {followUps.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Aucun suivi en attente</p>
            <p className="text-gray-500 text-xs mt-1">
              Tous les clients ont été contactés
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {followUps.map((followUp) => (
              <div
                key={followUp.id}
                className="border border-white/20 rounded-lg p-3 hover:bg-slate-400/10 transition-all duration-200 bg-slate-300/10"
              >
                <div className="flex items-start gap-3">
                  {/* Photo de cicatrisation */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 border border-white/20">
                    {followUp.photoUrl ? (
                      <Image
                        src={followUp.photoUrl}
                        alt="Photo de cicatrisation"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-400"
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

                  {/* Informations du suivi */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-white text-sm truncate font-one">
                        {followUp.appointment.client.firstName}{" "}
                        {followUp.appointment.client.lastName}
                      </h4>
                      <div className="bg-gradient-to-r from-orange-500/15 to-orange-500/15 border border-orange-400/30 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                          <span className="text-orange-300 font-medium font-one text-xs">
                            En attente
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 truncate mb-2 font-one flex items-center gap-3">
                      {followUp.appointment.title}
                      <span>•</span>
                      <span className="text-gray-500">
                        {followUp.appointment.tatoueur.name}
                      </span>
                    </p>

                    {/* Note et évaluation */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-400 text-xs">
                        {getRatingStars(followUp.rating)}
                      </span>
                      <span className="text-xs text-gray-400 font-one">
                        {getRatingLabel(followUp.rating)}
                      </span>
                    </div>

                    {/* Avis du client */}
                    {followUp.review && (
                      <p className="text-xs text-gray-300 line-clamp-2 mb-2 font-one italic">
                        "{followUp.review}"
                      </p>
                    )}

                    {/* Métadonnées */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="font-one">
                        {getTimeAgo(followUp.createdAt)}
                      </span>
                      <button
                        onClick={() => handleReplyClick(followUp)}
                        className="cursor-pointer text-tertiary-400 hover:text-tertiary-500 transition-colors font-one font-medium"
                      >
                        Répondre →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modale de réponse */}
      {isReplyModalOpen && selectedFollowUp && (
        <div className="fixed inset-0 z-[9999] bg-noir-700/95 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-noir-500 h-full w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 shadow-2xl rounded-xl">
            {/* Header compact */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-noir-700/80 to-noir-500/80">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 to-transparent"></div>
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
                    <h2 className="text-lg font-bold text-white font-one tracking-wide">
                      Répondre au suivi
                    </h2>
                    <p className="text-white/70 text-xs font-one">
                      {selectedFollowUp.appointment?.client?.firstName}{" "}
                      {selectedFollowUp.appointment?.client?.lastName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseReplyModal}
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

            {/* Contenu avec design compact */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
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
            <div className="p-3 border-t border-white/10 bg-white/5 flex justify-end gap-2">
              <button
                onClick={handleCloseReplyModal}
                disabled={isReplying}
                className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={isReplying || !replyText.trim()}
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs flex items-center gap-2"
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
      )}
    </>
  );
}
