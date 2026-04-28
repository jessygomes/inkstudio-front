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
import { Search } from "@/components/Shared/Search";
import Link from "next/link";
import { toast } from "sonner";
import { FaRegCalendarTimes } from "react-icons/fa";
import ShowRdvDetails from "./ShowRdvDetails";
import ShowRdvDetailsMobile from "./ShowRdvDetailsMobile";
import { useScrollLock } from "@/lib/hook/useScrollLock";
import { useSession } from "next-auth/react";
import RdvListSkeleton from "@/components/Skeleton/RdvListSkeleton";

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

  // Définir le mode par défaut selon la taille d'écran
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list"); // Changé à "list" par défaut
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

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

  // Bloquer le scroll du body quand la modal mobile est ouverte
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
      {/* Header toujours affiché */}
      <div className="dashboard-hero mb-3 flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:py-3">
        <div className="w-full min-w-0 flex items-start gap-3 sm:items-center sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary-400/30 sm:h-12 sm:w-12">
            <FaRegCalendarTimes
              size={28}
              className="text-tertiary-400 animate-pulse"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold uppercase tracking-wide text-white font-one sm:text-xl">
              Mes rendez-vous
            </h1>
            <p className="mt-1 hidden text-xs text-white/70 font-one sm:block">
              Gérez vos rendez-vous, consultez les détails de chaque client et
              suivez l&apos;historique de vos visites.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:flex-nowrap lg:justify-end">
          <div className="relative w-full sm:w-[175px]">
            <div className="bg-white/10 w-full px-5 py-2 text-white rounded-2xl font-medium font-one text-xs flex items-center justify-center gap-2 whitespace-nowrap">
              <span className="bg-gradient-to-br from-tertiary-400 to-tertiary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-[12px]">
                {pendingAppointmentsCount > 99
                  ? "99+"
                  : pendingAppointmentsCount}
              </span>
              RDV en attente
            </div>
          </div>

          {/* <div className="relative w-full sm:w-[175px]">
            <div className="bg-white/10  px-5 py-2 text-white rounded-2xl font-medium font-one text-xs flex items-center justify-center gap-2 whitespace-nowrap">
              <span className="bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-[12px]">
                {reschedulingAppointmentsCount > 99
                  ? "99+"
                  : reschedulingAppointmentsCount}
              </span>
              RDV reprogrammer
            </div>
          </div> */}
          {!isFreeAccount && (
            <Link
              href={"/mes-rendez-vous/creer"}
              className="hidden min-w-[170px] items-center justify-center gap-2 rounded-2xl border border-tertiary-400/30 bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-4 py-2.5 text-xs font-medium text-white shadow-xl shadow-tertiary-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-tertiary-500 hover:to-tertiary-600 font-one sm:inline-flex"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Créer un rendez-vous
            </Link>
          )}
        </div>

        {!isFreeAccount && (
          <Link
            href={"/mes-rendez-vous/creer"}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-tertiary-400 to-tertiary-500 py-2 text-xs font-medium text-white shadow-lg transition-all duration-300 hover:from-tertiary-500 hover:to-tertiary-600 sm:hidden"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Créer un rendez-vous
          </Link>
        )}
      </div>
      {/* Fin header toujours affiché */}

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
      ) : isFreeAccount ? (
        /* Message pour les comptes Free */
        <div className="w-full">
          {!isFreeAccount && <Search />}

          <div className="bg-gradient-to-r from-orange-500/10 to-tertiary-500/10 border border-orange-500/30 rounded-2xl p-6 mt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v8a2 2 0 002 2h4a2 2 0 002-2v-8m-6 0h8m-8 0V7a2 2 0 012-2h4a2 2 0 012 2v4m0 0v8a2 2 0 01-2 2H10a2 2 0 01-2-2v-8m0 0h8"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <h2 className="text-white font-semibold font-one mb-2">
                  📅 Gestion des rendez-vous disponible avec un abonnement
                </h2>

                <p className="text-white/70 text-sm font-one mb-4">
                  Accédez à la gestion complète de vos rendez-vous :
                  planification, suivi des clients, historique des séances et
                  bien plus.
                </p>

                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      📅 Calendrier interactif
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      👥 Gestion des clients
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      💰 Suivi des paiements
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      📊 Statistiques détaillées
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      🔔 Notifications automatiques
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      📝 Historique complet
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => (window.location.href = "/parametres")}
                    className="cursor-pointer px-4 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg text-sm font-one font-medium transition-all duration-300"
                  >
                    🚀 Passer à PRO
                  </button>

                  <button
                    onClick={() => (window.location.href = "/parametres")}
                    className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 text-sm font-one font-medium transition-colors"
                  >
                    Voir les plans
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full">
          <div className="relative z-0 overflow-visible">
            <div className="relative z-0 flex flex-wrap items-center gap-2 overflow-visible">
              <div className="flex bg-white/10 rounded-xl border border-white/20 overflow-hidden">
                <button
                  onClick={() => handleViewModeChange("calendar")}
                  className={`cursor-pointer px-3 py-1 text-xs font-medium transition-all duration-200 flex gap-1 items-center font-one whitespace-nowrap ${
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
                  className={`cursor-pointer flex gap-1.5 items-center font-one px-3 py-1 text-xs font-medium transition-all duration-200 whitespace-nowrap ${
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
                className={`${viewMode === "calendar" ? "hidden" : "flex"} scrollbar-hidden w-full flex-nowrap items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:flex-wrap sm:overflow-visible font-one`}
              >
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="relative z-0 min-w-[92px] shrink-0 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white transition-colors focus:border-tertiary-400 focus:outline-none"
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
                  className="relative z-0 min-w-[92px] shrink-0 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white transition-colors focus:border-tertiary-400 focus:outline-none"
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
                  className="relative z-0 min-w-[92px] shrink-0 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white transition-colors focus:border-tertiary-400 focus:outline-none"
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
                    className="relative z-0 min-w-[86px] shrink-0 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white transition-colors focus:border-tertiary-400 focus:outline-none"
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
                    className="cursor-pointer shrink-0 whitespace-nowrap rounded-xl border border-red-400/30 bg-red-400/20 px-2.5 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-400/30"
                  >
                    ✕ Effacer
                  </button>
                )}

                {(statusFilter !== "all" ||
                  prestationFilter !== "all" ||
                  tatoueurFilter !== "all" ||
                  (viewMode === "list" && dateFilter !== "all")) && (
                  <div className="hidden sm:flex items-center gap-2 ml-1">
                    <span className="text-xs text-white/50 font-one whitespace-nowrap">
                      Actifs :
                    </span>
                    {statusFilter !== "all" && (
                      <span className="px-2 py-1 bg-tertiary-400/20 text-tertiary-500 rounded-full text-xs border border-tertiary-400/30 whitespace-nowrap">
                        {statusFilter === "PENDING"
                          ? "En attente"
                          : statusFilter === "CONFIRMED"
                            ? "Confirmés"
                            : statusFilter === "COMPLETED"
                              ? "Complétés"
                              : statusFilter === "NO_SHOW"
                                ? "Pas présentés"
                                : statusFilter === "CANCELED"
                                  ? "Annulés"
                                  : statusFilter}
                      </span>
                    )}
                    {prestationFilter !== "all" && (
                      <span className="px-2 py-1 bg-purple-400/20 text-purple-500 rounded-full text-xs border border-purple-400/30 whitespace-nowrap">
                        {prestationFilter}
                      </span>
                    )}
                    {tatoueurFilter !== "all" && (
                      <span className="px-2 py-1 bg-cyan-400/20 text-cyan-500 rounded-full text-xs border border-cyan-400/30 whitespace-nowrap">
                        {
                          uniqueTatoueurs.find(
                            (t: any) => t.id === tatoueurFilter,
                          )?.name
                        }
                      </span>
                    )}
                    {viewMode === "list" && dateFilter !== "all" && (
                      <span className="px-2 py-1 bg-blue-400/20 text-blue-500 rounded-full text-xs border border-blue-400/30 whitespace-nowrap">
                        {dateFilter === "upcoming"
                          ? "À venir"
                          : dateFilter === "past"
                            ? "Passés"
                            : dateFilter}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div
                className={`${viewMode === "calendar" ? "hidden sm:block" : "block"} w-full md:ml-auto md:w-[250px] lg:w-[300px]`}
              >
                <Search />
              </div>
            </div>
          </div>

          {/* Layout responsive : flex-col sur mobile, flex-row sur desktop */}
          <div className="relative z-0 flex flex-col xl:flex-row gap-4 w-full">
            {/* Section principale - prend toute la largeur sur mobile */}
            <section
              className={`${viewMode === "calendar" ? "hidden xl:block" : "block"} w-full xl:w-3/5 bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-3 sm:p-6 border border-white/20 shadow-2xl`}
            >
              {isLoading ? (
                /* Skeleton loader - localisé dans la section */
                <RdvListSkeleton />
              ) : (
                /* Contenu réel */
                <>
                  <div className="mb-4 sm:mb-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                      {/* Titre adaptatif : "Tous les rendez-vous" sur mobile, titre dynamique sur desktop */}
                      <h2 className="text-white font-one text-lg sm:text-xl tracking-wide">
                        <span className="sm:hidden">Tous les rendez-vous</span>
                        <span className="hidden sm:block">
                          {viewMode === "calendar"
                            ? getFormattedLabel()
                            : "Tous les rendez-vous"}
                        </span>
                      </h2>
                    </div>

                    <div className="h-[1px] w-full bg-gradient-to-r from-tertiary-400/50 via-white/30 to-transparent" />
                  </div>

                  {/* Affichage conditionnel selon la vue */}
                  {paginatedEvents.length > 0 ? (
                    <div className="space-y-4">
                      {/* Header de la table - masqué sur mobile */}
                      <div className="hidden sm:grid grid-cols-7 gap-4 p-3 dashboard-embedded-section rounded-2xl">
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
                      </div>

                      {/* Liste des rendez-vous - layout adaptatif */}
                      <div className="space-y-2 lg:max-h-[55vh] lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-white/20 lg:scrollbar-track-transparent">
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
                              {/* Vue desktop - grille */}
                              <div
                                className={`hidden sm:grid grid-cols-7 items-center gap-4 p-3.5 transition-all duration-300 group dashboard-list-item ${
                                  selectedEvent?.id === event.id
                                    ? "dashboard-list-item-active"
                                    : ""
                                }`}
                              >
                                <div className="text-white font-one text-sm">
                                  <p className="font-semibold">
                                    {new Date(
                                      event.start ?? "",
                                    ).toLocaleDateString("fr-FR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "2-digit",
                                    })}
                                  </p>
                                  <p className="text-[11px] text-white/60 mt-0.5">
                                    {new Date(
                                      event.start ?? "",
                                    ).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                                <p className="text-white/90 font-one text-sm truncate">
                                  {event.title}
                                </p>
                                <button className="text-left text-white/90 font-one text-sm hover:text-tertiary-400 transition-colors duration-200 truncate">
                                  {event.client.firstName}{" "}
                                  {event.client.lastName}
                                </button>
                                <p className="text-white/75 font-one text-sm">
                                  {durationHours}h
                                  {durationMinutes > 0
                                    ? `${durationMinutes}m`
                                    : ""}
                                </p>
                                <p className="text-white/75 font-one text-xs truncate">
                                  <span className="inline-flex items-center rounded-full border border-white/12 bg-white/6 px-2 py-0.5">
                                    {event.prestation}
                                  </span>
                                </p>
                                <p className="text-white/75 font-one text-sm truncate">
                                  {event.tatoueur?.name || "Non assigné"}
                                </p>
                                <div className="text-center">
                                  <button
                                    onClick={() => openEventDetails(event)}
                                    className="w-full cursor-pointer"
                                  >
                                    {event.status === "CANCELED" ? (
                                      <span className="inline-block px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-xs font-medium font-one hover:bg-red-500/30 transition-all duration-200 whitespace-nowrap">
                                        Annulé
                                      </span>
                                    ) : event.status === "RESCHEDULING" ? (
                                      <span className="inline-block px-1 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-one font-medium hover:bg-blue-500/30 transition-all duration-200 whitespace-nowrap">
                                        En attente de reprogrammation
                                      </span>
                                    ) : event.status === "COMPLETED" ? (
                                      <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium font-one hover:bg-emerald-500/30 transition-all duration-200 whitespace-nowrap">
                                        Complété
                                      </span>
                                    ) : event.status === "NO_SHOW" ? (
                                      <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium font-one hover:bg-amber-500/30 transition-all duration-200 whitespace-nowrap">
                                        Pas présenté
                                      </span>
                                    ) : event.status === "PENDING" ? (
                                      <span className="inline-block px-2 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-lg text-xs font-medium font-one hover:bg-orange-500/30 transition-all duration-200 whitespace-nowrap">
                                        En attente
                                      </span>
                                    ) : (
                                      <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg text-xs font-medium font-one hover:bg-green-500/30 transition-all duration-200 whitespace-nowrap">
                                        Confirmé
                                      </span>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Vue mobile - format carte (toujours en mode liste) */}
                              <div
                                className={`sm:hidden p-4 transition-all duration-300 cursor-pointer dashboard-list-item ${
                                  selectedEvent?.id === event.id
                                    ? "dashboard-list-item-active"
                                    : ""
                                }`}
                                onClick={() => openEventDetails(event)}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex-1">
                                    <h3 className="text-white font-one font-semibold text-sm mb-1 truncate pr-2">
                                      {event.title}
                                    </h3>
                                    <p className="text-white/75 font-one text-sm">
                                      {event.client.firstName}{" "}
                                      {event.client.lastName}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    {event.status === "CANCELED" ? (
                                      <span className="inline-block px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-xs font-medium font-one whitespace-nowrap">
                                        Annulé
                                      </span>
                                    ) : event.status === "RESCHEDULING" ? (
                                      <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-medium font-one whitespace-nowrap">
                                        Reprogrammation
                                      </span>
                                    ) : event.status === "COMPLETED" ? (
                                      <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium font-one whitespace-nowrap">
                                        Complété
                                      </span>
                                    ) : event.status === "NO_SHOW" ? (
                                      <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium font-one whitespace-nowrap">
                                        Pas présenté
                                      </span>
                                    ) : event.status === "PENDING" ? (
                                      <span className="inline-block px-2 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-lg text-xs font-medium font-one whitespace-nowrap">
                                        En attente
                                      </span>
                                    ) : (
                                      <span className="inline-block px-2 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg text-xs font-medium font-one whitespace-nowrap">
                                        Confirmé
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex justify-between items-center text-xs text-white/70 font-one gap-2">
                                  <span className="truncate">
                                    {new Date(
                                      event.start ?? "",
                                    ).toLocaleDateString("fr-FR")}{" "}
                                    -
                                    {new Date(
                                      event.start ?? "",
                                    ).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  <span className="flex items-center gap-2 shrink-0">
                                    <span className="inline-flex items-center rounded-full border border-white/12 bg-white/6 px-2 py-0.5 text-[11px]">
                                      {event.prestation}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {event.tatoueur?.name || "Non assigné"}
                                    </span>
                                  </span>
                                </div>
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

            {/* Section détails/Calendrier - responsive */}
            <section className="w-full xl:w-2/5 xl:h-[85vh] relative">
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
                <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl h-full">
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
                <div className="hidden xl:flex items-center justify-center bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl h-full ">
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
