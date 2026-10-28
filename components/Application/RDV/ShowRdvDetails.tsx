import RdvDetailsHeader from "./RdvDetailsHeader";
import RdvActions from "./RdvActions";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { CalendarEvent } from "./Calendar";

import { ClientProps } from "@/lib/type";
import { useSession } from "next-auth/react";
import { UserRound } from "lucide-react";
import { getSalonClientsAction } from "@/lib/queries/client";
import InfoClient from "../Clients/InfoClient";
import { RdvPaymentCard, RdvPlanningCard, RdvPrestationCard } from "./RdvInformationCards";
import { openImageInNewTab } from "@/lib/utils/openImage";
import Link from "next/link";
import { getPiercingServiceByIdAction } from "@/lib/queries/piercing";
import { getMoodboardByAppointmentAction, MoodboardDto } from "@/lib/queries/moodboard";
import ConsumablesList from "./Consumables/ConsumablesList";
import AppointmentDrawingCardAction from "@/components/Application/SuiviDessin/AppointmentDrawingCardAction";
import { ExternalLink, Palette } from "lucide-react";

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
  const { data: session } = useSession();
  const [clientFile, setClientFile] = useState<ClientProps | null>(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const openClientFile = async () => {
    if (clientLoading) return;
    setClientLoading(true);
    setClientError(null);
    try {
      const { email, firstName, lastName } = selectedEvent.client;
      const data = await getSalonClientsAction(1, email || `${firstName} ${lastName}`);
      const found = (Array.isArray(data?.clients) ? data.clients : []).find(
        (candidate: ClientProps) =>
          (selectedEvent.clientId && candidate.id === selectedEvent.clientId) ||
          (email && candidate.email === email),
      );
      if (found) setClientFile(found);
      else setClientError("Fiche client introuvable.");
    } catch {
      setClientError("Impossible de charger la fiche client.");
    } finally {
      setClientLoading(false);
    }
  };

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
      <div className="bg-noir-700 font-one [&_button]:cursor-pointer [&_a]:cursor-pointer [&_button]:disabled:cursor-not-allowed !rounded-none !border-0 flex h-full flex-col">
      <RdvDetailsHeader client={selectedEvent.client} status={selectedEvent.status} title={selectedEvent.title} onClose={onClose} error={clientError}><button
                  type="button"
                  onClick={openClientFile}
                  disabled={clientLoading}
                  title="Voir la fiche client"
                  aria-label="Voir la fiche client"
                  className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-tertiary-400/20 bg-tertiary-400/10 text-white/60 transition-colors hover:border-tertiary-400/40 hover:text-tertiary-400 disabled:opacity-60"
                >
                  <UserRound size={13} aria-hidden="true" />
                </button></RdvDetailsHeader>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <RdvPlanningCard appointment={selectedEvent} />

        <RdvActions appointment={selectedEvent} userId={userId} onUpdated={handleRdvUpdated} onStatusChange={handleStatusChange} />

        {/* Section Visio */}
        {selectedEvent.visio && (
          <div className="rounded-2xl border border-white/10 bg-noir-600 p-3">
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

        <RdvPaymentCard appointment={selectedEvent} onPaymentChange={(isPayed) => handlePaymentStatusChange(selectedEvent.id, isPayed)} />

        {/* Détails */}
        <RdvPrestationCard appointment={selectedEvent} price={price} piercingZoneName={piercingZoneName}>
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
        </RdvPrestationCard>

        <AppointmentDrawingCardAction appointmentId={selectedEvent.id} />

        {/* Consommables */}
        {(selectedEvent.prestation === "TATTOO" ||
          selectedEvent.prestation === "PIERCING" ||
          selectedEvent.prestation === "RETOUCHE") && (
          <div className="rounded-2xl border border-white/10 bg-noir-600 p-3">
            <ConsumablesList key={selectedEvent.id} appointmentId={selectedEvent.id} />
          </div>
        )}

        {/* Avis */}
        {selectedEvent.salonReview && (
          <div className="rounded-2xl border border-white/10 bg-noir-600 p-3">
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

      <div className="shrink-0 border-t border-white/10 bg-noir-700 flex items-center justify-between px-4 py-2.5">
        <p className="text-[10px] text-white/30 font-one leading-none">
          RDV {new Date(selectedEvent.start).toLocaleDateString("fr-FR")}
        </p>
        <button
          onClick={onClose}
          aria-label="Fermer le rendez-vous"
          className="cursor-pointer inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/6 px-4 py-1 text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/12 transition-all duration-200 font-one"
        >
          Fermer
        </button>
      </div>
      </div>
      {moodboardModal}
      {clientFile && (
        <InfoClient
          client={clientFile}
          isOpen
          onClose={() => setClientFile(null)}
          salonName={session?.user?.salonName ?? "Mon Salon"}
        />
      )}
    </>
  );
}
