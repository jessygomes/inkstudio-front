"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import ConfirmRdv from "../RDV/ConfirmRdv";
import UpdateRdv from "../RDV/UpdateRdv";
import CancelRdv from "../RDV/CancelRdv";
import ChangeRdv from "../RDV/ChangeRdv";
import ChangeStatusButtons from "../RDV/ChangeStatusButtons";
import SendMessageRdv from "../RDV/SendMessageRdv";
import { UpdateRdvFormProps } from "@/lib/type";
import { openImageInNewTab } from "@/lib/utils/openImage";
import Link from "next/link";
import { getPiercingServiceByIdAction } from "@/lib/queries/piercing";
import { useScrollLock } from "@/lib/hook/useScrollLock";
import { RendezVous } from "./RdvDetailsPanelDesktop";

interface RdvDetailsPanelMobileProps {
  selectedAppointment: RendezVous;
  onClose: () => void;
  handleRdvUpdated: (updatedId: string) => void;
  handleStatusChange: (rdvId: string, status: "COMPLETED" | "NO_SHOW") => void;
  handlePaymentStatusChange: (rdvId: string, isPayed: boolean) => void;
  userId: string;
}

export default function RdvDetailsPanelMobile({
  selectedAppointment,
  onClose,
  handleRdvUpdated,
  handleStatusChange,
  handlePaymentStatusChange,
  userId,
}: RdvDetailsPanelMobileProps) {
  // Bloquer le scroll du body quand la modal est ouverte
  useScrollLock(true);

  const [piercingZoneName, setPiercingZoneName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPiercingDetails() {
      if (selectedAppointment.tattooDetail?.piercingServicePriceId) {
        try {
          const piercingResult = await getPiercingServiceByIdAction(
            selectedAppointment.tattooDetail.piercingServicePriceId,
          );

          if (piercingResult.ok && piercingResult.data) {
            const service = piercingResult.data;

            const zoneName =
              service.piercingZoneOreille ||
              service.piercingZoneVisage ||
              service.piercingZoneBouche ||
              service.piercingCorps ||
              "Zone non spécifiée";

            setPiercingZoneName(zoneName);
          }
        } catch {
          setPiercingZoneName(null);
        }
      } else {
        setPiercingZoneName(null);
      }
    }

    fetchPiercingDetails();
  }, [
    selectedAppointment.id,
    selectedAppointment.tattooDetail?.piercingServicePriceId,
  ]);

  return (
    <div
      className="fixed inset-0 z-50 bg-noir-700 overflow-hidden"
      style={{
        height: "100dvh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      <div className="w-full h-full">
        <div className="w-full h-full bg-gradient-to-br from-noir-500 to-noir-600 overflow-hidden flex flex-col min-h-0">
          {/* Header mobile */}
          <div className="relative p-4 border-b border-white/10 bg-gradient-to-r from-noir-700/80 to-noir-500/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-tertiary-500 to-tertiary-400 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {selectedAppointment.client.firstName
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-bold font-one text-white tracking-wide truncate">
                    {selectedAppointment.client.firstName}{" "}
                    {selectedAppointment.client.lastName}
                  </h4>
                  <p className="text-white/70 text-xs font-one truncate">
                    {selectedAppointment.title}
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {/* Statut */}
            <div className="bg-gradient-to-r from-white/8 to-white/4 rounded-xl p-3 border border-white/10">
              <h5 className="text-white font-one text-sm mb-2">Statut</h5>
              {selectedAppointment.status === "PENDING" ? (
                <div className="bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-orange-300 font-medium font-one text-xs">
                      En attente de confirmation
                    </span>
                  </div>
                </div>
              ) : selectedAppointment.status === "CONFIRMED" ? (
                <div className="bg-gradient-to-r from-green-500/15 to-emerald-500/15 border border-green-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-300 font-medium font-one text-xs">
                      Confirmé
                    </span>
                  </div>
                </div>
              ) : selectedAppointment.status === "COMPLETED" ? (
                <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-emerald-300 font-medium font-one text-xs">
                      Complété
                    </span>
                  </div>
                </div>
              ) : selectedAppointment.status === "NO_SHOW" ? (
                <div className="bg-gradient-to-r from-amber-500/15 to-orange-600/15 border border-amber-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-amber-300 font-medium font-one text-xs">
                      Pas présenté
                    </span>
                  </div>
                </div>
              ) : selectedAppointment.status === "CANCELED" ? (
                <div className="bg-gradient-to-r from-red-500/15 to-rose-500/15 border border-red-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-red-300 font-medium font-one text-xs">
                      Annulé
                    </span>
                  </div>
                </div>
              ) : selectedAppointment.status === "RESCHEDULING" ? (
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
              {/* Bouton Rejoindre la conversation - si une conversation existe */}
              {selectedAppointment.conversation?.id && (
                <button
                  onClick={() => {
                    window.location.href = `/messagerie/${selectedAppointment.conversation?.id}`;
                  }}
                  className="cursor-pointer px-2.5 py-1.5 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 text-teal-300 border border-teal-500/40 rounded-md text-xs font-one font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shadow-sm hover:shadow-md"
                  title="Rejoindre la conversation"
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
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  <span>Conversation</span>
                </button>
              )}

              {/* Bouton Confirmer */}
              {selectedAppointment.status !== "CONFIRMED" &&
                selectedAppointment.status !== "RESCHEDULING" &&
                selectedAppointment.status !== "COMPLETED" &&
                selectedAppointment.status !== "NO_SHOW" && (
                  <ConfirmRdv
                    rdvId={selectedAppointment.id}
                    appointment={selectedAppointment}
                    onConfirm={() => handleRdvUpdated(selectedAppointment.id)}
                  />
                )}

              {/* Bouton Modifier */}
              {!(
                selectedAppointment.status === "CONFIRMED" &&
                new Date(selectedAppointment.end) < new Date()
              ) &&
                selectedAppointment.status !== "COMPLETED" &&
                selectedAppointment.status !== "NO_SHOW" && (
                  <UpdateRdv
                    rdv={selectedAppointment as unknown as UpdateRdvFormProps}
                    userId={userId}
                    onUpdate={() => handleRdvUpdated(selectedAppointment.id)}
                  />
                )}

              <ChangeRdv
                rdvId={selectedAppointment.id}
                userId={userId}
                appointment={selectedAppointment}
              />

              {/* Bouton Annuler */}
              {selectedAppointment.status !== "CANCELED" &&
                selectedAppointment.status !== "COMPLETED" &&
                selectedAppointment.status !== "NO_SHOW" &&
                !(
                  selectedAppointment.status === "CONFIRMED" &&
                  new Date(selectedAppointment.end) < new Date()
                ) && (
                  <CancelRdv
                    rdvId={selectedAppointment.id}
                    appointment={selectedAppointment}
                    onCancel={() => handleRdvUpdated(selectedAppointment.id)}
                  />
                )}

              {/* Boutons pour changer le statut */}
              {((selectedAppointment.status === "CONFIRMED" &&
                new Date(selectedAppointment.end) < new Date()) ||
                selectedAppointment.status === "COMPLETED" ||
                selectedAppointment.status === "NO_SHOW") && (
                <ChangeStatusButtons
                  rdvId={selectedAppointment.id}
                  currentStatus={selectedAppointment.status}
                  onStatusChange={handleStatusChange}
                  size="sm"
                />
              )}

              {/* Bouton Message */}
              {selectedAppointment.status !== "CANCELED" && (
                <SendMessageRdv
                  rdvId={selectedAppointment.id}
                  appointment={selectedAppointment}
                  onMessageSent={() => handleRdvUpdated(selectedAppointment.id)}
                  buttonLabel="Envoyer un mail"
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
                    {new Date(selectedAppointment.start).toLocaleDateString(
                      "fr-FR",
                    )}
                    <br />
                    {new Date(selectedAppointment.start).toLocaleTimeString(
                      "fr-FR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}{" "}
                    -{" "}
                    {new Date(selectedAppointment.end).toLocaleTimeString(
                      "fr-FR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 text-xs font-one">Durée</span>
                  <span className="text-white font-one text-xs">
                    {Math.round(
                      (new Date(selectedAppointment.end).getTime() -
                        new Date(selectedAppointment.start).getTime()) /
                        (1000 * 60),
                    )}{" "}
                    min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 text-xs font-one">
                    Prestation
                  </span>
                  <span className="text-white font-one text-xs">
                    {selectedAppointment.prestation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 text-xs font-one">
                    Tatoueur
                  </span>
                  <span className="text-white font-one text-xs">
                    {selectedAppointment.tatoueur?.name || "Non assigné"}
                  </span>
                </div>
              </div>
            </div>

            {/* Section Visio si applicable */}
            {selectedAppointment.visio && (
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

                {selectedAppointment.visioRoom && (
                  <Link
                    href={`/meeting/${selectedAppointment.id}`}
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
            {(selectedAppointment.prestation === "RETOUCHE" ||
              selectedAppointment.prestation === "TATTOO" ||
              selectedAppointment.prestation === "PIERCING") && (
              <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10">
                <h5 className="text-white font-one text-sm mb-3">Paiement</h5>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 cursor-pointer bg-white/5 rounded-lg p-2 border border-white/10 flex-1">
                    <input
                      type="radio"
                      name={`payment-mobile-${selectedAppointment.id}`}
                      checked={selectedAppointment.isPayed === false}
                      onChange={() =>
                        handlePaymentStatusChange(selectedAppointment.id, false)
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
                      name={`payment-mobile-${selectedAppointment.id}`}
                      checked={selectedAppointment.isPayed === true}
                      onChange={() =>
                        handlePaymentStatusChange(selectedAppointment.id, true)
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
            {selectedAppointment.tattooDetail && (
              <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10">
                <h5 className="text-white font-one text-sm mb-3">
                  Détails {selectedAppointment.prestation}
                </h5>
                <div className="space-y-2">
                  {selectedAppointment.tattooDetail.description && (
                    <div>
                      <p className="text-white/60 text-xs font-one mb-1">
                        Description
                      </p>
                      <p className="text-white font-one text-xs leading-relaxed">
                        {selectedAppointment.tattooDetail.description}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {selectedAppointment.tattooDetail.zone && (
                      <div>
                        <p className="text-white/60 text-xs font-one">Zone</p>
                        <p className="text-white font-one text-xs">
                          {selectedAppointment.tattooDetail.zone}
                        </p>
                      </div>
                    )}
                    {selectedAppointment.tattooDetail.size && (
                      <div>
                        <p className="text-white/60 text-xs font-one">Taille</p>
                        <p className="text-white font-one text-xs">
                          {selectedAppointment.tattooDetail.size}
                        </p>
                      </div>
                    )}
                    {selectedAppointment.tattooDetail.piercingZone && (
                      <div>
                        <p className="text-white/60 text-xs font-one mb-1">
                          Zone de piercing
                        </p>
                        <p className="text-white font-one text-xs leading-relaxed">
                          {selectedAppointment.tattooDetail.piercingZone}
                        </p>
                      </div>
                    )}

                    {piercingZoneName && (
                      <div>
                        <p className="text-white/60 text-xs font-one mb-1">
                          Zone de piercing spécifique
                        </p>
                        <p className="text-white font-one text-xs leading-relaxed">
                          {piercingZoneName}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Images de référence mobiles */}
                  {(selectedAppointment.tattooDetail.reference ||
                    selectedAppointment.tattooDetail.sketch) && (
                    <div>
                      <p className="text-white/60 text-xs font-one mb-2">
                        Images
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedAppointment.tattooDetail.reference && (
                          <div
                            className="relative w-full h-32 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (selectedAppointment.tattooDetail.reference) {
                                openImageInNewTab(
                                  selectedAppointment.tattooDetail.reference,
                                );
                              }
                            }}
                          >
                            <Image
                              src={selectedAppointment.tattooDetail.reference}
                              alt="Référence"
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center pointer-events-none">
                              <svg
                                className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
                            </div>
                          </div>
                        )}
                        {selectedAppointment.tattooDetail.sketch && (
                          <div
                            className="relative w-full h-32 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (selectedAppointment.tattooDetail.sketch) {
                                openImageInNewTab(
                                  selectedAppointment.tattooDetail.sketch,
                                );
                              }
                            }}
                          >
                            <Image
                              src={selectedAppointment.tattooDetail.sketch}
                              alt="Croquis"
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center pointer-events-none">
                              <svg
                                className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Prix mobile */}
                  {((selectedAppointment.tattooDetail.estimatedPrice !==
                    undefined &&
                    selectedAppointment.tattooDetail.estimatedPrice !== null &&
                    selectedAppointment.tattooDetail.estimatedPrice > 0) ||
                    (selectedAppointment.tattooDetail.price !== undefined &&
                      selectedAppointment.tattooDetail.price !== null &&
                      selectedAppointment.tattooDetail.price > 0)) && (
                    <div className="bg-gradient-to-r from-tertiary-500/10 to-primary-500/10 rounded-lg p-2 border border-tertiary-400/20">
                      <div className="bg-white/5 rounded-md p-2 border border-white/5">
                        {selectedAppointment.tattooDetail.price ? (
                          <p className="text-orange-400 font-one font-semibold text-xs">
                            💰 Prix final :{" "}
                            {selectedAppointment.tattooDetail.price}€
                          </p>
                        ) : (
                          <p className="text-orange-400 font-one font-semibold text-xs">
                            💰 Prix estimé :{" "}
                            {selectedAppointment.tattooDetail.estimatedPrice}€
                          </p>
                        )}
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
