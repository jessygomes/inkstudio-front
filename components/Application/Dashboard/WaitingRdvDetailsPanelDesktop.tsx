"use client";
import Image from "next/image";
import Link from "next/link";
import ConfirmRdv from "../RDV/ConfirmRdv";
import CancelRdv from "../RDV/CancelRdv";
import UpdateRdv from "../RDV/UpdateRdv";
import ChangeRdv from "../RDV/ChangeRdv";
import SendMessageRdv from "../RDV/SendMessageRdv";
import { UpdateRdvFormProps } from "@/lib/type";
import { openImageInNewTab } from "@/lib/utils/openImage";
import { useEffect, useState } from "react";
import { getPiercingServiceByIdAction } from "@/lib/queries/piercing";
import { calculateDuration } from "@/lib/utils/calculateDuration";
import { PendingAppointment } from "./WaitingRdv";

interface WaitingRdvDetailsPanelDesktopProps {
  selectedAppointment: PendingAppointment;
  onClose: () => void;
  handleRdvUpdated: (updatedId: string) => void;
  handlePaymentStatusChange: (rdvId: string, isPayed: boolean) => void;
  userId: string;
}

export default function WaitingRdvDetailsPanelDesktop({
  selectedAppointment,
  onClose,
  handleRdvUpdated,
  handlePaymentStatusChange,
  userId,
}: WaitingRdvDetailsPanelDesktopProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui ${date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    if (date.toDateString() === tomorrow.toDateString()) {
      return `Demain ${date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tattooDetail = selectedAppointment.tattooDetail;
  const [piercingZoneName, setPiercingZoneName] = useState<string | null>(null);

  // Récupérer le nom de la zone de piercing détaillée
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
    <div className="h-full w-full bg-gradient-to-br from-noir-700/90 to-noir-500/90 backdrop-blur-sm rounded-xl flex flex-col border border-white/20 shadow-2xl animate-in slide-in-from-right-4 duration-300">
      {/* Header desktop */}
      <div className="relative p-3 border-b border-white/10 bg-gradient-to-r from-noir-700 to-noir-500 rounded-t-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 to-transparent rounded-t-xl"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xs">
                {selectedAppointment.client.firstName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold font-one text-white tracking-wide truncate">
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
            className="cursor-pointer p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <svg
              className="w-4 h-4 text-white/70 group-hover:text-white transition-colors"
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

      {/* Contenu scrollable desktop */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* Statut */}
        <div className="bg-gradient-to-r from-white/8 to-white/4 rounded-lg p-2 border border-white/10">
          <h5 className="text-white font-one text-xs mb-2 flex items-center gap-1">
            <svg
              className="w-3 h-3 text-orange-500"
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
            Statut
          </h5>
          {selectedAppointment.status === "PENDING" ? (
            <div className="bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-400/30 rounded-md p-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-orange-300 font-medium font-one text-xs">
                  En attente de confirmation
                </span>
              </div>
            </div>
          ) : selectedAppointment.status === "RESCHEDULING" ? (
            <div className="bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-400/30 rounded-md p-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-300 font-medium font-one text-xs">
                  En attente de reprogrammation
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Actions desktop */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedAppointment.conversation?.id && (
            <button
              onClick={() => {
                window.location.href = `/messagerie/${selectedAppointment.conversation?.id}`;
              }}
              className="cursor-pointer px-2.5 py-1.5 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 text-teal-300 border border-teal-500/40 rounded-md text-xs font-one font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shadow-sm hover:shadow-md"
              title="Rejoindre la conversation"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span>Conversation</span>
            </button>
          )}
          {selectedAppointment.status !== "CONFIRMED" && (
            <ConfirmRdv
              rdvId={selectedAppointment.id}
              appointment={selectedAppointment}
              onConfirm={() => handleRdvUpdated(selectedAppointment.id)}
            />
          )}
          <UpdateRdv
            rdv={selectedAppointment as unknown as UpdateRdvFormProps}
            userId={userId}
            onUpdate={() => handleRdvUpdated(selectedAppointment.id)}
          />
          <ChangeRdv
            rdvId={selectedAppointment.id}
            userId={userId}
            appointment={selectedAppointment}
          />
          {selectedAppointment.status !== "CANCELED" && (
            <CancelRdv
              rdvId={selectedAppointment.id}
              appointment={selectedAppointment}
              onCancel={() => handleRdvUpdated(selectedAppointment.id)}
            />
          )}
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
        <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-lg p-2 border border-white/10">
          <h5 className="text-white font-one text-xs mb-2 flex items-center gap-1">
            <svg
              className="w-3 h-3 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Informations
          </h5>

          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-white/5 rounded-md p-1.5 border border-white/5">
              <p className="text-white/60 text-xs font-one">Date & Heure</p>
              <p className="text-white font-one text-xs">
                {formatDate(selectedAppointment.start)}
              </p>
            </div>
            <div className="bg-white/5 rounded-md p-1.5 border border-white/5">
              <p className="text-white/60 text-xs font-one">Durée</p>
              <p className="text-white font-one text-xs">
                {calculateDuration(
                  selectedAppointment.start,
                  selectedAppointment.end,
                )}{" "}
                min
              </p>
            </div>
            <div className="bg-white/5 rounded-md p-1.5 border border-white/5">
              <p className="text-white/60 text-xs font-one">Prestation</p>
              <p className="text-white font-one text-xs">
                {selectedAppointment.prestation}
              </p>
            </div>
            <div className="bg-white/5 rounded-md p-1.5 border border-white/5">
              <p className="text-white/60 text-xs font-one">Tatoueur</p>
              <p className="text-white font-one text-xs">
                {selectedAppointment.tatoueur?.name || "Non assigné"}
              </p>
            </div>
          </div>

          {/* Section Visio si applicable */}
          {selectedAppointment.visio && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-md p-1.5 border border-blue-400/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-300 font-medium font-one text-xs">
                    Rendez-vous en ligne
                  </span>
                </div>
                {selectedAppointment.visioRoom && (
                  <Link
                    href={`/meeting/${selectedAppointment.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-md text-blue-300 hover:text-blue-200 transition-colors text-xs font-one"
                    onClick={(e) => e.stopPropagation()}
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Rejoindre la visio
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Contact client */}
          {selectedAppointment.client.email && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="bg-white/5 rounded-md p-1.5 border border-white/5">
                <p className="text-white/60 text-xs font-one mb-1">Contact</p>
                <p className="text-white/80 text-xs font-one truncate">
                  {selectedAppointment.client.email}
                </p>
                {selectedAppointment.client.phone && (
                  <p className="text-white/80 text-xs font-one">
                    {selectedAppointment.client.phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Statut de paiement */}
        {(selectedAppointment.prestation === "RETOUCHE" ||
          selectedAppointment.prestation === "TATTOO" ||
          selectedAppointment.prestation === "PIERCING") && (
          <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-lg p-2 border border-white/10">
            <h5 className="text-white font-one text-xs mb-2 flex items-center gap-1">
              <svg
                className="w-3 h-3 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Paiement
            </h5>

            <div className="flex gap-1">
              <label className="flex items-center gap-1.5 cursor-pointer bg-white/5 rounded-md p-1.5 border border-white/10 hover:bg-white/10 transition-colors flex-1">
                <input
                  type="radio"
                  name={`payment-desktop-${selectedAppointment.id}`}
                  checked={selectedAppointment.isPayed === false}
                  onChange={() =>
                    handlePaymentStatusChange(selectedAppointment.id, false)
                  }
                  className="w-2.5 h-2.5 text-red-500"
                />
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                  <span className="text-red-400 text-xs font-one">
                    Non payé
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer bg-white/5 rounded-md p-1.5 border border-white/10 hover:bg-white/10 transition-colors flex-1">
                <input
                  type="radio"
                  name={`payment-desktop-${selectedAppointment.id}`}
                  checked={selectedAppointment.isPayed === true}
                  onChange={() =>
                    handlePaymentStatusChange(selectedAppointment.id, true)
                  }
                  className="w-2.5 h-2.5 text-green-500"
                />
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-xs font-one">Payé</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Détails tattoo desktop */}
        {tattooDetail && (
          <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-lg p-2 border border-white/10">
            <h5 className="text-white font-one text-xs mb-2 flex items-center gap-1">
              <svg
                className="w-3 h-3 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
              Détails {selectedAppointment.prestation}
            </h5>

            <div className="space-y-1.5">
              {tattooDetail.piercingZone && (
                <div className="bg-white/5 rounded-md p-1.5 border border-white/5">
                  <p className="text-white/60 text-xs font-one mb-0.5">
                    Zone de piercing
                  </p>
                  <p className="text-white font-one text-xs">
                    {tattooDetail.piercingZone}
                  </p>
                </div>
              )}

              {piercingZoneName && (
                <div className="bg-white/5 rounded-md p-1.5 border border-white/5">
                  <p className="text-white/60 text-xs font-one mb-0.5">
                    Zone spécifique
                  </p>
                  <p className="text-white font-one text-xs">
                    {piercingZoneName}
                  </p>
                </div>
              )}

              {tattooDetail.description && (
                <div className="bg-white/5 rounded-md p-1.5 border border-white/5">
                  <p className="text-white/60 text-xs font-one mb-0.5">
                    Description
                  </p>
                  <p className="text-white font-one text-xs">
                    {tattooDetail.description}
                  </p>
                </div>
              )}

              {/* Prix estimé */}
              {tattooDetail.estimatedPrice && (
                <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-md p-1.5 border border-orange-400/20">
                  <p className="text-orange-400 font-one font-semibold text-xs">
                    💰 Estimé: {tattooDetail.estimatedPrice}€
                  </p>
                </div>
              )}

              {/* Images compactes */}
              {(tattooDetail.reference || tattooDetail.sketch) && (
                <div>
                  <p className="text-white/60 text-xs font-one mb-1">Images</p>
                  <div className="flex gap-1">
                    {tattooDetail.reference && (
                      <div
                        className="relative w-12 h-12 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer flex-shrink-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (tattooDetail.reference) {
                            openImageInNewTab(tattooDetail.reference);
                          }
                        }}
                      >
                        <Image
                          src={tattooDetail.reference}
                          alt="Ref"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center pointer-events-none">
                          <svg
                            className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
                    {tattooDetail.sketch && (
                      <div
                        className="relative w-12 h-12 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer flex-shrink-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (tattooDetail.sketch) {
                            openImageInNewTab(tattooDetail.sketch);
                          }
                        }}
                      >
                        <Image
                          src={tattooDetail.sketch}
                          alt="Croquis"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center pointer-events-none">
                          <svg
                            className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
            </div>
          </div>
        )}
      </div>

      {/* Footer desktop */}
      <div className="p-2 border-t border-white/10 bg-white/5 rounded-b-xl">
        <button
          onClick={onClose}
          className="cursor-pointer w-full py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-md border border-white/20 transition-colors font-medium font-one"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
