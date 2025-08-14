/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState } from "react";
import { AppointmentRequest, Availability } from "../DemandeRdvClient";
import { formatTime, formatDate } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function DeclinedDemande({
  // userId,
  demande,
  onDeclined, // Callback to trigger after declining
}: {
  userId: string;
  demande: AppointmentRequest;
  onDeclined: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  //! FETCH
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/decline-appointment-request`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentRequestId: demande.id,
            reason: actionMessage.trim() || undefined,
          }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.message || "Erreur inconnue");
      return data;
    },
    onSuccess: () => {
      toast.success(
        "Demande déclinée avec succès ! Le client va recevoir un email."
      );
      setShowModal(false);
      setActionMessage("");
      onDeclined();
    },
    onError: (error: any) => {
      setError(error.message);
      toast.error(`Erreur lors de l'annulation: ${error.message}`);
    },
  });

  // -------- utils
  const toObject = <T extends object>(val: unknown): T => {
    if (!val) return {} as T;
    if (typeof val === "string") {
      try {
        return JSON.parse(val) as T;
      } catch {
        return {} as T;
      }
    }
    if (typeof val === "object") return val as T;
    return {} as T;
  };
  const av = toObject<Availability>(demande.availability);
  const primary = av?.primary;
  const alternative = av?.alternative;

  return (
    <div>
      {" "}
      <button
        onClick={() => {
          setError(null);
          setLoading(false);
          setShowModal(true);
        }}
        disabled={loading}
        className="cursor-pointer px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-xs font-one font-medium transition-colors flex items-center gap-1"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        Décliner la demande
      </button>
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-noir-700 rounded-lg backdrop-blur-sm flex items-center justify-center">
          <div className="bg-noir-500 h-full rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white font-one tracking-wide">
                  Décliner la demande
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <span className="cursor-pointer text-white text-xl">×</span>
                </button>
              </div>
              <p className="text-white/70 mt-1 text-xs">
                Décliner et clôturer la demande de rendez-vous de{" "}
                <span className="text-white">
                  {demande.clientFirstname} {demande.clientLastname}
                </span>
              </p>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Récap client */}
              {demande && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {demande.clientFirstname?.charAt(0).toUpperCase() ||
                          "?"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-one font-semibold mb-1">
                        {demande.clientFirstname} {demande.clientLastname}
                      </h3>

                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-white/60 text-xs font-one mb-2">
                          Disponibilités du client
                        </p>
                        <div className="space-y-2">
                          {primary?.date && (
                            <div className="flex items-center gap-2 text-xs text-white/80 font-one">
                              <span className="font-semibold text-blue-400">
                                Primaire :
                              </span>
                              <span>
                                {formatDate(primary.date)}
                                {primary.from && (
                                  <>{` ${formatTime(primary.from)}`}</>
                                )}
                                {primary.to && <> – {formatTime(primary.to)}</>}
                              </span>
                            </div>
                          )}
                          {alternative?.date && (
                            <div className="flex items-center gap-2 text-xs text-white/80 font-one">
                              <span className="font-semibold text-purple-400">
                                Alternative :
                              </span>
                              <span>
                                {formatDate(alternative.date)}
                                {alternative.from && (
                                  <>{` ${formatTime(alternative.from)}`}</>
                                )}
                                {alternative.to && (
                                  <> – {formatTime(alternative.to)}</>
                                )}
                              </span>
                            </div>
                          )}
                          {!primary?.date && !alternative?.date && (
                            <div className="text-xs text-white/50 font-one">
                              Aucune disponibilité renseignée.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-white/60 text-xs font-one">
                          Prestation
                        </p>
                        <p className="text-white font-one">
                          {demande.prestation}
                        </p>
                      </div>

                      {demande.clientEmail && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-white/60 text-xs font-one">
                            Contact
                          </p>
                          <div className="grid grid-cols-2">
                            <p className="text-white/80 text-xs font-one">
                              {demande.clientEmail}
                            </p>
                            {demande.clientPhone && (
                              <p className="text-white/80 text-xs font-one">
                                {demande.clientPhone}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Zone de message */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold font-one mb-3 text-sm">
                  📝 Raison du refus
                </h3>
                <div className="space-y-3">
                  <textarea
                    value={actionMessage}
                    onChange={(e) => setActionMessage(e.target.value)}
                    placeholder="Expliquez brièvement la raison de l'annulation..."
                    className="w-full h-20 p-3 bg-white/10 border border-white/20 rounded-lg text-white text-xs placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400 focus:border-transparent resize-none transition-colors"
                    maxLength={300}
                    disabled={mutation.isPending}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-white/50 font-one">
                      Le client recevra un email d'annulation
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
                    {/* 
                      "Imprévu de dernière minute, désolé pour la gêne occasionnée.",
                      "Problème technique, nous vous recontacterons rapidement.",
                      "Changement d'agenda, nous proposons de nouvelles dates.",
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
                    */}
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
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Annulation...</span>
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span>Décliner & clôturer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
