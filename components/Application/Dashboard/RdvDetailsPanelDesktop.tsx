"use client";
import RdvDetailsHeader from "../RDV/RdvDetailsHeader";
import RdvActions from "../RDV/RdvActions";
import { RdvPlanningCard, RdvPaymentCard, RdvPrestationCard } from "@/components/Application/RDV/RdvInformationCards";

import { useEffect, useState } from "react";

import Link from "next/link";
import { getPiercingServiceByIdAction } from "@/lib/queries/piercing";
import AppointmentDrawingCardAction from "@/components/Application/SuiviDessin/AppointmentDrawingCardAction";

interface Client {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Tatoueur {
  id: string;
  name: string;
  userId: string;
  img: string;
}

interface TattooDetail {
  description?: string;
  zone?: string;
  size?: string;
  colorStyle?: string;
  reference?: string;
  sketch?: string;
  estimatedPrice?: number;
  price?: number;
  piercingZone?: string;
  piercingServicePriceId?: string;
}

export interface RendezVous {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELED"
    | "RESCHEDULING"
    | "COMPLETED"
    | "NO_SHOW";
  prestation: string;
  skin?: string | null;
  client: Client;
  clientId: string;
  tatoueur?: Tatoueur | null;
  tatoueurId?: string | null;
  tattooDetail: TattooDetail;
  tattooDetailId: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isPayed?: boolean;
  visio?: boolean;
  visioRoom?: string;
  conversation?: { id: string } | null;
}

interface RdvDetailsPanelDesktopProps {
  selectedAppointment: RendezVous;
  onClose: () => void;
  handleRdvUpdated: (updatedId: string) => void;
  handleStatusChange: (rdvId: string, status: "COMPLETED" | "NO_SHOW") => void;
  handlePaymentStatusChange: (rdvId: string, isPayed: boolean) => void;
  userId: string;
}

export default function RdvDetailsPanelDesktop({
  selectedAppointment,
  onClose,
  handleRdvUpdated,
  handleStatusChange,
  handlePaymentStatusChange,
  userId,
}: RdvDetailsPanelDesktopProps) {
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
    <div className="bg-noir-700 font-one [&_button]:cursor-pointer [&_a]:cursor-pointer [&_button]:disabled:cursor-not-allowed flex h-full flex-col animate-in slide-in-from-right-4 duration-300">
      {/* ── HEADER ───────────────────────────────────────── */}
      <RdvDetailsHeader client={selectedAppointment.client} status={selectedAppointment.status} title={selectedAppointment.title} onClose={onClose}></RdvDetailsHeader>

      {/* ── BODY ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

        {/* ── Infos principales ── */}
        <RdvPlanningCard appointment={selectedAppointment} />

        {/* ── Actions ── */}
        <RdvActions appointment={selectedAppointment} userId={userId} onUpdated={handleRdvUpdated} onStatusChange={handleStatusChange} />

        {/* ── Visio ── */}
        {selectedAppointment.visio && (
          <div className="rounded-2xl border border-white/10 bg-noir-600 p-3">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">Visioconférence</p>
              <span className="inline-flex items-center gap-1 border border-blue-400/25 bg-blue-500/12 rounded-full px-2 py-0.5 text-[10px] font-medium font-one text-blue-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                En ligne
              </span>
            </div>
            {selectedAppointment.visioRoom && (
              <Link
                href={`/meeting/${selectedAppointment.id}`}
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

        {/* ── Paiement ── */}
        <RdvPaymentCard appointment={selectedAppointment} onPaymentChange={(paid) => handlePaymentStatusChange(selectedAppointment.id, paid)} />

        {/* ── Détails prestation ── */}

            <RdvPrestationCard appointment={selectedAppointment} piercingZoneName={piercingZoneName} />
      </div>

      {/* ── FOOTER ───────────────────────────────────────── */}
      {(selectedAppointment.prestation === "PROJET" ||
        selectedAppointment.prestation === "TATTOO") && (
        <div className="px-3 pb-3">
          <AppointmentDrawingCardAction
            appointmentId={selectedAppointment.id}
            allowCreate={selectedAppointment.prestation === "PROJET"}
          />
        </div>
      )}

      <div className="shrink-0 border-t border-white/10 bg-noir-700 flex items-center justify-between rounded-b-[28px] px-4 py-2.5">
        <p className="text-[10px] text-white/30 font-one leading-none">
          Màj {new Date(selectedAppointment.updatedAt).toLocaleDateString("fr-FR")}
        </p>
        <button
          onClick={onClose}
          aria-label="Fermer le rendez-vous"
          className="cursor-pointer inline-flex items-center justify-center rounded-[14px] border border-white/10 bg-white/6 px-4 py-1.5 text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/12 transition-all duration-200 font-one"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
