"use client";
import RdvDetailsHeader from "../RDV/RdvDetailsHeader";
import React, { useEffect, useState } from "react";
import type { ConversationRDVPreview } from "./ConversationRDVModal";
import { fetchAppointmentById } from "@/lib/queries/appointment";
import { AppointmentProps } from "@/lib/type";
import { RdvPaymentCard, RdvPlanningCard, RdvPrestationCard } from "../RDV/RdvInformationCards";
import AppointmentDrawingCardAction from "@/components/Application/SuiviDessin/AppointmentDrawingCardAction";

interface ConversationRDVDetailsProps {
  conversation: ConversationRDVPreview;
  onClose?: () => void;
}

export default function ConversationRDVDetails({
  conversation,
  onClose,
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
      <div className="bg-noir-700 font-one [&_button]:cursor-pointer [&_a]:cursor-pointer [&_button]:disabled:cursor-not-allowed h-full flex items-center justify-center !rounded-none !border-0">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
          <p className="text-white/50 text-sm font-one">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="dashboard-empty-state h-full flex items-center justify-center !rounded-none !border-0">
        <div className="text-center p-6">
          <p className="text-white/50 text-sm font-one">
            {error ? "Impossible de charger le rendez-vous. Rechargez la page pour réessayer." : "Aucun rendez-vous associé"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-noir-700 font-one [&_button]:cursor-pointer [&_a]:cursor-pointer [&_button]:disabled:cursor-not-allowed !rounded-none !border-0 !bg-transparent h-full min-h-0 flex flex-col overflow-hidden">
      <RdvDetailsHeader client={{ ...conversation.client, email: conversation.client.email || "" }} status={appointment.status} title={conversation.subject} onClose={onClose} />

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
