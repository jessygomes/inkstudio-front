"use client";
import React, { useEffect, useState } from "react";
import { ConversationDto } from "@/lib/queries/conversation.action";
import { fetchAppointmentById } from "@/lib/queries/appointment";
import { AppointmentProps } from "@/lib/type";
import Image from "next/image";
import { formatSkinTone, getSkinTonePreviewHex } from "@/lib/utils/formatSkinTone";
import { openImageInNewTab } from "@/lib/utils/openImage";

interface ConversationRDVDetailsProps {
  conversation: ConversationDto;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; pill: string }
> = {
  PENDING: {
    label: "En attente",
    dot: "bg-amber-400 animate-pulse",
    pill: "bg-amber-500/12 text-amber-300 border-amber-400/25",
  },
  CONFIRMED: {
    label: "Confirmé",
    dot: "bg-emerald-400",
    pill: "bg-emerald-500/12 text-emerald-300 border-emerald-400/25",
  },
  COMPLETED: {
    label: "Complété",
    dot: "bg-teal-400",
    pill: "bg-teal-500/12 text-teal-300 border-teal-400/25",
  },
  NO_SHOW: {
    label: "Pas présenté",
    dot: "bg-orange-400",
    pill: "bg-orange-500/12 text-orange-300 border-orange-400/25",
  },
  CANCELLED: {
    label: "Annulé",
    dot: "bg-red-400",
    pill: "bg-red-500/12 text-red-300 border-red-400/25",
  },
  CANCELED: {
    label: "Annulé",
    dot: "bg-red-400",
    pill: "bg-red-500/12 text-red-300 border-red-400/25",
  },
  RESCHEDULING: {
    label: "Reprogrammation",
    dot: "bg-blue-400 animate-pulse",
    pill: "bg-blue-500/12 text-blue-300 border-blue-400/25",
  },
};

export default function ConversationRDVDetails({
  conversation,
}: ConversationRDVDetailsProps) {
  const [appointment, setAppointment] = useState<AppointmentProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRDV = async () => {
      if (!conversation.appointmentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await fetchAppointmentById(conversation.appointmentId);
        setAppointment(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        console.error("Erreur lors du chargement du RDV:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRDV();
  }, [conversation.appointmentId]);

  if (loading) {
    return (
      <div className="dashboard-embedded-panel h-full flex items-center justify-center rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
          <p className="text-white/50 text-sm font-one">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="dashboard-empty-state h-full flex items-center justify-center rounded-2xl">
        <div className="text-center p-6">
          <p className="text-white/50 text-sm font-one">
            Aucun rendez-vous associé
          </p>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[appointment.status] ?? STATUS_CONFIG.PENDING;
  const durationMin = Math.round(
    (new Date(appointment.end).getTime() -
      new Date(appointment.start).getTime()) /
      60000,
  );

  const startDate = new Date(appointment.start).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const startTime = new Date(appointment.start).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(appointment.end).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const price =
    appointment.tattooDetail?.price ||
    appointment.tattooDetail?.estimatedPrice ||
    0;

  return (
    <div className="dashboard-embedded-panel h-full flex flex-col">
      <div className="dashboard-embedded-header rounded-t-[28px] px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-tertiary-500 to-primary-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-base leading-none">
                {conversation.client.firstName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#1a1a1a] ${statusCfg.dot}`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 justify-between">
              <h4 className="truncate text-base font-bold text-white font-one leading-tight">
                {conversation.client.firstName} {conversation.client.lastName}
              </h4>
              <span
                className={`inline-flex items-center gap-1.5 border rounded-full px-2 py-0.5 text-[10px] font-medium font-one flex-shrink-0 ${statusCfg.pill}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-white/65 font-one">
              {conversation.subject}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="dashboard-embedded-section p-3">
          <p className="mb-2.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">
            Rendez-vous
          </p>
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
                <p className="text-xs font-medium text-white/90 font-one truncate">{appointment.prestation}</p>
              </div>
            </div>

            <div className="col-span-2 flex items-center gap-2.5 rounded-xl bg-white/4 border border-white/7 px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-orange-500/12 border border-orange-400/15">
                <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Artiste</p>
                <p className="text-xs font-medium text-white/90 font-one truncate">
                  {appointment.tatoueur?.name || <span className="text-white/35 italic">Non assigné</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {(appointment.prestation === "RETOUCHE" ||
          appointment.prestation === "TATTOO" ||
          appointment.prestation === "PIERCING") && (
          <div className="dashboard-embedded-section p-3">
            <p className="mb-2.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">Paiement</p>
            <div className="flex gap-2">
              <span
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs font-medium font-one ${
                  appointment.isPayed
                    ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
                    : "bg-red-500/15 border-red-400/30 text-red-300"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${appointment.isPayed ? "bg-emerald-400" : "bg-red-400"}`} />
                {appointment.isPayed ? "Payé" : "Non payé"}
              </span>
            </div>
          </div>
        )}

        {appointment.tattooDetail && (
          <div className="dashboard-embedded-section p-3">
            <p className="mb-2.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">
              Détails · {appointment.prestation}
            </p>

            <div className="space-y-2.5">
              {appointment.tattooDetail.description && (
                <div>
                  <p className="mb-1 text-[9px] uppercase tracking-wider text-white/30 font-one">Description</p>
                  <p className="text-xs text-white/80 font-one leading-relaxed">{appointment.tattooDetail.description}</p>
                </div>
              )}

              {(appointment.tattooDetail.zone || appointment.tattooDetail.size || appointment.skin) && (
                <div className="flex flex-wrap gap-1.5">
                  {appointment.tattooDetail.zone && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-one text-white/75">
                      <span className="text-white/40 text-[9px]">Zone</span> {appointment.tattooDetail.zone}
                    </span>
                  )}
                  {appointment.tattooDetail.size && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-one text-white/75">
                      <span className="text-white/40 text-[9px]">Taille</span> {appointment.tattooDetail.size}
                    </span>
                  )}
                  {appointment.skin && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-one text-white/75">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full border border-white/15 shrink-0"
                        style={{ backgroundColor: getSkinTonePreviewHex(appointment.skin) ?? undefined }}
                      />
                      {formatSkinTone(appointment.skin)}
                    </span>
                  )}
                </div>
              )}

              {price > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-white/4 border border-white/8 px-3 py-2">
                  <span className="text-[9px] uppercase tracking-wider text-white/35 font-one">Prix</span>
                  <span className="text-sm font-bold text-white font-one">
                    {price}
                    <span className="ml-0.5 text-xs font-medium text-white/55">€</span>
                  </span>
                </div>
              )}

              {(appointment.tattooDetail.reference || appointment.tattooDetail.sketch) && (
                <div>
                  <p className="mb-2 text-[9px] uppercase tracking-wider text-white/30 font-one">Images</p>
                  <div className="grid grid-cols-2 gap-2">
                    {appointment.tattooDetail.reference && (
                      <button
                        onClick={() => openImageInNewTab(appointment.tattooDetail?.reference || "")}
                        className="group relative h-28 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 cursor-pointer"
                      >
                        <Image src={appointment.tattooDetail.reference} alt="Référence" fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex flex-col items-center justify-end pb-2">
                          <span className="text-[10px] font-one text-white/0 group-hover:text-white/90 transition-colors font-medium">Référence</span>
                        </div>
                      </button>
                    )}
                    {appointment.tattooDetail.sketch && (
                      <button
                        onClick={() => openImageInNewTab(appointment.tattooDetail?.sketch || "")}
                        className="group relative h-28 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 cursor-pointer"
                      >
                        <Image src={appointment.tattooDetail.sketch} alt="Croquis" fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex flex-col items-center justify-end pb-2">
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
      </div>
    </div>
  );
}
