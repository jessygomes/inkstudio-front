/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@/components/Auth/Context/UserContext";
import { MdOutlineRateReview, MdFilterList } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RiFileUserLine } from "react-icons/ri";
import {
  deleteSuiviAction,
  getFollowUpAction,
  replySuiviAction,
} from "@/lib/queries/followUp";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}
interface Tatoueur {
  id: string;
  name: string;
}
interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  client: Client;
  tatoueur: Tatoueur;
}
interface FollowUpSubmission {
  id: string;
  rating: number;
  review?: string;
  photoUrl: string;
  createdAt: string;
  isAnswered: boolean;
  isPhotoPublic: boolean;
  appointmentId: string;
  clientId: string;
  appointment: Appointment;
}

type StatusFilter = "all" | "answered" | "unanswered";
type TatoueurFilter = "all" | string;

interface Pagination {
  currentPage: number;
  limit: number;
  totalFollowUps: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

export default function ShowSuivis() {
  const user = useUser();

  // URL / Nav
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State
  const [loading, setLoading] = useState(true);
  const [followUps, setFollowUps] = useState<FollowUpSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Modales réponse/suppression
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] =
    useState<FollowUpSubmission | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [followUpToDelete, setFollowUpToDelete] =
    useState<FollowUpSubmission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtres (pilotés par URL)
  const statusFromUrl = (searchParams.get("status") || "all") as StatusFilter;
  const tatoueurFromUrl = (searchParams.get("tatoueurId") ||
    "all") as TatoueurFilter;
  const queryFromUrl = searchParams.get("q") || "";
  const limitFromUrl = Number(searchParams.get("limit")) || 10;
  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(statusFromUrl);
  const [tatoueurFilter, setTatoueurFilter] =
    useState<TatoueurFilter>(tatoueurFromUrl);
  const [searchTerm, setSearchTerm] = useState(queryFromUrl);

  const [tatoueurs, setTatoueurs] = useState<Tatoueur[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // Helpers URL
  const updateParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "") params.set(key, value);
    else params.delete(key);

    // reset page si filtre modifié
    if (["status", "tatoueurId", "q"].includes(key)) {
      params.set("page", "1");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const goToPage = (p: number) => updateParam("page", String(p));

  // Fetch tatoueurs (liste complète pour le select)
  const fetchTatoueurs = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_BACK_URL!;
      const res = await fetch(`${base}/follow-up/tatoueurs/${user.id}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setTatoueurs(Array.isArray(data?.tatoueurs) ? data.tatoueurs : []);
      } else {
        // fallback : à partir de la page courante
        const unique = Array.from(
          new Map(
            followUps
              .filter((f) => f.appointment?.tatoueur)
              .map((f) => [f.appointment.tatoueur.id, f.appointment.tatoueur])
          ).values()
        ) as Tatoueur[];
        setTatoueurs(unique);
      }
    } catch {
      const unique = Array.from(
        new Map(
          followUps
            .filter((f) => f.appointment?.tatoueur)
            .map((f) => [f.appointment.tatoueur.id, f.appointment.tatoueur])
        ).values()
      ) as Tatoueur[];
      setTatoueurs(unique);
    }
  };

  // Fetch follow-ups (server-side filters + pagination)
  const fetchFollowUps = async (opts?: {
    page?: number;
    limit?: number;
    status?: StatusFilter;
    tatoueurId?: string;
    q?: string;
  }) => {
    if (!user?.id) return;

    const page = opts?.page ?? pageFromUrl;
    const limit = opts?.limit ?? limitFromUrl;
    const status = opts?.status ?? statusFromUrl;
    const tatoueurId = opts?.tatoueurId ?? tatoueurFromUrl;
    const q = opts?.q ?? queryFromUrl;

    setLoading(true);
    setError(null);
    try {
      const res = await getFollowUpAction(page, limit, status, tatoueurId, q);

      if (!res.ok) throw new Error("Erreur lors de la récupération des suivis");

      setFollowUps(
        Array.isArray(res.data?.followUps) ? res.data.followUps : []
      );

      setPagination(res.data?.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Sync URL -> state + fetch
  useEffect(() => {
    setStatusFilter(statusFromUrl);
    setTatoueurFilter(tatoueurFromUrl);
    setSearchTerm(queryFromUrl);
    if (user?.id) {
      fetchFollowUps({
        page: pageFromUrl,
        limit: limitFromUrl,
        status: statusFromUrl,
        tatoueurId: tatoueurFromUrl,
        q: queryFromUrl,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, searchParams]);

  // Charger la liste des tatoueurs
  useEffect(() => {
    if (user?.id) fetchTatoueurs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, followUps]);

  // Debounce pour la recherche client
  useEffect(() => {
    const handler = setTimeout(() => {
      // Met à jour l'URL seulement si différent
      if (searchTerm !== queryFromUrl) {
        updateParam("q", searchTerm || undefined);
      }
    }, 500); // 500ms de délai

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Utils
  const getRatingStars = (rating: number) =>
    "⭐".repeat(rating) + "☆".repeat(5 - rating);
  const getRatingLabel = (rating: number) =>
    ((
      {
        1: "Très insatisfait",
        2: "Insatisfait",
        3: "Neutre",
        4: "Satisfait",
        5: "Très satisfait",
      } as any
    )[rating] || "");
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const getTimeAgo = (s: string) => {
    const now = new Date().getTime();
    const t = new Date(s).getTime();
    const h = Math.floor((now - t) / (1000 * 60 * 60));
    if (h < 1) return "À l'instant";
    if (h < 24) return `Il y a ${h}h`;
    const d = Math.floor(h / 24);
    return `Il y a ${d}j`;
  };

  // Handlers réponse/suppression
  const handleReplyClick = (f: FollowUpSubmission) => {
    setSelectedFollowUp(f);
    setReplyText("");
    setIsReplyModalOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!selectedFollowUp || !replyText.trim()) {
      toast.error("Veuillez saisir une réponse");
      return;
    }
    setIsReplying(true);
    try {
      const res = await replySuiviAction(selectedFollowUp.id, replyText);

      if (!res.ok)
        throw new Error(
          res.message === "Unauthorized"
            ? "Vous n'êtes pas autorisé à répondre à ce suivi"
            : "Erreur lors de l'envoi de la réponse"
        );

      toast.success("Réponse envoyée avec succès !");

      await fetchFollowUps({
        page: pageFromUrl,
        limit: limitFromUrl,
        status: statusFromUrl,
        tatoueurId: tatoueurFromUrl,
        q: queryFromUrl,
      });

      setIsReplyModalOpen(false);
      setSelectedFollowUp(null);
      setReplyText("");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Erreur lors de l'envoi de la réponse"
      );
    } finally {
      setIsReplying(false);
    }
  };

  const handleDeleteClick = (f: FollowUpSubmission) => {
    setFollowUpToDelete(f);
    setIsDeleteModalOpen(true);
  };

  // UploadThing helpers
  const extractUploadThingKey = (url: string): string | null => {
    try {
      const m = url.match(/\/f\/([^\/\?]+)/);
      return m ? m[1] : null;
    } catch {
      return null;
    }
  };

  const deleteFromUploadThing = async (fileKey: string) => {
    try {
      const res = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKeys: [fileKey] }),
      });
      if (!res.ok) return false;
      await res.json();
      return true;
    } catch {
      return false;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!followUpToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteSuiviAction(followUpToDelete.id);

      if (!res.ok)
        throw new Error(
          res.message === "Unauthorized"
            ? "Vous n'êtes pas autorisé à répondre à ce suivi"
            : "Erreur lors de l'envoi de la réponse"
        );

      if (followUpToDelete.photoUrl?.includes("utfs.io")) {
        const key = extractUploadThingKey(followUpToDelete.photoUrl);
        if (key) await deleteFromUploadThing(key);
      }

      toast.success("Suivi supprimé avec succès");

      await fetchFollowUps({
        page: pageFromUrl,
        limit: limitFromUrl,
        status: statusFromUrl,
        tatoueurId: tatoueurFromUrl,
        q: queryFromUrl,
      });

      setIsDeleteModalOpen(false);
      setFollowUpToDelete(null);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Erreur lors de la suppression"
      );
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setFollowUpToDelete(null);
  };

  return (
    <div className="min-h-screen bg-noir-700">
      <div className="px-6 lg:px-20 mx-auto">
        {/* Header visible en permanence */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10 mb-6 ">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center ">
              <RiFileUserLine
                size={28}
                className="text-tertiary-400 animate-pulse"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-one tracking-wide uppercase">
                Clients - Suivi de cicatrisation
              </h1>
              <p className="text-white/70 text-xs font-one mt-1">
                Répondez aux suivis de cicatrisation de vos clients. Gérez les
                photos et les commentaires pour assurer un suivi optimal.
              </p>
            </div>
          </div>
        </div>

        {/* Filtres (désactivés pendant le chargement) */}
        <div className="bg-noir-500 rounded-xl border border-white/20 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <MdFilterList className="text-white w-5 h-5" />
            <h2 className="text-white font-one font-semibold">Filtres</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <label className="block text-xs text-white/70 font-one mb-2">
                Rechercher par client
              </label>
              <input
                type="text"
                value={searchTerm}
                disabled={loading}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // NE PAS appeler updateParam ici
                }}
                placeholder="Nom du client..."
                className="w-full text-sm text-white bg-white/10 placeholder:text-white/30 py-2 px-3 font-one border border-white/20 rounded-lg focus:outline-none focus:border-tertiary-400 transition-colors disabled:opacity-60"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-xs text-white/70 font-one mb-2">
                Statut de réponse
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  disabled={loading}
                  onChange={(e) => {
                    const v = e.target.value as StatusFilter;
                    setStatusFilter(v);
                    updateParam("status", v);
                  }}
                  className="w-full text-sm text-white bg-noir-500/80 py-2 px-3 font-one border border-white/20 rounded-lg focus:outline-none focus:border-tertiary-400 transition-colors appearance-none cursor-pointer disabled:opacity-60"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="unanswered">En attente</option>
                  <option value="answered">Répondus</option>
                </select>
                <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Tatoueur */}
            <div>
              <label className="block text-xs text-white/70 font-one mb-2">
                Tatoueur
              </label>
              <div className="relative">
                <select
                  value={tatoueurFilter}
                  disabled={loading}
                  onChange={(e) => {
                    const v = e.target.value as TatoueurFilter;
                    setTatoueurFilter(v);
                    updateParam("tatoueurId", v);
                  }}
                  className="w-full text-sm text-white bg-noir-500/80 py-2 px-3 font-one border border-white/20 rounded-lg focus:outline-none focus:border-tertiary-400 transition-colors appearance-none cursor-pointer disabled:opacity-60"
                >
                  <option value="all">Tous les tatoueurs</option>
                  {tatoueurs.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Compteurs */}
            <div className="flex items-end">
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-xs text-white/70 font-one">
                    Résultats (page)
                  </p>
                  <p className="text-lg font-bold text-tertiary-400 font-one">
                    {loading ? "—" : followUps.length}
                  </p>
                </div>
                {pagination && (
                  <div className="text-center">
                    <p className="text-xs text-white/70 font-one">Total</p>
                    <p className="text-lg font-bold text-white font-one">
                      {loading ? "—" : pagination.totalFollowUps}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filtres actifs */}
          {(statusFilter !== "all" ||
            tatoueurFilter !== "all" ||
            searchTerm) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-var(--font-one) text-white/50">
                Filtres actifs :
              </span>

              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-2 px-2 py-1 bg-cyan-400/20 text-cyan-300 rounded-full text-[10px] font-var(--font-one) border border-cyan-400/30">
                  Statut :{" "}
                  {statusFilter
                    ? statusFilter === "unanswered"
                      ? "En attente"
                      : "Répondu"
                    : "Tous"}
                  <button
                    onClick={() => updateParam("status", "all")}
                    className="cursor-pointer hover:text-white/90"
                    aria-label="Supprimer filtre statut"
                  >
                    ✕
                  </button>
                </span>
              )}

              {tatoueurFilter !== "all" && (
                <span className="inline-flex items-center gap-2 px-2 py-1 bg-violet-400/20 text-violet-300 rounded-full text-[10px] font-var(--font-one) border border-violet-400/30">
                  tatoueur:{" "}
                  {tatoueurs.find((t) => t.id === tatoueurFilter)?.name ||
                    tatoueurFilter}
                  <button
                    onClick={() => updateParam("tatoueurId", "all")}
                    className="cursor-pointer hover:text-white/90"
                    aria-label="Supprimer filtre tatoueur"
                  >
                    ✕
                  </button>
                </span>
              )}

              {searchTerm && (
                <span className="inline-flex items-center gap-2 px-2 py-1 bg-amber-400/20 text-amber-300 rounded-full text-[10px] font-var(--font-one) border border-amber-400/30">
                  recherche: “{searchTerm}”
                  <button
                    onClick={() => updateParam("q", undefined)}
                    className="cursor-pointer hover:text-white/90"
                    aria-label="Supprimer filtre recherche"
                  >
                    ✕
                  </button>
                </span>
              )}

              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("status");
                  params.delete("tatoueurId");
                  params.delete("q");
                  params.set("page", "1");
                  router.replace(`${pathname}?${params.toString()}`, {
                    scroll: false,
                  });
                }}
                className="cursor-pointer px-2 py-1 bg-red-400/20 text-red-300 rounded-full font-var(--font-one) text-[10px] border border-red-400/30 hover:bg-red-400/30 transition-colors"
              >
                ✕ Effacer tout
              </button>
            </div>
          )}
        </div>

        {/* Ligne d’info */}
        <div className="text-white/60 text-xs font-var(--font-one) mb-3">
          Affichage de {pagination?.startIndex ?? 0} à{" "}
          {pagination?.endIndex ?? 0} sur {pagination?.totalFollowUps ?? 0}{" "}
          suivi
          {(pagination?.totalFollowUps ?? 0) > 1 ? "s" : ""}
        </div>

        {/* Zone liste : erreur / loading skeleton / vide / liste */}
        {error ? (
          <div className="text-center py-12 bg-noir-500 rounded-xl border border-white/20">
            <p className="text-red-400 mb-4 text-lg font-medium">{error}</p>
            <button
              onClick={() =>
                fetchFollowUps({
                  page: pageFromUrl,
                  limit: limitFromUrl,
                  status: statusFromUrl,
                  tatoueurId: tatoueurFromUrl,
                  q: queryFromUrl,
                })
              }
              className="px-6 py-3 bg-tertiary-500 text-white rounded-lg hover:bg-tertiary-600 transition-colors font-medium"
            >
              Réessayer
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-noir-500 rounded-xl border border-white/10 p-6 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-white/10 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                    <div className="h-3 bg-white/10 rounded w-1/4" />
                    <div className="h-3 bg-white/10 rounded w-1/5" />
                    <div className="h-20 bg-white/5 rounded border border-white/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : followUps.length === 0 ? (
          <div className="bg-noir-500 rounded-xl border border-white/20 p-12 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdOutlineRateReview className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-white/60 text-lg mb-2">Aucun suivi trouvé</p>
            <p className="text-white/40 text-sm">
              Essayez de modifier vos filtres
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {followUps.map((followUp) => (
              <div
                key={followUp.id}
                className="bg-noir-500 rounded-xl border border-white/20 p-6 hover:border-tertiary-400/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 border border-white/20">
                    {followUp.photoUrl ? (
                      <Image
                        src={followUp.photoUrl}
                        alt="Photo de cicatrisation"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(followUp.photoUrl, "_blank")}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold font-one text-lg mb-1">
                          {followUp.appointment?.client?.firstName}{" "}
                          {followUp.appointment?.client?.lastName}
                        </h3>
                        <p className="text-white/70 text-sm font-one mb-1">
                          {followUp.appointment?.title}
                        </p>
                        <p className="text-white/50 text-xs font-one">
                          Tatoueur: {followUp.appointment?.tatoueur?.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            followUp.isAnswered
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          }`}
                        >
                          {followUp.isAnswered ? "Répondu" : "En attente"}
                        </span>
                        <span className="text-white/50 text-xs font-one">
                          {getTimeAgo(followUp.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Évaluation */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-yellow-400">
                        {getRatingStars(followUp.rating)}
                      </span>
                      <span className="text-white/80 text-sm font-one">
                        {getRatingLabel(followUp.rating)}
                      </span>
                    </div>

                    {/* Avis */}
                    {followUp.review && (
                      <div className="bg-white/5 p-3 rounded-lg border border-white/10 mb-3">
                        <p className="text-white/90 text-sm font-one italic">
                          "{followUp.review}"
                        </p>
                      </div>
                    )}

                    {/* Métadonnées + actions */}
                    <div className="flex items-center justify-between text-xs text-white/50 font-one">
                      <span>Envoyé le {formatDate(followUp.createdAt)}</span>
                      <div className="flex items-center gap-4">
                        <span
                          className={`${
                            followUp.isPhotoPublic
                              ? "text-blue-400"
                              : "text-gray-400"
                          }`}
                        >
                          Photo {followUp.isPhotoPublic ? "publique" : "privée"}
                        </span>
                        <div className="flex items-center gap-2">
                          {!followUp.isAnswered && (
                            <button
                              onClick={() => handleReplyClick(followUp)}
                              className="cursor-pointer text-tertiary-400 hover:text-tertiary-300 transition-colors font-medium"
                            >
                              Répondre →
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(followUp)}
                            className="cursor-pointer text-red-400 hover:text-red-300 transition-colors font-medium ml-2"
                            title="Supprimer ce suivi"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
            <button
              onClick={() => goToPage(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage || loading}
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
                      disabled={loading}
                      className={`cursor-pointer w-8 h-8 rounded-lg text-xs font-var(--font-one) transition-all ${
                        curr === pageNumber
                          ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                          : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={() => goToPage(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="cursor-pointer px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors text-xs"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Modale de réponse */}
      {isReplyModalOpen && selectedFollowUp && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-noir-500 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white font-one tracking-wide">
                  Répondre au suivi
                </h2>
                <button
                  onClick={() => setIsReplyModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <span className="cursor-pointer text-white text-xl">×</span>
                </button>
              </div>
              <p className="text-white/70 mt-2 text-sm">
                Réponse à {selectedFollowUp.appointment?.client?.firstName}{" "}
                {selectedFollowUp.appointment?.client?.lastName}
              </p>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Récapitulatif du suivi */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
                <h3 className="text-white font-semibold font-one mb-3">
                  📋 Récapitulatif du suivi
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-white/70 font-one">Client</p>
                    <p className="text-white font-one text-sm">
                      {selectedFollowUp.appointment?.client?.firstName}{" "}
                      {selectedFollowUp.appointment?.client?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/70 font-one">Prestation</p>
                    <p className="text-white font-one text-sm">
                      {selectedFollowUp.appointment?.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/70 font-one">Tatoueur</p>
                    <p className="text-white font-one text-sm">
                      {selectedFollowUp.appointment?.tatoueur?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/70 font-one">
                      Date d'envoi
                    </p>
                    <p className="text-white font-one text-sm">
                      {formatDate(selectedFollowUp.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Évaluation du client */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-white/70 font-one">
                    Satisfaction:
                  </span>
                  <span className="text-yellow-400 text-sm">
                    {getRatingStars(selectedFollowUp.rating)}
                  </span>
                  <span className="text-white/80 text-xs font-one">
                    {getRatingLabel(selectedFollowUp.rating)}
                  </span>
                </div>

                {/* Avis du client */}
                {selectedFollowUp.review && (
                  <div className="mt-3">
                    <p className="text-xs text-white/70 font-one mb-2">
                      Avis du client:
                    </p>
                    <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                      <p className="text-white/90 text-sm font-one italic">
                        "{selectedFollowUp.review}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Photo du client */}
                {selectedFollowUp.photoUrl && (
                  <div className="mt-4">
                    <p className="text-xs text-white/70 font-one mb-2">
                      Photo de cicatrisation:
                    </p>
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-white/10 border border-white/20">
                      <Image
                        src={selectedFollowUp.photoUrl}
                        alt="Photo de cicatrisation"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() =>
                          window.open(selectedFollowUp.photoUrl, "_blank")
                        }
                      />
                    </div>
                    <p className="text-xs text-white/50 font-one mt-1">
                      Cliquez pour voir en grand
                    </p>
                  </div>
                )}
              </div>

              {/* Zone de réponse */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="text-white font-semibold font-one mb-3">
                  ✍️ Votre réponse
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-white/70 font-one mb-2">
                      Message pour le client
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Rédigez votre réponse personnalisée pour le client..."
                      className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400 focus:border-transparent resize-none transition-colors"
                      maxLength={1000}
                      disabled={isReplying}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-white/50 font-one">
                        Le client recevra votre réponse par email
                      </p>
                      <p className="text-xs text-white/50 font-one">
                        {replyText.length}/1000
                      </p>
                    </div>
                  </div>

                  {/* Suggestions de réponse */}
                  <div className="border-t border-white/10 pt-3">
                    <p className="text-xs text-white/70 font-one mb-2">
                      💡 Suggestions de réponse :
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        "Votre tatouage cicatrise parfaitement ! Continuez les soins comme indiqué.",
                        "Merci pour cette belle photo ! La cicatrisation suit son cours normal.",
                        "Excellent ! Votre tatouage guérit très bien. N'hésitez pas si vous avez des questions.",
                      ].map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setReplyText(suggestion)}
                          disabled={isReplying}
                          className="cursor-pointer text-left p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-tertiary-400/30 transition-all text-xs text-white/80 font-one disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button
                onClick={() => setIsReplyModalOpen(false)}
                disabled={isReplying}
                className="cursor-pointer px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={isReplying || !replyText.trim()}
                className="cursor-pointer px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-sm flex items-center gap-2"
              >
                {isReplying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    <span>Envoyer la réponse</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {isDeleteModalOpen && followUpToDelete && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-noir-500 rounded-2xl w-full max-w-md border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-white font-one">
                  Supprimer le suivi
                </h2>
              </div>
              <p className="text-white/70 text-sm">
                Cette action est irréversible
              </p>
            </div>

            {/* Contenu */}
            <div className="p-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 border border-white/20">
                    {followUpToDelete.photoUrl ? (
                      <Image
                        src={followUpToDelete.photoUrl}
                        alt="Photo de cicatrisation"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-white font-medium text-sm mb-1">
                      {followUpToDelete.appointment?.client?.firstName}{" "}
                      {followUpToDelete.appointment?.client?.lastName}
                    </p>
                    <p className="text-white/70 text-xs mb-1">
                      {followUpToDelete.appointment?.title}
                    </p>
                    <p className="text-white/50 text-xs">
                      {formatDate(followUpToDelete.createdAt)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-400 text-xs">
                        {getRatingStars(followUpToDelete.rating)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          followUpToDelete.isAnswered
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        }`}
                      >
                        {followUpToDelete.isAnswered ? "Répondu" : "En attente"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-red-300 text-xs font-semibold mb-1">
                      Attention !
                    </p>
                    <p className="text-red-300/80 text-xs">
                      Cette action supprimera définitivement ce suivi de
                      cicatrisation.
                      {!followUpToDelete.isAnswered &&
                        " Le client ne pourra plus recevoir de réponse."}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-white/80 text-sm mb-4">
                Êtes-vous sûr de vouloir supprimer ce suivi ?
              </p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-sm flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>Supprimer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
