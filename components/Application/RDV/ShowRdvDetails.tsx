import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarEvent } from "./Calendar";
import ConfirmRdv from "./ConfirmRdv";
import UpdateRdv from "./UpdateRdv";
import CancelRdv from "./CancelRdv";
import ChangeRdv from "./ChangeRdv";
import ChangeStatusButtons from "./ChangeStatusButtons";
import SendMessageRdv from "./SendMessageRdv";
import { UpdateRdvFormProps } from "@/lib/type";
import { formatSkinTone, getSkinTonePreviewHex } from "@/lib/utils/formatSkinTone";
import { openImageInNewTab } from "@/lib/utils/openImage";
import Link from "next/link";
import { getPiercingServiceByIdAction } from "@/lib/queries/piercing";

const STATUS_CONFIG = {
  PENDING: { label: "En attente", dot: "bg-amber-400 animate-pulse", pill: "bg-amber-500/12 text-amber-300 border-amber-400/25" },
  CONFIRMED: { label: "Confirmé", dot: "bg-emerald-400", pill: "bg-emerald-500/12 text-emerald-300 border-emerald-400/25" },
  COMPLETED: { label: "Complété", dot: "bg-teal-400", pill: "bg-teal-500/12 text-teal-300 border-teal-400/25" },
  NO_SHOW: { label: "Pas présenté", dot: "bg-orange-400", pill: "bg-orange-500/12 text-orange-300 border-orange-400/25" },
  CANCELED: { label: "Annulé", dot: "bg-red-400", pill: "bg-red-500/12 text-red-300 border-red-400/25" },
  RESCHEDULING: { label: "Reprogrammation", dot: "bg-blue-400 animate-pulse", pill: "bg-blue-500/12 text-blue-300 border-blue-400/25" },
} as const;

interface ShowRdvDetailsProps {
  selectedEvent: CalendarEvent;
  onClose: () => void;
  handleRdvUpdated: (rdvId: string) => void;
  handleStatusChange: (rdvId: string, status: "COMPLETED" | "NO_SHOW") => void;
  handlePaymentStatusChange: (rdvId: string, isPayed: boolean) => void;
  userId: string | null;
  price: number | undefined;
}

export default function ShowRdvDetails({
  selectedEvent,
  onClose,
  handleRdvUpdated,
  handleStatusChange,
  handlePaymentStatusChange,
  userId,
  price,
}: ShowRdvDetailsProps) {
  const [piercingZoneName, setPiercingZoneName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPiercingDetails() {
      if (selectedEvent.tattooDetail?.piercingServicePriceId) {
        try {
          const piercingResult = await getPiercingServiceByIdAction(
            selectedEvent.tattooDetail.piercingServicePriceId,
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
  }, [selectedEvent.id, selectedEvent.tattooDetail?.piercingServicePriceId]);

  const statusCfg =
    STATUS_CONFIG[selectedEvent.status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.PENDING;

  const durationMin = Math.round(
    (new Date(selectedEvent.end).getTime() -
      new Date(selectedEvent.start).getTime()) /
      60000,
  );

  const startDate = new Date(selectedEvent.start).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const startTime = new Date(selectedEvent.start).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(selectedEvent.end).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const displayPrice =
    price ?? selectedEvent.tattooDetail?.price ?? selectedEvent.tattooDetail?.estimatedPrice;
  const hasPrice = typeof displayPrice === "number" && displayPrice > 0;
  const tattooDetail = selectedEvent.tattooDetail;

  return (
    <div className="dashboard-embedded-panel flex h-full flex-col">
      <div className="dashboard-embedded-header rounded-t-[28px] px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-11 h-11 bg-gradient-to-br from-tertiary-500 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base leading-none">
                  {selectedEvent.client.firstName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1a1a1a] ${statusCfg.dot}`} />
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-base font-bold text-white font-one leading-tight">
                {selectedEvent.client.firstName} {selectedEvent.client.lastName}
              </h4>
              <span className={`mt-1 inline-flex items-center gap-1.5 border rounded-full px-2 py-0.5 text-[10px] font-medium font-one ${statusCfg.pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
                {selectedEvent.status === "RESCHEDULING" && (
                  <span className="text-[9px] opacity-70"> · client doit replanifier</span>
                )}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer shrink-0 p-1.5 hover:bg-white/10 rounded-xl transition-colors group"
          >
            <svg className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="dashboard-embedded-section p-3">
          <p className="mb-2.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">Rendez-vous</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2.5 rounded-xl bg-white/4 border border-white/7 px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-500/12 border border-blue-400/15">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Date</p>
                <p className="text-xs font-medium text-white font-one capitalize">{startDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-white/4 border border-white/7 px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-500/12 border border-blue-400/15">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Heure</p>
                <p className="text-xs font-medium text-white font-one tabular-nums">{startTime} - {endTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-white/4 border border-white/7 px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-purple-500/12 border border-purple-400/15">
                <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Durée</p>
                <p className="text-xs font-medium text-white/90 font-one">{durationMin} min</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-white/4 border border-white/7 px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 border border-emerald-400/15">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Prestation</p>
                <p className="text-xs font-medium text-white/90 font-one truncate">{selectedEvent.prestation}</p>
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-2.5 rounded-xl bg-white/4 border border-white/7 px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-tertiary-500/12 border border-tertiary-400/15">
                <svg className="w-3.5 h-3.5 text-tertiary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Artiste</p>
                <p className="text-xs font-medium text-white/90 font-one truncate">
                  {selectedEvent.tatoueur?.name || (
                    <span className="text-white/35 italic">Non assigné</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-embedded-section p-3">
          <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">Actions</p>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bouton Rejoindre la conversation - si une conversation existe */}
            {selectedEvent.conversation?.id && (
              <button
                onClick={() => {
                  window.location.href = `/messagerie/${selectedEvent.conversation?.id}`;
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

            {/* Bouton Confirmer - pas pour CONFIRMED, RESCHEDULING, COMPLETED, NO_SHOW */}
            {selectedEvent.status !== "CONFIRMED" &&
              selectedEvent.status !== "RESCHEDULING" &&
              selectedEvent.status !== "COMPLETED" &&
              selectedEvent.status !== "NO_SHOW" && (
                <ConfirmRdv
                  rdvId={selectedEvent.id}
                  appointment={selectedEvent}
                  onConfirm={() => handleRdvUpdated(selectedEvent.id)}
                />
              )}

            {/* Bouton Modifier - pas pour RDV passés confirmés, COMPLETED, NO_SHOW */}
            {!(
              selectedEvent.status === "CONFIRMED" &&
              new Date(selectedEvent.end) < new Date()
            ) &&
              selectedEvent.status !== "COMPLETED" &&
              selectedEvent.status !== "NO_SHOW" && (
                <UpdateRdv
                  rdv={selectedEvent as unknown as UpdateRdvFormProps}
                  userId={userId || ""}
                  onUpdate={() => handleRdvUpdated(selectedEvent.id)}
                />
              )}

            {/* Bouton Notifier changement - pas pour RDV passés confirmés, COMPLETED, NO_SHOW */}
            {!(
              selectedEvent.status === "CONFIRMED" &&
              new Date(selectedEvent.end) < new Date()
            ) &&
              selectedEvent.status !== "COMPLETED" &&
              selectedEvent.status !== "NO_SHOW" && (
                <ChangeRdv
                  rdvId={selectedEvent.id}
                  appointment={selectedEvent}
                  userId={userId || ""}
                />
              )}

            {/* Bouton Annuler - pas pour CANCELED, RDV passés confirmés, COMPLETED, NO_SHOW */}
            {selectedEvent.status !== "CANCELED" &&
              selectedEvent.status !== "COMPLETED" &&
              selectedEvent.status !== "NO_SHOW" &&
              !(
                selectedEvent.status === "CONFIRMED" &&
                new Date(selectedEvent.end) < new Date()
              ) && (
                <CancelRdv
                  rdvId={selectedEvent.id}
                  appointment={selectedEvent}
                  onCancel={() => handleRdvUpdated(selectedEvent.id)}
                />
              )}

            {/* Boutons pour changer le statut - pour RDV confirmés passés, COMPLETED, NO_SHOW */}
            {((selectedEvent.status === "CONFIRMED" &&
              new Date(selectedEvent.end) < new Date()) ||
              selectedEvent.status === "COMPLETED" ||
              selectedEvent.status === "NO_SHOW") && (
              <ChangeStatusButtons
                rdvId={selectedEvent.id}
                currentStatus={selectedEvent.status}
                onStatusChange={handleStatusChange}
                size="sm"
              />
            )}

            {/* Bouton Message - disponible pour tous les rendez-vous sauf CANCELED */}
            {selectedEvent.status !== "CANCELED" && (
              <SendMessageRdv
                rdvId={selectedEvent.id}
                appointment={selectedEvent}
                onMessageSent={() => handleRdvUpdated(selectedEvent.id)}
                buttonLabel="Envoyer un mail"
              />
            )}
          </div>
        </div>

        {/* Section Visio */}
        {selectedEvent.visio && (
          <div className="dashboard-embedded-section p-3">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">Visioconférence</p>
              <span className="inline-flex items-center gap-1 border border-blue-400/25 bg-blue-500/12 rounded-full px-2 py-0.5 text-[10px] font-medium font-one text-blue-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                En ligne
              </span>
            </div>

            {selectedEvent.visioRoom && (
              <Link
                href={`/meeting/${selectedEvent.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/25 rounded-xl text-blue-300 hover:text-blue-200 transition-colors text-xs font-one font-medium"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Rejoindre la salle
              </Link>
            )}
          </div>
        )}

        {/* Paiement */}
        {(selectedEvent.prestation === "RETOUCHE" ||
          selectedEvent.prestation === "TATTOO" ||
          selectedEvent.prestation === "PIERCING") && (
          <div className="dashboard-embedded-section p-3">
            <p className="mb-2.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">Paiement</p>
            <div className="flex gap-2">
              <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border py-2 px-3 transition-all ${selectedEvent.isPayed === false ? "bg-red-500/15 border-red-400/30 text-red-300" : "bg-white/4 border-white/8 text-white/40 hover:bg-white/7"}`}>
                <input type="radio" name={`payment-${selectedEvent.id}`} checked={selectedEvent.isPayed === false} onChange={() => handlePaymentStatusChange(selectedEvent.id, false)} className="sr-only" />
                <span className={`w-2 h-2 rounded-full ${selectedEvent.isPayed === false ? "bg-red-400" : "bg-white/20"}`} />
                <span className="text-xs font-medium font-one">Non payé</span>
              </label>
              <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border py-2 px-3 transition-all ${selectedEvent.isPayed === true ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300" : "bg-white/4 border-white/8 text-white/40 hover:bg-white/7"}`}>
                <input type="radio" name={`payment-${selectedEvent.id}`} checked={selectedEvent.isPayed === true} onChange={() => handlePaymentStatusChange(selectedEvent.id, true)} className="sr-only" />
                <span className={`w-2 h-2 rounded-full ${selectedEvent.isPayed === true ? "bg-emerald-400" : "bg-white/20"}`} />
                <span className="text-xs font-medium font-one">Payé</span>
              </label>
            </div>
          </div>
        )}

        {/* Détails */}
        {tattooDetail && (
          <div className="dashboard-embedded-section p-3">
            <p className="mb-2.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">
              Détails · {selectedEvent.prestation}
            </p>

            <div className="space-y-2.5">
              {tattooDetail.description && (
                <div>
                  <p className="mb-1 text-[9px] uppercase tracking-wider text-white/30 font-one">Description</p>
                  <p className="text-xs text-white/80 font-one leading-relaxed">{tattooDetail.description}</p>
                </div>
              )}

              {(tattooDetail.zone ||
                tattooDetail.size ||
                selectedEvent.skin ||
                tattooDetail.piercingZone ||
                piercingZoneName) && (
                <div className="flex flex-wrap gap-1.5">
                  {tattooDetail.zone && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-one text-white/75">
                      <span className="text-white/40 text-[9px]">Zone</span> {tattooDetail.zone}
                    </span>
                  )}
                  {tattooDetail.size && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-one text-white/75">
                      <span className="text-white/40 text-[9px]">Taille</span> {tattooDetail.size}
                    </span>
                  )}
                  {selectedEvent.skin && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-one text-white/75">
                      <span className="inline-block h-2.5 w-2.5 rounded-full border border-white/15 shrink-0" style={{ backgroundColor: getSkinTonePreviewHex(selectedEvent.skin) ?? undefined }} />
                      {formatSkinTone(selectedEvent.skin)}
                    </span>
                  )}
                  {tattooDetail.piercingZone && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-one text-white/75">
                      <span className="text-white/40 text-[9px]">Piercing</span> {tattooDetail.piercingZone}
                    </span>
                  )}
                  {piercingZoneName && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-one text-white/75">
                      <span className="text-white/40 text-[9px]">Zone spéc.</span> {piercingZoneName}
                    </span>
                  )}
                </div>
              )}

              {hasPrice && (
                <div className="flex items-center justify-between rounded-xl bg-white/4 border border-white/8 px-3 py-2">
                  <span className="text-[9px] uppercase tracking-wider text-white/35 font-one">
                    {tattooDetail.price ? "Prix final" : "Estimation"}
                  </span>
                  <span className="text-sm font-bold text-white font-one">
                    {displayPrice}
                    <span className="ml-0.5 text-xs font-medium text-white/55">€</span>
                  </span>
                </div>
              )}

              {(tattooDetail.reference || tattooDetail.sketch) && (
                <div>
                  <p className="mb-2 text-[9px] uppercase tracking-wider text-white/30 font-one">Images</p>
                  <div className="grid grid-cols-2 gap-2">
                    {tattooDetail.reference && (
                      <button
                        onClick={() => openImageInNewTab(tattooDetail.reference as string)}
                        className="group relative h-28 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 cursor-pointer"
                      >
                        <Image src={tattooDetail.reference} alt="Référence" fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-end justify-center pb-2">
                          <span className="text-[10px] font-one text-white/0 group-hover:text-white/90 transition-colors font-medium">Référence</span>
                        </div>
                      </button>
                    )}
                    {tattooDetail.sketch && (
                      <button
                        onClick={() => openImageInNewTab(tattooDetail.sketch as string)}
                        className="group relative h-28 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 cursor-pointer"
                      >
                        <Image src={tattooDetail.sketch} alt="Croquis" fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-end justify-center pb-2">
                          <span className="text-[10px] font-one text-white/0 group-hover:text-white/90 transition-colors font-medium">Croquis</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Avis */}
        {selectedEvent.salonReview && (
          <div className="dashboard-embedded-section p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-[0.14em] text-white/35 font-one">Avis client</p>
                <p className="text-white font-one font-semibold text-sm truncate mt-1">{selectedEvent.salonReview.title}</p>
              </div>
              <div className="inline-flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-md border border-yellow-500/30">
                <span className="text-yellow-400 font-one font-bold text-xs">{selectedEvent.salonReview.rating}</span>
                <span className="text-yellow-400 text-xs">★</span>
              </div>
            </div>

            <p className="text-white/80 font-one text-xs leading-relaxed">{selectedEvent.salonReview.comment}</p>

            <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/10">
              <div className="text-white/60 text-xs font-one">
                {new Date(selectedEvent.salonReview.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              {selectedEvent.salonReview.isVerified && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30 font-one">✓ Vérifié</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-embedded-footer flex items-center justify-between rounded-b-[28px] px-4 py-2.5">
        <p className="text-[10px] text-white/30 font-one leading-none">
          RDV {new Date(selectedEvent.start).toLocaleDateString("fr-FR")}
        </p>
        <button
          onClick={onClose}
          className="cursor-pointer inline-flex items-center justify-center rounded-[14px] border border-white/10 bg-white/6 px-4 py-1.5 text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/12 transition-all duration-200 font-one"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
