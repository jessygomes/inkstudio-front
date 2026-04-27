"use client";
import Image from "next/image";
import Link from "next/link";
import ConfirmRdv from "../RDV/ConfirmRdv";
import CancelRdv from "../RDV/CancelRdv";
import UpdateRdv from "../RDV/UpdateRdv";
import ChangeRdv from "../RDV/ChangeRdv";
import SendMessageRdv from "../RDV/SendMessageRdv";
import { UpdateRdvFormProps } from "@/lib/type";
import { formatSkinTone, getSkinTonePreviewHex } from "@/lib/utils/formatSkinTone";
import { openImageInNewTab } from "@/lib/utils/openImage";
import { useScrollLock } from "@/lib/hook/useScrollLock";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getPiercingServiceByIdAction } from "@/lib/queries/piercing";
import { calculateDuration } from "@/lib/utils/calculateDuration";
import { PendingAppointment } from "./WaitingRdv";

interface WaitingRdvDetailsPanelMobileProps {
  selectedAppointment: PendingAppointment;
  onClose: () => void;
  handleRdvUpdated: (updatedId: string) => void;
  handlePaymentStatusChange: (rdvId: string, isPayed: boolean) => void;
  userId: string;
}

export default function WaitingRdvDetailsPanelMobile({
  selectedAppointment,
  onClose,
  handleRdvUpdated,
  handlePaymentStatusChange,
  userId,
}: WaitingRdvDetailsPanelMobileProps) {
  // Bloquer le scroll du body quand la modal est ouverte
  useScrollLock(true);

  const tattooDetail = selectedAppointment.tattooDetail;

  const [piercingZoneName, setPiercingZoneName] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

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

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden bg-noir-700"
      style={{
        height: "100dvh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <div className="h-full w-full">
        <div className="flex h-full w-full min-h-0 flex-col overflow-hidden bg-gradient-to-br from-noir-500 to-noir-600 lg:rounded-[28px]">
          <div className="dashboard-embedded-header p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-tertiary-500 to-primary-500 shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {selectedAppointment.client.firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-lg font-bold tracking-wide text-white font-one">
                    {selectedAppointment.client.firstName}{" "}
                    {selectedAppointment.client.lastName}
                  </h4>
                  <p className="truncate text-xs text-white/70 font-one">
                    {selectedAppointment.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="cursor-pointer rounded-full p-2 transition-colors hover:bg-white/10"
              >
                <svg
                  className="h-6 w-6 text-white"
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

          <div className="flex-1 min-h-0 space-y-3 overflow-y-auto bg-noir-700/70 p-3">
            <div className="dashboard-embedded-section flex justify-between gap-3 p-2.5">
              <div className="flex items-center">
                <h5 className="flex items-center gap-2 text-sm text-white font-one">
                  <svg className="h-4 w-4 text-tertiary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Statut
                </h5>
              </div>

              <div>
                {selectedAppointment.status === "PENDING" ? (
                  <div className="rounded-2xl border border-orange-400/30 bg-gradient-to-r from-orange-500/15 to-amber-500/15 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse"></div>
                      <span className="text-xs font-medium text-orange-300 font-one">
                        En attente de confirmation
                      </span>
                    </div>
                  </div>
                ) : selectedAppointment.status === "RESCHEDULING" ? (
                  <div className="rounded-2xl border border-blue-400/30 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
                      <span className="text-xs font-medium text-blue-300 font-one">
                        En attente de reprogrammation
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-blue-200/80 font-one">
                      Le client doit choisir un nouveau créneau
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="dashboard-embedded-section p-2.5">
              <div className="mb-2 flex items-center gap-2">
                <h5 className="flex items-center gap-2 text-sm text-white font-one">
                  <svg className="h-4 w-4 text-tertiary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Actions rapides
                </h5>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {selectedAppointment.conversation?.id && (
                  <button
                    onClick={() => {
                      window.location.href = `/messagerie/${selectedAppointment.conversation?.id}`;
                    }}
                    className="cursor-pointer flex items-center gap-1.5 whitespace-nowrap rounded-[14px] border border-teal-500/40 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 px-2.5 py-1.5 text-xs font-medium text-teal-300 shadow-sm transition-all duration-200 hover:from-teal-500/30 hover:to-emerald-500/30 hover:shadow-md font-one"
                    title="Rejoindre la conversation"
                  >
                    <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>

            <div className="dashboard-embedded-section p-2.5">
              <h5 className="mb-3 flex items-center gap-2 text-sm text-white font-one">
                <svg className="h-4 w-4 text-tertiary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informations
              </h5>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(59,130,246,0.10),rgba(255,255,255,0.03))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] border border-blue-400/18 bg-blue-500/14">
                      <svg className="h-3 w-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-white/42 font-one">
                        Date & heure
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="rounded-full border border-white/10 bg-white/7 px-2 py-0.5 text-[10px] text-white/78 font-one">
                          {new Date(selectedAppointment.start).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/7 px-2 py-0.5 text-[10px] text-white/78 font-one">
                          {new Date(selectedAppointment.start).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(selectedAppointment.end).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(168,85,247,0.10),rgba(255,255,255,0.03))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] border border-purple-400/18 bg-purple-500/14">
                      <svg className="h-3 w-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-white/42 font-one">
                        Durée
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-none text-white font-one">
                        {calculateDuration(selectedAppointment.start, selectedAppointment.end)}
                        <span className="ml-1 text-[10px] font-medium text-white/50">min</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(34,197,94,0.10),rgba(255,255,255,0.03))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] border border-green-400/18 bg-green-500/14">
                      <svg className="h-3 w-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-white/42 font-one">
                        Prestation
                      </p>
                      <p className="mt-1 truncate text-xs font-medium text-white/86 font-one">
                        {selectedAppointment.prestation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(249,115,22,0.10),rgba(255,255,255,0.03))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] border border-orange-400/18 bg-orange-500/14">
                      <svg className="h-3 w-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-white/42 font-one">
                        Tatoueur
                      </p>
                      <p className="mt-1 truncate text-xs font-medium text-white/86 font-one">
                        {selectedAppointment.tatoueur?.name || "Non assigné"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedAppointment.visio && (
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/6 to-white/3 p-3 backdrop-blur-sm">
                <h5 className="mb-3 flex items-center gap-2 text-sm text-white font-one">
                  <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Visioconférence
                </h5>

                <div className="rounded-lg border border-blue-400/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
                    <span className="text-xs font-medium text-blue-300 font-one">Rendez-vous en ligne</span>
                  </div>
                  <p className="mb-3 text-xs text-blue-200/80 font-one">
                    Ce rendez-vous se déroulera en visioconférence
                  </p>

                  {selectedAppointment.visioRoom && (
                    <Link
                      href={`/meeting/${selectedAppointment.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-400/30 bg-blue-500/20 px-3 py-2 text-xs font-medium text-blue-300 transition-colors hover:bg-blue-500/30 hover:text-blue-200 font-one"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Rejoindre la salle de visio
                    </Link>
                  )}
                </div>
              </div>
            )}

            {selectedAppointment.client.email && (
              <div className="dashboard-embedded-section rounded-xl border border-white/10 p-3 backdrop-blur-sm">
                <h5 className="mb-3 flex items-center gap-2 text-sm text-white font-one">
                  <svg className="h-4 w-4 text-tertiary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m0 0l3-3m-3 3l3 3m9-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Contact
                </h5>

                <div className="space-y-1 rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <p className="text-xs text-white/80 font-one">
                    {selectedAppointment.client.email}
                  </p>
                  {selectedAppointment.client.phone && (
                    <p className="text-xs text-white/80 font-one">
                      {selectedAppointment.client.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {(selectedAppointment.prestation === "RETOUCHE" ||
              selectedAppointment.prestation === "TATTOO" ||
              selectedAppointment.prestation === "PIERCING") && (
              <div className="dashboard-embedded-section rounded-xl border border-white/10 p-3 backdrop-blur-sm">
                <h5 className="mb-3 flex items-center gap-2 text-sm text-white font-one">
                  <svg className="h-4 w-4 text-tertiary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Paiement
                </h5>

                <div className="flex gap-2">
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
                    <input
                      type="radio"
                      name={`payment-mobile-${selectedAppointment.id}`}
                      checked={selectedAppointment.isPayed === false}
                      onChange={() => handlePaymentStatusChange(selectedAppointment.id, false)}
                      className="h-3 w-3 text-red-500"
                    />
                    <span className="text-xs text-red-400 font-one">Non payé</span>
                  </label>
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
                    <input
                      type="radio"
                      name={`payment-mobile-${selectedAppointment.id}`}
                      checked={selectedAppointment.isPayed === true}
                      onChange={() => handlePaymentStatusChange(selectedAppointment.id, true)}
                      className="h-3 w-3 text-green-500"
                    />
                    <span className="text-xs text-green-400 font-one">Payé</span>
                  </label>
                </div>
              </div>
            )}

            {tattooDetail && (
              <div className="dashboard-embedded-section rounded-xl border border-white/10 p-3 backdrop-blur-sm">
                <h5 className="mb-3 flex items-center gap-2 text-sm text-white font-one">
                  <svg className="h-4 w-4 text-tertiary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Détails : {selectedAppointment.prestation}
                </h5>

                <div className="space-y-2">
                  {tattooDetail.description && (
                    <div className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/42 font-one">
                        Description
                      </p>
                      <p className="text-xs leading-relaxed text-white/86 font-one">
                        {tattooDetail.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {tattooDetail.piercingZone && (
                      <div className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/42 font-one">
                          Zone de piercing
                        </p>
                        <p className="text-xs leading-relaxed text-white/86 font-one">
                          {tattooDetail.piercingZone}
                        </p>
                      </div>
                    )}

                    {piercingZoneName && (
                      <div className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/42 font-one">
                          Zone de piercing spécifique
                        </p>
                        <p className="text-xs leading-relaxed text-white/86 font-one">
                          {piercingZoneName}
                        </p>
                      </div>
                    )}

                    {selectedAppointment.skin && (
                      <div className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/42 font-one">
                          Teinte de peau
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-white/86 font-one">
                          <span
                            className="inline-block h-3 w-3 flex-shrink-0 rounded-full border border-white/20"
                            style={{
                              backgroundColor: getSkinTonePreviewHex(selectedAppointment.skin) ?? undefined,
                            }}
                            aria-hidden="true"
                          />
                          {formatSkinTone(selectedAppointment.skin)}
                        </p>
                      </div>
                    )}
                  </div>

                  {(tattooDetail.reference || tattooDetail.sketch) && (
                    <div className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-white/42 font-one">
                        Images
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {tattooDetail.reference && (
                          <div
                            className="group relative h-32 w-full cursor-pointer overflow-hidden rounded-[18px] border border-white/10 bg-white/5"
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
                              alt="Référence"
                              fill
                              className="pointer-events-none object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/20">
                              <svg className="h-4 w-4 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </div>
                          </div>
                        )}

                        {tattooDetail.sketch && (
                          <div
                            className="group relative h-32 w-full cursor-pointer overflow-hidden rounded-[18px] border border-white/10 bg-white/5"
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
                              className="pointer-events-none object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/20">
                              <svg className="h-4 w-4 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {((tattooDetail.estimatedPrice !== undefined &&
                    tattooDetail.estimatedPrice !== null &&
                    tattooDetail.estimatedPrice > 0) ||
                    (tattooDetail.price !== undefined &&
                      tattooDetail.price !== null &&
                      tattooDetail.price > 0)) && (
                    <div className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/42 font-one">
                        Budget
                      </p>
                      <div className="rounded-[16px] border border-white/8 bg-white/5 px-2.5 py-2">
                        {tattooDetail.price ? (
                          <p className="text-xs font-semibold text-white font-one">
                            Prix final :
                            <span className="ml-1 text-white/86">{tattooDetail.price}€</span>
                          </p>
                        ) : (
                          <p className="text-xs font-semibold text-white font-one">
                            Prix estimé :
                            <span className="ml-1 text-white/86">{tattooDetail.estimatedPrice}€</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="dashboard-embedded-footer px-3 py-2.5">
            <div className="flex items-center justify-between gap-2 rounded-[18px] border border-white/8 bg-black/12 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-[11px] leading-none text-white/58 font-one">
                Mis a jour le {new Date(selectedAppointment.updatedAt).toLocaleDateString("fr-FR")}
              </p>
              <button
                onClick={onClose}
                className="cursor-pointer inline-flex min-w-[92px] items-center justify-center rounded-[14px] border border-white/12 bg-white/8 px-4 py-2 text-[13px] font-medium text-white transition-colors duration-200 hover:bg-white/14 font-one"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isMounted) {
    return null;
  }

  return createPortal(modalContent, document.body);
}
