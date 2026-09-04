import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { CalendarEvent } from "./Calendar";
import ConfirmRdv from "./ConfirmRdv";
import UpdateRdv from "./UpdateRdv";
import CancelRdv from "./CancelRdv";
import ChangeRdv from "./ChangeRdv";
import ChangeStatusButtons from "./ChangeStatusButtons";
import SendMessageRdv from "./SendMessageRdv";
import ConversationRdv from "./ConversationRdv";
import { UpdateRdvFormProps } from "@/lib/type";
import { formatSkinTone, getSkinTonePreviewHex } from "@/lib/utils/formatSkinTone";
import { openImageInNewTab } from "@/lib/utils/openImage";
import Link from "next/link";
import { getPiercingServiceByIdAction } from "@/lib/queries/piercing";
import {
  getMoodboardByAppointmentAction,
  MoodboardDto,
} from "@/lib/queries/moodboard";
import ConsumablesList from "./Consumables/ConsumablesList";
import AppointmentDrawingCardAction from "@/components/Application/SuiviDessin/AppointmentDrawingCardAction";
import {
  Check,
  CreditCard,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  MapPin,
  MoreHorizontal,
  Palette,
  Ruler,
  Zap,
} from "lucide-react";

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
  const [isMoodboardOpen, setIsMoodboardOpen] = useState(false);
  const [moodboardLoading, setMoodboardLoading] = useState(false);
  const [moodboardError, setMoodboardError] = useState<string | null>(null);
  const [moodboardData, setMoodboardData] = useState<MoodboardDto | null>(null);

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
  const isPastOrDone =
    (selectedEvent.status === "CONFIRMED" &&
      new Date(selectedEvent.end) < new Date()) ||
    selectedEvent.status === "COMPLETED" ||
    selectedEvent.status === "NO_SHOW";
  const canConfirm =
    selectedEvent.status !== "CONFIRMED" &&
    selectedEvent.status !== "RESCHEDULING";

  const openMoodboard = async () => {
    setIsMoodboardOpen(true);
    setMoodboardLoading(true);
    setMoodboardError(null);

    try {
      const result = await getMoodboardByAppointmentAction(selectedEvent.id);

      if (!result.ok) {
        setMoodboardData(null);
        setMoodboardError(result.message || "Impossible de charger le moodboard.");
        return;
      }

      setMoodboardData(result.data ?? null);
    } catch {
      setMoodboardData(null);
      setMoodboardError("Impossible de charger le moodboard.");
    } finally {
      setMoodboardLoading(false);
    }
  };

  const renderMoodboardImage = (image: {
    imageUrl?: string;
    url?: string;
  }) => image.imageUrl || image.url || "";

  const moodboardModal =
    isMoodboardOpen &&
    createPortal(
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/15 bg-noir-700 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h4 className="text-white font-one font-semibold text-base">
                Moodboard de {selectedEvent.client.firstName} {selectedEvent.client.lastName}
              </h4>
              {moodboardData?.name && (
                <p className="text-white/65 text-xs font-one mt-1">{moodboardData.name}</p>
              )}
            </div>
            <button
              onClick={() => setIsMoodboardOpen(false)}
              className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
            >
              Fermer
            </button>
          </div>

          <div className="max-h-[calc(90vh-72px)] overflow-y-auto p-5">
            {moodboardLoading ? (
              <p className="text-white/70 text-sm font-one">Chargement du moodboard...</p>
            ) : moodboardError ? (
              <p className="text-red-300 text-sm font-one">{moodboardError}</p>
            ) : !moodboardData ? (
              <p className="text-white/70 text-sm font-one">
                Aucun moodboard n&apos;est associé à ce rendez-vous.
              </p>
            ) : (
              <div className="space-y-5">
                {(moodboardData.title || moodboardData.name) && (
                  <div>
                    <h5 className="text-white text-lg font-semibold font-one">
                      {moodboardData.title || moodboardData.name}
                    </h5>
                    {moodboardData.description && (
                      <p className="mt-2 text-white/75 text-sm leading-relaxed font-one">
                        {moodboardData.description}
                      </p>
                    )}
                  </div>
                )}

                {Array.isArray(moodboardData.images) && moodboardData.images.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {moodboardData.images.map((image) => {
                      const imageUrl = renderMoodboardImage(image);

                      if (!imageUrl) return null;

                      return (
                        <button
                          key={image.id}
                          onClick={() => openImageInNewTab(imageUrl)}
                          className="group text-left"
                          type="button"
                        >
                          <div className="relative h-48 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                            <Image
                              src={imageUrl}
                              alt={image.title || image.caption || "Image du moodboard"}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          {(image.caption || image.title || image.description) && (
                            <div className="mt-2 space-y-1">
                              {image.title && (
                                <p className="text-sm font-semibold text-white font-one">{image.title}</p>
                              )}
                              {image.caption && (
                                <p className="text-xs text-white/70 font-one">{image.caption}</p>
                              )}
                              {image.description && (
                                <p className="text-xs text-white/60 font-one">{image.description}</p>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-white/70 text-sm font-one">
                    Ce moodboard ne contient pas encore d&apos;images.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
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
        <div className="dashboard-embedded-section overflow-hidden p-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-tertiary-400/80 font-one">
                Rendez-vous
              </p>
              <p className="mt-1 text-[11px] text-white/40 font-one">
                Planning et prestation
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] text-white/45 font-one">
              {selectedEvent.prestation}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-linear-to-l from-noir-500 to-noir-700 px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/15">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-medium uppercase tracking-wider text-blue-200/55 font-one">Date et heure</p>
                <p className="mt-0.5 text-sm font-semibold text-white font-one capitalize">{startDate}</p>
                <p className="text-[11px] text-white/55 font-one tabular-nums">{startTime} - {endTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-linear-to-l from-noir-500 to-noir-700 px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-purple-400/15 bg-purple-500/10">
                <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Durée</p>
                <p className="text-xs font-semibold text-white font-one">{durationMin} min</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-linear-to-l from-noir-500 to-noir-700 px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-500/10">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Prestation</p>
                <p className="text-xs font-medium text-white/90 font-one truncate">{selectedEvent.prestation}</p>
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-2.5 rounded-2xl border border-tertiary-400/15 bg-tertiary-500/[0.06] px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/15 bg-tertiary-500/10">
                <svg className="w-3.5 h-3.5 text-tertiary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Artiste</p>
                <p className="text-xs font-medium text-white/90 font-one truncate">
                  {selectedEvent.performerUser?.salonName ||
                    (selectedEvent.performerUser?.firstName ||
                    selectedEvent.performerUser?.lastName
                      ? `${selectedEvent.performerUser?.firstName ?? ""} ${selectedEvent.performerUser?.lastName ?? ""}`.trim()
                      : selectedEvent.tatoueur?.name) || (
                      <span className="text-white/35 italic">Non assigné</span>
                    )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-embedded-section overflow-hidden p-2.5">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">
                Actions rapides
              </p>
            </div>
            <div className="flex h-6 w-6 items-center justify-center">
              <Zap size={12} className="text-tertiary-400" />
            </div>
          </div>
          <div className="flex items-stretch gap-1.5 overflow-x-auto scrollbar-hidden [&_button]:!py-2 [&_button]:!text-[11px]">
            {isPastOrDone ? (
              <div className="flex min-w-0 basis-0 flex-1 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.035] transition-colors hover:border-white/20 hover:bg-white/[0.07]">
                <ChangeStatusButtons
                  rdvId={selectedEvent.id}
                  currentStatus={selectedEvent.status}
                  onStatusChange={handleStatusChange}
                  size="sm"
                  className="w-full"
                />
              </div>
            ) : (
              <>
                {canConfirm && (
                  <div className="flex min-w-0 basis-0 flex-1 overflow-hidden rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] transition-colors hover:border-emerald-400/35 hover:bg-emerald-500/[0.12]">
                    <ConfirmRdv
                      rdvId={selectedEvent.id}
                      appointment={selectedEvent}
                      onConfirm={() => handleRdvUpdated(selectedEvent.id)}
                    />
                  </div>
                )}
                <div className="flex min-w-0 basis-0 flex-1 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.035] transition-colors hover:border-white/20 hover:bg-white/[0.07]">
                  <UpdateRdv
                    rdv={selectedEvent as unknown as UpdateRdvFormProps}
                    userId={userId || ""}
                    onUpdate={() => handleRdvUpdated(selectedEvent.id)}
                  />
                </div>
                <div className="flex min-w-0 basis-0 flex-1 overflow-hidden rounded-2xl border border-cyan-400/15 bg-cyan-500/[0.05] transition-colors hover:border-cyan-400/30 hover:bg-cyan-500/[0.1]">
                  <ChangeRdv
                    rdvId={selectedEvent.id}
                    appointment={selectedEvent}
                    userId={userId || ""}
                  />
                </div>
              </>
            )}
                {selectedEvent.conversation?.id && (
              <div className="flex min-w-0 basis-0 flex-1 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.035] transition-colors hover:border-white/20 hover:bg-white/[0.07]">
                  <ConversationRdv conversationId={selectedEvent.conversation.id} />
                </div>
                )}
                {selectedEvent.status !== "CANCELED" && (
                <div className="flex min-w-0 basis-0 flex-1 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.035] transition-colors hover:border-white/20 hover:bg-white/[0.07]">
                  <SendMessageRdv
                    rdvId={selectedEvent.id}
                    appointment={selectedEvent}
                    onMessageSent={() => handleRdvUpdated(selectedEvent.id)}
                    buttonLabel="Mail"
                  />
                </div>
                )}
                {!isPastOrDone && selectedEvent.status !== "CANCELED" && (
                <div className="flex min-w-0 basis-0 flex-1 overflow-hidden rounded-2xl border border-red-400/10 bg-red-500/[0.035] transition-colors hover:border-red-400/25 hover:bg-red-500/[0.08]">
                  <CancelRdv
                    rdvId={selectedEvent.id}
                    appointment={selectedEvent}
                    onCancel={() => handleRdvUpdated(selectedEvent.id)}
                  />
                </div>
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
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">Paiement</p>
                <p className="mt-1 text-[11px] text-white/40 font-one">Indiquez si la prestation a été réglée.</p>
              </div>
              <CreditCard size={15} className="text-emerald-300/80" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className={`group flex cursor-pointer items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 transition-all ${selectedEvent.isPayed === false ? "border-red-400/35 bg-red-500/15 text-red-200 shadow-lg shadow-red-950/20" : "border-white/8 bg-white/[0.035] text-white/45 hover:border-red-400/20 hover:bg-red-500/[0.07]"}`}>
                <input type="radio" name={`payment-${selectedEvent.id}`} checked={selectedEvent.isPayed === false} onChange={() => handlePaymentStatusChange(selectedEvent.id, false)} className="sr-only" />
                <span className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${selectedEvent.isPayed === false ? "bg-red-400/20" : "bg-white/5"}`}><MoreHorizontal size={13} /></span>
                  <span className="text-xs font-medium font-one">Non payé</span>
                </span>
                {selectedEvent.isPayed === false && <Check size={14} />}
              </label>
              <label className={`group flex cursor-pointer items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 transition-all ${selectedEvent.isPayed === true ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-200 shadow-lg shadow-emerald-950/20" : "border-white/8 bg-white/[0.035] text-white/45 hover:border-emerald-400/20 hover:bg-emerald-500/[0.07]"}`}>
                <input type="radio" name={`payment-${selectedEvent.id}`} checked={selectedEvent.isPayed === true} onChange={() => handlePaymentStatusChange(selectedEvent.id, true)} className="sr-only" />
                <span className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${selectedEvent.isPayed === true ? "bg-emerald-400/20" : "bg-white/5"}`}><Check size={13} /></span>
                  <span className="text-xs font-medium font-one">Payé</span>
                </span>
                {selectedEvent.isPayed === true && <Check size={14} />}
              </label>
            </div>
          </div>
        )}

        {/* Détails */}
        {tattooDetail && (
          <div className="dashboard-embedded-section overflow-hidden p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">
                  Détails de la prestation
                </p>
                <p className="mt-1 text-xs font-semibold text-white font-one">
                  {selectedEvent.prestation}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <FileText size={14} className="text-white/55" />
              </div>
            </div>

            <div className="space-y-2.5">
              {tattooDetail.description && (
                <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <FileText size={13} className="text-white/40" />
                    <p className="text-[9px] font-medium uppercase tracking-wider text-white/35 font-one">Description</p>
                  </div>
                  <p className="text-xs leading-relaxed text-white/80 font-one">{tattooDetail.description}</p>
                </div>
              )}

              {(tattooDetail.zone ||
                tattooDetail.size ||
                selectedEvent.skin ||
                tattooDetail.piercingZone ||
                piercingZoneName) && (
                <div className="grid grid-cols-2 gap-2">
                  {tattooDetail.zone && (
                    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.035] px-2.5 py-2">
                      <MapPin size={13} className="shrink-0 text-tertiary-300/80" />
                      <span className="min-w-0 truncate text-[11px] text-white/75 font-one"><span className="mr-1 text-[9px] text-white/35">Zone</span>{tattooDetail.zone}</span>
                    </div>
                  )}
                  {tattooDetail.size && (
                    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.035] px-2.5 py-2">
                      <Ruler size={13} className="shrink-0 text-tertiary-300/80" />
                      <span className="min-w-0 truncate text-[11px] text-white/75 font-one"><span className="mr-1 text-[9px] text-white/35">Taille</span>{tattooDetail.size}</span>
                    </div>
                  )}
                  {selectedEvent.skin && (
                    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.035] px-2.5 py-2 text-[11px] font-one text-white/75">
                      <span className="inline-block h-2.5 w-2.5 rounded-full border border-white/15 shrink-0" style={{ backgroundColor: getSkinTonePreviewHex(selectedEvent.skin) ?? undefined }} />
                      {formatSkinTone(selectedEvent.skin)}
                    </span>
                  )}
                  {tattooDetail.piercingZone && (
                    <span className="inline-flex min-w-0 items-center gap-1 rounded-xl border border-white/8 bg-white/[0.035] px-2.5 py-2 text-[11px] font-one text-white/75">
                      <span className="text-white/40 text-[9px]">Piercing</span> {tattooDetail.piercingZone}
                    </span>
                  )}
                  {piercingZoneName && (
                    <span className="inline-flex min-w-0 items-center gap-1 rounded-xl border border-white/8 bg-white/[0.035] px-2.5 py-2 text-[11px] font-one text-white/75">
                      <span className="text-white/40 text-[9px]">Zone spéc.</span> {piercingZoneName}
                    </span>
                  )}
                </div>
              )}

              {hasPrice && (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 to-transparent px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-emerald-300" />
                    <span className="text-[9px] uppercase tracking-wider text-white/45 font-one">
                    {tattooDetail.price ? "Prix final" : "Estimation"}
                    </span>
                  </div>
                  <span className="text-base font-bold text-white font-one">
                    {displayPrice}
                    <span className="ml-0.5 text-xs font-medium text-white/55">€</span>
                  </span>
                </div>
              )}

              {(tattooDetail.reference || tattooDetail.sketch) && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <ImageIcon size={13} className="text-white/40" />
                    <p className="text-[9px] font-medium uppercase tracking-wider text-white/35 font-one">Références visuelles</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {tattooDetail.reference && (
                      <button
                        onClick={() => openImageInNewTab(tattooDetail.reference as string)}
                        className="group relative h-28 w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5"
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
                        className="group relative h-28 w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5"
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
              <button
              type="button"
              onClick={openMoodboard}
              className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-200 transition-colors duration-200 hover:bg-indigo-500/20 font-one"
              title="Voir le moodboard du client"
            >
                <Palette size={14} className="shrink-0" />
              <span>Voir le moodboard</span>
              <ExternalLink size={13} className="opacity-60" />
            </button>
            </div>
          </div>
        )}

        {(selectedEvent.prestation === "PROJET" ||
          selectedEvent.prestation === "TATTOO") && (
          <AppointmentDrawingCardAction
            appointmentId={selectedEvent.id}
            allowCreate={selectedEvent.prestation === "PROJET"}
          />
        )}

        {/* Consommables */}
        {(selectedEvent.prestation === "TATTOO" ||
          selectedEvent.prestation === "PIERCING" ||
          selectedEvent.prestation === "RETOUCHE") && (
          <div className="dashboard-embedded-section p-3">
            <ConsumablesList appointmentId={selectedEvent.id} />
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
          className="cursor-pointer inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/6 px-4 py-1 text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/12 transition-all duration-200 font-one"
        >
          Fermer
        </button>
      </div>
      </div>
      {moodboardModal}
    </>
  );
}
