/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import ConfirmRdv from "../RDV/ConfirmRdv";
import CancelRdv from "../RDV/CancelRdv";
import UpdateRdv from "../RDV/UpdateRdv";
import ChangeStatusButtons from "../RDV/ChangeStatusButtons";
import SendMessageRdv from "../RDV/SendMessageRdv";
// import ChangeRdv from "../RDV/ChangeRdv";
import { UpdateRdvFormProps } from "@/lib/type";
import {
  fetchTodayAppointmentsAction,
  paidAppointmentsAction,
} from "@/lib/queries/appointment";
import { openImageInNewTab } from "@/lib/utils/openImage";
import ChangeRdv from "../RDV/ChangeRdv";

interface Client {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Tatoueur {
  id: string;
  name: string;
  userId: string;
  img: string;
}

interface TattooDetail {
  description?: string;
  zone?: string;
  size?: string;
  colorStyle?: string;
  reference?: string;
  sketch?: string;
  estimatedPrice?: number;
  price?: number; // Ajout du prix réel
}

interface RendezVous {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELED"
    | "RESCHEDULING"
    | "COMPLETED"
    | "NO_SHOW";
  prestation: string;
  client: Client;
  clientId: string;
  tatoueur: Tatoueur;
  tatoueurId: string;
  tattooDetail: TattooDetail;
  tattooDetailId: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isPayed?: boolean; // Champ optionnel pour le statut de paiement
  visio?: boolean; // Indique si le RDV est en visioconférence
  visioRoom?: string; // Lien de la salle de visioconférence
}

export default function RendezVousToday({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [error, setError] = useState<string | null>(null);

  // État pour la date actuelle
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Nouvel état pour les détails du RDV sélectionné
  const [selectedAppointment, setSelectedAppointment] =
    useState<RendezVous | null>(null);

  const fetchTodayAppointments = async (date?: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchTodayAppointmentsAction(date);

      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  };

  // Navigation
  const goToPreviousDay = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const newDate = prevDate.toISOString().split("T")[0];
    setCurrentDate(newDate);
    fetchTodayAppointments(newDate);
  };

  const goToNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const newDate = nextDate.toISOString().split("T")[0];
    setCurrentDate(newDate);
    fetchTodayAppointments(newDate);
  };

  // Fonction pour formater la date avec les labels intelligents
  const getDateLabel = () => {
    // Date d'aujourd'hui
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Date d'hier
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Date de demain
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    if (currentDate === todayStr) {
      return "Aujourd'hui";
    } else if (currentDate === yesterdayStr) {
      return "Hier";
    } else if (currentDate === tomorrowStr) {
      return "Demain";
    } else {
      // Afficher la date au format français
      const date = new Date(currentDate);
      return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  //! Gérer le statut de paiement
  const handlePaymentStatusChange = async (rdvId: string, isPayed: boolean) => {
    try {
      await paidAppointmentsAction(rdvId, isPayed);

      // Mettre à jour l'appointment sélectionné si c'est celui qui a été modifié
      if (selectedAppointment && selectedAppointment.id === rdvId) {
        setSelectedAppointment({
          ...selectedAppointment,
          isPayed: isPayed,
        });
      }

      // Refetch des données
      fetchTodayAppointments(currentDate);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleRdvUpdated = (updatedId: string) => {
    // Refetch des données après mise à jour
    fetchTodayAppointments(currentDate);

    // Mettre à jour l'appointment sélectionné si nécessaire
    if (selectedAppointment && selectedAppointment.id === updatedId) {
      const updated = appointments.find((a) => a.id === updatedId);
      if (updated) {
        setSelectedAppointment(updated);
      }
    }
  };

  //! Callback pour le changement de statut depuis le composant ChangeStatusButtons
  const handleStatusChange = (
    rdvId: string,
    status: "COMPLETED" | "NO_SHOW"
  ) => {
    // Mettre à jour l'événement sélectionné si c'est celui qui a été modifié
    if (selectedAppointment && selectedAppointment.id === rdvId) {
      setSelectedAppointment({
        ...selectedAppointment,
        status: status,
      });
    }

    // Refetch des données après mise à jour
    fetchTodayAppointments(currentDate);
  };

  const openAppointmentDetails = (appointment: RendezVous) => {
    setSelectedAppointment(appointment);
  };

  const closeAppointmentDetails = () => {
    setSelectedAppointment(null);
  };

  if (loading) {
    return (
      <div className="bg-noir-700 rounded-xl border border-white/20 p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white font-one">RDV du jour</h3>
          <div className="w-4 h-4 border-2 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-slate-300/10 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-noir-700 rounded-xl border border-white/20 p-4 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4 font-one">
          RDV du jour
        </h3>
        <div className="text-center py-6">
          <div className="w-10 h-10 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-400 mb-3 text-sm font-medium">{error}</p>
          <button
            onClick={() => fetchTodayAppointments()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[550px] bg-noir-700 rounded-xl border border-white/20 p-4 overflow-y-auto custom-scrollbar shadow-2xl relative">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white font-one">RDV</h3>
        <button
          onClick={goToPreviousDay}
          className="cursor-pointer w-6 h-6 rounded-lg bg-tertiary-500/20 border border-tertiary-500/50 flex items-center justify-center hover:bg-tertiary-500/30 transition-colors"
        >
          <svg
            className="w-3 h-3 text-tertiary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="text-white text-sm font-one font-medium">
          {getDateLabel()}
        </div>
        <button
          onClick={goToNextDay}
          className="cursor-pointer w-6 h-6 rounded-lg bg-tertiary-500/20 border border-tertiary-500/50 flex items-center justify-center hover:bg-tertiary-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-3 h-3 text-tertiary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <div className="px-2 py-1 bg-tertiary-500/20 text-tertiary-400 rounded-lg text-xs font-medium border border-tertiary-500/50">
          {appointments.length}
        </div>
      </div>

      {/* Liste des rendez-vous */}
      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-500"
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
          <p className="text-gray-400 text-sm">
            Aucun RDV {getDateLabel().toLowerCase()}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              onClick={() => openAppointmentDetails(appointment)}
              className={`cursor-pointer border rounded-lg p-3 hover:bg-slate-400/10 transition-all duration-200 ${
                selectedAppointment?.id === appointment.id
                  ? "bg-tertiary-500/10 border-tertiary-500/50"
                  : "border-white/20 bg-slate-300/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-tertiary-500 to-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-xs">
                      {appointment.client.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-white text-sm truncate font-one">
                      {appointment.client.firstName}{" "}
                      {appointment.client.lastName}
                    </h4>
                    <p className="text-[10px] font-one text-gray-300 truncate">
                      {appointment.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-one text-gray-400 mt-1">
                      <span>{formatTime(appointment.start)}</span>
                      <span>•</span>
                      <span>
                        {calculateDuration(appointment.start, appointment.end)}
                        min
                      </span>
                      {appointment.tattooDetail?.zone && (
                        <>
                          <span>•</span>
                          <span className="truncate">
                            {appointment.tattooDetail.zone}
                          </span>
                        </>
                      )}
                      {/* Indicateur de visio */}
                      {appointment.visio && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
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
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-blue-400">Visio</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {appointment.status === "PENDING" ? (
                  <div className="bg-gradient-to-r from-orange-500/15 to-orange-500/15 border border-orange-400/30 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span className="text-orange-300 font-medium font-one text-xs">
                        En attente
                      </span>
                    </div>
                  </div>
                ) : appointment.status === "RESCHEDULING" ? (
                  <div className="bg-gradient-to-r from-blue-500/15 to-blue-500/15 border border-blue-400/30 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-300 font-medium font-one text-xs">
                        Reprogrammation
                      </span>
                    </div>
                  </div>
                ) : appointment.status === "CONFIRMED" ? (
                  <div className="bg-gradient-to-r from-green-500/15 to-green-500/15 border border-green-400/30 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 font-medium font-one text-xs">
                        Confirmé
                      </span>
                    </div>
                  </div>
                ) : appointment.status === "COMPLETED" ? (
                  <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-400/30 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-emerald-300 font-medium font-one text-xs">
                        Complété
                      </span>
                    </div>
                  </div>
                ) : appointment.status === "NO_SHOW" ? (
                  <div className="bg-gradient-to-r from-amber-500/15 to-orange-600/15 border border-amber-400/30 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span className="text-amber-300 font-medium font-one text-xs">
                        Pas présenté
                      </span>
                    </div>
                  </div>
                ) : appointment.status === "CANCELED" ? (
                  <div className="bg-gradient-to-r from-red-500/15 to-red-500/15 border border-red-400/30 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <span className="text-red-300 font-medium font-one text-xs">
                        Annulé
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Panneau de détails en overlay */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-noir-700 sm:bg-gradient-to-br sm:from-noir-700/98 sm:via-noir-600/98 sm:to-noir-500/98 sm:backdrop-blur-md sm:flex sm:items-center sm:justify-center animate-in slide-in-from-bottom-4 duration-300">
          <div className="h-full w-full sm:h-auto sm:w-auto sm:max-w-4xl sm:max-h-[95vh] bg-noir-700 sm:bg-transparent rounded-none sm:rounded-xl flex flex-col border-0 sm:border sm:border-white/10 shadow-2xl">
            {/* Header du panneau avec design compact */}
            <div className="relative p-4 sm:p-4 border-b border-white/10 bg-noir-700 sm:bg-gradient-to-r sm:from-noir-700/80 sm:to-noir-500/80">
              <div className="absolute inset-0 bg-transparent sm:bg-gradient-to-r sm:from-tertiary-400/5 sm:to-transparent"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-tertiary-500 to-tertiary-400 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {selectedAppointment.client.firstName
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-lg font-bold font-one text-white tracking-wide">
                      {selectedAppointment.client.firstName}{" "}
                      {selectedAppointment.client.lastName}
                    </h4>
                    <p className="text-white/70 text-sm sm:text-xs font-one">
                      {selectedAppointment.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeAppointmentDetails}
                  className="cursor-pointer p-2 sm:p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
                >
                  <svg
                    className="w-6 h-6 sm:w-5 sm:h-5 text-white/70 group-hover:text-white transition-colors"
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-4 space-y-4 sm:space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {/* Statut avec design compact */}
              <div className="bg-gradient-to-r from-white/8 to-white/4 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-white font-one text-base sm:text-sm flex items-center gap-2">
                    <svg
                      className="w-5 h-5 sm:w-4 sm:h-4 text-tertiary-500"
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
                  {selectedAppointment.status === "PENDING" ? (
                    <div className="bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-400/30 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        <span className="text-orange-300 font-medium font-one text-sm sm:text-xs">
                          En attente de confirmation
                        </span>
                      </div>
                    </div>
                  ) : selectedAppointment.status === "CONFIRMED" ? (
                    <div className="bg-gradient-to-r from-green-500/15 to-emerald-500/15 border border-green-400/30 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-300 font-medium font-one text-sm sm:text-xs">
                          Confirmé
                        </span>
                      </div>
                    </div>
                  ) : selectedAppointment.status === "COMPLETED" ? (
                    <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-400/30 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span className="text-emerald-300 font-medium font-one text-sm sm:text-xs">
                          Complété
                        </span>
                      </div>
                    </div>
                  ) : selectedAppointment.status === "NO_SHOW" ? (
                    <div className="bg-gradient-to-r from-amber-500/15 to-orange-600/15 border border-amber-400/30 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        <span className="text-amber-300 font-medium font-one text-sm sm:text-xs">
                          Pas présenté
                        </span>
                      </div>
                    </div>
                  ) : selectedAppointment.status === "CANCELED" ? (
                    <div className="bg-gradient-to-r from-red-500/15 to-rose-500/15 border border-red-400/30 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-red-300 font-medium font-one text-sm sm:text-xs">
                          Annulé
                        </span>
                      </div>
                    </div>
                  ) : selectedAppointment.status === "RESCHEDULING" ? (
                    <div className="bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-400/30 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-blue-300 font-medium font-one text-sm sm:text-xs">
                          En attente de reprogrammation
                        </span>
                      </div>
                      <p className="text-blue-200/80 text-sm sm:text-xs font-one mt-1">
                        Le client doit choisir un nouveau créneau
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Actions compactes */}
              <div className="border-white/10">
                <div className="flex items-center gap-1 flex-wrap">
                  {/* Bouton Confirmer - pas pour CONFIRMED, RESCHEDULING, COMPLETED, NO_SHOW */}
                  {selectedAppointment.status !== "CONFIRMED" &&
                    selectedAppointment.status !== "RESCHEDULING" &&
                    selectedAppointment.status !== "COMPLETED" &&
                    selectedAppointment.status !== "NO_SHOW" && (
                      <ConfirmRdv
                        rdvId={selectedAppointment.id}
                        appointment={selectedAppointment}
                        onConfirm={() =>
                          handleRdvUpdated(selectedAppointment.id)
                        }
                      />
                    )}

                  {/* Bouton Modifier - pas pour RDV passés confirmés, COMPLETED, NO_SHOW */}
                  {!(
                    selectedAppointment.status === "CONFIRMED" &&
                    new Date(selectedAppointment.end) < new Date()
                  ) &&
                    selectedAppointment.status !== "COMPLETED" &&
                    selectedAppointment.status !== "NO_SHOW" && (
                      <UpdateRdv
                        rdv={
                          selectedAppointment as unknown as UpdateRdvFormProps
                        }
                        userId={userId}
                        onUpdate={() =>
                          handleRdvUpdated(selectedAppointment.id)
                        }
                      />
                    )}

                  <ChangeRdv
                    rdvId={selectedAppointment.id}
                    userId={userId}
                    appointment={selectedAppointment}
                  />

                  {/* Bouton Annuler - pas pour CANCELED, RDV passés confirmés, COMPLETED, NO_SHOW */}
                  {selectedAppointment.status !== "CANCELED" &&
                    selectedAppointment.status !== "COMPLETED" &&
                    selectedAppointment.status !== "NO_SHOW" &&
                    !(
                      selectedAppointment.status === "CONFIRMED" &&
                      new Date(selectedAppointment.end) < new Date()
                    ) && (
                      <CancelRdv
                        rdvId={selectedAppointment.id}
                        appointment={selectedAppointment}
                        onCancel={() =>
                          handleRdvUpdated(selectedAppointment.id)
                        }
                      />
                    )}

                  {/* Boutons pour changer le statut - pour RDV confirmés passés, COMPLETED, NO_SHOW */}
                  {((selectedAppointment.status === "CONFIRMED" &&
                    new Date(selectedAppointment.end) < new Date()) ||
                    selectedAppointment.status === "COMPLETED" ||
                    selectedAppointment.status === "NO_SHOW") && (
                    <ChangeStatusButtons
                      rdvId={selectedAppointment.id}
                      currentStatus={selectedAppointment.status}
                      onStatusChange={handleStatusChange}
                      size="sm"
                    />
                  )}

                  {/* Bouton Message - disponible pour tous les rendez-vous sauf CANCELED */}
                  {selectedAppointment.status !== "CANCELED" && (
                    <SendMessageRdv
                      rdvId={selectedAppointment.id}
                      appointment={selectedAppointment}
                      onMessageSent={() =>
                        handleRdvUpdated(selectedAppointment.id)
                      }
                    />
                  )}
                </div>
              </div>
              {/* Informations principales compactes */}
              <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                <h5 className="text-white font-one text-base sm:text-sm flex items-center gap-2 mb-3">
                  <svg
                    className="w-5 h-5 sm:w-4 sm:h-4 text-tertiary-500"
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm sm:text-xs font-one">
                          Heure
                        </p>
                        <p className="text-white font-one text-sm sm:text-xs">
                          {formatTime(selectedAppointment.start)} -{" "}
                          {formatTime(selectedAppointment.end)}
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
                        <p className="text-white/60 text-sm sm:text-xs font-one">
                          Durée
                        </p>
                        <p className="text-white font-one text-sm sm:text-xs">
                          {calculateDuration(
                            selectedAppointment.start,
                            selectedAppointment.end
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
                        <p className="text-white/60 text-sm sm:text-xs font-one">
                          Prestation
                        </p>
                        <p className="text-white font-one text-sm sm:text-xs">
                          {selectedAppointment.prestation}
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
                        <p className="text-white/60 text-sm sm:text-xs font-one">
                          Tatoueur
                        </p>
                        <p className="text-white font-one text-sm sm:text-xs">
                          {selectedAppointment.tatoueur.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Visio si applicable */}
              {selectedAppointment.visio && (
                <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                  <h5 className="text-white font-one text-base sm:text-sm flex items-center gap-2 mb-3">
                    <svg
                      className="w-5 h-5 sm:w-4 sm:h-4 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Visioconférence
                  </h5>

                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-3 border border-blue-400/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-300 font-medium font-one text-sm sm:text-xs">
                        Rendez-vous en ligne
                      </span>
                    </div>
                    <p className="text-blue-200/80 text-sm sm:text-xs font-one mb-3">
                      Ce rendez-vous se déroulera en visioconférence
                    </p>

                    {selectedAppointment.visioRoom && (
                      <a
                        href={selectedAppointment.visioRoom}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-3 sm:px-3 sm:py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-300 hover:text-blue-200 transition-colors text-sm sm:text-xs font-one font-medium"
                        onClick={(e) => e.stopPropagation()}
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
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        Rejoindre la salle de visio
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Statut de paiement compact */}
              {(selectedAppointment.prestation === "RETOUCHE" ||
                selectedAppointment.prestation === "TATTOO" ||
                selectedAppointment.prestation === "PIERCING") && (
                <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                  <h5 className="text-white font-one text-base sm:text-sm flex items-center gap-2 mb-3">
                    <svg
                      className="w-5 h-5 sm:w-4 sm:h-4 text-tertiary-500"
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
                          name={`payment-${selectedAppointment.id}`}
                          checked={selectedAppointment.isPayed === false}
                          onChange={() =>
                            handlePaymentStatusChange(
                              selectedAppointment.id,
                              false
                            )
                          }
                          className="w-3 h-3 text-red-500"
                        />
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          <span className="text-red-400 text-sm sm:text-xs font-one">
                            Non payé
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer bg-white/5 rounded-lg p-2 border border-white/10 hover:bg-white/10 transition-colors flex-1">
                        <input
                          type="radio"
                          name={`payment-${selectedAppointment.id}`}
                          checked={selectedAppointment.isPayed === true}
                          onChange={() =>
                            handlePaymentStatusChange(
                              selectedAppointment.id,
                              true
                            )
                          }
                          className="w-3 h-3 text-green-500"
                        />
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <span className="text-green-400 text-sm sm:text-xs font-one">
                            Payé
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Détails du tattoo compact */}
              {selectedAppointment.tattooDetail && (
                <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                  <h5 className="text-white font-one text-base sm:text-sm flex items-center gap-2 mb-3">
                    <svg
                      className="w-5 h-5 sm:w-4 sm:h-4 text-tertiary-500"
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
                    Détails : {selectedAppointment.prestation}
                  </h5>

                  <div className="space-y-2">
                    {selectedAppointment.tattooDetail.description && (
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <p className="text-white/60 text-sm sm:text-xs font-one mb-1">
                          Description
                        </p>
                        <p className="text-white font-one text-sm sm:text-xs leading-relaxed">
                          {selectedAppointment.tattooDetail.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {selectedAppointment.tattooDetail.zone && (
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                          <p className="text-white/60 text-sm sm:text-xs font-one">
                            Zone
                          </p>
                          <p className="text-white font-one text-sm sm:text-xs">
                            {selectedAppointment.tattooDetail.zone}
                          </p>
                        </div>
                      )}

                      {selectedAppointment.tattooDetail.size && (
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                          <p className="text-white/60 text-sm sm:text-xs font-one">
                            Taille
                          </p>
                          <p className="text-white font-one text-sm sm:text-xs">
                            {selectedAppointment.tattooDetail.size}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Images de référence compactes */}
                    {(selectedAppointment.tattooDetail.reference ||
                      selectedAppointment.tattooDetail.sketch) && (
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <p className="text-white/60 text-sm sm:text-xs font-one mb-2">
                          Images
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedAppointment.tattooDetail.reference && (
                            <div
                              className="relative w-full h-16 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openImageInNewTab(
                                  selectedAppointment.tattooDetail.reference!
                                );
                              }}
                            >
                              <Image
                                src={selectedAppointment.tattooDetail.reference}
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
                          {selectedAppointment.tattooDetail.sketch && (
                            <div
                              className="relative w-full h-16 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openImageInNewTab(
                                  selectedAppointment.tattooDetail.sketch!
                                );
                              }}
                            >
                              <Image
                                src={selectedAppointment.tattooDetail.sketch}
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
                    {((selectedAppointment.tattooDetail.estimatedPrice !==
                      undefined &&
                      selectedAppointment.tattooDetail.estimatedPrice !==
                        null &&
                      selectedAppointment.tattooDetail.estimatedPrice > 0) ||
                      (selectedAppointment.tattooDetail.price !== undefined &&
                        selectedAppointment.tattooDetail.price !== null &&
                        selectedAppointment.tattooDetail.price > 0)) && (
                      <div className="bg-gradient-to-r from-tertiary-500/10 to-primary-500/10 rounded-lg p-2 border border-tertiary-400/20">
                        <div className="flex gap-2">
                          {selectedAppointment.tattooDetail.estimatedPrice !==
                            undefined &&
                            selectedAppointment.tattooDetail.estimatedPrice !==
                              null &&
                            selectedAppointment.tattooDetail.estimatedPrice >
                              0 && (
                              <div className="bg-white/5 rounded-md p-2 border border-white/5 flex-1">
                                <p className="text-orange-400 font-one font-semibold text-sm sm:text-xs">
                                  💰 Prix estimé :{" "}
                                  {
                                    selectedAppointment.tattooDetail
                                      .estimatedPrice
                                  }
                                  €
                                </p>
                              </div>
                            )}
                          {selectedAppointment.tattooDetail.price !==
                            undefined &&
                            selectedAppointment.tattooDetail.price !== null &&
                            selectedAppointment.tattooDetail.price > 0 && (
                              <div className="bg-white/5 rounded-md p-2 border border-white/5 flex-1">
                                <p className="text-green-400 font-one font-semibold text-sm sm:text-xs">
                                  ✅ Prix final :{" "}
                                  {selectedAppointment.tattooDetail.price}€
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer compact */}
            <div className="p-4 sm:p-3 border-t border-white/10 bg-white/5">
              <button
                onClick={closeAppointmentDetails}
                className="cursor-pointer w-full py-3 sm:py-2 text-sm sm:text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one"
              >
                Retour à la liste
              </button>
            </div>
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
