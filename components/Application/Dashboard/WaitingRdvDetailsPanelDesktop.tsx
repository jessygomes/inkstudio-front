"use client";
import RdvDetailsHeader from "../RDV/RdvDetailsHeader";
import RdvActions from "../RDV/RdvActions";
import { RdvPlanningCard, RdvPaymentCard, RdvPrestationCard } from "@/components/Application/RDV/RdvInformationCards";

import Link from "next/link";

import { useEffect, useState } from "react";
import { getPiercingServiceByIdAction } from "../../../lib/queries/piercing";
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
            setPiercingZoneName(
              service.piercingZoneOreille ||
              service.piercingZoneVisage ||
              service.piercingZoneBouche ||
              service.piercingCorps ||
              "Zone non spécifiée",
            );
          }
        } catch {
          setPiercingZoneName(null);
        }
      } else {
        setPiercingZoneName(null);
      }
    }
    fetchPiercingDetails();
  }, [selectedAppointment.id, selectedAppointment.tattooDetail?.piercingServicePriceId]);

  return (
    <div className="bg-noir-700 font-one [&_button]:cursor-pointer [&_a]:cursor-pointer [&_button]:disabled:cursor-not-allowed flex h-full w-full flex-col animate-in slide-in-from-right-4 duration-300">
      {/* ── HEADER ───────────────────────────────────────── */}
      <RdvDetailsHeader client={selectedAppointment.client} status={selectedAppointment.status} title={selectedAppointment.title} onClose={onClose}></RdvDetailsHeader>

      {/* ── BODY ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

        {/* ── Infos principales ── */}
        <RdvPlanningCard appointment={selectedAppointment} />

        {/* ── Actions ── */}
        <RdvActions appointment={selectedAppointment} userId={userId} onUpdated={handleRdvUpdated} />

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

        {/* ── Contact ── */}
        {selectedAppointment.client.email && (
          <div className="rounded-2xl border border-white/10 bg-noir-600 p-3">
            <p className="mb-2.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">Contact</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 rounded-xl bg-white/4 border border-white/7 px-2.5 py-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-tertiary-400/10 border border-tertiary-400/20">
                  <svg className="w-3.5 h-3.5 text-tertiary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="min-w-0 truncate text-xs font-medium text-white/90 font-one">{selectedAppointment.client.email}</p>
              </div>
              {selectedAppointment.client.phone && (
                <div className="flex items-center gap-2.5 rounded-xl bg-white/4 border border-white/7 px-2.5 py-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-tertiary-400/10 border border-tertiary-400/20">
                    <svg className="w-3.5 h-3.5 text-tertiary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-white/90 font-one">{selectedAppointment.client.phone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Paiement ── */}
        <RdvPaymentCard appointment={selectedAppointment} onPaymentChange={(paid) => handlePaymentStatusChange(selectedAppointment.id, paid)} />

        {/* ── Détails prestation ── */}

            <RdvPrestationCard appointment={selectedAppointment} piercingZoneName={piercingZoneName} />
      </div>

      {/* ── FOOTER ───────────────────────────────────────── */}
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
