/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getUnansweredFollowUpsAction } from "@/lib/queries/followUp";
import NotAnswerClientReplyPanel from "./NotAnswerClientReplyPanel";

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

  const fetchUnansweredFollowUps = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUnansweredFollowUpsAction();

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des suivis");
      }

      setFollowUps(response.data.followUps || []);
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
    setIsReplyModalOpen(true);
  };

  const handleCloseReplyModal = () => {
    setIsReplyModalOpen(false);
    setSelectedFollowUp(null);
  };

  return (
    <>
      <div className="h-[550px] bg-noir-700 rounded-xl border border-white/20 p-4 overflow-y-scroll custom-scrollbar shadow-2xl lg:overflow-hidden relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white font-one">
            Suivis en attente
          </h3>
          <div className="px-2 py-1 bg-tertiary-500/20 text-tertiary-400 rounded-lg text-xs font-medium border border-tertiary-500/50">
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

      {/* Panneau de réponse */}
      {isReplyModalOpen && selectedFollowUp && (
        <NotAnswerClientReplyPanel
          selectedFollowUp={selectedFollowUp}
          onClose={handleCloseReplyModal}
          onReplySuccess={fetchUnansweredFollowUps}
        />
      )}
    </>
  );
}
