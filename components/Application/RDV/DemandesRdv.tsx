/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/components/Auth/Context/UserContext";
import { format as formatDateFns } from "date-fns";
import { fr } from "date-fns/locale";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import ProposeCreneau from "../Dashboard/DemandeRdvBtn/ProposeCreneau";
import DeclinedDemande from "../Dashboard/DemandeRdvBtn/DeclinedDemande";
import Image from "next/image";
import { FaRegCalendarTimes } from "react-icons/fa";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

interface Pagination {
  currentPage: number;
  limit: number;
  totalRequests: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
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
  if (from && to) heureStr = `De ${from.slice(0, 5)} à ${to.slice(0, 5)}`;
  else if (from) heureStr = `À partir de ${from.slice(0, 5)}`;
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

  // URL & nav
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openDetailsId, setOpenDetailsId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // Params depuis l’URL
  const limitFromUrl = Number(searchParams.get("limit")) || 10;
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const statusFromUrl = (searchParams.get("status") ||
    "PENDING") as StatusFilter;

  // Helpers URL
  const updateParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "") params.set(key, value);
    else params.delete(key);
    if (key === "status") params.set("page", "1"); // reset page si filtre changé
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const goToPage = (p: number) => updateParam("page", String(p));

  // Fetch demandes (server-side pagination + status)
  const fetchDemandes = async (params?: {
    page?: number;
    limit?: number;
    status?: StatusFilter;
  }) => {
    if (!user?.id) return;
    const page = params?.page ?? pageFromUrl;
    const limit = params?.limit ?? limitFromUrl;
    const status = params?.status ?? statusFromUrl;

    setLoading(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_BACK_URL!;
      const url = new URL(
        `${base}/appointments/appointment-requests/${user.id}`
      );
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(limit));
      if (status && status !== "all") url.searchParams.set("status", status); // 👈 important

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des demandes");

      const data = await response.json();
      setDemandes(
        Array.isArray(data?.appointmentRequests) ? data.appointmentRequests : []
      );
      setPagination(data?.pagination ?? null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
    }
  };

  // Sync URL -> state + fetch
  useEffect(() => {
    setStatusFilter(statusFromUrl);
    if (user?.id) {
      fetchDemandes({
        page: pageFromUrl,
        limit: limitFromUrl,
        status: statusFromUrl,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, searchParams]);

  // Helpers
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

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Tous les statuts" },
    { value: "PENDING", label: "En attente" },
    { value: "PROPOSED", label: "Proposée" },
    { value: "DECLINED", label: "Refusée" },
    { value: "ACCEPTED", label: "Acceptée" },
    { value: "CLOSED", label: "Clôturée" },
  ];

  return (
    <div className="min-h-screen w-full bg-noir-700">
      <div className="px-6 lg:px-20 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center ">
              <FaRegCalendarTimes
                size={28}
                className="text-tertiary-400 animate-pulse"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-one tracking-wide uppercase">
                Mes demandes de rendez-vous
              </h1>
              <p className="text-white/70 text-xs font-one mt-1">
                Répondez aux demandes de rendez-vous et assurez un suivi
                optimal.
              </p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-noir-500 rounded-xl border border-white/20 p-6 my-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-white/70 font-one mb-2">
                Filtrer par le statut de la demande
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  const val = e.target.value as StatusFilter;
                  setStatusFilter(val);
                  updateParam("status", val);
                }}
                className="w-full text-sm text-white bg-noir-500/80 py-2 px-3 font-one border border-white/20 rounded-lg focus:outline-none focus:border-tertiary-400 transition-colors appearance-none cursor-pointer"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-6">
              <div className="text-center">
                <p className="text-xs text-white/70 font-one">
                  Résultats (page)
                </p>
                <p className="text-lg font-bold text-tertiary-400 font-one">
                  {demandes.length}
                </p>
              </div>

              {pagination && (
                <div className="text-center">
                  <p className="text-xs text-white/70 font-one">Total</p>
                  <p className="text-lg font-bold text-white font-one">
                    {pagination.totalRequests}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ligne d'info */}
        <div className="text-white/60 text-xs font-var(--font-one) mb-3">
          Affichage de {pagination?.startIndex ?? 0} à{" "}
          {pagination?.endIndex ?? 0} sur {pagination?.totalRequests ?? 0}{" "}
          demande
          {(pagination?.totalRequests ?? 0) > 1 ? "s" : ""}
          {statusFilter !== "all" && (
            <span className="ml-1">(statut: {statusFilter})</span>
          )}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-noir-500 rounded-xl border border-white/20 p-12 text-center">
            <p className="text-red-400 mb-4 text-lg font-medium">{error}</p>
            <button
              onClick={() =>
                fetchDemandes({
                  page: pageFromUrl,
                  limit: limitFromUrl,
                  status: statusFromUrl,
                })
              }
              className="px-6 py-3 bg-tertiary-500 text-white rounded-lg hover:bg-tertiary-600 transition-colors font-medium"
            >
              Réessayer
            </button>
          </div>
        ) : demandes.length === 0 ? (
          <div className="bg-noir-500 rounded-xl border border-white/20 p-12 text-center">
            <p className="text-white/60 text-lg mb-2">Aucune demande trouvée</p>
            <p className="text-white/40 text-sm">
              {pagination?.totalRequests === 0
                ? "Aucune demande n'a encore été enregistrée"
                : "Essayez de modifier vos filtres"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {demandes.map((demande) => {
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
                              <Badge
                                color="orange"
                                label="Demande en attente"
                              />
                            ) : demande.status === "PROPOSED" ? (
                              <Badge color="blue" label="Demande proposée" />
                            ) : demande.status === "DECLINED" ? (
                              <Badge color="red" label="Demande refusée" />
                            ) : demande.status === "CLOSED" ? (
                              <Badge color="red" label="Demande clôturée" />
                            ) : (
                              <Badge
                                color="green"
                                label="Demande acceptée - RDV Créé"
                              />
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

                        {/* Détails utilisateur */}
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
                              <KV
                                label="Description"
                                value={details?.description}
                              />
                              <KV label="Zone" value={details?.zone} />
                              <KV
                                label="Style / Couleurs"
                                value={details?.colorStyle}
                              />
                              <KV label="Taille" value={details?.size} />

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

                        {/* Actions / date de création */}
                        <div className="flex items-center justify-between text-xs text-white/50 font-one mt-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {(demande.status === "PENDING" ||
                              demande.status === "DECLINED") && (
                              <>
                                <ProposeCreneau
                                  userId={user.id ?? ""}
                                  demande={demande}
                                  onUpdate={() =>
                                    fetchDemandes({
                                      page: pageFromUrl,
                                      limit: limitFromUrl,
                                      status: statusFromUrl,
                                    })
                                  }
                                />
                                <DeclinedDemande
                                  userId={user.id ?? ""}
                                  demande={demande}
                                  onDeclined={() =>
                                    fetchDemandes({
                                      page: pageFromUrl,
                                      limit: limitFromUrl,
                                      status: statusFromUrl,
                                    })
                                  }
                                />
                              </>
                            )}
                            {demande.status === "PROPOSED" && (
                              <DeclinedDemande
                                userId={user.id ?? ""}
                                demande={demande}
                                onDeclined={() =>
                                  fetchDemandes({
                                    page: pageFromUrl,
                                    limit: limitFromUrl,
                                    status: statusFromUrl,
                                  })
                                }
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

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-4">
                <button
                  onClick={() => goToPage(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="cursor-pointer px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors text-xs"
                >
                  Précédent
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(pagination.totalPages, 5) },
                    (_, i) => {
                      const total = pagination.totalPages;
                      const curr = pagination.currentPage;
                      let pageNumber: number;
                      if (total <= 5) pageNumber = i + 1;
                      else if (curr <= 3) pageNumber = i + 1;
                      else if (curr >= total - 2) pageNumber = total - 4 + i;
                      else pageNumber = curr - 2 + i;

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={`cursor-pointer w-8 h-8 rounded-lg text-xs font-var(--font-one) transition-all ${
                            curr === pageNumber
                              ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                              : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() => goToPage(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="cursor-pointer px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors text-xs"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="text-white/60">{label} :</span> {value || "N/A"}
    </div>
  );
}

function Badge({
  color,
  label,
}: {
  color: "orange" | "blue" | "red" | "green";
  label: string;
}) {
  const colors: Record<string, string> = {
    orange:
      "from-orange-500/15 to-orange-500/15 border-orange-400/30 text-orange-300",
    blue: "from-blue-500/15 to-blue-500/15 border-blue-400/30 text-blue-300",
    red: "from-red-500/15 to-red-500/15 border-red-400/30 text-red-300",
    green:
      "from-green-500/15 to-green-500/15 border-green-400/30 text-green-300",
  };
  return (
    <div className={`bg-gradient-to-r ${colors[color]} border rounded-lg p-2`}>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            color === "red"
              ? "bg-red-400"
              : color === "blue"
              ? "bg-blue-400"
              : color === "green"
              ? "bg-green-400"
              : "bg-orange-400"
          } animate-pulse`}
        />
        <span className="font-medium font-one text-xs">{label}</span>
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
