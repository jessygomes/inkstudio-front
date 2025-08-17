/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";
import {
  CalendarEvent,
  CalendarView,
} from "@/components/Application/RDV/Calendar";
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
import { useUser } from "@/components/Auth/Context/UserContext";
import { useSearchParams } from "next/navigation";
import ConfirmRdv from "./ConfirmRdv";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAllAppointments,
  fetchAppointments,
} from "@/lib/queries/appointment";
import CancelRdv from "./CancelRdv";
import UpdateRdv from "./UpdateRdv";
import { UpdateRdvFormProps } from "@/lib/type";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa6";
import { CiCalendar, CiCalendarDate } from "react-icons/ci";
import ChangeRdv from "./ChangeRdv";
import { Search } from "@/components/Shared/Search";
import Link from "next/link";
import { toast } from "sonner";
import { FaRegCalendarTimes } from "react-icons/fa";

export default function RDV() {
  const user = useUser();
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";

  //! Pour afficher les rdv en fonction de la date courante
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("week");

  //! Nouvelle state pour la vue liste
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  //! États pour les filtres
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all"); // all, past, upcoming
  const [prestationFilter, setPrestationFilter] = useState<string>("all");
  const [tatoueurFilter, setTatoueurFilter] = useState<string>("all");

  //! Nouveau state pour les demandes non répondus
  const [unansweredDemandesCount, setUnansweredDemandesCount] = useState(0);

  //! Afficher les infos d'un RDV
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const openEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };
  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

  //! OUVRIR L'IMAGE EN GRAND
  const openImageInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
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

  const userId = user?.id;

  const {
    data: rawData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "appointments",
      userId,
      viewMode === "calendar" ? start : "all",
      viewMode === "calendar" ? end : "all",
    ],
    queryFn: async () => {
      try {
        let result;
        if (viewMode === "calendar") {
          result = await fetchAppointments(userId!, start, end, 1, 1000);
        } else {
          // Pour la vue liste, on récupère tous les RDV (pas de pagination backend)
          result = await fetchAllAppointments(userId!, 1, 1000); // Grande limite pour récupérer tous
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

  // Extraire les prestations et tatoueurs uniques pour les filtres
  const uniquePrestations = [
    ...new Set(events.map((event: CalendarEvent) => event.prestation)),
  ];

  // Extraire les tatoueurs uniques en dédupliquant par ID
  const uniqueTatoueurs = events.reduce((acc: any[], event: CalendarEvent) => {
    if (!acc.find((t) => t.id === event.tatoueur.id)) {
      acc.push(event.tatoueur);
    }
    return acc;
  }, []);

  const handleRdvUpdated = (updatedId: string) => {
    const updated = events.find((e: CalendarEvent) => e.id === updatedId);
    if (updated) {
      setSelectedEvent(updated);
    }
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
          options
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

  const filteredEvents = events.filter((event: CalendarEvent) => {
    // Filtre par recherche
    const target = `${event.title} ${event.client.firstName} ${
      event.client.lastName
    } ${event.prestation} ${event.tatoueur?.name || ""}`.toLowerCase();
    const matchesSearch = target.includes(query);

    // Filtre par statut
    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;

    // Filtre par prestation
    const matchesPrestation =
      prestationFilter === "all" || event.prestation === prestationFilter;

    // Filtre par tatoueur
    const matchesTatoueur =
      tatoueurFilter === "all" || event.tatoueur?.id === tatoueurFilter;

    // Filtre par date (seulement en mode "Tous les RDV")
    let matchesDate = true;
    if (viewMode === "list" && dateFilter !== "all") {
      const eventDate = new Date(event.start);
      const now = new Date();

      if (dateFilter === "past") {
        matchesDate = eventDate < now;
      } else if (dateFilter === "upcoming") {
        matchesDate = eventDate >= now;
      }
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPrestation &&
      matchesTatoueur &&
      matchesDate
    );
  });

  // Pagination côté frontend pour les deux vues
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/payed/${rdvId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isPayed }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut de paiement");
      }

      // Mettre à jour l'événement sélectionné si c'est celui qui a été modifié
      if (selectedEvent && selectedEvent.id === rdvId) {
        setSelectedEvent({
          ...selectedEvent,
          isPayed: isPayed,
        });
      }

      // Optionnel: refetch des données pour mettre à jour la liste
      // queryClient.invalidateQueries(['appointments']);
    } catch (error) {
      console.error("Erreur:", error);
      // Optionnel: afficher une notification d'erreur
      toast.error(
        "Une erreur est survenue lors de la mise à jour du statut de paiement"
      );
    }
  };

  //! Nouvelle fonction pour récupérer le nombre de suivis non répondus
  const fetchUnansweredDemandesCount = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/appointment-requests/not-confirmed/count/${user.id}`,
        {
          cache: "no-store",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnansweredDemandesCount(data.count || 0);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre de suivis non répondus:",
        error
      );
    }
  };

  useEffect(() => {
    fetchUnansweredDemandesCount();
  }, [user.id]);

  return (
    <div className="w-full flex gap-6">
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-full rounded-2xl p-10 flex flex-col items-center justify-center gap-6 mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
            <p className="text-white/60 font-two text-xs text-center">
              Chargement des rendez-vous...
            </p>
          </div>
        </div>
      ) : error ? (
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
        <div className="flex flex-col gap-6 w-full">
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
                  Mes rendez-vous
                </h1>
                <p className="text-white/70 text-xs font-one mt-1">
                  Gérez vos rendez-vous, consultez les détails de chaque client
                  et suivez l&apos;historique de vos visites.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={"/mes-rendez-vous/creer"}
                className="cursor-pointer w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
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

              <div className="relative">
                <Link
                  href="/mes-rendez-vous/demandes"
                  className="cursor-pointer text-center px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs flex items-center justify-center gap-2"
                >
                  Demandes de rdv
                  {unansweredDemandesCount > 0 && (
                    <span className="bg-gradient-to-br from-tertiary-400 to-tertiary-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                      {unansweredDemandesCount > 99
                        ? "99+"
                        : unansweredDemandesCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>

          <Search />

          <div className="flex gap-4 w-full">
            <section className="w-3/5 bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-2xl">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-white font-one text-xl tracking-wide">
                    {viewMode === "calendar"
                      ? getFormattedLabel()
                      : "Tous les rendez-vous"}
                  </h2>

                  {/* Boutons de basculement de vue */}
                  <div className="flex bg-white/10 rounded-xl border border-white/20 overflow-hidden">
                    <button
                      onClick={() => handleViewModeChange("calendar")}
                      className={`cursor-pointer px-4 py-2 text-xs font-medium transition-all duration-200 flex gap-2 items-center font-one ${
                        viewMode === "calendar"
                          ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <CiCalendarDate size={20} /> Calendrier
                    </button>
                    <button
                      onClick={() => handleViewModeChange("list")}
                      className={`cursor-pointer flex gap-2 items-center font-one px-4 py-2 text-xs font-medium transition-all duration-200 ${
                        viewMode === "list"
                          ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <CiCalendar size={20} /> Tous les RDV
                    </button>
                  </div>
                </div>

                {/* Filtres */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {/* Filtre par statut - pour les deux vues */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/70 font-one">
                      Statut :
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    >
                      <option value="all" className="bg-noir-500">
                        Tous
                      </option>
                      <option value="PENDING" className="bg-noir-500">
                        En attente
                      </option>
                      <option value="CONFIRMED" className="bg-noir-500">
                        Confirmés
                      </option>
                      <option value="CANCELED" className="bg-noir-500">
                        Annulés
                      </option>
                    </select>
                  </div>

                  {/* Filtre par type de prestation */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/70 font-one">
                      Type :
                    </label>
                    <select
                      value={prestationFilter}
                      onChange={(e) => setPrestationFilter(e.target.value)}
                      className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    >
                      <option value="all" className="bg-noir-500">
                        Tous
                      </option>
                      {uniquePrestations.map((prestation: any) => (
                        <option
                          key={prestation}
                          value={prestation}
                          className="bg-noir-500"
                        >
                          {prestation}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtre par tatoueur */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/70 font-one">
                      Tatoueur :
                    </label>
                    <select
                      value={tatoueurFilter}
                      onChange={(e) => setTatoueurFilter(e.target.value)}
                      className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    >
                      <option value="all" className="bg-noir-500">
                        Tous
                      </option>
                      {uniqueTatoueurs.map((tatoueur: any) => (
                        <option
                          key={tatoueur.id}
                          value={tatoueur.id}
                          className="bg-noir-500"
                        >
                          {tatoueur.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtre par date - seulement en mode "Tous les RDV" */}
                  {viewMode === "list" && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-white/70 font-one">
                        Période :
                      </label>
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                      >
                        <option value="all" className="bg-noir-500">
                          Tous
                        </option>
                        <option value="upcoming" className="bg-noir-500">
                          À venir
                        </option>
                        <option value="past" className="bg-noir-500">
                          Passés
                        </option>
                      </select>
                    </div>
                  )}

                  {/* Indicateur des filtres actifs */}
                  {(statusFilter !== "all" ||
                    prestationFilter !== "all" ||
                    tatoueurFilter !== "all" ||
                    (viewMode === "list" && dateFilter !== "all")) && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">
                        Filtres actifs :
                      </span>
                      {statusFilter !== "all" && (
                        <span className="px-2 py-1 bg-tertiary-400/20 text-tertiary-300 rounded-full text-xs border border-tertiary-400/30">
                          {statusFilter === "PENDING"
                            ? "En attente"
                            : statusFilter === "CONFIRMED"
                            ? "Confirmés"
                            : statusFilter === "CANCELED"
                            ? "Annulés"
                            : statusFilter}
                        </span>
                      )}
                      {prestationFilter !== "all" && (
                        <span className="px-2 py-1 bg-purple-400/20 text-purple-300 rounded-full text-xs border border-purple-400/30">
                          {prestationFilter}
                        </span>
                      )}
                      {tatoueurFilter !== "all" && (
                        <span className="px-2 py-1 bg-cyan-400/20 text-cyan-300 rounded-full text-xs border border-cyan-400/30">
                          {
                            uniqueTatoueurs.find(
                              (t: any) => t.id === tatoueurFilter
                            )?.name
                          }
                        </span>
                      )}
                      {viewMode === "list" && dateFilter !== "all" && (
                        <span className="px-2 py-1 bg-blue-400/20 text-blue-300 rounded-full text-xs border border-blue-400/30">
                          {dateFilter === "upcoming"
                            ? "À venir"
                            : dateFilter === "past"
                            ? "Passés"
                            : dateFilter}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setStatusFilter("all");
                          setDateFilter("all");
                          setPrestationFilter("all");
                          setTatoueurFilter("all");
                        }}
                        className="cursor-pointer px-2 py-1 bg-red-400/20 text-red-300 rounded-full text-xs border border-red-400/30 hover:bg-red-400/30 transition-colors"
                      >
                        ✕ Effacer
                      </button>
                    </div>
                  )}
                </div>

                <div className="h-[1px] w-full bg-gradient-to-r from-tertiary-400/50 via-white/30 to-transparent" />
              </div>

              {/* Affichage conditionnel selon la vue - maintenant paginatedEvents pour les deux */}
              {paginatedEvents.length > 0 ? (
                <div className="space-y-4">
                  {/* Header de la table */}
                  <div className="grid grid-cols-7 gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-white/80 text-xs font-one font-semibold tracking-widest">
                      Date & Heure
                    </p>
                    <p className="text-white/80 text-xs font-one font-semibold tracking-widest">
                      Titre
                    </p>
                    <p className="text-white/80 text-xs font-one font-semibold tracking-widest">
                      Client
                    </p>
                    <p className="text-white/80 text-xs font-one font-semibold tracking-widest">
                      Durée
                    </p>
                    <p className="text-white/80 text-xs font-one font-semibold tracking-widest">
                      Type
                    </p>
                    <p className="text-white/80 text-xs font-one font-semibold tracking-widest">
                      Tatoueur
                    </p>
                    <p className="text-white/80 text-xs font-one font-semibold tracking-widest text-center">
                      Statut
                    </p>
                  </div>

                  {/* Liste des rendez-vous - maintenant toujours paginatedEvents */}
                  <div className="space-y-2 max-h-[55vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {paginatedEvents.map((event: CalendarEvent) => {
                      // Calcul de la durée en millisecondes
                      const start = new Date(event.start ?? "").getTime();
                      const end = new Date(event.end ?? "").getTime();
                      const durationMs = end - start;

                      // Conversion en heures et minutes
                      const durationHours = Math.floor(
                        durationMs / (1000 * 60 * 60)
                      );
                      const durationMinutes = Math.floor(
                        (durationMs % (1000 * 60 * 60)) / (1000 * 60)
                      );

                      return (
                        <div
                          key={event.id}
                          className="grid grid-cols-7 items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-tertiary-400/30 transition-all duration-300 group"
                        >
                          {/* DATE ET HEURE */}
                          <div className="text-white font-two text-sm">
                            <p className="font-bold">
                              {new Date(event.start ?? "").toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                }
                              )}
                            </p>
                            <p className="text-xs text-white/70">
                              {new Date(event.start ?? "").toLocaleTimeString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>

                          {/* TITRE DU RDV */}
                          <p className="text-white font-two text-sm truncate">
                            {event.title}
                          </p>

                          {/* CLIENT */}
                          <button className="text-left text-white font-two text-sm hover:text-tertiary-400 transition-colors duration-200 truncate">
                            {event.client.firstName} {event.client.lastName}
                          </button>

                          {/* DUREE */}
                          <p className="text-white font-two text-sm">
                            {durationHours}h
                            {durationMinutes > 0 ? `${durationMinutes}m` : ""}
                          </p>

                          {/* PRESTATION */}
                          <p className="text-white font-two text-sm truncate">
                            {event.prestation}
                          </p>

                          {/* NOM DU TATOUEUR */}
                          <p className="text-white font-two text-sm truncate">
                            {event.tatoueur.name}
                          </p>

                          {/* STATUT */}
                          <div className="text-center">
                            <button
                              onClick={() => openEventDetails(event)}
                              className="w-full cursor-pointer"
                            >
                              {event.status === "CANCELED" ? (
                                <span className="inline-block px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-xs font-medium font-one hover:bg-red-500/30 transition-all duration-200">
                                  Annulé
                                </span>
                              ) : event.status === "RESCHEDULING" ? (
                                <span className="inline-block px-1 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-one font-medium hover:bg-blue-500/30 transition-all duration-200">
                                  En attente de reprogrammation
                                </span>
                              ) : event.status !== "CONFIRMED" ? (
                                <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-lg text-xs font-medium font-one hover:bg-orange-500/30 transition-all duration-200">
                                  En attente
                                </span>
                              ) : (
                                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg text-xs font-medium font-one hover:bg-green-500/30 transition-all duration-200">
                                  Confirmé
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination - maintenant pour les deux vues */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-4 border-t border-white/10">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="cursor-pointer px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
                      >
                        Précédent
                      </button>

                      <div className="flex items-center gap-2">
                        {Array.from(
                          { length: Math.min(totalPages, 5) },
                          (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                className={`cursor-pointer w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 font-one ${
                                  currentPage === pageNumber
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
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="cursor-pointer px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
                      >
                        Suivant
                      </button>
                    </div>
                  )}

                  {/* Informations de pagination - pour les deux vues */}
                  <div className="text-center text-white/60 text-xs mt-2 font-one">
                    Affichage de{" "}
                    {Math.min(
                      (currentPage - 1) * ITEMS_PER_PAGE + 1,
                      filteredEvents.length
                    )}{" "}
                    à{" "}
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredEvents.length
                    )}{" "}
                    sur {filteredEvents.length} rendez-vous
                    {(query ||
                      statusFilter !== "all" ||
                      prestationFilter !== "all" ||
                      tatoueurFilter !== "all" ||
                      (viewMode === "list" && dateFilter !== "all")) && (
                      <span className="ml-2">
                        (
                        {[
                          query ? `recherche: "${query}"` : null,
                          statusFilter !== "all"
                            ? `statut: ${
                                statusFilter === "PENDING"
                                  ? "en attente"
                                  : statusFilter === "CONFIRMED"
                                  ? "confirmés"
                                  : statusFilter === "CANCELED"
                                  ? "annulés"
                                  : statusFilter
                              }`
                            : null,
                          prestationFilter !== "all"
                            ? `type: ${prestationFilter}`
                            : null,
                          tatoueurFilter !== "all"
                            ? `tatoueur: ${
                                (
                                  uniqueTatoueurs as {
                                    id: string;
                                    name: string;
                                  }[]
                                ).find((t) => t.id === tatoueurFilter)?.name ??
                                tatoueurFilter
                              }`
                            : null,
                          viewMode === "list" && dateFilter !== "all"
                            ? `période: ${
                                dateFilter === "upcoming"
                                  ? "à venir"
                                  : dateFilter === "past"
                                  ? "passés"
                                  : dateFilter
                              }`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                        )
                      </span>
                    )}
                    {viewMode === "calendar" && (
                      <span className="ml-2">
                        pour{" "}
                        {currentView === "day"
                          ? "la journée"
                          : currentView === "week"
                          ? "la semaine"
                          : "le mois"}{" "}
                        sélectionné(e)
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[60vh] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-3xl">📅</span>
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
            </section>

            <section className="w-2/5 h-[85vh] relative">
              {selectedEvent ? (
                <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl h-full flex flex-col">
                  {/* Header du panneau avec design compact */}
                  <div className="relative p-4 border-b border-white/10 bg-gradient-to-r from-noir-700/80 to-noir-500/80">
                    <div className="absolute inset-0 bg-gradient-to-r from-tertiary-400/5 to-transparent"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-tertiary-500 to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">
                            {selectedEvent.client.firstName
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold font-one text-white tracking-wide">
                            {selectedEvent.client.firstName}{" "}
                            {selectedEvent.client.lastName}
                          </h4>
                          <p className="text-white/70 text-xs font-one">
                            {selectedEvent.title}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={closeEventDetails}
                        className="cursor-pointer p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
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

                  {/* Contenu scrollable avec design compact */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {/* Statut avec design compact */}
                    <div className="bg-gradient-to-r from-white/8 to-white/4 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-white font-one text-sm flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-tertiary-400"
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
                          Statut
                        </h5>
                      </div>

                      <div className="mb-3">
                        {selectedEvent.status === "PENDING" ? (
                          <div className="bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-400/30 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                              <span className="text-orange-300 font-medium font-one text-xs">
                                En attente de confirmation
                              </span>
                            </div>
                          </div>
                        ) : selectedEvent.status === "CONFIRMED" ? (
                          <div className="bg-gradient-to-r from-green-500/15 to-emerald-500/15 border border-green-400/30 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-green-300 font-medium font-one text-xs">
                                Confirmé
                              </span>
                            </div>
                          </div>
                        ) : selectedEvent.status === "CANCELED" ? (
                          <div className="bg-gradient-to-r from-red-500/15 to-rose-500/15 border border-red-400/30 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                              <span className="text-red-300 font-medium font-one text-xs">
                                Annulé
                              </span>
                            </div>
                          </div>
                        ) : selectedEvent.status === "RESCHEDULING" ? (
                          <div className="bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-400/30 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                              <span className="text-blue-300 font-medium font-one text-xs">
                                En attente de reprogrammation
                              </span>
                            </div>
                            <p className="text-blue-200/80 text-xs font-one mt-1">
                              Le client doit choisir un nouveau créneau
                            </p>
                          </div>
                        ) : null}
                      </div>

                      {/* Actions compactes */}
                    </div>
                    <div className="">
                      <div className="flex items-center gap-1 flex-wrap">
                        {selectedEvent.status !== "CONFIRMED" && (
                          <ConfirmRdv
                            rdvId={selectedEvent.id}
                            appointment={selectedEvent}
                          />
                        )}
                        <UpdateRdv
                          rdv={selectedEvent as unknown as UpdateRdvFormProps}
                          userId={userId || ""}
                          onUpdate={() => handleRdvUpdated(selectedEvent.id)}
                        />
                        <ChangeRdv
                          rdvId={selectedEvent.id}
                          userId={userId || ""}
                          appointment={selectedEvent}
                        />
                        {selectedEvent.status !== "CANCELED" && (
                          <CancelRdv
                            rdvId={selectedEvent.id}
                            appointment={selectedEvent}
                          />
                        )}
                      </div>
                    </div>

                    {/* Informations principales compactes */}
                    <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                      <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
                        <svg
                          className="w-4 h-4 text-tertiary-400"
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

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-white/60 text-xs font-one">
                                Date & Heure
                              </p>
                              <p className="text-white font-one text-xs">
                                {new Date(
                                  selectedEvent.start
                                ).toLocaleDateString("fr-FR")}
                              </p>
                              <p className="text-white font-one text-xs">
                                {new Date(
                                  selectedEvent.start
                                ).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                -{" "}
                                {new Date(selectedEvent.end).toLocaleTimeString(
                                  "fr-FR",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-500/20 rounded-md flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-purple-400"
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
                            </div>
                            <div>
                              <p className="text-white/60 text-xs font-one">
                                Durée
                              </p>
                              <p className="text-white font-one text-xs">
                                {Math.round(
                                  (new Date(selectedEvent.end).getTime() -
                                    new Date(selectedEvent.start).getTime()) /
                                    (1000 * 60)
                                )}{" "}
                                min
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500/20 rounded-md flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-white/60 text-xs font-one">
                                Prestation
                              </p>
                              <p className="text-white font-one text-xs">
                                {selectedEvent.prestation}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-orange-500/20 rounded-md flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-orange-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-white/60 text-xs font-one">
                                Tatoueur
                              </p>
                              <p className="text-white font-one text-xs">
                                {selectedEvent.tatoueur.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Statut de paiement compact */}
                    {(selectedEvent.prestation === "RETOUCHE" ||
                      selectedEvent.prestation === "TATTOO" ||
                      selectedEvent.prestation === "PIERCING") && (
                      <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                        <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
                          <svg
                            className="w-4 h-4 text-tertiary-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          Paiement
                        </h5>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer bg-white/5 rounded-lg p-2 border border-white/10 hover:bg-white/10 transition-colors flex-1">
                              <input
                                type="radio"
                                name={`payment-${selectedEvent.id}`}
                                checked={selectedEvent.isPayed === false}
                                onChange={() =>
                                  handlePaymentStatusChange(
                                    selectedEvent.id,
                                    false
                                  )
                                }
                                className="w-3 h-3 text-red-500"
                              />
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                <span className="text-red-400 text-xs font-one">
                                  Non payé
                                </span>
                              </div>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer bg-white/5 rounded-lg p-2 border border-white/10 hover:bg-white/10 transition-colors flex-1">
                              <input
                                type="radio"
                                name={`payment-${selectedEvent.id}`}
                                checked={selectedEvent.isPayed === true}
                                onChange={() =>
                                  handlePaymentStatusChange(
                                    selectedEvent.id,
                                    true
                                  )
                                }
                                className="w-3 h-3 text-green-500"
                              />
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                <span className="text-green-400 text-xs font-one">
                                  Payé
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Détails du tattoo compact */}
                    {(() => {
                      const tattooDetail = selectedEvent.tattooDetail;

                      return (
                        <>
                          {tattooDetail && (
                            <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                              <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
                                <svg
                                  className="w-4 h-4 text-tertiary-400"
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
                                Détails tatouage
                              </h5>

                              <div className="space-y-2">
                                {tattooDetail.description && (
                                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                                    <p className="text-white/60 text-xs font-one mb-1">
                                      Description
                                    </p>
                                    <p className="text-white font-one text-xs leading-relaxed">
                                      {tattooDetail.description}
                                    </p>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                  {tattooDetail.zone && (
                                    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                                      <p className="text-white/60 text-xs font-one">
                                        Zone
                                      </p>
                                      <p className="text-white font-one text-xs">
                                        {tattooDetail.zone}
                                      </p>
                                    </div>
                                  )}

                                  {tattooDetail.size && (
                                    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                                      <p className="text-white/60 text-xs font-one">
                                        Taille
                                      </p>
                                      <p className="text-white font-one text-xs">
                                        {tattooDetail.size}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Images de référence compactes */}
                                {(tattooDetail.reference ||
                                  tattooDetail.sketch) && (
                                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                                    <p className="text-white/60 text-xs font-one mb-2">
                                      Images
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {tattooDetail.reference && (
                                        <div
                                          className="relative w-full h-32 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            openImageInNewTab(
                                              tattooDetail.reference
                                            );
                                          }}
                                        >
                                          <Image
                                            src={tattooDetail.reference}
                                            alt="Référence"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center pointer-events-none">
                                            <svg
                                              className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                              />
                                            </svg>
                                          </div>
                                        </div>
                                      )}
                                      {tattooDetail.sketch && (
                                        <div
                                          className="relative w-full h-32 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            openImageInNewTab(
                                              tattooDetail.sketch
                                            );
                                          }}
                                        >
                                          <Image
                                            src={tattooDetail.sketch}
                                            alt="Croquis"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center pointer-events-none">
                                            <svg
                                              className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                              />
                                            </svg>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Prix compact */}
                                {tattooDetail.estimatedPrice && (
                                  <div className="bg-gradient-to-r from-tertiary-500/10 to-primary-500/10 rounded-lg p-2 border border-tertiary-400/20">
                                    <div className="bg-white/5 rounded-md p-2 border border-white/5">
                                      <p className="text-orange-400 font-one font-semibold text-xs">
                                        💰 Estimé: {tattooDetail.estimatedPrice}
                                        €
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Footer compact */}
                  <div className="p-3 border-t border-white/10 bg-white/5">
                    <button
                      onClick={closeEventDetails}
                      className="cursor-pointer w-full py-2 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one"
                    >
                      Retour à la liste
                    </button>
                  </div>
                </div>
              ) : viewMode === "calendar" ? (
                <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl h-full">
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
                <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl h-full flex items-center justify-center">
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
            </section>
          </div>
        </div>
      )}

      {/* Supprimer toute la modale d'affichage d'image */}
      {/* {selectedImage && (
        // ... toute la modale
      )} */}
    </div>
  );
}
