/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { MdOutlineRateReview, MdFilterList } from "react-icons/md";
import { IoChevronDown, IoArrowBack } from "react-icons/io5";
import Link from "next/link";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RiFileUserLine } from "react-icons/ri";
import PageHeader from "@/components/Shared/PageHeader";
import ApplicationToolbar from "@/components/Shared/ApplicationToolbar";
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
  const { data: session } = useSession();

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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
  const activeFiltersCount =
    (statusFilter !== "all" ? 1 : 0) +
    (tatoueurFilter !== "all" ? 1 : 0) +
    (searchTerm ? 1 : 0);

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
      const res = await fetch(
        `${base}/follow-up/tatoueurs/${session?.user?.id}`,
        {
          cache: "no-store",
        }
      );
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

  //! Fetch follow-ups (server-side filters + pagination)
  const fetchFollowUps = async (opts?: {
    page?: number;
    limit?: number;
    status?: StatusFilter;
    tatoueurId?: string;
    q?: string;
  }) => {
    if (!session?.user?.id) return;

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
    if (session?.user?.id) {
      fetchFollowUps({
        page: pageFromUrl,
        limit: limitFromUrl,
        status: statusFromUrl,
        tatoueurId: tatoueurFromUrl,
        q: queryFromUrl,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, searchParams]);

  // Charger la liste des tatoueurs
  useEffect(() => {
    if (session?.user?.id) fetchTatoueurs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, followUps]);

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
      console.log("Réponse au suivi :", selectedFollowUp.id, replyText);
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
    <section className="w-full space-y-3">
      <PageHeader
        icon={<RiFileUserLine size={20} className="text-tertiary-400" />}
        title="Suivi cicatrisation"
      />

      <ApplicationToolbar>
        <div className="flex w-full min-w-0 items-center gap-2">
          <Link
            href="/clients"
            aria-label="Retour aux clients"
            title="Retour aux clients"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-tertiary-400/10 text-white/70 transition-colors hover:bg-tertiary-400/15 hover:text-white"
          >
            <IoArrowBack className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={searchTerm}
              disabled={loading}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder="Rechercher un client..."
              className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-tertiary-400 focus:outline-none font-one transition-colors disabled:opacity-60"
            />
          </div>

          <div className="relative shrink-0 font-one">
            <button
              type="button"
              onClick={() => setIsFiltersOpen((open) => !open)}
              aria-label="Filtres"
              aria-expanded={isFiltersOpen}
              title="Filtres"
              className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border transition-colors ${
                isFiltersOpen || activeFiltersCount > 0
                  ? "border-tertiary-400/50 bg-tertiary-400/15 text-white"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <MdFilterList className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-tertiary-400 text-[10px] text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {isFiltersOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 flex w-60 flex-col gap-2 rounded-2xl border border-white/10 bg-noir-500 p-3 shadow-xl">
                <div className="relative">
                  <select
                    value={statusFilter}
                    disabled={loading}
                    onChange={(e) => {
                      const v = e.target.value as StatusFilter;
                      setStatusFilter(v);
                      updateParam("status", v);
                    }}
                    className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-tertiary-400 focus:outline-none font-one disabled:opacity-60"
                  >
                    <option value="all" className="bg-noir-500">Tous les statuts</option>
                    <option value="unanswered" className="bg-noir-500">En attente</option>
                    <option value="answered" className="bg-noir-500">Répondus</option>
                  </select>
                  <IoChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
                </div>

                <div className="relative">
                  <select
                    value={tatoueurFilter}
                    disabled={loading}
                    onChange={(e) => {
                      const v = e.target.value as TatoueurFilter;
                      setTatoueurFilter(v);
                      updateParam("tatoueurId", v);
                    }}
                    className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-tertiary-400 focus:outline-none font-one disabled:opacity-60"
                  >
                    <option value="all" className="bg-noir-500">Tous les tatoueurs</option>
                    {tatoueurs.map((t) => (
                      <option key={t.id} value={t.id} className="bg-noir-500">
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <IoChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
                </div>

                {activeFiltersCount > 0 && (
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
                    className="cursor-pointer rounded-2xl border border-red-400/25 bg-red-400/10 px-2.5 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-400/20 font-one"
                  >
                    ✕ Effacer
                  </button>
                )}
              </div>
            )}
          </div>

          <div
            title="Nombre de suivis"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-3 text-xs font-medium text-white font-one"
          >
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-400 to-tertiary-500 px-1 text-[11px]">
              {loading ? "-" : (pagination?.totalFollowUps ?? 0)}
            </span>
            Suivis
          </div>
        </div>
      </ApplicationToolbar>

      <div className="px-1 text-right text-xs text-white/55 font-one">
        {pagination?.startIndex ?? 0}–{pagination?.endIndex ?? 0} sur {pagination?.totalFollowUps ?? 0}
      </div>

      {error ? (
        <div className="dashboard-empty-state rounded-2xl border border-red-500/25 bg-red-500/8 p-6 text-center">
          <p className="text-sm text-red-300 font-one">{error}</p>
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
            className="cursor-pointer mt-3 inline-flex h-9 items-center justify-center rounded-[14px] bg-tertiary-500 px-4 text-[11px] font-medium text-white transition-colors hover:bg-tertiary-400 font-one"
          >
            Réessayer
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="dashboard-embedded-section animate-pulse rounded-2xl p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 rounded-xl bg-white/8 sm:h-20 sm:w-20" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-white/8" />
                  <div className="h-2 w-1/4 rounded bg-white/8" />
                  <div className="h-16 rounded-xl border border-white/10 bg-white/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : followUps.length === 0 ? (
        <div className="dashboard-empty-state rounded-2xl border border-white/10 p-8 text-center sm:p-10">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-tertiary-400/10">
            <MdOutlineRateReview className="h-7 w-7 text-tertiary-400" />
          </div>
          <p className="text-base text-white font-one">Aucun suivi trouvé</p>
          <p className="mt-1 text-xs text-white/55 font-one">Essayez de modifier vos filtres.</p>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {followUps.map((followUp) => (
            <article
              key={followUp.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.05] sm:flex-row sm:gap-4"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] sm:h-24 sm:w-24">
                {followUp.photoUrl ? (
                  <Image
                    src={followUp.photoUrl}
                    alt="Photo de cicatrisation"
                    width={96}
                    height={96}
                    className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
                    onClick={() => window.open(followUp.photoUrl, "_blank")}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <svg className="h-6 w-6 text-white/35" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              <div className="min-w-0 flex-1 font-one">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-white">
                      {followUp.appointment?.client?.firstName} {followUp.appointment?.client?.lastName}
                    </h3>
                    <p className="mt-1 truncate text-xs text-white/60">
                      {followUp.appointment?.title}
                      <span className="mx-1.5">·</span>
                      {followUp.appointment?.tatoueur?.name}
                      <span className="mx-1.5">·</span>
                      {getTimeAgo(followUp.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${
                      followUp.isAnswered
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-orange-500/30 bg-orange-500/10 text-orange-300"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {followUp.isAnswered ? "Répondu" : "En attente"}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[13px] text-yellow-400">{getRatingStars(followUp.rating)}</span>
                  <span className="text-[11px] text-white/70">{getRatingLabel(followUp.rating)}</span>
                </div>

                {followUp.review && (
                  <p className="mt-2 line-clamp-3 rounded-xl bg-white/[0.04] px-3 py-2 text-xs italic text-white/80">
                    "{followUp.review}"
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/50">
                  <span>
                    {formatDate(followUp.createdAt)}
                    <span className="mx-1.5">·</span>
                    <span className={followUp.isPhotoPublic ? "text-blue-300" : "text-white/40"}>
                      Photo {followUp.isPhotoPublic ? "publique" : "privée"}
                    </span>
                  </span>

                  <div className="flex items-center gap-2">
                    {!followUp.isAnswered && (
                      <button
                        onClick={() => handleReplyClick(followUp)}
                        className="cursor-pointer inline-flex h-8 items-center justify-center rounded-xl border border-tertiary-400/30 bg-tertiary-400/10 px-3 text-[11px] text-tertiary-300 transition-colors hover:bg-tertiary-400/20"
                      >
                        Répondre
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(followUp)}
                      className="cursor-pointer inline-flex h-8 items-center justify-center rounded-xl border border-red-400/30 bg-red-400/10 px-3 text-[11px] text-red-300 transition-colors hover:bg-red-400/20"
                      title="Supprimer ce suivi"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="dashboard-embedded-panel flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/4 p-2.5 sm:flex-row sm:gap-1.5">
          <button
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={!pagination.hasPreviousPage || loading}
            className="cursor-pointer inline-flex h-8 items-center justify-center rounded-[10px] border border-white/12 bg-white/8 px-2.5 text-[11px] text-white/85 transition-colors hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50 font-one"
          >
            Précédent
          </button>

          <div className="flex items-center gap-1">
            {Array.from(
              {
                length: Math.min(
                  pagination.totalPages,
                  typeof window !== "undefined" && window.innerWidth < 640 ? 3 : 5
                ),
              },
              (_, i) => {
                const maxButtons =
                  typeof window !== "undefined" && window.innerWidth < 640 ? 3 : 5;
                const total = pagination.totalPages;
                const curr = pagination.currentPage;
                let pageNumber: number;
                if (total <= maxButtons) pageNumber = i + 1;
                else if (curr <= Math.floor(maxButtons / 2) + 1) pageNumber = i + 1;
                else if (curr >= total - Math.floor(maxButtons / 2)) pageNumber = total - maxButtons + 1 + i;
                else pageNumber = curr - Math.floor(maxButtons / 2) + i;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    disabled={loading}
                    className={`cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-[11px] transition-colors font-one ${
                      curr === pageNumber
                        ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                        : "border border-white/12 bg-white/8 text-white/75 hover:bg-white/12 hover:text-white"
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
            className="cursor-pointer inline-flex h-8 items-center justify-center rounded-[10px] border border-white/12 bg-white/8 px-2.5 text-[11px] text-white/85 transition-colors hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50 font-one"
          >
            Suivant
          </button>
        </div>
      )}

      {isReplyModalOpen && selectedFollowUp && (
        <div
          data-modal
          className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-[2px] p-0 sm:p-3 md:p-4 lg:flex lg:items-center lg:justify-center overflow-hidden"
          style={{ height: "100dvh", width: "100vw" }}
        >
          <div className="dashboard-embedded-panel mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-none border-0 bg-noir-500 shadow-none sm:h-auto sm:max-h-[calc(100dvh-1.5rem)] sm:rounded-[28px] sm:border sm:border-white/12 sm:shadow-[0_32px_64px_rgba(0,0,0,0.45)] md:max-h-[90vh]">
            <div className="dashboard-embedded-header px-4 py-3.5 sm:rounded-t-[28px]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-white/50 font-one">Suivi client</p>
                  <h2 className="mt-1 truncate text-base font-semibold tracking-wide text-white font-one sm:text-lg">
                    Répondre au suivi
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-white/65 font-one">
                    {selectedFollowUp.appointment?.client?.firstName} {selectedFollowUp.appointment?.client?.lastName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReplyModalOpen(false)}
                  className="shrink-0 rounded-xl p-1.5 text-white/65 transition-colors hover:bg-tertiary-400/15 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-2.5 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              <div className="dashboard-embedded-section p-3">
                <h3 className="mb-2 text-[12px] font-semibold text-white font-one">Récapitulatif</h3>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/8 bg-white/4 px-2.5 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-white/35 font-one">Client</p>
                    <p className="mt-0.5 truncate text-xs text-white/90 font-one">
                      {selectedFollowUp.appointment?.client?.firstName} {selectedFollowUp.appointment?.client?.lastName}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/4 px-2.5 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-white/35 font-one">Prestation</p>
                    <p className="mt-0.5 truncate text-xs text-white/90 font-one">
                      {selectedFollowUp.appointment?.title}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/4 px-2.5 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-white/35 font-one">Tatoueur</p>
                    <p className="mt-0.5 truncate text-xs text-white/90 font-one">
                      {selectedFollowUp.appointment?.tatoueur?.name}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/4 px-2.5 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-white/35 font-one">Date</p>
                    <p className="mt-0.5 text-xs text-white/90 font-one">{formatDate(selectedFollowUp.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-white/55 font-one">Satisfaction :</span>
                  <span className="text-[13px] text-yellow-400">{getRatingStars(selectedFollowUp.rating)}</span>
                  <span className="text-[11px] text-white/80 font-one">{getRatingLabel(selectedFollowUp.rating)}</span>
                </div>

                {selectedFollowUp.review && (
                  <div className="mt-2 rounded-xl border border-white/10 bg-white/4 px-2.5 py-2">
                    <p className="text-[11px] text-white/60 font-one">Avis du client</p>
                    <p className="mt-0.5 text-xs italic text-white/90 font-one">"{selectedFollowUp.review}"</p>
                  </div>
                )}

                {selectedFollowUp.photoUrl && (
                  <div className="mt-2">
                    <p className="mb-1 text-[11px] text-white/60 font-one">Photo de cicatrisation</p>
                    <div className="h-24 w-24 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-28 sm:w-28">
                      <Image
                        src={selectedFollowUp.photoUrl}
                        alt="Photo de cicatrisation"
                        width={112}
                        height={112}
                        className="h-full w-full cursor-pointer object-cover"
                        onClick={() => window.open(selectedFollowUp.photoUrl, "_blank")}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="dashboard-embedded-section p-3">
                <h3 className="mb-2 text-[12px] font-semibold text-white font-one">Votre réponse</h3>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Rédigez votre réponse personnalisée pour le client..."
                  className="h-28 w-full resize-none rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one"
                  maxLength={1000}
                  disabled={isReplying}
                />

                <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-white/45 font-one">
                  <p>Le client recevra votre réponse par email.</p>
                  <p>{replyText.length}/1000</p>
                </div>

                <div className="mt-2 border-t border-white/10 pt-2">
                  <p className="mb-1.5 text-[11px] text-white/60 font-one">Suggestions</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      "Votre tatouage cicatrise parfaitement ! Continuez les soins comme indiqué.",
                      "Merci pour cette belle photo ! La cicatrisation suit son cours normal.",
                      "Excellent ! Votre tatouage guérit très bien. N'hésitez pas si vous avez des questions.",
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setReplyText(suggestion)}
                        disabled={isReplying}
                        className="cursor-pointer rounded-xl border border-white/10 bg-white/4 px-2.5 py-2 text-left text-[11px] text-white/80 transition-colors hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50 font-one"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-embedded-footer flex items-center justify-end gap-2 px-4 py-2.5 sm:rounded-b-[28px]">
              <button
                onClick={() => setIsReplyModalOpen(false)}
                disabled={isReplying}
                className="cursor-pointer inline-flex h-9 items-center justify-center rounded-[14px] border border-white/12 bg-white/8 px-3.5 text-[11px] font-medium text-white/85 transition-colors hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50 font-one"
              >
                Annuler
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={isReplying || !replyText.trim()}
                className="cursor-pointer inline-flex h-9 items-center justify-center gap-1.5 rounded-[14px] bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-4 text-[11px] font-medium text-white transition-all duration-200 hover:from-tertiary-500 hover:to-tertiary-600 disabled:cursor-not-allowed disabled:opacity-50 font-one"
              >
                {isReplying ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-b-2 border-white" />
                    <span>Envoi...</span>
                  </>
                ) : (
                  <span>Envoyer la réponse</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && followUpToDelete && (
        <div
          data-modal
          className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-[2px] p-0 sm:p-3 md:p-4 lg:flex lg:items-center lg:justify-center overflow-hidden"
          style={{ height: "100dvh", width: "100vw" }}
        >
          <div className="dashboard-embedded-panel mx-auto flex h-full w-full max-w-lg flex-col overflow-hidden rounded-none border-0 bg-noir-500 shadow-none sm:h-auto sm:rounded-[28px] sm:border sm:border-white/12 sm:shadow-[0_32px_64px_rgba(0,0,0,0.45)]">
            <div className="dashboard-embedded-header px-4 py-3.5 sm:rounded-t-[28px]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-red-300/70 font-one">Suppression</p>
                  <h2 className="mt-1 text-base font-semibold text-white font-one">Supprimer le suivi</h2>
                  <p className="mt-0.5 text-xs text-white/65 font-one">Cette action est irréversible.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  className="shrink-0 rounded-xl p-1.5 text-white/65 transition-colors hover:bg-tertiary-400/15 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-2.5 overflow-y-auto px-3 py-3">
              <div className="dashboard-embedded-section p-3">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    {followUpToDelete.photoUrl ? (
                      <Image
                        src={followUpToDelete.photoUrl}
                        alt="Photo de cicatrisation"
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/40">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white font-one">
                      {followUpToDelete.appointment?.client?.firstName} {followUpToDelete.appointment?.client?.lastName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-white/65 font-one">
                      {followUpToDelete.appointment?.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/45 font-one">
                      {formatDate(followUpToDelete.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-red-500/35 bg-red-500/10 p-3">
                <p className="text-xs font-semibold text-red-300 font-one">Attention</p>
                <p className="mt-1 text-xs text-red-200/90 font-one">
                  Cette action supprimera définitivement ce suivi de cicatrisation.
                  {!followUpToDelete.isAnswered && " Le client ne pourra plus recevoir de réponse."}
                </p>
              </div>
            </div>

            <div className="dashboard-embedded-footer flex items-center justify-end gap-2 px-4 py-2.5 sm:rounded-b-[28px]">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="cursor-pointer inline-flex h-9 items-center justify-center rounded-[14px] border border-white/12 bg-white/8 px-3.5 text-[11px] font-medium text-white/85 transition-colors hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50 font-one"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="cursor-pointer inline-flex h-9 items-center justify-center gap-1.5 rounded-[14px] bg-gradient-to-r from-red-500 to-red-600 px-4 text-[11px] font-medium text-white transition-all duration-200 hover:from-red-600 hover:to-red-700 disabled:cursor-not-allowed disabled:opacity-50 font-one"
              >
                {isDeleting ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-b-2 border-white" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <span>Supprimer</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
