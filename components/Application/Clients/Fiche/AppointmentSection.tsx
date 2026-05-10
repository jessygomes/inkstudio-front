"use client";
import React, { useState } from "react";
import Image from "next/image";
import { CiCalendarDate } from "react-icons/ci";
import { AppointmentProps } from "@/lib/type";
import { fetchAppointmentById } from "@/lib/queries/appointment";

interface AppointmentSectionProps {
  appointments: AppointmentProps[];
}

const getDisplayText = (value?: string | null) => {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
};

const isImageUrl = (value: string) => {
  const lower = value.toLowerCase();
  return (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("data:image/")
  );
};

export default function AppointmentSection({
  appointments,
}: AppointmentSectionProps) {
  const [rdvDetailsById, setRdvDetailsById] = useState<Record<string, AppointmentProps>>({});
  const [expandedRdvIds, setExpandedRdvIds] = useState<Set<string>>(new Set());
  const [rdvDetailsLoadingIds, setRdvDetailsLoadingIds] = useState<Set<string>>(new Set());
  const [rdvDetailsErrorById, setRdvDetailsErrorById] = useState<Record<string, string>>({});

  const toggleRdvDetails = async (rdvId: string) => {
    const isExpanded = expandedRdvIds.has(rdvId);

    setExpandedRdvIds((prev) => {
      const next = new Set(prev);
      if (isExpanded) {
        next.delete(rdvId);
      } else {
        next.add(rdvId);
      }
      return next;
    });

    if (isExpanded || rdvDetailsById[rdvId] || rdvDetailsLoadingIds.has(rdvId)) {
      return;
    }

    setRdvDetailsLoadingIds((prev) => {
      const next = new Set(prev);
      next.add(rdvId);
      return next;
    });

    setRdvDetailsErrorById((prev) => {
      const next = { ...prev };
      delete next[rdvId];
      return next;
    });

    try {
      const result = await fetchAppointmentById(rdvId);
      const fullRdv = (result?.appointment ?? result) as AppointmentProps | null;

      if (fullRdv) {
        setRdvDetailsById((prev) => ({
          ...prev,
          [rdvId]: fullRdv,
        }));
      } else {
        setRdvDetailsErrorById((prev) => ({
          ...prev,
          [rdvId]: "Rendez-vous introuvable.",
        }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement du détail du RDV:", error);
      setRdvDetailsErrorById((prev) => ({
        ...prev,
        [rdvId]: "Impossible de charger les détails du rendez-vous.",
      }));
    } finally {
      setRdvDetailsLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(rdvId);
        return next;
      });
    }
  };

  const getRdvStatusStyle = (status: AppointmentProps["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return { text: "Confirme", dot: "bg-green-400", pill: "bg-green-500/15 border-green-400/30 text-green-300" };
      case "PENDING":
        return { text: "En attente", dot: "bg-orange-400", pill: "bg-orange-500/15 border-orange-400/30 text-orange-300" };
      case "CANCELLED":
        return { text: "Annule", dot: "bg-red-400", pill: "bg-red-500/15 border-red-400/30 text-red-300" };
      case "DECLINED":
        return { text: "Refuse", dot: "bg-gray-400", pill: "bg-gray-500/20 border-gray-400/30 text-gray-300" };
      case "COMPLETED":
        return { text: "Termine", dot: "bg-blue-400", pill: "bg-blue-500/15 border-blue-400/30 text-blue-300" };
      case "NO_SHOW":
        return { text: "Absent", dot: "bg-rose-400", pill: "bg-rose-500/15 border-rose-400/30 text-rose-300" };
      case "RESCHEDULING":
        return { text: "Reprogrammation", dot: "bg-cyan-400", pill: "bg-cyan-500/15 border-cyan-400/30 text-cyan-300" };
      default:
        return { text: status, dot: "bg-white/50", pill: "bg-white/10 border-white/20 text-white/75" };
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 shadow-lg">
      

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-tertiary-400/20">
            <CiCalendarDate className="w-8 h-8 text-tertiary-400" />
          </div>
          <p className="text-white/60 text-sm font-one">Aucun rendez-vous</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((rdv) => {
            const summaryRdv = rdv;
            const fetchedRdv = rdvDetailsById[rdv.id];
            const detailDescription =
              getDisplayText(fetchedRdv?.tattooDetail?.description) ||
              getDisplayText(fetchedRdv?.description) ||
              "Non renseignée";
            const detailZone =
              getDisplayText(fetchedRdv?.tattooDetail?.piercingZone) ||
              getDisplayText(fetchedRdv?.tattooDetail?.zone) ||
              getDisplayText(fetchedRdv?.zone) ||
              "Non renseignée";
            const detailSize =
              getDisplayText(fetchedRdv?.tattooDetail?.size) ||
              (typeof fetchedRdv?.size === "number"
                ? String(fetchedRdv.size)
                : getDisplayText(fetchedRdv?.size)) ||
              "Non renseignée";
            const detailColor =
              getDisplayText(fetchedRdv?.tattooDetail?.colorStyle) || "Non renseignée";
            const detailReference =
              getDisplayText(fetchedRdv?.tattooDetail?.reference) || "Non renseignée";
            const detailSketch = getDisplayText(fetchedRdv?.tattooDetail?.sketch) || "Non renseigné";
            const hasReferenceImage = detailReference !== "Non renseignée" && isImageUrl(detailReference);
            const hasSketchImage = detailSketch !== "Non renseigné" && isImageUrl(detailSketch);
            const detailPrice =
              fetchedRdv?.tattooDetail?.price ??
              fetchedRdv?.tattooDetail?.estimatedPrice ??
              fetchedRdv?.estimatedPrice;
            const isLoading = rdvDetailsLoadingIds.has(rdv.id);
            const error = rdvDetailsErrorById[rdv.id];
            const isExpanded = expandedRdvIds.has(rdv.id);
            const statusStyle = getRdvStatusStyle(summaryRdv.status);

            return (
              <div
                key={rdv.id}
                className="group overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r from-white/10 via-white/5 to-transparent p-3 transition-all duration-200 hover:border-tertiary-400/35"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-white font-one sm:text-[15px]">
                      {summaryRdv.title}
                    </h4>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="whitespace-nowrap rounded-2xl border border-tertiary-400/30 bg-tertiary-500/15 px-2.5 py-1 text-[11px] font-semibold text-tertiary-500">
                        {summaryRdv.prestation}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle.pill}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                        {statusStyle.text}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-2xl border px-2.5 py-1 text-[11px] font-semibold ${
                          summaryRdv.isPayed
                            ? "border-green-400/30 bg-green-500/15 text-green-300"
                            : "border-orange-400/30 bg-orange-500/15 text-orange-300"
                        }`}
                      >
                        {summaryRdv.isPayed ? "Payé" : "Non payé"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[360px]">
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">Date</p>
                      <p className="text-xs text-white/90 font-two">
                        {new Date(summaryRdv.start).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">Horaire</p>
                      <p className="text-xs text-white/90 font-two">
                        {new Date(summaryRdv.start).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="col-span-2 rounded-2xl border border-white/10 bg-black/20 px-2.5 py-2 sm:col-span-1">
                      <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">Tatoueur</p>
                      <p className="truncate text-xs text-white/90 font-two">
                        {summaryRdv.tatoueur?.name || "Non renseigné"}
                      </p>
                    </div>
                  </div>

                <div className="">
                  <button
                    onClick={() => toggleRdvDetails(rdv.id)}
                    className="cursor-pointer rounded-full border border-tertiary-400/30 bg-tertiary-500/15 px-3 py-1.5 text-[11px] font-one text-white/55 transition-colors hover:text-white"
                  >
                    {isExpanded ? "Masquer les détails" : "Voir les détails du RDV"}
                  </button>
                </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-2.5 border-t border-white/12 pt-3">
                    {isLoading && (
                      <p className="text-xs text-white/60 font-one rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                        Chargement des détails du rendez-vous...
                      </p>
                    )}

                    {error && (
                      <p className="text-xs text-red-300 font-one rounded-xl border border-red-400/20 bg-red-500/10 px-2.5 py-2">
                        {error}
                      </p>
                    )}

                    {fetchedRdv && (
                      <>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          <p className="mb-1 text-[10px] uppercase tracking-wide text-white/45 font-one">Description</p>
                          <p className="text-xs text-white/80 font-two leading-relaxed">{detailDescription}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">Zone</p>
                            <p className="text-xs text-white/85 font-two">{detailZone}</p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">Taille</p>
                            <p className="text-xs text-white/85 font-two">{detailSize}</p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">Prix</p>
                            <p className="text-xs text-white/85 font-two">
                              {detailPrice != null ? `${detailPrice} EUR` : "Non renseigné"}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">Couleur</p>
                            <p className="text-xs text-white/85 font-two">{detailColor}</p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">Référence</p>
                            {hasReferenceImage ? (
                              <a
                                href={detailReference}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1.5 inline-block"
                                title="Ouvrir l'image de référence"
                              >
                                <Image
                                  src={detailReference}
                                  width={64}
                                  height={64}
                                  unoptimized
                                  alt="Image de référence"
                                  className="h-16 w-16 rounded-md border border-white/20 object-cover"
                                />
                              </a>
                            ) : (
                              <p className="break-all text-xs text-white/85 font-two">{detailReference}</p>
                            )}
                          </div>

                          <div className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">Sketch</p>
                            {hasSketchImage ? (
                              <a
                                href={detailSketch}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1.5 inline-block"
                                title="Ouvrir l'image du sketch"
                              >
                                <Image
                                  src={detailSketch}
                                  width={64}
                                  height={64}
                                  unoptimized
                                  alt="Image du sketch"
                                  className="h-16 w-16 rounded-md border border-white/20 object-cover"
                                />
                              </a>
                            ) : (
                              <p className="break-all text-xs text-white/85 font-two">{detailSketch}</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {!isLoading && !error && !fetchedRdv && (
                      <p className="text-xs text-white/55 font-one rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                        Aucun détail supplémentaire trouvé pour ce rendez-vous.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
