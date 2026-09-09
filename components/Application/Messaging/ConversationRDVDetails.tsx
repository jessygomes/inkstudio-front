"use client";
import React, { useEffect, useState } from "react";
import { ConversationDto } from "@/lib/queries/conversation.action";
import { fetchAppointmentById } from "@/lib/queries/appointment";
import { AppointmentProps } from "@/lib/type";
import { RdvPaymentCard, RdvPlanningCard, RdvPrestationCard } from "../RDV/RdvInformationCards";
import AppointmentDrawingCardAction from "@/components/Application/SuiviDessin/AppointmentDrawingCardAction";

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
            {error ? "Impossible de charger le rendez-vous. Rechargez la page pour réessayer." : "Aucun rendez-vous associé"}
          </p>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[appointment.status] ?? STATUS_CONFIG.PENDING;
  return (
    <div className="dashboard-embedded-panel h-full min-h-0 flex flex-col overflow-hidden rounded-3xl">
      <div className="dashboard-embedded-header shrink-0 border-b border-white/10 px-5 py-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/60">Votre rendez-vous</h2>
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

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <RdvPlanningCard appointment={appointment} />

        <RdvPaymentCard appointment={appointment} />
        <RdvPrestationCard appointment={appointment} />

        {(appointment.prestation === "PROJET" ||
          appointment.prestation === "TATTOO") && (
          <AppointmentDrawingCardAction
            appointmentId={appointment.id}
            allowCreate={appointment.prestation === "PROJET"}
          />
        )}


      </div>
    </div>
  );
}
