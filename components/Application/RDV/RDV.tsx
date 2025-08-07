/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";
import {
  CalendarEvent,
  CalendarView,
} from "@/components/Application/RDV/Calendar";
import { CSSProperties, useState, useEffect } from "react";
import BarLoader from "react-spinners/BarLoader";
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

  //! Loader
  // const [loading, setLoading] = useState(false);
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "none",
  };
  const color = "#ff5500";

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

        console.log("✅ Résultat du fetch:", result);
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

      console.log(response);

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
    }
  };

  return (
    <div className="w-full flex gap-6">
      {isLoading ? (
        <div className="h-[80vh] w-full flex items-center justify-center">
          <BarLoader
            color={color}
            loading={isLoading}
            cssOverride={override}
            width={300}
            height={5}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
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
        <>
          <section className="w-3/5 bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white font-one text-2xl font-bold tracking-wide">
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
                <div className="space-y-2 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
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
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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
              <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl h-full flex flex-col">
                <div className="flex-1 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {/* Header */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold font-one text-white tracking-wide">
                      Détails du Rendez-vous
                    </h2>

                    {/* Statut avec badge */}
                    <div className="flex items-center gap-3">
                      {selectedEvent.status === "PENDING" ? (
                        <span className="inline-flex items-center px-3 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-lg text-sm font-medium">
                          <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                          En attente de confirmation
                        </span>
                      ) : selectedEvent.status === "CONFIRMED" ? (
                        <span className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg text-sm font-medium">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          Confirmé
                        </span>
                      ) : selectedEvent.status === "CANCELED" ? (
                        <span className="inline-flex items-center px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-sm font-medium">
                          <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                          Annulé
                        </span>
                      ) : selectedEvent.status === "RESCHEDULING" ? (
                        <div className="w-full bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-blue-300 font-semibold font-one text-sm">
                              En attente de reprogrammation
                            </span>
                          </div>
                          <p className="text-blue-200/80 text-xs font-one">
                            Le client doit choisir un nouveau créneau. Vous
                            recevrez une notification une fois qu'il aura fait
                            son choix.
                          </p>
                        </div>
                      ) : null}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
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

                    {/* Statut de paiement - seulement pour certains types de RDV */}
                    {(selectedEvent.prestation === "RETOUCHE" ||
                      selectedEvent.prestation === "TATTOO" ||
                      selectedEvent.prestation === "PIERCING") && (
                      <div className="space-y-3">
                        <div className="h-[1px] w-full bg-gradient-to-r from-tertiary-400/30 via-white/20 to-transparent" />
                        <h4 className="text-sm font-semibold text-tertiary-400 font-one">
                          Statut de paiement
                        </h4>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
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
                              className="w-4 h-4 text-red-500 bg-transparent border-2 border-red-500/50 focus:ring-red-500/30 focus:ring-2"
                            />
                            <span className="text-red-400 text-sm font-one">
                              Non payé
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
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
                              className="w-4 h-4 text-green-500 bg-transparent border-2 border-green-500/50 focus:ring-green-500/30 focus:ring-2"
                            />
                            <span className="text-green-400 text-sm font-one">
                              Payé
                            </span>
                          </label>
                        </div>

                        {/* Indicateur visuel du statut */}
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              selectedEvent.isPayed
                                ? "bg-green-400"
                                : "bg-red-400"
                            }`}
                          ></div>
                          <span
                            className={`text-xs font-one ${
                              selectedEvent.isPayed
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {selectedEvent.isPayed
                              ? "Paiement effectué"
                              : "En attente de paiement"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informations principales */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-tertiary-400 font-one">
                      Informations générales
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-white/60 text-xs font-one">Date</p>
                        <p className="text-white font-two text-sm">
                          {new Date(selectedEvent.start).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white/60 text-xs font-one">Heure</p>
                        <p className="text-white font-two text-sm">
                          {new Date(selectedEvent.start).toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}{" "}
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
                      <div className="space-y-1">
                        <p className="text-white/60 text-xs font-one">Client</p>
                        <p className="text-white font-two text-sm">
                          {selectedEvent.client.firstName}{" "}
                          {selectedEvent.client.lastName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white/60 text-xs font-one">
                          Prestation
                        </p>
                        <p className="text-white font-two text-sm">
                          {selectedEvent.prestation}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white/60 text-xs font-one">Titre</p>
                        <p className="text-white font-two text-sm">
                          {selectedEvent.title}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white/60 text-xs font-one">
                          Tatoueur
                        </p>
                        <p className="text-white font-two text-sm">
                          {selectedEvent.tatoueur.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Détails du tattoo */}
                  {selectedEvent.tattooDetail && (
                    <div className="space-y-4">
                      <div className="h-[1px] w-full bg-gradient-to-r from-tertiary-400/50 via-white/30 to-transparent" />
                      <h3 className="text-lg font-semibold text-tertiary-400 font-one">
                        Détails du tatouage
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-white/60 text-xs font-one">
                            Description
                          </p>
                          <p className="text-white font-two text-sm">
                            {selectedEvent.tattooDetail.description}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-white/60 text-xs font-one">
                            Style/Couleur
                          </p>
                          <p className="text-white font-two text-sm">
                            {selectedEvent.tattooDetail.colorStyle}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-white/60 text-xs font-one">
                              Zone
                            </p>
                            <p className="text-white font-two text-sm">
                              {selectedEvent.tattooDetail.zone}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-white/60 text-xs font-one">
                              Taille
                            </p>
                            <p className="text-white font-two text-sm">
                              {selectedEvent.tattooDetail.size}
                            </p>
                          </div>
                        </div>

                        {/* Images de référence */}
                        {(selectedEvent.tattooDetail.reference ||
                          selectedEvent.tattooDetail.sketch) && (
                          <div className="space-y-3">
                            <div className="h-[1px] w-full bg-gradient-to-r from-tertiary-400/30 via-white/20 to-transparent" />
                            <h3 className="text-lg font-semibold text-tertiary-400 font-one">
                              Images de référence
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Image de référence 1 */}
                              {selectedEvent.tattooDetail.reference && (
                                <div className="space-y-2">
                                  <p className="text-white/60 text-xs font-one">
                                    Référence 1
                                  </p>
                                  <div className="relative w-full h-32 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                    <Image
                                      src={selectedEvent.tattooDetail.reference}
                                      alt="Image de référence 1"
                                      fill
                                      className="object-cover hover:scale-105 transition-transform duration-200"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Croquis/Référence 2 */}
                              {selectedEvent.tattooDetail.sketch && (
                                <div className="space-y-2">
                                  <p className="text-white/60 text-xs font-one">
                                    Croquis / Référence 2
                                  </p>
                                  <div className="relative w-full h-32 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                    <Image
                                      src={selectedEvent.tattooDetail.sketch}
                                      alt="Croquis/Référence 2"
                                      fill
                                      className="object-cover hover:scale-105 transition-transform duration-200"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Prix estimé */}
                        {selectedEvent.tattooDetail.estimatedPrice && (
                          <div className="space-y-1 mb-2">
                            <h3 className="text-lg font-semibold text-tertiary-400 font-one">
                              Prix estimé
                            </h3>
                            <p className="text-white font-two text-sm font-semibold">
                              {selectedEvent.tattooDetail.estimatedPrice}€
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer avec bouton retour */}
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={closeEventDetails}
                    className="cursor-pointer w-full py-2 text-xs bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-colors font-medium font-one"
                  >
                    Retour à la liste
                  </button>
                </div>
              </div>
            ) : viewMode === "calendar" ? (
              <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl h-full">
                <CalendarView
                  events={paginatedEvents} // Maintenant on passe les événements paginés au calendrier
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
        </>
      )}
    </div>
  );
}
