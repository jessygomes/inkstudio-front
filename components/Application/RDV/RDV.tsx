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
import UpdateRdv, { UpdateRdvFormProps } from "./UpdateRdv";

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
    <div className="w-full flex gap-2">
      {isLoading ? (
        <div className="h-[80vh] w-full flex items-center justify-center">
          <BarLoader
            color={color}
            loading={isLoading}
            cssOverride={override}
            // size={150}
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
          <section className="w-3/5 rounded-[20px] relative">
            <h2 className="text-white font-two text-xl uppercase">
              {getFormattedLabel()}
            </h2>
            {events.length > 0 ? (
              <div className="flex flex-col gap-4 mt-2  rounded-[20px] p-2">
                <div className="grid grid-cols-7 gap-2 p-1 text-white text-xs font-bold">
                  <p>Date & Heure</p>
                  <p>Titre</p>
                  <p>Client</p>
                  <p>Durée</p>
                  <p>Type</p>
                  <p>Tatoueur</p>
                  <p></p>
                </div>
                <div className="h-[1px] w-full bg-white/70" />

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
                        key={event.id} // Assurez-vous que chaque événement a un ID unique
                        className="grid grid-cols-7 items-center gap-2 text-white font-one text-xs p-1 rounded-[20px] hover:bg-secondary-500 transition duration-200"
                      >
                        {/* DATE ET HEURE */}
                        <p className="font-bold">
                          {new Date(event.start ?? "").toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            }
                          )}{" "}
                          -{" "}
                          {new Date(event.start ?? "").toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>

                        {/* TITRE DU RDV */}
                        <p className="truncate">{event.title}</p>

                        {/* CLIQUER SUR LE NOM DUU CLIENT POUR AFFICHER SA FICHE CLIENT */}
                        <button className="cursor-pointer text-left hover:text-tertiary-500 transition duration-200">
                          {event.client.firstName} {event.client.lastName}
                        </button>

                        {/* DUREE */}
                        <p>
                          {durationHours}h
                          {durationMinutes > 0 ? `${durationMinutes}m` : ""}
                        </p>

                        {/* PRESTATION */}
                        <p>{event.prestation}</p>

                        {/* NOM DU TATOUEUR */}
                        <p className="truncate">{event.tatoueur.name}</p>

                        {/* CONFIRMER LE RDV OU VOIR TOUS LES DETAILS */}
                        <button
                          onClick={() => openEventDetails(event)}
                          className="text-center"
                        >
                          {event.status === "CANCELED" ? (
                            <p className="cursor-pointer bg-red-900 text-white px-2 py-1 rounded-[20px] hover:bg-red-700 transition">
                              RDV Annulé
                            </p>
                          ) : event.status !== "CONFIRMED" ? (
                            <p className="cursor-pointer bg-primary-500 text-white px-2 py-1 rounded-[20px] hover:bg-primary-400 transition">
                              {event.status === "PENDING" ? "En attente" : ""}
                            </p>
                          ) : (
                            <p className="cursor-pointer bg-tertiary-500 text-white px-2 py-1 rounded-[20px] hover:bg-tertiary-400 transition">
                              Voir les infos
                            </p>
                          )}
                        </button>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <section>
                <div className="h-[1px] w-full bg-white/70 mt-2" />
                <div className="h-[85vh] w-full flex items-center justify-center relative">
                  <p className="font-two text-xl text-center text-white">
                    Aucun rendez-vous disponible.
                  </p>
                </div>
              </section>
            )}
          </section>
          {/* <h1 className="text-2xl font-bold mb-4">Agenda des Rendez-vous</h1> */}
          <section className="w-2/5 h-[85vh] relative">
            {selectedEvent ? (
              <div className="flex flex-col justify-between gap-2 bg-primary-500/60 h-full rounded-lg p-6 font-two text-white text-sm">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-two text-white">
                      Détails du Rendez-vous
                    </h2>
                  </div>

                  {selectedEvent.status === "PENDING" ? (
                    <p className="text-white/60 tracking-widest font-bold">
                      Ce rendez-vous est en attente de confirmation.
                    </p>
                  ) : selectedEvent.status === "CONFIRMED" ? (
                    <p className="text-green-500 font-bold">
                      Ce rendez-vous est confirmé.
                    </p>
                  ) : selectedEvent.status === "CANCELED" ? (
                    <p className="text-red-500 font-bold">
                      Ce rendez-vous a été annulé.
                    </p>
                  ) : null}

                  <div className="flex items-center gap-2">
                    {selectedEvent.status !== "CONFIRMED" ? (
                      <ConfirmRdv rdvId={selectedEvent.id} />
                    ) : null}

                    <UpdateRdv
                      rdv={selectedEvent as unknown as UpdateRdvFormProps}
                      userId={userId || ""}
                      onUpdate={() => handleRdvUpdated(selectedEvent.id)}
                    />

                    {selectedEvent.status !== "CANCELED" ? (
                      <CancelRdv rdvId={selectedEvent.id} />
                    ) : null}
                  </div>

                  <div className="h-[1px] w-full bg-white/70" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <p>
                    <strong>Date :</strong>{" "}
                    {new Date(selectedEvent.start).toLocaleDateString("fr-FR")}
                  </p>
                  <p>
                    <strong>Heure :</strong>{" "}
                    {new Date(selectedEvent.start).toLocaleTimeString("fr-FR")}{" "}
                    - {new Date(selectedEvent.end).toLocaleTimeString("fr-FR")}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <p>
                    <strong>Client :</strong> {selectedEvent.client.firstName}{" "}
                    {selectedEvent.client.lastName}
                  </p>
                  <p>
                    <strong>Prestation :</strong> {selectedEvent.prestation}
                  </p>
                </div>
                <div className="h-[1px] w-full bg-white/70" />
                <div className="grid grid-cols-2 gap-4">
                  <p>
                    <strong>Titre :</strong> {selectedEvent.title}
                  </p>
                  <p>
                    <strong>Tatoueur :</strong> {selectedEvent.tatoueur.name}
                  </p>
                </div>
                <p>
                  <strong>Statut :</strong> {selectedEvent.status}
                </p>
                {/* DETAIL TATTOO  */}
                <div className="h-[1px] w-full bg-white/70" />
                <p className="font-bold underline">Détails supplémentaires :</p>
                <p className="text-xs">
                  <strong>Description :</strong>{" "}
                  {selectedEvent.tattooDetail?.description}
                </p>
                <p className="text-xs">
                  <strong>Style/Couleur :</strong>{" "}
                  {selectedEvent.tattooDetail?.colorStyle}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <p className="text-xs">
                    <strong>Zone :</strong> {selectedEvent.tattooDetail?.zone}
                  </p>
                  <p className="text-xs">
                    <strong>Taille :</strong> {selectedEvent.tattooDetail?.size}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <p className="text-xs">
                    <strong>Image de référence 1 :</strong>{" "}
                    {selectedEvent.tattooDetail?.reference}
                  </p>
                  <p className="text-xs">
                    <strong>Image de référence 2 :</strong>{" "}
                    {selectedEvent.tattooDetail?.sketch}
                  </p>
                </div>
                <button
                  onClick={closeEventDetails}
                  className="cursor-pointer bg-primary-500 text-white text-xs px-4 py-1 rounded-[20px] hover:bg-primary-400 transition"
                >
                  Retour
                </button>
              </div>
            ) : (
              <CalendarView
                events={events}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                currentView={currentView}
                setCurrentView={setCurrentView}
                onSelectEvent={openEventDetails}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
