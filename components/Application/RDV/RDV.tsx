/* eslint-disable react/no-unescaped-entities */
"use client";
import {
  CalendarEvent,
  CalendarView,
} from "@/components/Application/RDV/Calendar";
import { CSSProperties, useState } from "react";
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
import { fetchAppointments } from "@/lib/queries/appointment";
import CancelRdv from "./CancelRdv";
import UpdateRdv from "./UpdateRdv";
import { UpdateRdvFormProps } from "@/lib/type";
import Image from "next/image";

export default function RDV() {
  const user = useUser();
  // const [events, setEvents] = useState<CalendarEvent[]>([]);
  // const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  // const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
  //   null
  // );

  //! Pour afficher les rdv en fonction de la date courante
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("week");

  //! Afficher les infos d'un RDV
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const openEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event); // Stocke le rendez-vous sélectionné
  };
  const closeEventDetails = () => {
    setSelectedEvent(null); // Réinitialise le rendez-vous sélectionné
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

  //! DATA
  // useEffect(() => {
  //   const { start, end } = getDateRange(currentView, currentDate);
  //   const userId = user?.id; // Récupérer l'ID de l'utilisateur connecté

  //   const fetchEvents = async () => {
  //     try {
  //       const response = await fetch(
  //         `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/range?userId=${userId}&start=${start}&end=${end}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );
  //       if (!response.ok) {
  //         const errorText = await response.text(); // <--- pour voir le contenu brut de l’erreur
  //         throw new Error(errorText || "Réponse du serveur invalide");
  //       }

  //       const data = await response.json();
  //       setEvents(data);
  //     } catch (error) {
  //       setError(
  //         error instanceof Error ? error.message : "An unknown error occurred"
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchEvents();
  // }, [currentDate, currentView, user?.id]); // Ajoutez user?.id comme dépendance

  const { start, end } = getDateRange(currentView, currentDate);
  const userId = user?.id;

  const {
    data: events = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["appointments", userId, start, end],
    queryFn: () => fetchAppointments(userId!, start, end),
    enabled: !!userId, // évite de fetch tant que l'ID n'est pas dispo
  });

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
    const target = `${event.title} ${event.client.firstName} ${
      event.client.lastName
    } ${event.prestation} ${event.tatoueur?.name || ""}`.toLowerCase();
    return target.includes(query);
  });

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
          <p className="text-white text-2xl font-two text-center">{isError}</p>
        </div>
      ) : (
        <>
          <section className="w-3/5 bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-white font-one text-2xl font-bold tracking-wide mb-2">
                {getFormattedLabel()}
              </h2>
              <div className="h-[1px] w-full bg-gradient-to-r from-tertiary-400/50 via-white/30 to-transparent" />
            </div>

            {events.length > 0 ? (
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

                {/* Liste des rendez-vous */}
                <div className="space-y-2 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {filteredEvents.length > 0 &&
                    events.map((event: CalendarEvent) => {
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
                                <span className="inline-block px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-xs font-medium hover:bg-red-500/30 transition-all duration-200">
                                  Annulé
                                </span>
                              ) : event.status !== "CONFIRMED" ? (
                                <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full text-xs font-medium hover:bg-orange-500/30 transition-all duration-200">
                                  En attente
                                </span>
                              ) : (
                                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-xs font-medium hover:bg-green-500/30 transition-all duration-200">
                                  Confirmé
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-3xl">📅</span>
                  </div>
                  <p className="font-two text-xl text-white">
                    Aucun rendez-vous disponible
                  </p>
                  <p className="font-two text-sm text-white/60">
                    Les nouveaux rendez-vous apparaîtront ici
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
                        <span className="inline-flex items-center px-3 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full text-sm font-medium">
                          <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                          En attente de confirmation
                        </span>
                      ) : selectedEvent.status === "CONFIRMED" ? (
                        <span className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-sm font-medium">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          Confirmé
                        </span>
                      ) : selectedEvent.status === "CANCELED" ? (
                        <span className="inline-flex items-center px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-sm font-medium">
                          <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                          Annulé
                        </span>
                      ) : null}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {selectedEvent.status !== "CONFIRMED" && (
                        <ConfirmRdv rdvId={selectedEvent.id} />
                      )}
                      <UpdateRdv
                        rdv={selectedEvent as unknown as UpdateRdvFormProps}
                        userId={userId || ""}
                        onUpdate={() => handleRdvUpdated(selectedEvent.id)}
                      />
                      {selectedEvent.status !== "CANCELED" && (
                        <CancelRdv rdvId={selectedEvent.id} />
                      )}
                    </div>

                    <div className="h-[1px] w-full bg-gradient-to-r from-tertiary-400/50 via-white/30 to-transparent" />
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
            ) : (
              <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl h-full">
                <CalendarView
                  events={events}
                  currentDate={currentDate}
                  setCurrentDate={setCurrentDate}
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  onSelectEvent={openEventDetails}
                />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
