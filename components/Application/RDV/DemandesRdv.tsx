/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/components/Auth/Context/UserContext";
import { format as formatDateFns } from "date-fns";
import { fr } from "date-fns/locale";
import { MdFilterList } from "react-icons/md";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import ProposeCreneau from "../Dashboard/DemandeRdvBtn/ProposeCreneau";
import DeclinedDemande from "../Dashboard/DemandeRdvBtn/DeclinedDemande";
import Image from "next/image";

type StatusFilter =
  | "all"
  | "PENDING"
  | "PROPOSED"
  | "DECLINED"
  | "ACCEPTED"
  | "CLOSED"
  | string;

interface Demande {
  id: string;
  prestation: string;
  status: string;
  clientFirstname: string;
  clientLastname: string;
  clientEmail: string;
  clientPhone?: string;
  createdAt: string;
  availability?: any;
  details?: any;
  message?: string;
}

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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DemandesRdv() {
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [filtered, setFiltered] = useState<Demande[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING"); // <-- valeur par défaut modifiée
  const [openDetailsId, setOpenDetailsId] = useState<string | null>(null);

  // Fetch demandes
  const fetchDemandes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/appointment-requests/${user.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }
      );
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des demandes");
      const data = await response.json();
      setDemandes(
        Array.isArray(data?.appointmentRequests) ? data.appointmentRequests : []
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) {
      fetchDemandes();
    }
  }, [user.id]);

  // Tri/filtre par status
  useEffect(() => {
    if (statusFilter === "all") {
      setFiltered(demandes);
    } else {
      setFiltered(demandes.filter((d) => d.status === statusFilter));
    }
  }, [demandes, statusFilter]);

  // Extraction des dispos
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

  // Status options
  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Tous les statuts" },
    { value: "PENDING", label: "En attente" },
    { value: "PROPOSED", label: "Proposée" },
    { value: "DECLINED", label: "Refusée" },
    { value: "ACCEPTED", label: "Acceptée" },
    { value: "CLOSED", label: "Clôturée" },
  ];

  return (
    <div className="min-h-screen bg-noir-700">
      <div className="px-6 lg:px-20 mx-auto py-8">
        {/* Filtres */}
        <div className="bg-noir-500 rounded-xl border border-white/20 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MdFilterList className="text-white w-5 h-5" />
            <h2 className="text-white font-one font-semibold">Filtres</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-white/70 font-one mb-2">
                Statut de la demande
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="w-full text-sm text-white bg-noir-500/80 py-2 px-3 font-one border border-white/20 rounded-lg focus:outline-none focus:border-tertiary-400 transition-colors appearance-none cursor-pointer"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-center">
                <p className="text-xs text-white/70 font-one">Résultats</p>
                <p className="text-lg font-bold text-tertiary-400 font-one">
                  {filtered.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-noir-500 rounded-xl border border-white/20 p-12 text-center">
            <p className="text-red-400 mb-4 text-lg font-medium">{error}</p>
            <button
              onClick={fetchDemandes}
              className="px-6 py-3 bg-tertiary-500 text-white rounded-lg hover:bg-tertiary-600 transition-colors font-medium"
            >
              Réessayer
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-noir-500 rounded-xl border border-white/20 p-12 text-center">
            <p className="text-white/60 text-lg mb-2">Aucune demande trouvée</p>
            <p className="text-white/40 text-sm">
              {demandes.length === 0
                ? "Aucune demande n'a encore été enregistrée"
                : "Essayez de modifier vos filtres"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((demande) => {
              const av = toObject<any>(demande.availability);
              const primary = av?.primary;
              const alternative = av?.alternative;
              const details = toObject<any>(demande.details);
              const isOpen = openDetailsId === demande.id;
              return (
                <div
                  key={demande.id}
                  className="bg-noir-500 rounded-xl border border-white/20 p-6 hover:border-tertiary-400/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-xl font-one">
                      {demande.clientFirstname?.[0]?.toUpperCase() || "?"}
                    </div>
                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-semibold font-one text-lg mb-1">
                            {demande.clientFirstname} {demande.clientLastname}
                          </h3>
                          <p className="text-white/70 text-sm font-one mb-1">
                            {demande.prestation}
                          </p>
                          <p className="text-white/50 text-xs font-one">
                            {demande.clientEmail}
                            {demande.clientPhone && (
                              <> · {demande.clientPhone}</>
                            )}
                          </p>
                        </div>

                        <div>
                          {demande.status === "PENDING" ? (
                            <div className="bg-gradient-to-r from-orange-500/15 to-orange-500/15 border border-orange-400/30 rounded-lg p-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                                <span className="text-orange-300 font-medium font-one text-xs">
                                  Demande en attente
                                </span>
                              </div>
                            </div>
                          ) : demande.status === "PROPOSED" ? (
                            <div className="bg-gradient-to-r from-blue-500/15 to-blue-500/15 border border-blue-400/30 rounded-lg p-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <span className="text-blue-300 font-medium font-one text-xs">
                                  Demande proposée
                                </span>
                              </div>
                            </div>
                          ) : demande.status === "DECLINED" ? (
                            <div className="bg-gradient-to-r from-red-500/15 to-red-500/15 border border-red-400/30 rounded-lg p-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                <span className="text-red-300 font-medium font-one text-xs">
                                  Demande refusée
                                </span>
                              </div>
                            </div>
                          ) : demande.status === "CLOSED" ? (
                            <div className="bg-gradient-to-r from-red-500/15 to-red-500/15 border border-red-400/30 rounded-lg p-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                <span className="text-red-300 font-medium font-one text-xs">
                                  Demande clôturée
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gradient-to-r from-green-500/15 to-green-500/15 border border-green-400/30 rounded-lg p-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-green-300 font-medium font-one text-xs">
                                  Demande acceptée - RDV Créé
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Disponibilités */}
                      <div className="flex flex-col md:flex-row gap-2 mb-2">
                        {primary?.date && (
                          <div className="text-xs text-white/80 font-one">
                            <span className="font-semibold text-blue-400">
                              Primaire :
                            </span>{" "}
                            {formatFancySlot(
                              primary.date,
                              primary.from,
                              primary.to
                            )}
                          </div>
                        )}
                        {alternative?.date && (
                          <div className="text-xs text-white/80 font-one">
                            <span className="font-semibold text-purple-400">
                              Alternative :
                            </span>{" "}
                            {formatFancySlot(
                              alternative.date,
                              alternative.from,
                              alternative.to
                            )}
                          </div>
                        )}
                      </div>
                      {/* Message */}
                      {demande.message && (
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 mb-2">
                          <p className="text-white/90 text-xs font-one italic">
                            "{demande.message}"
                          </p>
                        </div>
                      )}

                      {/* Détails utilisateur (dépliable) */}
                      <div className="mt-4 p-2 bg-white/5 rounded-xl">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenDetailsId(isOpen ? null : demande.id)
                          }
                          className="cursor-pointer flex items-center gap-1 text-xs text-white/70 font-one hover:text-tertiary-400 transition-colors"
                        >
                          {isOpen ? (
                            <IoChevronUp className="w-4 h-4" />
                          ) : (
                            <IoChevronDown className="w-4 h-4" />
                          )}
                          <span>Détails ajoutés par le client</span>
                        </button>
                        {isOpen && (
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10 mt-2 text-xs text-white font-one space-y-2">
                            <div>
                              <span className="text-white/60">
                                Description :
                              </span>{" "}
                              {details?.description || "N/A"}
                            </div>
                            <div>
                              <span className="text-white/60">Zone :</span>{" "}
                              {details?.zone || "N/A"}
                            </div>
                            <div>
                              <span className="text-white/60">
                                Style / Couleurs :
                              </span>{" "}
                              {details?.colorStyle || "N/A"}
                            </div>
                            <div>
                              <span className="text-white/60">Taille :</span>{" "}
                              {details?.size || "N/A"}
                            </div>
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
                                      onOpen={() =>
                                        openImageInNewTab(details.reference!)
                                      }
                                    />
                                  )}
                                  {details?.sketch && (
                                    <ThumbImage
                                      label="Croquis"
                                      url={details.sketch}
                                      onOpen={() =>
                                        openImageInNewTab(details.sketch!)
                                      }
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Création */}
                      <div className="flex items-center justify-between text-xs text-white/50 font-one mt-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {demande.status === "PENDING" && (
                            <>
                              <ProposeCreneau
                                userId={user.id ?? ""}
                                demande={demande}
                                onUpdate={() => {
                                  fetchDemandes();
                                }}
                              />

                              <DeclinedDemande
                                userId={user.id ?? ""}
                                demande={demande}
                                onDeclined={() => {
                                  fetchDemandes();
                                }}
                              />
                            </>
                          )}

                          {demande.status === "DECLINED" && (
                            <>
                              <ProposeCreneau
                                userId={user.id ?? ""}
                                demande={demande}
                                onUpdate={() => {
                                  fetchDemandes();
                                }}
                              />

                              <DeclinedDemande
                                userId={user.id ?? ""}
                                demande={demande}
                                onDeclined={() => {
                                  fetchDemandes();
                                }}
                              />
                            </>
                          )}

                          {demande.status === "PROPOSED" && (
                            <DeclinedDemande
                              userId={user.id ?? ""}
                              demande={demande}
                              onDeclined={() => {
                                fetchDemandes();
                              }}
                            />
                          )}
                        </div>

                        <span>Créée le {formatDate(demande.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
        className="relative w-full h-32 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer"
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
