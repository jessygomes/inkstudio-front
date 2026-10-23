/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  CalendarEvent,
  CalendarView,
} from "@/components/Application/RDV/Calendar";
import { CalendarViewMobile } from "@/components/Application/RDV/CalendarViewMobile";
import { useState, useEffect } from "react";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { View } from "react-big-calendar";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllAppointments,
  fetchAppointments,
  paidAppointmentsAction,
} from "@/lib/queries/appointment";
import { FaArrowLeft } from "react-icons/fa6";
import { CiCalendar, CiCalendarDate } from "react-icons/ci";
import { SlidersHorizontal } from "lucide-react";
import { Search } from "@/components/Shared/Search";
import { toast } from "sonner";
import { FaRegCalendarTimes } from "react-icons/fa";
import ShowRdvDetails from "./ShowRdvDetails";
import ShowRdvDetailsMobile from "./ShowRdvDetailsMobile";
import { useScrollLock } from "@/lib/hook/useScrollLock";
import { useSession } from "next-auth/react";
import RdvListSkeleton from "@/components/Skeleton/RdvListSkeleton";
import PageHeader from "@/components/Shared/PageHeader";
import ApplicationToolbar from "@/components/Shared/ApplicationToolbar";
import DashboardButton from "@/components/Shared/DashboardButton";

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  CANCELED: { label: "Annulé", className: "border-red-500/30 bg-red-500/10 text-red-300" },
  RESCHEDULING: { label: "Reprogrammation", className: "border-blue-500/30 bg-blue-500/10 text-blue-300" },
  COMPLETED: { label: "Complété", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  NO_SHOW: { label: "Pas présenté", className: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
  PENDING: { label: "En attente", className: "border-orange-500/30 bg-orange-500/10 text-orange-300" },
  CONFIRMED: { label: "Confirmé", className: "border-green-500/30 bg-green-500/10 text-green-300" },
};

export default function RDV() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  const queryClient = useQueryClient();

  // Vérifier si l'utilisateur a un plan Free
  const isFreeAccount = session?.user?.saasPlan === "FREE";

  //! Pour afficher les rdv en fonction de la date courante
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("month");

  //! Définir le mode par défaut selon la taille d'écran
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list"); // Changé à "list" par défaut
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const ITEMS_PER_PAGE = 10;

  //! États pour les filtres
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all"); // all, past, upcoming
  const [prestationFilter, setPrestationFilter] = useState<string>("all");
  const [tatoueurFilter, setTatoueurFilter] = useState<string>("all");

  //! Afficher les infos d'un RDV
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  //! Bloquer le scroll du body quand la modal mobile est ouverte
  useScrollLock(isMobileDetailOpen);

  const openEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsMobileDetailOpen(true); // Pour mobile
  };
  const closeEventDetails = () => {
    setSelectedEvent(null);
    setIsMobileDetailOpen(false);
  };

  //! Déterminer la plage de dates en fonction de la vue
  const getDateRange = (view: string, date: Date) => {
    switch (view) {
      case "week":
        return {
          start: startOfWeek(date, { weekStartsOn: 1 }).toISOString(),
          end: endOfWeek(date, { weekStartsOn: 1 }).toISOString(),
        };
      case "day":
        return {
          start: startOfDay(date).toISOString(),
          end: endOfDay(date).toISOString(),
        };
      case "month":
        return {
          start: startOfMonth(date).toISOString(),
          end: endOfMonth(date).toISOString(),
        };
      default:
        return {
          start: startOfDay(date).toISOString(),
          end: endOfDay(date).toISOString(),
        };
    }
  };

  //! DATA - Modifier pour récupérer tous les RDV en mode liste
  const { start, end } =
    viewMode === "calendar"
      ? getDateRange(currentView, currentDate)
      : { start: "", end: "" }; // Pas de filtre de date en mode liste

  const userId = session?.user?.id;

  const {
    data: rawData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "appointments",
      userId,
      viewMode,
      viewMode === "calendar" ? start : "all",
      viewMode === "calendar" ? end : "all",
      currentPage,
      ITEMS_PER_PAGE,
      statusFilter,
      dateFilter,
      tatoueurFilter,
      prestationFilter,
      query,
    ],
    queryFn: async () => {
      try {
        let result;
        if (viewMode === "calendar") {
          result = await fetchAppointments(
            userId!,
            start,
            end,
            currentPage,
            ITEMS_PER_PAGE,
          );
        } else {
          // Vue liste: utiliser la pagination serveur avec filtres
          result = await fetchAllAppointments(
            userId!,
            currentPage,
            ITEMS_PER_PAGE,
            statusFilter !== "all" ? statusFilter : undefined,
            dateFilter !== "all" ? dateFilter : undefined,
            tatoueurFilter !== "all" ? tatoueurFilter : undefined,
            prestationFilter !== "all" ? prestationFilter : undefined,
            query ? query : undefined,
          );
        }

        return result;
      } catch (error) {
        console.error("❌ Erreur dans queryFn:", error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Extraire les événements selon le format de réponse
  const events = rawData?.appointments || [];

  // Utiliser les options de filtres retournées par le backend
  const uniquePrestations = rawData?.allPrestations || [];
  const activeFiltersCount = [
    statusFilter,
    prestationFilter,
    tatoueurFilter,
    viewMode === "list" ? dateFilter : "all",
  ].filter((value) => value !== "all").length;
  const uniqueTatoueurs = rawData?.allTatoueurs || [];

  const handleRdvUpdated = (updatedId: string) => {
    // Invalidate queries to refresh the appointments list
    queryClient.invalidateQueries({ queryKey: ["appointments"] });

    // Update selected event after a small delay to allow query to refetch
    setTimeout(() => {
      const updated = events.find((e: CalendarEvent) => e.id === updatedId);
      if (updated) {
        setSelectedEvent(updated);
      }
    }, 100);
  };

  const getFormattedLabel = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    switch (currentView) {
      case "day":
        return currentDate.toLocaleDateString("fr-FR", {
          ...options,
          weekday: "long",
        });

      case "week":
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `Semaine du ${start.toLocaleDateString(
          "fr-FR",
          options,
        )} au ${end.toLocaleDateString("fr-FR", options)}`;

      case "month":
        return currentDate.toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
        });

      default:
        return currentDate.toLocaleDateString("fr-FR", options);
    }
  };

  // Les filtres (dont la recherche) sont appliqués côté backend
  const filteredEvents = events;

  // Calcul du nombre de RDV en attente de confirmation
  const pendingAppointmentsCount = events.filter(
    (event: CalendarEvent) => event.status === "PENDING",
  ).length;

  // Pagination: utiliser la pagination serveur
  const hasActiveFilters = Boolean(
    statusFilter !== "all" ||
    prestationFilter !== "all" ||
    tatoueurFilter !== "all" ||
    (viewMode === "list" && dateFilter !== "all"),
  );
  const totalPages = hasActiveFilters
    ? 1
    : (rawData?.pagination?.totalPages ?? 1);
  const totalAppointments =
    rawData?.pagination?.totalAppointments ?? events.length;

  // Les données reçues sont déjà paginées par le serveur
  const paginatedEvents = filteredEvents;

  // Reset de la pagination quand on change de vue, query ou filtres
  const handleViewModeChange = (mode: "calendar" | "list") => {
    setViewMode(mode);
    setCurrentPage(1);
    setStatusFilter("all");
    setDateFilter("all");
    setPrestationFilter("all");
    setTatoueurFilter("all");
    if (mode === "calendar") {
      setSelectedEvent(null);
    }
  };

  // Reset pagination when query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, dateFilter, prestationFilter, tatoueurFilter]);

  // Reset pagination when date range changes in calendar mode
  useEffect(() => {
    if (viewMode === "calendar") {
      setCurrentPage(1);
    }
  }, [currentDate, currentView, viewMode]);

  //! Changer le statut de paiement
  const handlePaymentStatusChange = async (rdvId: string, isPayed: boolean) => {
    try {
      await paidAppointmentsAction(rdvId, isPayed);

      // Mettre à jour l'événement sélectionné si c'est celui qui a été modifié
      if (selectedEvent && selectedEvent.id === rdvId) {
        setSelectedEvent({
          ...selectedEvent,
          isPayed: isPayed,
        });
      }

      // Invalidate queries to refresh the appointments list
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    } catch (error) {
      console.error("Erreur:", error);
      // Optionnel: afficher une notification d'erreur
      toast.error(
        "Une erreur est survenue lors de la mise à jour du statut de paiement",
      );
    }
  };

  //! Callback pour le changement de statut depuis le composant ChangeStatusButtons
  const handleStatusChange = (
    rdvId: string,
    status: "COMPLETED" | "NO_SHOW",
  ) => {
    // Mettre à jour l'événement sélectionné si c'est celui qui a été modifié
    if (selectedEvent && selectedEvent.id === rdvId) {
      setSelectedEvent({
        ...selectedEvent,
        status: status,
      });
    }

    // Invalidate all appointment queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ["appointments"] });

    // Show success message
    toast.success(
      `Rendez-vous marqué comme ${
        status === "COMPLETED" ? "terminé" : "non présenté"
      }`,
    );
  };

  const price =
    selectedEvent?.tattooDetail?.price ||
    selectedEvent?.tattooDetail?.estimatedPrice ||
    0;

  return (
    <div className="w-full gap-6 pb-10 xl:pb-0">
      <PageHeader
        icon={<FaRegCalendarTimes size={15} className="text-tertiary-400" />}
        title="Mes rendez-vous"
      >
      </PageHeader>

      {isFreeAccount && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-tertiary-400/25 bg-tertiary-400/8 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-one text-sm leading-6 text-white/75">
            Votre compte est en plan gratuit : vous pouvez consulter et gérer vos rendez-vous en cours, mais plus en créer de nouveaux.
          </p>
          <DashboardButton href="/parametres" className="min-w-0 shrink-0 px-4 py-2 text-sm">
            Passer à PRO
          </DashboardButton>
        </div>
      )}

      {error ? (
        <div className="h-[80vh] w-full flex items-center justify-center relative">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-white text-xl font-two">Erreur de chargement</p>
            <p className="text-white/60 text-sm max-w-md">
              {error instanceof Error
                ? error.message
                : "Une erreur est survenue lors du chargement des rendez-vous"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-tertiary-400 hover:bg-tertiary-500 text-white rounded-lg transition-colors text-sm"
            >
              Réessayer
            </button>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-4 xl:flex-row xl:gap-0">
          <div className="flex min-w-0 flex-1 flex-col gap-4 xl:mr-[calc(36vw-2.5rem)] xl:pr-6">
          <ApplicationToolbar className="sm:!flex-col sm:!items-stretch [&_input:not([type=checkbox])]:!rounded-2xl sm:[&_input:not([type=checkbox])]:!rounded-2xl">
            <div className="relative z-0 flex w-full min-w-0 flex-wrap items-center gap-2 md:flex-nowrap">
              <div className="flex w-full shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-black/15 p-1 md:w-auto">
                <button
                  onClick={() => handleViewModeChange("calendar")}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200 font-one md:flex-none md:py-1.5 ${
                    viewMode === "calendar"
                      ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <CiCalendarDate size={18} />
                  Calendrier
                </button>
                <button
                  onClick={() => handleViewModeChange("list")}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200 font-one md:flex-none md:py-1.5 ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <CiCalendar size={18} />
                  Tous les RDV
                </button>
              </div>

              <div
                className={`${viewMode === "calendar" ? "hidden" : "block"} relative order-2 shrink-0 font-one`}
              >
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
                  <SlidersHorizontal size={16} />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-tertiary-400 text-[10px] text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {isFiltersOpen && (
              <div
                className="absolute right-0 top-full z-30 mt-2 flex w-56 flex-col gap-2 rounded-2xl border border-white/10 bg-noir-500 p-3 shadow-xl"
              >
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                    className="relative z-0 min-w-[92px] shrink-0 cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white transition-colors focus:border-tertiary-400 focus:outline-none"
                >
                  <option value="all" className="bg-noir-500">Statut</option>
                  <option value="PENDING" className="bg-noir-500">En attente</option>
                  <option value="CONFIRMED" className="bg-noir-500">Confirmés</option>
                  <option value="COMPLETED" className="bg-noir-500">Complétés</option>
                  <option value="NO_SHOW" className="bg-noir-500">Pas présentés</option>
                  <option value="CANCELED" className="bg-noir-500">Annulés</option>
                </select>

                <select
                  value={prestationFilter}
                  onChange={(e) => setPrestationFilter(e.target.value)}
                    className="relative z-0 min-w-[92px] shrink-0 cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white transition-colors focus:border-tertiary-400 focus:outline-none"
                >
                  <option value="all" className="bg-noir-500">Type</option>
                  {uniquePrestations.map((prestation: any) => (
                    <option key={prestation} value={prestation} className="bg-noir-500">
                      {prestation}
                    </option>
                  ))}
                </select>

                <select
                  value={tatoueurFilter}
                  onChange={(e) => setTatoueurFilter(e.target.value)}
                    className="relative z-0 min-w-[92px] shrink-0 cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white transition-colors focus:border-tertiary-400 focus:outline-none"
                >
                  <option value="all" className="bg-noir-500">Tatoueur</option>
                  {uniqueTatoueurs.map((tatoueur: any) => (
                    <option key={tatoueur.id} value={tatoueur.id} className="bg-noir-500">
                      {tatoueur.name}
                    </option>
                  ))}
                </select>

                {viewMode === "list" && (
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="relative z-0 min-w-[86px] shrink-0 cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white transition-colors focus:border-tertiary-400 focus:outline-none"
                  >
                    <option value="all" className="bg-noir-500">Tous</option>
                    <option value="upcoming" className="bg-noir-500">À venir</option>
                    <option value="past" className="bg-noir-500">Passés</option>
                  </select>
                )}

                {(statusFilter !== "all" ||
                  prestationFilter !== "all" ||
                  tatoueurFilter !== "all" ||
                  dateFilter !== "all") && (
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setDateFilter("all");
                      setPrestationFilter("all");
                      setTatoueurFilter("all");
                    }}
                    className="cursor-pointer shrink-0 whitespace-nowrap rounded-2xl border border-red-400/25 bg-red-400/10 px-2.5 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-400/20"
                  >
                    ✕ Effacer
                  </button>
                )}

              </div>
                )}
              </div>

            <div
              className={`${viewMode === "calendar" ? "hidden sm:block" : "block"} order-1 min-w-0 flex-1 md:min-w-[120px]`}
            >
              <Search />
            </div>

            <div className="order-3 flex w-full shrink-0 gap-2 md:w-auto">
            <div
              title="Rendez-vous en attente"
              className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-white/12 bg-white/6 px-3 py-2 text-xs font-medium text-white font-one md:flex-none"
            >
              <span className="bg-gradient-to-br from-tertiary-400 to-tertiary-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[11px]">
                {pendingAppointmentsCount > 99 ? "99+" : pendingAppointmentsCount}
              </span>
              <span>En attente</span>
            </div>
            {!isFreeAccount && <DashboardButton href="/mes-rendez-vous/creer" className="!min-w-0 flex-1 whitespace-nowrap md:flex-none">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau
            </DashboardButton>}
          </div>
            </div>
          </ApplicationToolbar>

            {/* Section principale - prend toute la largeur sur mobile */}
            <section
              className={`${viewMode === "calendar" ? "hidden xl:block" : "block"} dashboard-rdv-list w-full p-3 sm:p-0`}
            >
              {isLoading ? (
                /* Skeleton loader - localisé dans la section */
                <RdvListSkeleton />
              ) : (
                /* Contenu réel */
                <>
                  {viewMode === "calendar" && (
                  <div className="mb-4 sm:mb-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                      <div>
                      <h2 className="text-white font-one text-base font-semibold tracking-tight sm:text-xl">
                        {getFormattedLabel()}
                      </h2>
                      </div>
                    </div>

                    <div className="h-[1px] w-full bg-gradient-to-r from-tertiary-400/50 via-white/30 to-transparent" />
                  </div>
                  )}

                  {/* Affichage conditionnel selon la vue */}
                  {paginatedEvents.length > 0 ? (
                    <div className="space-y-4">
                      {/* Header de la table - masqué sur mobile */}
                      {/* <div className="hidden sm:grid grid-cols-7 gap-4 rounded-xl border border-white/8 bg-black/15 px-3 py-2.5">
                        <p className="text-white/70 text-[10px] font-one font-semibold tracking-[0.12em] uppercase">
                          Date & Heure
                        </p>
                        <p className="text-white/70 text-[10px] font-one font-semibold tracking-[0.12em] uppercase">
                          Titre
                        </p>
                        <p className="text-white/70 text-[10px] font-one font-semibold tracking-[0.12em] uppercase">
                          Client
                        </p>
                        <p className="text-white/70 text-[10px] font-one font-semibold tracking-[0.12em] uppercase">
                          Durée
                        </p>
                        <p className="text-white/70 text-[10px] font-one font-semibold tracking-[0.12em] uppercase">
                          Type
                        </p>
                        <p className="text-white/70 text-[10px] font-one font-semibold tracking-[0.12em] uppercase">
                          Tatoueur
                        </p>
                        <p className="text-white/70 text-[10px] font-one font-semibold tracking-[0.12em] uppercase text-center">
                          Statut
                        </p>
                      </div> */}

                      {/* Liste des rendez-vous - layout adaptatif */}
                      <div className="space-y-2 pt-1">
                        {paginatedEvents.map((event: CalendarEvent) => {
                          const start = new Date(event.start ?? "").getTime();
                          const end = new Date(event.end ?? "").getTime();
                          const durationMs = end - start;
                          const durationHours = Math.floor(
                            durationMs / (1000 * 60 * 60),
                          );
                          const durationMinutes = Math.floor(
                            (durationMs % (1000 * 60 * 60)) / (1000 * 60),
                          );

                          return (
                            <div key={event.id}>
                              <div
                                onClick={() => openEventDetails(event)}
                                className={`group flex cursor-pointer items-center gap-3 rounded-2xl border bg-white/[0.03] p-2.5 transition-all duration-200 hover:bg-white/[0.06] sm:gap-4 sm:p-3 ${
                                  selectedEvent?.id === event.id
                                    ? "border-tertiary-400/50 bg-tertiary-400/10"
                                    : "border-white/8 hover:border-white/20"
                                }`}
                              >
                                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white/[0.06] font-one text-white sm:h-14 sm:w-14">
                                  <span className="text-lg leading-none font-semibold">
                                    {new Date(event.start ?? "").toLocaleDateString("fr-FR", { day: "2-digit" })}
                                  </span>
                                  <span className="mt-1 text-[10px] uppercase tracking-wider text-white/60">
                                    {new Date(event.start ?? "").toLocaleDateString("fr-FR", { month: "short" })}
                                  </span>
                                </div>

                                <div className="min-w-0 flex-1 font-one">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-semibold text-white">
                                      {event.title}
                                    </p>
                                    <span className="hidden shrink-0 rounded-full border border-white/12 bg-white/6 px-2 py-0.5 text-[11px] text-white/75 sm:inline">
                                      {event.prestation}
                                    </span>
                                  </div>
                                  <p className="mt-1 truncate text-xs text-white/60">
                                    {event.client.firstName} {event.client.lastName}
                                    <span className="mx-1.5 sm:hidden">·</span>
                                    <span className="sm:hidden">{event.prestation}</span>
                                    <span className="mx-1.5">·</span>
                                    {new Date(event.start ?? "").toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                    <span className="mx-1.5">·</span>
                                    {durationHours}h{durationMinutes > 0 ? `${durationMinutes}m` : ""}
                                    <span className="mx-1.5">·</span>
                                    {event.performerUser?.salonName ||
                                      (event.performerUser?.firstName ||
                                      event.performerUser?.lastName
                                        ? `${event.performerUser?.firstName ?? ""} ${event.performerUser?.lastName ?? ""}`.trim()
                                        : event.tatoueur?.name) ||
                                      "Non assigné"}
                                  </p>
                                </div>

                                {(() => {
                                  const status = STATUS_BADGES[event.status ?? ""] ?? STATUS_BADGES.CONFIRMED;
                                  return (
                                    <span
                                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium whitespace-nowrap font-one sm:px-2.5 sm:text-xs ${status.className}`}
                                    >
                                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                      {status.label}
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination + informations sur une même ligne */}
                      <div className="mt-2 border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-left text-white/60 text-xs font-one">
                            <span className="sm:hidden">
                              {hasActiveFilters
                                ? 1
                                : Math.min(
                                    (currentPage - 1) * ITEMS_PER_PAGE + 1,
                                    totalAppointments,
                                  )}
                              -
                              {hasActiveFilters
                                ? filteredEvents.length
                                : Math.min(
                                    currentPage * ITEMS_PER_PAGE,
                                    totalAppointments,
                                  )}{" "}
                              sur{" "}
                              {hasActiveFilters
                                ? filteredEvents.length
                                : totalAppointments}
                            </span>
                            <span className="hidden sm:inline">
                              Affichage de{" "}
                              {hasActiveFilters
                                ? 1
                                : Math.min(
                                    (currentPage - 1) * ITEMS_PER_PAGE + 1,
                                    totalAppointments,
                                  )}{" "}
                              à{" "}
                              {hasActiveFilters
                                ? filteredEvents.length
                                : Math.min(
                                    currentPage * ITEMS_PER_PAGE,
                                    totalAppointments,
                                  )}{" "}
                              sur{" "}
                              {hasActiveFilters
                                ? filteredEvents.length
                                : totalAppointments}{" "}
                              rendez-vous
                            </span>
                          </div>

                          {totalPages > 1 && (
                            <div className="flex items-center gap-2 sm:gap-4">
                              <button
                                onClick={() =>
                                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                                }
                                disabled={currentPage === 1}
                                className="cursor-pointer px-2 sm:px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
                              >
                                <span className="hidden sm:inline">Précédent</span>
                                <span className="sm:hidden">‹</span>
                              </button>

                              <div className="flex items-center gap-1 sm:gap-2">
                                {Array.from(
                                  { length: Math.min(totalPages, 3) },
                                  (_, i) => {
                                    // Moins de boutons sur mobile
                                    let pageNumber;
                                    if (totalPages <= 3) {
                                      pageNumber = i + 1;
                                    } else if (currentPage <= 2) {
                                      pageNumber = i + 1;
                                    } else if (currentPage >= totalPages - 1) {
                                      pageNumber = totalPages - 2 + i;
                                    } else {
                                      pageNumber = currentPage - 1 + i;
                                    }

                                    return (
                                      <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`cursor-pointer w-6 h-6 rounded-2xl text-xs font-medium transition-all duration-200 font-one ${
                                          currentPage === pageNumber
                                            ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                                            : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                                        }`}
                                      >
                                        {pageNumber}
                                      </button>
                                    );
                                  },
                                )}
                              </div>

                              <button
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages),
                                  )
                                }
                                disabled={currentPage === totalPages}
                                className="cursor-pointer px-2 sm:px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
                              >
                                <span className="hidden sm:inline">Suivant</span>
                                <span className="sm:hidden">›</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[60vh] flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-3xl text-white">📅</span>
                        </div>
                        <p className="font-two text-xl text-white">
                          {query ||
                          statusFilter !== "all" ||
                          prestationFilter !== "all" ||
                          tatoueurFilter !== "all" ||
                          (viewMode === "list" && dateFilter !== "all")
                            ? "Aucun résultat trouvé"
                            : "Aucun rendez-vous disponible"}
                        </p>
                        <p className="font-two text-sm text-white/60">
                          {query ||
                          statusFilter !== "all" ||
                          prestationFilter !== "all" ||
                          tatoueurFilter !== "all" ||
                          (viewMode === "list" && dateFilter !== "all") ? (
                            <span>
                              Aucun rendez-vous ne correspond aux critères
                              sélectionnés
                              <br />
                              <button
                                onClick={() => {
                                  setStatusFilter("all");
                                  setDateFilter("all");
                                  setPrestationFilter("all");
                                  setTatoueurFilter("all");
                                }}
                                className="cursor-pointer mt-2 px-3 py-1 bg-tertiary-400/20 text-tertiary-300 rounded-full text-xs border border-tertiary-400/30 hover:bg-tertiary-400/30 transition-colors"
                              >
                                Effacer les filtres
                              </button>
                            </span>
                          ) : viewMode === "calendar" ? (
                            `Aucun rendez-vous pour ${
                              currentView === "day"
                                ? "cette journée"
                                : currentView === "week"
                                  ? "cette semaine"
                                  : "ce mois"
                            }`
                          ) : (
                            "Les nouveaux rendez-vous apparaîtront ici"
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

            {/* Section détails/Calendrier - fixe sur toute la hauteur de l'écran */}
            <section className="relative w-full xl:fixed xl:top-0 xl:right-0 xl:z-30 xl:h-screen xl:w-[36vw] xl:border-l xl:border-white/10">
              {/* Affichage mobile : Calendrier */}
              <div className="xl:hidden mb-4">
                {viewMode === "calendar" ? (
                  <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl h-[60vh]">
                    <CalendarViewMobile
                      events={paginatedEvents}
                      currentDate={currentDate}
                      setCurrentDate={setCurrentDate}
                      currentView={currentView}
                      setCurrentView={setCurrentView}
                      onSelectEvent={openEventDetails}
                    />
                  </div>
                ) : null}
              </div>

              {/* Affichage desktop : Détails du RDV ou Calendrier */}
              <div className="hidden xl:block h-full">
              {selectedEvent ? (
                <ShowRdvDetails
                  selectedEvent={selectedEvent}
                  onClose={closeEventDetails}
                  handleRdvUpdated={handleRdvUpdated}
                  handleStatusChange={handleStatusChange}
                  handlePaymentStatusChange={handlePaymentStatusChange}
                  userId={userId ?? null}
                  price={price}
                />
              ) : viewMode === "calendar" ? (
                <div className="bg-noir-500 h-full">
                  <CalendarView
                    events={paginatedEvents}
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    onSelectEvent={openEventDetails}
                  />
                </div>
              ) : (
                <div className="hidden xl:flex items-center justify-center bg-noir-500 p-6 h-full ">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-3xl text-white">
                        <FaArrowLeft />
                      </span>
                    </div>
                    <p className="font-two text-xl text-white">
                      Sélectionnez un rendez-vous
                    </p>
                    <p className="font-two text-sm text-white/60">
                      Cliquez sur un rendez-vous pour voir ses détails
                    </p>
                  </div>
                </div>
              )}
              </div>
            </section>
        </div>
      )}

      {/* Modale mobile pour les détails du RDV */}
      {selectedEvent && isMobileDetailOpen && (
        <ShowRdvDetailsMobile
          selectedEvent={selectedEvent}
          onClose={closeEventDetails}
          handleRdvUpdated={handleRdvUpdated}
          handlePaymentStatusChange={handlePaymentStatusChange}
          userId={userId ?? null}
          price={price}
        />
      )}
    </div>
  );
}
