/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  calculateDurationForModal,
} from "@/lib/utils/date-format/format-date-for-modal";
import { sendCustomEmailAction } from "@/lib/queries/appointment";

export default function SendMessageRdv({
  rdvId,
  appointment,
  onMessageSent,
  buttonLabel = "Message",
}: {
  rdvId: string;
  appointment?: any; // Pour passer les détails du RDV
  onMessageSent?: () => void;
  buttonLabel?: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!emailSubject.trim()) {
        setError("Veuillez saisir un objet pour l'email");
        return;
      }
      if (!customMessage.trim()) {
        setError("Veuillez saisir un message");
        return;
      }

      const res = await sendCustomEmailAction(
        rdvId,
        emailSubject,
        customMessage,
      );

      if (res) {
        toast.success(
          "Email envoyé avec succès ! Le client va recevoir votre message.",
        );
        onMessageSent?.();
        setShowModal(false);
        setEmailSubject("");
        setCustomMessage("");
        setError(null);
      } else {
        setError("Erreur lors de l'envoi de l'email");
        toast.error("Erreur lors de l'envoi de l'email");
      }
    },
  });

  return (
    <>
      <button
        className="cursor-pointer px-2.5 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 border border-indigo-500/40 rounded-2xl text-xs font-one font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shadow-sm hover:shadow-md"
        onClick={() => setShowModal(true)}
        title={buttonLabel}
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <span>{buttonLabel}</span>
      </button>

      {/* Modale d'envoi de message */}
      {showModal && (
        <div className="absolute inset-0 z-[9999] bg-black/30 backdrop-blur-[1px]">
          <div className="dashboard-embedded-panel flex h-full w-full flex-col overflow-hidden rounded-[28px]">
            {/* Header */}
            <div className="dashboard-embedded-header px-4 py-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white font-one tracking-wide">
                  💬 Envoyer un email
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <span className="cursor-pointer text-white text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {/* Récapitulatif du rendez-vous */}
              {appointment && (
                <div className="dashboard-embedded-section p-3">
                  <div className="flex items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-one font-semibold text-sm mb-0.5 truncate">
                        {appointment.client?.firstName}{" "}
                        {appointment.client?.lastName}
                      </h3>
                      <p className="text-white/70 text-xs mb-2 truncate">
                        {appointment.title}
                      </p>

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
                              <p className="text-[9px] uppercase tracking-wider text-white/35">Durée</p>
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
                              <p className="mt-0.5 text-white/90 text-xs truncate">
                                {appointment.tatoueur?.name || "Non assigné"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Zone de saisie d'email */}
              <div className="dashboard-embedded-section p-3">
                <h3 className="text-white font-semibold font-one mb-2.5 text-sm">
                  Composer l&apos;email
                </h3>
                <div className="space-y-3">
                  <div className="rounded-xl border border-white/10 bg-white/4 p-2.5">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="block text-white font-one text-xs">
                      Objet de l&apos;email{" "}
                      <span className="text-red-400">*</span>
                      </label>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/55 font-one">
                        {emailSubject.length}/100
                      </span>
                    </div>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Objet de votre email..."
                      className="w-full bg-white/6 border border-white/12 rounded-xl p-3 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-tertiary-400/50 focus:border-transparent transition-colors"
                      maxLength={100}
                      disabled={mutation.isPending}
                    />
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/4 p-2.5">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="block text-white font-one text-xs">
                      Message <span className="text-red-400">*</span>
                      </label>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/55 font-one">
                        {customMessage.length}/500
                      </span>
                    </div>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Rédigez votre message personnalisé..."
                      className="w-full h-24 p-3 bg-white/6 border border-white/12 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-tertiary-400/50 focus:border-transparent resize-none transition-colors"
                      maxLength={500}
                      disabled={mutation.isPending}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-white/50 font-one">
                        Le client recevra cet email à son adresse
                      </p>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-1.5 mt-3">
                      <p className="text-[11px] text-white/65 font-one">Suggestions rapides</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                        "J'espère que tout se passe bien !",
                        "N'hésitez pas si vous avez des questions.",
                        "Merci pour votre confiance !",
                      ].map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setCustomMessage(suggestion)}
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
              </div>

              {/* Messages d'erreur */}
              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="dashboard-embedded-footer px-4 py-2.5 flex flex-row justify-end gap-2 rounded-b-xl">
              <button
                onClick={() => setShowModal(false)}
                disabled={mutation.isPending}
                className="cursor-pointer px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-[14px] border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setError(null);
                  mutation.mutate();
                }}
                disabled={
                  mutation.isPending ||
                  !customMessage.trim() ||
                  !emailSubject.trim()
                }
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
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Envoyer l&apos;email</span>
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
