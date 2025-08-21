/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  calculateDurationForModal,
  formatDateForModal,
} from "@/lib/utils/date-format/format-date-for-modal";

export default function ChangeRdv({
  rdvId,
  userId,
  appointment,
}: {
  rdvId: string;
  userId: string;
  appointment?: any;
}) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      //   const res = await proposeRescheduleAppointmentAction(
      //   rdvId,
      //   actionMessage
      // );
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/propose-reschedule/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentId: rdvId,
            message: actionMessage.trim() || undefined,
          }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.message || "Erreur inconnue");
      return data;
    },
    onSuccess: () => {
      toast.success(
        "Proposition de nouveau créneau envoyée ! Le client va recevoir un email."
      );
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowModal(false);
      setActionMessage("");
    },
    onError: (error: any) => {
      setError(error.message);
      toast.error(`Erreur lors de la proposition: ${error.message}`);
    },
  });

  return (
    <>
      <button
        className="cursor-pointer px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg text-xs font-one font-medium transition-colors flex items-center gap-1"
        onClick={() => setShowModal(true)}
      >
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Notifier un changement
      </button>

      {/* Modale de proposition */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-noir-700 rounded-xl backdrop-blur-sm flex items-center justify-center">
          <div className="bg-noir-500 h-full rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white font-one tracking-wide">
                  🔄 Notifier un changement
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <span className="cursor-pointer text-white text-xl">×</span>
                </button>
              </div>
              <p className="text-white/70 mt-1 text-sm">
                {appointment
                  ? `Proposer un nouveau créneau à ${appointment.client?.firstName} ${appointment.client?.lastName}`
                  : "Proposer un nouveau créneau"}
              </p>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Récapitulatif du rendez-vous actuel */}
              {appointment && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                  <h3 className="text-white font-one font-semibold mb-3 text-sm">
                    📅 Rendez-vous actuel
                  </h3>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {appointment.client?.firstName
                          ?.charAt(0)
                          .toUpperCase() || "?"}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-white font-one font-semibold mb-1">
                        {appointment.client?.firstName}{" "}
                        {appointment.client?.lastName}
                      </h4>
                      <p className="text-white/80 text-sm font-one mb-2">
                        {appointment.title}
                      </p>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-white/60 font-one">
                            Date & Heure actuelles
                          </p>
                          <p className="text-white font-one">
                            {formatDateForModal(appointment.start)}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/60 font-one">Durée</p>
                          <p className="text-white font-one">
                            {calculateDurationForModal(
                              appointment.start,
                              appointment.end
                            )}{" "}
                            min
                          </p>
                        </div>
                        <div>
                          <p className="text-white/60 font-one">Prestation</p>
                          <p className="text-white font-one">
                            {appointment.prestation}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/60 font-one">Tatoueur</p>
                          <p className="text-white font-one">
                            {appointment.tatoueur?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message personnalisé */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold font-one mb-3 text-sm">
                  💬 Message d'explication
                </h3>
                <div className="space-y-3">
                  <textarea
                    value={actionMessage}
                    onChange={(e) => setActionMessage(e.target.value)}
                    placeholder="Expliquez la raison du changement et présentez le nouveau créneau..."
                    className="w-full h-20 p-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400 focus:border-transparent resize-none transition-colors"
                    maxLength={400}
                    disabled={mutation.isPending}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-white/50 font-one">
                      Le client recevra un email avec la proposition
                    </p>
                    <p className="text-xs text-white/50 font-one">
                      {actionMessage.length}/400
                    </p>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-1">
                    <p className="text-xs text-white/70 font-one">
                      💡 Suggestions :
                    </p>
                    {[
                      "Bonjour ! Je dois modifier votre rendez-vous pour des raisons organisationnelles. Je vous propose ce nouveau créneau.",
                      "Imprévu dans mon planning ! Je vous propose de reporter à cette nouvelle date qui vous conviendrait peut-être mieux.",
                      "Suite à un changement dans mon agenda, je vous propose ce nouveau créneau. J'espère qu'il vous conviendra !",
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setActionMessage(suggestion)}
                        disabled={mutation.isPending}
                        className="cursor-pointer block w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 hover:border-tertiary-400/30 transition-all text-xs text-white/80 font-one disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Messages d'erreur */}
              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                disabled={mutation.isPending}
                className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
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
                    <span>
                      Envoyer à {appointment.client?.firstName}{" "}
                      {appointment.client?.lastName}
                    </span>
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
