/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  calculateDurationForModal,
  formatDateForModal,
} from "@/lib/utils/date-format/format-date-for-modal";
import { confirmAppointmentAction } from "@/lib/queries/appointment";

export default function ConfirmRdv({
  rdvId,
  appointment,
  onConfirm,
}: {
  rdvId: string;
  appointment?: any; // Pour passer les détails du RDV
  onConfirm: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await confirmAppointmentAction(
        rdvId,
        "confirm",
        actionMessage
      );

      if (res) {
        toast.success(
          "Rendez-vous confirmé avec succès ! Le client va recevoir un email."
        );
        onConfirm();
        setShowModal(false);
        setActionMessage("");
      } else {
        setError(res.message);
        toast.error(`Erreur lors de la confirmation: ${res.message}`);
      }
    },
  });

  return (
    <>
      <button
        className="cursor-pointer px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-lg text-xs font-one font-medium transition-colors flex items-center gap-1"
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
            d="M5 13l4 4L19 7"
          />
        </svg>
        Confirmer
      </button>

      {/* Modale d'action */}
      {showModal && (
        <div className="absolute inset-0 z-[9999] bg-transparent flex items-stretch justify-stretch p-0">
          <div className="bg-noir-500 w-full h-full overflow-hidden flex flex-col border-0 shadow-none lg:rounded-xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white font-one tracking-wide">
                  ✅ Confirmer le rendez-vous
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
                  ? `Confirmer le RDV de ${appointment.client?.firstName} ${appointment.client?.lastName}`
                  : "Confirmer ce rendez-vous"}
              </p>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {/* Récapitulatif du rendez-vous */}
              {appointment && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {appointment.client?.firstName
                          ?.charAt(0)
                          .toUpperCase() || "?"}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-white font-one font-semibold mb-1">
                        {appointment.client?.firstName}{" "}
                        {appointment.client?.lastName}
                      </h3>
                      <p className="text-white/80 text-sm font-one mb-2">
                        {appointment.title}
                      </p>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-white/60 font-one">Date & Heure</p>
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
                        {appointment.tattooDetail?.price && (
                          <div>
                            <p className="text-white/60 font-one">Prix</p>
                            <p className="text-green-400 font-one font-semibold">
                              {appointment.tattooDetail.price}€
                            </p>
                          </div>
                        )}
                      </div>

                      {appointment.client?.email && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-white/60 text-xs font-one">
                            Contact
                          </p>
                          <p className="text-white/80 text-xs font-one">
                            {appointment.client.email}
                          </p>
                          {appointment.client.phone && (
                            <p className="text-white/80 text-xs font-one">
                              {appointment.client.phone}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Zone de message */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold font-one mb-3 text-sm">
                  💬 Message de confirmation
                </h3>
                <div className="space-y-3">
                  <textarea
                    value={actionMessage}
                    onChange={(e) => setActionMessage(e.target.value)}
                    placeholder="Message personnalisé de confirmation (optionnel)..."
                    className="w-full h-20 p-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400 focus:border-transparent resize-none transition-colors"
                    maxLength={300}
                    disabled={mutation.isPending}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-white/50 font-one">
                      Le client recevra un email de confirmation
                    </p>
                    <p className="text-xs text-white/50 font-one">
                      {actionMessage.length}/300
                    </p>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-1">
                    <p className="text-xs text-white/70 font-one">
                      💡 Suggestions :
                    </p>
                    {[
                      "Votre rendez-vous est confirmé ! À bientôt !",
                      "J'ai hâte de réaliser votre projet !",
                      "Rendez-vous confirmé, n'hésitez pas si vous avez des questions.",
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
            <div className="p-4 border-t border-white/10 bg-white/5 flex flex-row justify-end gap-2">
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
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Confirmation...</span>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Confirmer le RDV</span>
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
