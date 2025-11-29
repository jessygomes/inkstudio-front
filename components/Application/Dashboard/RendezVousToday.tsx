/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from "react";
import {
  fetchTodayAppointmentsAction,
  paidAppointmentsAction,
} from "@/lib/queries/appointment";
import { useScrollLock } from "@/lib/hook/useScrollLock";
import { formatTime } from "@/lib/utils/formatTime";
import { calculateDuration } from "@/lib/utils/calculateDuration";
import { getDateLabel } from "@/lib/utils/getDateLabel";
import RdvDetailsPanelDesktop from "./RdvDetailsPanelDesktop";
import RdvDetailsPanelMobile from "./RdvDetailsPanelMobile";

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

  //! État pour la date actuelle
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  //! Nouvel état pour les détails du RDV sélectionné
  const [selectedAppointment, setSelectedAppointment] =
    useState<RendezVous | null>(null);

  // Bloquer le scroll du body quand une modal est ouverte
  useScrollLock(!!selectedAppointment);

  //! Fonction pour récupérer les rendez-vous du jour
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

  //! Navigation
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
    <div className="h-[550px] bg-noir-700 rounded-xl border border-white/20 p-4 overflow-y-auto custom-scrollbar shadow-2xl relative lg:overflow-hidden">
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
          {getDateLabel(currentDate)}
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
            Aucun RDV {getDateLabel(currentDate).toLowerCase()}
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
                  <div className="w-8 h-8 bg-gradient-to-r from-tertiary-500 to-tertiary-400 rounded-full flex items-center justify-center flex-shrink-0">
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
      {/* Panneau de détails */}
      {selectedAppointment && (
        <>
          {/* Version Desktop - par-dessus tout le composant */}
          <div className="hidden lg:block absolute inset-0 z-50">
            <RdvDetailsPanelDesktop
              selectedAppointment={selectedAppointment}
              onClose={closeAppointmentDetails}
              handleRdvUpdated={handleRdvUpdated}
              handleStatusChange={handleStatusChange}
              handlePaymentStatusChange={handlePaymentStatusChange}
              userId={userId}
            />
          </div>
          {/* Version Mobile - masquée sur desktop */}
          <div className="lg:hidden">
            <RdvDetailsPanelMobile
              selectedAppointment={selectedAppointment}
              onClose={closeAppointmentDetails}
              handleRdvUpdated={handleRdvUpdated}
              handleStatusChange={handleStatusChange}
              handlePaymentStatusChange={handlePaymentStatusChange}
              userId={userId}
            />
          </div>
        </>
      )}
    </div>
  );
}
