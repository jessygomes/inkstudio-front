"use client";
import RdvDetailsHeader from "../RDV/RdvDetailsHeader";
import RdvActions from "../RDV/RdvActions";
import { RdvPlanningCard, RdvPaymentCard, RdvPrestationCard } from "@/components/Application/RDV/RdvInformationCards";

import Link from "next/link";

import { useScrollLock } from "@/lib/hook/useScrollLock";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getPiercingServiceByIdAction } from "@/lib/queries/piercing";

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
          <RdvDetailsHeader client={selectedAppointment.client} status={selectedAppointment.status} title={selectedAppointment.title} onClose={onClose}></RdvDetailsHeader>

          <div className="flex-1 min-h-0 space-y-3 overflow-y-auto bg-noir-700/70 p-3">

            <RdvActions appointment={selectedAppointment} userId={userId} onUpdated={handleRdvUpdated} />

            <RdvPlanningCard appointment={selectedAppointment} />

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
              <div className="rounded-2xl border border-white/10 bg-noir-600 rounded-xl border border-white/10 p-3 backdrop-blur-sm">
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

            <RdvPaymentCard appointment={selectedAppointment} onPaymentChange={(paid) => handlePaymentStatusChange(selectedAppointment.id, paid)} />

            <RdvPrestationCard appointment={selectedAppointment} piercingZoneName={piercingZoneName} />
          </div>

          <div className="shrink-0 border-t border-white/10 bg-noir-700 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2 rounded-[18px] border border-white/8 bg-black/12 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-[11px] leading-none text-white/58 font-one">
                Mis a jour le {new Date(selectedAppointment.updatedAt).toLocaleDateString("fr-FR")}
              </p>
              <button
                onClick={onClose}
                aria-label="Fermer le rendez-vous"
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
