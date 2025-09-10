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
}: {
  rdvId: string;
  appointment?: any; // Pour passer les détails du RDV
  onMessageSent?: () => void;
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
        customMessage
      );

      if (res) {
        toast.success(
          "Email envoyé avec succès ! Le client va recevoir votre message."
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  };

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
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Message
      </button>

      {/* Modale d'envoi de message */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-noir-700 rounded-2xl backdrop-blur-sm flex items-center justify-center">
          <div className="bg-noir-500 h-full rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white font-one tracking-wide">
                  � Envoyer un email
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
                            appointment.end
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulaire d'email */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white font-one text-sm mb-2">
                    Objet de l&apos;email{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Objet de votre email..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white text-sm placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                    maxLength={100}
                  />
                  <div className="flex justify-end items-center mt-1">
                    <span className="text-white/50 text-xs">
                      {emailSubject.length}/100
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-one text-sm mb-2">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Tapez votre message ici..."
                    className="w-full h-32 bg-white/10 border border-white/20 rounded-lg p-3 text-white text-sm placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-white/50 text-xs">
                      Le client recevra cet email à son adresse
                    </p>
                    <span className="text-white/50 text-xs">
                      {customMessage.length}/500
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm font-one">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="cursor-pointer flex-1 py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={
                      mutation.isPending ||
                      !customMessage.trim() ||
                      !emailSubject.trim()
                    }
                    className="cursor-pointer flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium font-one text-sm transition-all"
                  >
                    {mutation.isPending ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Envoi...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
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
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Envoyer l&apos;email
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
