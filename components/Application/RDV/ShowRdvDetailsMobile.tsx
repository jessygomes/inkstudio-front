import RdvDetailsHeader from "./RdvDetailsHeader";
import RdvActions from "./RdvActions";
import { RdvPlanningCard, RdvPaymentCard, RdvPrestationCard } from "@/components/Application/RDV/RdvInformationCards";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarEvent } from "./Calendar";

import ConsumablesList from "./Consumables/ConsumablesList";
import AppointmentDrawingCardAction from "@/components/Application/SuiviDessin/AppointmentDrawingCardAction";

import Link from "next/link";

import { useScrollLock } from "@/lib/hook/useScrollLock";
import { getPiercingServiceByIdAction } from "@/lib/queries/piercing";
import { getMoodboardByAppointmentAction, MoodboardDto } from "@/lib/queries/moodboard";
import Image from "next/image";
import { openImageInNewTab } from "@/lib/utils/openImage";
import { Palette } from "lucide-react";

interface ShowRdvDetailsMobileProps {
  selectedEvent: CalendarEvent & {
    salonReview?: {
      id: string;
      rating: number;
      title?: string;
      comment?: string;
      photos?: string[];
      isVerified?: boolean;
      createdAt: string;
      salonResponse?: string | null;
      salonRespondedAt?: string | null;
    };
  };
  onClose: () => void;
  handleRdvUpdated: (rdvId: string) => void;
  handleStatusChange?: (rdvId: string, status: "COMPLETED" | "NO_SHOW") => void;
  handlePaymentStatusChange: (rdvId: string, isPayed: boolean) => void;
  userId: string | null;
  price: number | undefined;
}

export default function ShowRdvDetailsMobile({
  selectedEvent,
  onClose,
  handleRdvUpdated,
  handleStatusChange,
  handlePaymentStatusChange,
  userId,
  price,
}: ShowRdvDetailsMobileProps) {
  // Bloquer le scroll du body quand la modal est ouverte
  useScrollLock(true);

  const [isMounted, setIsMounted] = useState(false);

  // État pour le nom de la zone de piercing détaillée
  const [piercingZoneName, setPiercingZoneName] = useState<string | null>(null);
  const [isMoodboardOpen, setIsMoodboardOpen] = useState(false);
  const [moodboardLoading, setMoodboardLoading] = useState(false);
  const [moodboardError, setMoodboardError] = useState<string | null>(null);
  const [moodboardData, setMoodboardData] = useState<MoodboardDto | null>(null);

  // Récupérer le nom de la zone de piercing détaillée
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

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
      <div className="fixed inset-0 z-[10001] bg-noir-700">
        <div className="flex h-full w-full flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <h4 className="text-white font-one font-semibold text-sm">
                Moodboard de {selectedEvent.client.firstName} {selectedEvent.client.lastName}
              </h4>
              {moodboardData?.name && (
                <p className="text-white/65 text-[11px] font-one mt-1">{moodboardData.name}</p>
              )}
            </div>
            <button
              onClick={() => setIsMoodboardOpen(false)}
              className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/80 hover:bg-white/10"
            >
              Fermer
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {moodboardLoading ? (
              <p className="text-white/70 text-sm font-one">Chargement du moodboard...</p>
            ) : moodboardError ? (
              <p className="text-red-300 text-sm font-one">{moodboardError}</p>
            ) : !moodboardData ? (
              <p className="text-white/70 text-sm font-one">
                Aucun moodboard n&apos;est associé à ce rendez-vous.
              </p>
            ) : (
              <div className="space-y-4">
                {(moodboardData.title || moodboardData.name) && (
                  <div>
                    <h5 className="text-white text-base font-semibold font-one">
                      {moodboardData.title || moodboardData.name}
                    </h5>
                    {moodboardData.description && (
                      <p className="mt-1 text-white/75 text-xs leading-relaxed font-one">
                        {moodboardData.description}
                      </p>
                    )}
                  </div>
                )}

                {Array.isArray(moodboardData.images) && moodboardData.images.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {moodboardData.images.map((image) => {
                      const imageUrl = renderMoodboardImage(image);

                      if (!imageUrl) return null;

                      return (
                        <button
                          key={image.id}
                          onClick={() => openImageInNewTab(imageUrl)}
                          className="text-left"
                          type="button"
                        >
                          <div className="relative h-52 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                            <Image
                              src={imageUrl}
                              alt={image.title || image.caption || "Image du moodboard"}
                              fill
                              className="object-cover"
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

  const modalContent = (
    <div
      className="xl:hidden fixed inset-0 z-[9999] bg-noir-700 overflow-hidden"
      style={{
        height: "100dvh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <div className="w-full h-full">
        <div className="w-full h-full bg-gradient-to-br from-noir-500 to-noir-600 overflow-hidden flex flex-col min-h-0 lg:rounded-[28px]">
          {/* Header mobile */}
          <RdvDetailsHeader client={selectedEvent.client} status={selectedEvent.status} title={selectedEvent.title} onClose={onClose}></RdvDetailsHeader>

          {/* Contenu scrollable mobile */}
          <div className="flex-1 min-h-0 space-y-3 overflow-y-auto bg-noir-700/70 p-3">

            {/* Actions mobiles */}
            <RdvActions appointment={selectedEvent} userId={userId} onUpdated={handleRdvUpdated} onStatusChange={handleStatusChange} />

            {/* Informations principales */}
            <RdvPlanningCard appointment={selectedEvent} />

            {/* Section Visio si applicable */}
            {selectedEvent.visio && (
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

                  {selectedEvent.visioRoom && (
                    <Link
                      href={`/meeting/${selectedEvent.id}`}
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

            {/* Paiement mobile si applicable */}
            <RdvPaymentCard appointment={selectedEvent} onPaymentChange={(paid) => handlePaymentStatusChange(selectedEvent.id, paid)} />

            {/* Détails tattoo mobiles */}

            <RdvPrestationCard appointment={selectedEvent} price={price} piercingZoneName={piercingZoneName}><button
                type="button"
                onClick={openMoodboard}
                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-200 transition-colors duration-200 hover:bg-indigo-500/20 font-one"
                title="Voir le moodboard du client"
              >
                <Palette size={14} className="shrink-0" />
                <span>Voir le moodboard</span>
              </button></RdvPrestationCard>

            <AppointmentDrawingCardAction appointmentId={selectedEvent.id} />

            {/* Section Consommables mobiles */}
            {(selectedEvent.prestation === "TATTOO" ||
              selectedEvent.prestation === "PIERCING" ||
              selectedEvent.prestation === "RETOUCHE") && (
              <div className="rounded-2xl border border-white/10 p-3 backdrop-blur-sm">
                <ConsumablesList key={selectedEvent.id} appointmentId={selectedEvent.id} />
              </div>
            )}

            {/* Section Review du client - Affichage de la salonReview si elle existe */}
            {selectedEvent.salonReview && (
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-3 border border-blue-400/20">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h5 className="text-white font-one font-semibold text-sm mb-1">
                        ⭐ Avis client
                      </h5>
                      <p className="text-white font-one font-semibold text-sm">
                        {selectedEvent.salonReview.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-md border border-yellow-500/30 flex-shrink-0">
                      <span className="text-yellow-400 font-one font-bold text-xs">
                        {selectedEvent.salonReview.rating}
                      </span>
                      <span className="text-yellow-400 text-xs">★</span>
                    </div>
                  </div>

                  <p className="text-white/80 font-one text-xs leading-relaxed">
                    {selectedEvent.salonReview.comment}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="text-white/60 text-xs font-one">
                      {new Date(
                        selectedEvent.salonReview.createdAt,
                      ).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    {selectedEvent.salonReview.isVerified && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30 font-one">
                        ✓ Vérifié
                      </span>
                    )}
                  </div>

                  {selectedEvent.salonReview.salonResponse && (
                    <div className="bg-white/5 rounded-md p-2 border border-white/10 mt-2">
                      <p className="text-white/60 text-xs font-one mb-1">
                        Réponse du salon :
                      </p>
                      <p className="text-white/80 font-one text-xs">
                        {selectedEvent.salonReview.salonResponse}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer mobile */}
          <div className="shrink-0 border-t border-white/10 bg-noir-700 px-3 py-2.5">
            <div className="flex items-center justify-end gap-2 rounded-[18px] border border-white/8 bg-black/12 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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

  return (
    <>
      {createPortal(modalContent, document.body)}
      {moodboardModal}
    </>
  );
}
