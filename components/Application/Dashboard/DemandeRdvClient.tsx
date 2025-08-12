"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import ProposeCreneau from "./DemandeRdvBtn/ProposeCreneau";
import CreateRdvViaDemande from "./DemandeRdvBtn/CreateRdvViaDemande";
import { fr } from "date-fns/locale";
import { format as formatDateFns } from "date-fns";

/* =====================
  Types (alignés sur ton style)
   ===================== */
export interface AvailabilityPrimaryAlt {
  date?: string; // YYYY-MM-DD
  from?: string; // HH:mm[:ss]
  to?: string; // HH:mm[:ss]
}
export interface Availability {
  primary?: AvailabilityPrimaryAlt;
  alternative?: AvailabilityPrimaryAlt;
}
interface Details {
  description?: string;
  zone?: string;
  size?: string;
  colorStyle?: string;
  reference?: string | null;
  sketch?: string | null;
}
export interface AppointmentRequest {
  id: string;
  prestation: string;
  status:
    | "PENDING"
    | "CONTACTED"
    | "PROPOSED"
    | "CLIENT_CONFIRMED"
    | "BOOKED"
    | "DECLINED"
    | "EXPIRED"
    | "CANCELED"
    | string;
  clientFirstname: string;
  clientLastname: string;
  clientEmail: string;
  clientPhone?: string;
  clientBirthDate?: string;
  availability?: string | Availability; // string JSON ou objet
  details?: string | Details; // string JSON ou objet
  message?: string;
  createdAt: string;
}

const BACK_URL = process.env.NEXT_PUBLIC_BACK_URL;

export default function DemandeRdvClient({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [demandes, setDemandes] = useState<AppointmentRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Overlay de détails
  const [selected, setSelected] = useState<AppointmentRequest | null>(null);

  //! ===== Utils =====
  const toObject = <T extends object>(val: unknown): T => {
    if (!val) return {} as T;
    if (typeof val === "string") {
      try {
        return JSON.parse(val) as T;
      } catch {
        return {} as T;
      }
    }
    if (typeof val === "object") return val as T;
    return {} as T;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const openImageInNewTab = (url?: string | null) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  function formatFancySlot(date?: string, from?: string, to?: string) {
    if (!date) return "Sans date";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "Date invalide";
    const dayStr = formatDateFns(d, "EEEE d MMMM", { locale: fr });
    let heureStr = "";
    if (from && to) {
      heureStr = `De ${from.slice(0, 5)} à ${to.slice(0, 5)}`;
    } else if (from) {
      heureStr = `À partir de ${from.slice(0, 5)}`;
    } else {
      heureStr = "";
    }
    return `${dayStr.charAt(0).toUpperCase() + dayStr.slice(1)}${
      heureStr ? " - " + heureStr : ""
    }`;
  }

  //! ===== API =====
  const fetchPendingDemandes = useCallback(async () => {
    if (!BACK_URL) {
      setError("NEXT_PUBLIC_BACK_URL manquant");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${BACK_URL}/appointments/appointment-requests/${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }
      );
      if (!res.ok)
        throw new Error("Erreur lors de la récupération des demandes");
      const data = await res.json();
      setDemandes(
        Array.isArray(data?.appointmentRequests) ? data.appointmentRequests : []
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchPendingDemandes();
  }, [userId, fetchPendingDemandes]);

  console.log(selected);

  // =====================
  // Rendu
  // =====================
  if (loading) {
    return (
      <div className="bg-noir-700 rounded-xl border border-white/20 p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white font-one">
            Demandes de RDV
          </h3>
          <div className="w-4 h-4 border-2 border-orange-500/50 rounded-full animate-spin border-t-orange-400"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-slate-300/10 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-noir-700 rounded-xl border border-white/20 p-4 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4 font-one">
          Demandes de RDV
        </h3>
        <div className="text-center py-6">
          <div className="w-10 h-10 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-400 mb-3 text-sm font-medium">{error}</p>
          <button
            onClick={fetchPendingDemandes}
            className="cursor-pointer px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[550px] bg-noir-700 rounded-xl border border-white/20 p-4 overflow-y-auto custom-scrollbar shadow-2xl relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white font-one">
          Demandes de RDV
        </h3>
        <div className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-medium border border-orange-500/50">
          {demandes.length}
        </div>
      </div>

      {demandes.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Aucune demande en attente</p>
          <p className="text-gray-500 text-xs mt-1">
            Les nouvelles demandes de RDV apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {demandes.map((d) => {
            const av = toObject<Availability>(d.availability);
            const primary = av?.primary;
            const alternative = av?.alternative;
            return (
              <div
                key={d.id}
                onClick={() => setSelected(d)}
                className={`cursor-pointer border rounded-lg p-3 hover:bg-slate-400/10 transition-all duration-200 bg-slate-300/10 border-white/20 ${
                  selected?.id === d.id
                    ? "ring-2 ring-tertiary-500/50 border-tertiary-500/50"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-xs">
                        {d.clientFirstname?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white text-sm truncate font-one">
                          {d.clientFirstname} {d.clientLastname}
                        </h4>
                      </div>
                      <p className="text-[10px] font-one text-gray-300 truncate">
                        {d.prestation}
                      </p>
                      <div className="flex items-center gap-3 text-xs font-one text-gray-400 mt-1">
                        <div className="w-full">
                          <span>
                            {primary?.date
                              ? formatFancySlot(
                                  primary.date,
                                  primary.from,
                                  primary.to
                                )
                              : "Sans date"}
                          </span>
                        </div>
                      </div>
                      <div className="w-full text-xs font-one text-gray-400">
                        {alternative?.date && (
                          <span>
                            <span className="text-white">OU</span>{" "}
                            {formatFancySlot(
                              alternative.date,
                              alternative.from,
                              alternative.to
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    {d.status === "PENDING" ? (
                      <div className="bg-gradient-to-r from-orange-500/15 to-orange-500/15 border border-orange-400/30 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                          <span className="text-orange-300 font-medium font-one text-xs">
                            Demande en attente
                          </span>
                        </div>
                      </div>
                    ) : d.status === "PROPOSED" ? (
                      <div className="bg-gradient-to-r from-blue-500/15 to-blue-500/15 border border-blue-400/30 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-blue-300 font-medium font-one text-xs">
                            Demande proposée
                          </span>
                        </div>
                      </div>
                    ) : d.status === "DECLINED" ? (
                      <div className="bg-gradient-to-r from-red-500/15 to-red-500/15 border border-red-400/30 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                          <span className="text-red-300 font-medium font-one text-xs">
                            Demande refusée
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-green-500/15 to-green-500/15 border border-green-400/30 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-300 font-medium font-one text-xs">
                            Demande acceptée
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overlay de détails (même approche visuelle que WaitingRdv) */}
      {selected &&
        (() => {
          const av = toObject<Availability>(selected.availability);
          const details = toObject<Details>(selected.details);
          return (
            <div className="absolute inset-0 bg-gradient-to-br from-noir-700/98 via-noir-600/98 to-noir-500/98 backdrop-blur-md rounded-xl flex flex-col animate-in slide-in-from-bottom-4 duration-300 border border-white/10">
              {/* Header */}
              <div className="relative p-4 border-b border-white/10 bg-gradient-to-r from-noir-700/80 to-noir-500/80">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 to-transparent"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {selected.clientFirstname?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold font-one text-white tracking-wide">
                        {selected.clientFirstname} {selected.clientLastname}
                      </h4>
                      <p className="text-white/70 text-xs font-one">
                        {selected.prestation}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="cursor-pointer p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
                    aria-label="Fermer"
                  >
                    <svg
                      className="w-5 h-5 text-white/70 group-hover:text-white transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenu */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {/* Statut */}
                <div className="bg-gradient-to-r from-white/8 to-white/4 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-white font-one text-sm flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Statut
                    </h5>
                  </div>
                  <div className="mb-1">
                    {selected.status === "PENDING" ? (
                      <div className="bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-400/30 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                          <span className="text-orange-300 font-medium font-one text-xs">
                            Demande en attente
                          </span>
                        </div>
                      </div>
                    ) : selected.status === "PROPOSED" ? (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                        <span className="text-white/80 text-xs font-one">
                          Proposée
                        </span>
                      </div>
                    ) : selected.status === "DECLINED" ? (
                      <div className="bg-gradient-to-r from-red-500/15 to-red-500/15 border border-red-400/30 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                          <span className="text-red-300 font-medium font-one text-xs">
                            Demande refusée
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-green-500/15 to-green-500/15 border border-green-400/30 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-300 font-medium font-one text-xs">
                            Demande acceptée
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-white/60 text-[11px] font-one mt-2">
                    Créée le {formatDate(selected.createdAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-white/10">
                  <div className="flex items-center gap-1 flex-wrap">
                    {selected.status === "ACCEPTED" && <CreateRdvViaDemande />}

                    {selected.status === "PENDING" ||
                      (selected.status !== "DECLINED" &&
                        selected.status !== "ACCEPTED" && (
                          <ProposeCreneau
                            userId={userId}
                            demande={selected}
                            onUpdate={() => {
                              fetchPendingDemandes();
                            }}
                          />
                        ))}

                    {selected.status === "DECLINED" && (
                      <ProposeCreneau
                        userId={userId}
                        demande={selected}
                        onUpdate={() => {
                          fetchPendingDemandes();
                        }}
                      />

                      // <CloturerDemande
                      //   userId={userId}
                      //   demande={selected}
                      //   onUpdate={() => {
                      //     fetchPendingDemandes();
                      //   }}
                      // />
                    )}
                  </div>
                </div>

                {/* Informations principales */}
                <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                  <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
                    <svg
                      className="w-4 h-4 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Informations
                  </h5>
                  <div className="grid grid-cols-1 gap-2">
                    <InfoCard
                      title="Date (primaire)"
                      value={
                        av?.primary?.date
                          ? formatFancySlot(
                              av.primary.date,
                              av.primary.from,
                              av.primary.to
                            )
                          : "—"
                      }
                      tone="blue"
                    />
                    <InfoCard
                      title="Alternative"
                      value={
                        av?.alternative?.date
                          ? formatFancySlot(
                              av.alternative.date,
                              av.alternative.from,
                              av.alternative.to
                            )
                          : "—"
                      }
                      tone="purple"
                    />
                    <InfoCard
                      title="Prestation"
                      value={selected.prestation}
                      tone="green"
                    />
                    <InfoCard
                      title="Contact"
                      value={`${selected.clientEmail}${
                        selected.clientPhone ? ` · ${selected.clientPhone}` : ""
                      }`}
                      tone="orange"
                    />
                  </div>

                  {/* Détails + message */}
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    {details?.description && (
                      <>
                        <p className="text-white/60 text-xs font-one mb-1">
                          Détails de la demande
                        </p>
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                          <p className="text-white/60 text-xs font-one mb-1">
                            Description
                          </p>
                          <p className="text-white font-one text-xs leading-relaxed">
                            {details.description || "N/A"}
                          </p>
                          <div>
                            <p className="text-white/60 text-xs font-one mt-2 mb-1">
                              Zone
                            </p>
                            <p className="text-white font-one text-xs leading-relaxed">
                              {details.zone || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs font-one mt-2 mb-1">
                              Style / Couleurs
                            </p>
                            <p className="text-white font-one text-xs leading-relaxed">
                              {details.colorStyle || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs font-one mt-2 mb-1">
                              Taille
                            </p>
                            <p className="text-white font-one text-xs leading-relaxed">
                              {details.size || "N/A"}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                    {selected.message && (
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <p className="text-white/60 text-xs font-one mb-1">
                          Message du client
                        </p>
                        <p className="text-white font-one text-xs leading-relaxed">
                          {selected.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Images */}
                {(details?.reference || details?.sketch) && (
                  <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                    <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
                      <svg
                        className="w-4 h-4 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                        />
                      </svg>
                      Références
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      {details?.reference && (
                        <ThumbImage
                          label="Image de référence"
                          url={details.reference}
                          onOpen={() => openImageInNewTab(details.reference!)}
                        />
                      )}
                      {details?.sketch && (
                        <ThumbImage
                          label="Croquis"
                          url={details.sketch}
                          onOpen={() => openImageInNewTab(details.sketch!)}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-white/10 bg-white/5">
                <button
                  onClick={() => setSelected(null)}
                  className="cursor-pointer w-full py-2 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one"
                >
                  Retour à la liste
                </button>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

/* =====================
   Petits composants / UI
   ===================== */

function InfoCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: "blue" | "purple" | "green" | "orange";
}) {
  const tones: Record<typeof tone, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-500/20", text: "text-blue-400" },
    purple: { bg: "bg-purple-500/20", text: "text-purple-400" },
    green: { bg: "bg-green-500/20", text: "text-green-400" },
    orange: { bg: "bg-orange-500/20", text: "text-orange-400" },
  };
  return (
    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 ${tones[tone].bg} rounded-md`} />
        <div>
          <p className="text-white/60 text-xs font-one">{title}</p>
          <p className={`text-white font-one text-xs ${tones[tone].text}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ThumbImage({
  label,
  url,
  onOpen,
}: {
  label: string;
  url: string | null | undefined;
  onOpen: () => void;
}) {
  if (!url) return null;
  return (
    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
      <p className="text-white/60 text-xs font-one mb-2">{label}</p>
      <div
        className="relative w-full h-16 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpen();
        }}
      >
        <Image
          src={url}
          alt={label}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
        />
      </div>
    </div>
  );
}
