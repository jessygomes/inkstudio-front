/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  calculateDurationForModal,
  formatDateForModal,
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
        className="cursor-pointer px-2.5 py-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 border border-indigo-500/40 rounded-md text-xs font-one font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shadow-sm hover:shadow-md"
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
        <div className="absolute inset-0 z-[9999] bg-transparent flex items-stretch justify-stretch p-0 rounded-xl">
          <div className="bg-noir-500 rounded-none w-full h-full overflow-hidden flex flex-col border-0 shadow-none lg:rounded-xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white font-one tracking-wide">
                  💬 Envoyer un email
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
                  ? `Envoyer un email à ${appointment.client?.firstName} ${appointment.client?.lastName}`
                  : "Envoyer un email personnalisé au client"}
              </p>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Récapitulatif du rendez-vous */}
              {appointment && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {appointment.client?.firstName
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-one font-semibold text-sm mb-1">
                        {appointment.client?.firstName}{" "}
                        {appointment.client?.lastName}
                      </h3>
                      <p className="text-white/80 text-xs mb-2">
                        {appointment.title}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-white/60">
                        <span className="flex items-center gap-1">
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
                              d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6"
                            />
                          </svg>
                          {formatDateForModal(appointment.start)}
                        </span>
                        <span className="flex items-center gap-1">
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
                          {calculateDurationForModal(
                            appointment.start,
                            appointment.end,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Zone de saisie d'email */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold font-one mb-3 text-sm">
                  💬 Composer l&apos;email
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-white font-one text-xs mb-2">
                      Objet de l&apos;email{" "}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Objet de votre email..."
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
                      maxLength={100}
                      disabled={mutation.isPending}
                    />
                    <div className="flex justify-end items-center mt-1">
                      <span className="text-white/50 text-xs">
                        {emailSubject.length}/100
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-one text-xs mb-2">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Rédigez votre message personnalisé..."
                      className="w-full h-20 p-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none transition-colors"
                      maxLength={500}
                      disabled={mutation.isPending}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-white/50 font-one">
                        Le client recevra cet email à son adresse
                      </p>
                      <p className="text-xs text-white/50 font-one">
                        {customMessage.length}/500
                      </p>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-1 mt-3">
                      <p className="text-xs text-white/70 font-one">
                        💡 Suggestions :
                      </p>
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
                          className="cursor-pointer block w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 hover:border-blue-400/30 transition-all text-xs text-white/80 font-one disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {suggestion}
                        </button>
                      ))}
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
            <div className="p-4 border-t border-white/10 bg-white/5 flex flex-row justify-end gap-2 rounded-b-xl">
              <button
                onClick={() => setShowModal(false)}
                disabled={mutation.isPending}
                className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
