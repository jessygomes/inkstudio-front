"use client";
import AppointmentPhotos from "@/components/Application/RDV/AppointmentPhotos";

import React, { useState } from "react";
import Image from "next/image";
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import RdvActionButton from "@/components/Application/RDV/RdvActionButton";
import RdvStatusBadge from "@/components/Application/RDV/RdvStatusBadge";
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
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
  );
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

  return (
    <section aria-label="Historique des rendez-vous">


      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="h-6 w-6 text-tertiary-400" />
          </div>
          <p className="text-white/60 text-sm font-one">Aucun rendez-vous</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedAppointments.map((rdv) => {
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

            return (
              <div
                key={rdv.id}
                className="group overflow-hidden rounded-2xl bg-noir-600 p-3.5 sm:p-4"
              >
                <div className="flex min-w-0 flex-wrap items-center gap-3 sm:flex-nowrap">
                  <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-tertiary-400 to-tertiary-500 font-one text-[#ffffff]">
                    <span className="text-base leading-none font-semibold">
                      {new Date(summaryRdv.start).toLocaleDateString("fr-FR", { day: "2-digit" })}
                    </span>
                    <span className="mt-0.5 text-[10px] uppercase tracking-wider text-[#ffffffdd]">
                      {new Date(summaryRdv.start).toLocaleDateString("fr-FR", { month: "short" })}
                    </span>
                    <span className="text-[9px] leading-none text-[#ffffffaa]">
                      {new Date(summaryRdv.start).getFullYear()}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 font-one">
                    <div className="flex items-center gap-2">
                      <h4 className="min-w-0 truncate text-[13px] font-medium text-white"><button type="button" onClick={() => toggleRdvDetails(rdv.id)} aria-expanded={isExpanded} aria-controls={"client-rdv-" + rdv.id} className="max-w-full cursor-pointer truncate text-left hover:text-tertiary-400">{summaryRdv.title}</button></h4>
                      <span className="hidden shrink-0 rounded-lg bg-white/[0.07] px-2 py-0.5 text-[10px] text-white/70 sm:inline">
                        {{ TATTOO: "Tatouage", PROJET: "Projet", RETOUCHE: "Retouche", PIERCING: "Piercing" }[summaryRdv.prestation] || summaryRdv.prestation}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-white/60">
                      <span className="sm:hidden">{{ TATTOO: "Tatouage", PROJET: "Projet", RETOUCHE: "Retouche", PIERCING: "Piercing" }[summaryRdv.prestation] || summaryRdv.prestation}<span className="mx-1.5">·</span></span>
                      {new Date(summaryRdv.start).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      <span className="mx-1.5">·</span>
                      {summaryRdv.tatoueur?.name || "Non renseigné"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <RdvStatusBadge status={summaryRdv.status} />
                    <span
                      className={`inline-flex h-7 items-center rounded-xl px-2.5 text-[10px] font-semibold whitespace-nowrap font-one ${
                        summaryRdv.isPayed
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "bg-amber-400/15 text-amber-300"
                      }`}
                    >
                      {summaryRdv.isPayed ? "Payé" : "Non payé"}
                    </span>
                    <RdvActionButton tone="neutral" icon={isExpanded ? ChevronUp : ChevronDown} iconOnly onClick={() => toggleRdvDetails(rdv.id)} aria-expanded={isExpanded} aria-controls={"client-rdv-" + rdv.id}>{isExpanded ? "Masquer les détails" : "Voir les détails"}</RdvActionButton>
                  </div>
                </div>

                {isExpanded && (
                  <div id={"client-rdv-" + rdv.id} className="mt-3 space-y-3 pt-1">
                    {isLoading && (
                      <p className="text-xs text-white/60 font-one rounded-xl bg-white/[0.06] px-3 py-2">
                        Chargement des détails du rendez-vous...
                      </p>
                    )}

                    {error && (
                      <p className="text-xs text-red-300 font-one rounded-xl bg-red-500/10 px-3 py-2">
                        {error}
                      </p>
                    )}

                    {fetchedRdv && (
                      <>
                        <div className="rounded-xl bg-white/[0.04] p-3">
                          <p className="mb-1 text-[11px] font-medium text-white/55 font-one">Description</p>
                          <p className="text-xs text-white/80 font-two leading-relaxed">{detailDescription}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="min-w-0 rounded-xl bg-white/[0.04] px-3 py-2.5">
                            <p className="text-[11px] font-medium text-white/55 font-one">Zone</p>
                            <p className="mt-1 break-words text-xs text-white/75 font-two">{detailZone}</p>
                          </div>

                          <div className="min-w-0 rounded-xl bg-white/[0.04] px-3 py-2.5">
                            <p className="text-[11px] font-medium text-white/55 font-one">Taille</p>
                            <p className="mt-1 break-words text-xs text-white/75 font-two">{detailSize}</p>
                          </div>

                          <div className="min-w-0 rounded-xl bg-white/[0.04] px-3 py-2.5">
                            <p className="text-[11px] font-medium text-white/55 font-one">Prix</p>
                            <p className="mt-1 break-words text-xs text-white/75 font-two">
                              {detailPrice != null ? `${detailPrice} EUR` : "Non renseigné"}
                            </p>
                          </div>

                          <div className="min-w-0 rounded-xl bg-white/[0.04] px-3 py-2.5">
                            <p className="text-[11px] font-medium text-white/55 font-one">Couleur</p>
                            <p className="mt-1 break-words text-xs text-white/75 font-two">{detailColor}</p>
                          </div>

                          <div className="min-w-0 rounded-xl bg-white/[0.04] px-3 py-2.5">
                            <p className="text-[11px] font-medium text-white/55 font-one">Référence</p>
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
                                  className="h-16 w-16 rounded-lg object-cover"
                                />
                              </a>
                            ) : (
                              <p className="break-all mt-1 break-words text-xs text-white/75 font-two">{detailReference}</p>
                            )}
                          </div>

                          <div className="min-w-0 rounded-xl bg-white/[0.04] px-3 py-2.5">
                            <p className="text-[11px] font-medium text-white/55 font-one">Sketch</p>
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
                                  className="h-16 w-16 rounded-lg object-cover"
                                />
                              </a>
                            ) : (
                              <p className="break-all mt-1 break-words text-xs text-white/75 font-two">{detailSketch}</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="rounded-xl bg-white/[0.04] p-3"><AppointmentPhotos appointmentId={rdv.id} /></div>
                    {!isLoading && !error && !fetchedRdv && (
                      <p className="text-xs text-white/55 font-one rounded-xl bg-white/[0.06] px-3 py-2">
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
    </section>
  );
}
