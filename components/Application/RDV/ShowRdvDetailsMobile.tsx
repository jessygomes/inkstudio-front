import React from "react";
import { CalendarEvent } from "./Calendar";
import ConfirmRdv from "./ConfirmRdv";
import UpdateRdv from "./UpdateRdv";
import CancelRdv from "./CancelRdv";
import ChangeRdv from "./ChangeRdv";
import { UpdateRdvFormProps } from "@/lib/type";
import Link from "next/link";

interface ShowRdvDetailsMobileProps {
  selectedEvent: CalendarEvent;
  onClose: () => void;
  handleRdvUpdated: (rdvId: string) => void;
  handlePaymentStatusChange: (rdvId: string, isPayed: boolean) => void;
  userId: string | null;
  price: number | undefined;
}

export default function ShowRdvDetailsMobile({
  selectedEvent,
  onClose,
  handleRdvUpdated,
  handlePaymentStatusChange,
  userId,
  price,
}: ShowRdvDetailsMobileProps) {
  return (
    <div className="xl:hidden fixed inset-0 z-50 bg-noir-700">
      <div className="w-full h-full">
        <div className="w-full h-full bg-gradient-to-br from-noir-500 to-noir-600 overflow-hidden flex flex-col">
          {/* Header mobile */}
          <div className="relative p-4 border-b border-white/10 bg-gradient-to-r from-noir-700/80 to-noir-500/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-tertiary-500 to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {selectedEvent.client.firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-bold font-one text-white tracking-wide truncate">
                    {selectedEvent.client.firstName}{" "}
                    {selectedEvent.client.lastName}
                  </h4>
                  <p className="text-white/70 text-xs font-one truncate">
                    {selectedEvent.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6 text-white"
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

          {/* Contenu scrollable mobile */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Statut */}
            <div className="bg-gradient-to-r from-white/8 to-white/4 rounded-xl p-3 border border-white/10">
              <h5 className="text-white font-one text-sm mb-2">Statut</h5>
              {selectedEvent.status === "PENDING" ? (
                <div className="bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-orange-300 font-medium font-one text-xs">
                      En attente de confirmation
                    </span>
                  </div>
                </div>
              ) : selectedEvent.status === "CONFIRMED" ? (
                <div className="bg-gradient-to-r from-green-500/15 to-emerald-500/15 border border-green-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-300 font-medium font-one text-xs">
                      Confirmé
                    </span>
                  </div>
                </div>
              ) : selectedEvent.status === "COMPLETED" ? (
                <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-emerald-300 font-medium font-one text-xs">
                      Complété
                    </span>
                  </div>
                </div>
              ) : selectedEvent.status === "NO_SHOW" ? (
                <div className="bg-gradient-to-r from-amber-500/15 to-orange-600/15 border border-amber-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-amber-300 font-medium font-one text-xs">
                      Pas présenté
                    </span>
                  </div>
                </div>
              ) : selectedEvent.status === "CANCELED" ? (
                <div className="bg-gradient-to-r from-red-500/15 to-rose-500/15 border border-red-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-red-300 font-medium font-one text-xs">
                      Annulé
                    </span>
                  </div>
                </div>
              ) : selectedEvent.status === "RESCHEDULING" ? (
                <div className="bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-300 font-medium font-one text-xs">
                      En attente de reprogrammation
                    </span>
                  </div>
                  <p className="text-blue-200/80 text-xs font-one mt-1">
                    Le client doit choisir un nouveau créneau
                  </p>
                </div>
              ) : null}
            </div>

            {/* Actions mobiles */}
            <div className="flex flex-wrap gap-2">
              {selectedEvent.status !== "CONFIRMED" && (
                <ConfirmRdv
                  rdvId={selectedEvent.id}
                  appointment={selectedEvent}
                  onConfirm={() => handleRdvUpdated(selectedEvent.id)}
                />
              )}
              <UpdateRdv
                rdv={selectedEvent as unknown as UpdateRdvFormProps}
                userId={userId || ""}
                onUpdate={() => handleRdvUpdated(selectedEvent.id)}
              />
              <ChangeRdv
                rdvId={selectedEvent.id}
                appointment={selectedEvent}
                userId={userId || ""}
              />
              {selectedEvent.status !== "CANCELED" && (
                <CancelRdv
                  rdvId={selectedEvent.id}
                  appointment={selectedEvent}
                  onCancel={() => handleRdvUpdated(selectedEvent.id)}
                />
              )}
            </div>

            {/* Informations principales */}
            <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10">
              <h5 className="text-white font-one text-sm mb-3">Informations</h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60 text-xs font-one">
                    Date & Heure
                  </span>
                  <span className="text-white font-one text-xs text-right">
                    {new Date(selectedEvent.start).toLocaleDateString("fr-FR")}
                    <br />
                    {new Date(selectedEvent.start).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -
                    {new Date(selectedEvent.end).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 text-xs font-one">Durée</span>
                  <span className="text-white font-one text-xs">
                    {Math.round(
                      (new Date(selectedEvent.end).getTime() -
                        new Date(selectedEvent.start).getTime()) /
                        (1000 * 60)
                    )}{" "}
                    min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 text-xs font-one">
                    Prestation
                  </span>
                  <span className="text-white font-one text-xs">
                    {selectedEvent.prestation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 text-xs font-one">
                    Tatoueur
                  </span>
                  <span className="text-white font-one text-xs">
                    {selectedEvent.tatoueur.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Section Visio si applicable */}
            {selectedEvent.visio && (
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-3 border border-blue-400/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-300 font-medium font-one text-xs">
                    Rendez-vous en ligne
                  </span>
                </div>
                <p className="text-blue-200/80 text-xs font-one mb-3">
                  Ce rendez-vous se déroulera en visioconférence
                </p>

                {selectedEvent.visioRoom && (
                  <Link
                    href={`/meeting/${selectedEvent.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-300 hover:text-blue-200 transition-colors text-xs font-one font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Rejoindre la salle de visio
                  </Link>
                )}
              </div>
            )}

            {/* Paiement mobile si applicable */}
            {(selectedEvent.prestation === "RETOUCHE" ||
              selectedEvent.prestation === "TATTOO" ||
              selectedEvent.prestation === "PIERCING") && (
              <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10">
                <h5 className="text-white font-one text-sm mb-3">Paiement</h5>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 cursor-pointer bg-white/5 rounded-lg p-2 border border-white/10 flex-1">
                    <input
                      type="radio"
                      name={`payment-mobile-${selectedEvent.id}`}
                      checked={selectedEvent.isPayed === false}
                      onChange={() =>
                        handlePaymentStatusChange(selectedEvent.id, false)
                      }
                      className="w-3 h-3 text-red-500"
                    />
                    <span className="text-red-400 text-xs font-one">
                      Non payé
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-white/5 rounded-lg p-2 border border-white/10 flex-1">
                    <input
                      type="radio"
                      name={`payment-mobile-${selectedEvent.id}`}
                      checked={selectedEvent.isPayed === true}
                      onChange={() =>
                        handlePaymentStatusChange(selectedEvent.id, true)
                      }
                      className="w-3 h-3 text-green-500"
                    />
                    <span className="text-green-400 text-xs font-one">
                      Payé
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Détails tattoo mobiles */}
            {selectedEvent.tattooDetail && (
              <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10">
                <h5 className="text-white font-one text-sm mb-3">
                  Détails {selectedEvent.prestation}
                </h5>
                <div className="space-y-2">
                  {selectedEvent.tattooDetail.description && (
                    <div>
                      <p className="text-white/60 text-xs font-one mb-1">
                        Description
                      </p>
                      <p className="text-white font-one text-xs leading-relaxed">
                        {selectedEvent.tattooDetail.description}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {selectedEvent.tattooDetail.zone && (
                      <div>
                        <p className="text-white/60 text-xs font-one">Zone</p>
                        <p className="text-white font-one text-xs">
                          {selectedEvent.tattooDetail.zone}
                        </p>
                      </div>
                    )}
                    {selectedEvent.tattooDetail.size && (
                      <div>
                        <p className="text-white/60 text-xs font-one">Taille</p>
                        <p className="text-white font-one text-xs">
                          {selectedEvent.tattooDetail.size}
                        </p>
                      </div>
                    )}
                  </div>
                  {price !== undefined && price !== null && (
                    <div className="bg-gradient-to-r from-tertiary-500/10 to-primary-500/10 rounded-lg p-2 border border-tertiary-400/20">
                      <div className="bg-white/5 rounded-md p-2 border border-white/5">
                        <p className="text-orange-400 font-one font-semibold text-xs">
                          💰 Prix : {price}€
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer mobile */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <button
              onClick={onClose}
              className="cursor-pointer w-full py-3 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
