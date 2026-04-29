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
import { proposeRescheduleAppointmentAction } from "@/lib/queries/appointment";

export default function ChangeRdv({
  rdvId,
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
      try {
        const data = await proposeRescheduleAppointmentAction(
          rdvId,
          actionMessage.trim() || undefined,
        );

        if (!data) {
          throw new Error("Aucune reponse du serveur");
        }

        if (data.error) {
          throw new Error(data.message || "Erreur inconnue du serveur");
        }

        return data;
      } catch (err) {
        console.error("Erreur dans mutationFn:", err);
        throw err;
      }
    },
    onSuccess: () => {
      toast.success(
        "Proposition de nouveau creneau envoyee ! Le client va recevoir un email.",
      );
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowModal(false);
      setActionMessage("");
    },
    onError: (err: any) => {
      setError(err.message);
      toast.error(`Erreur lors de la proposition: ${err.message}`);
    },
  });

  return (
    <>
      <button
        className="cursor-pointer px-2.5 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 rounded-2xl text-xs font-one font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shadow-sm hover:shadow-md"
        onClick={() => setShowModal(true)}
        title="Proposer une reprogrammation"
      >
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Reprogrammer</span>
      </button>

      {showModal && (
        <div className="absolute inset-0 z-[9999] bg-black/30 backdrop-blur-[1px]">
          <div className="dashboard-embedded-panel flex h-full w-full flex-col overflow-hidden rounded-2xl">
            <div className="dashboard-embedded-header px-4 py-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white font-one tracking-wide">
                  Notifier un changement
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <span className="cursor-pointer text-white text-xl">×</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0 space-y-2.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {appointment && (
                <div className="dashboard-embedded-section p-3">
                  <div className="flex items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-one font-semibold text-sm mb-0.5 truncate">
                        {appointment.client?.firstName} {appointment.client?.lastName}
                      </h4>
                      <p className="text-white/70 text-xs font-one mb-2 truncate">{appointment.title}</p>

                      <div className="grid grid-cols-2 gap-1.5 text-[11px] font-one">
                        <div className="rounded-xl border border-white/8 bg-white/4 px-2 py-1.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/12 border border-blue-400/15">
                              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] uppercase tracking-wider text-white/35">Date</p>
                              <p className="mt-0.5 text-white/90 text-xs truncate">
                                {new Date(appointment.start).toLocaleDateString("fr-FR", {
                                  weekday: "short",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-white/4 px-2 py-1.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/12 border border-blue-400/15">
                              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] uppercase tracking-wider text-white/35">Heure</p>
                              <p className="mt-0.5 text-white/90 text-xs tabular-nums">
                                {new Date(appointment.start).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                {" - "}
                                {new Date(appointment.end).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-white/4 px-2 py-1.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-500/12 border border-purple-400/15">
                              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] uppercase tracking-wider text-white/35">Duree</p>
                              <p className="mt-0.5 text-white/90 text-xs">
                                {calculateDurationForModal(appointment.start, appointment.end)} min
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-white/4 px-2 py-1.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/12 border border-emerald-400/15">
                              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] uppercase tracking-wider text-white/35">Prestation</p>
                              <p className="mt-0.5 text-white/90 text-xs truncate">{appointment.prestation}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 rounded-xl border border-white/8 bg-white/4 px-2 py-1.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-tertiary-500/12 border border-tertiary-400/15">
                              <svg className="w-3.5 h-3.5 text-tertiary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] uppercase tracking-wider text-white/35">Artiste</p>
                              <p className="mt-0.5 text-white/90 text-xs truncate">{appointment.tatoueur?.name || "Non assigne"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="dashboard-embedded-section p-3">
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <h3 className="text-white font-semibold font-one text-sm">
                    Message d'explication
                  </h3>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/55 font-one">
                    {actionMessage.length}/400
                  </span>
                </div>
                <div className="space-y-2.5">
                  <textarea
                    value={actionMessage}
                    onChange={(e) => setActionMessage(e.target.value)}
                    placeholder="Expliquez la raison du changement et presentez le nouveau creneau..."
                    className="w-full h-24 p-3 bg-white/6 border border-white/12 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-tertiary-400/50 focus:border-transparent resize-none transition-colors"
                    maxLength={400}
                    disabled={mutation.isPending}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-white/50 font-one">
                      Le client recevra un email avec la proposition
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] text-white/65 font-one">Suggestions rapides</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                      "Bonjour ! Je dois modifier votre rendez-vous pour des raisons organisationnelles. Je vous propose ce nouveau creneau.",
                      "Imprevu dans mon planning ! Je vous propose de reporter a cette nouvelle date qui vous conviendrait peutetre mieux.",
                      "Suite a un changement dans mon agenda, je vous propose ce nouveau creneau. J'espere qu'il vous conviendra !",
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setActionMessage(suggestion)}
                        disabled={mutation.isPending}
                        className="cursor-pointer px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-tertiary-400/30 transition-all text-[11px] text-white/80 font-one disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {suggestion}
                      </button>
                    ))}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              )}
            </div>

            <div className="dashboard-embedded-footer px-4 py-2.5 flex flex-row justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                disabled={mutation.isPending}
                className="cursor-pointer px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-[14px] border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="cursor-pointer px-4 py-1.5 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-500 text-white rounded-[14px] transition-all duration-300 font-medium font-one text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Envoyer a {appointment.client?.firstName} {appointment.client?.lastName}
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
