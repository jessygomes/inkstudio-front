/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import ConfirmRdv from "../RDV/ConfirmRdv";
import CancelRdv from "../RDV/CancelRdv";
import UpdateRdv from "../RDV/UpdateRdv";
import ChangeRdv from "../RDV/ChangeRdv";
import { UpdateRdvFormProps } from "@/lib/type";

interface Client {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Tatoueur {
  id: string;
  name: string;
}

interface TattooDetail {
  sketch: string | null; // Correction ici
  reference: string | null; // Correction ici
  description: string;
  estimatedPrice: number;
  price: number;
}

interface PendingAppointment {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  status: "PENDING" | "CONFIRMED" | "CANCELED" | "RESCHEDULING";
  prestation: string;
  client: Client;
  clientId: string;
  tatoueur: Tatoueur;
  tatoueurId: string;
  tattooDetail: TattooDetail | null;
  tattooDetailId: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isPayed?: boolean; // Champ optionnel pour le statut de paiement
}

interface PendingAppointmentsResponse {
  error: boolean;
  appointments?: PendingAppointment[];
  totalAppointments?: number;
  message?: string;
}

export default function WaitingRdv({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<PendingAppointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  // États pour les modales d'action - on garde pour compatibilité
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<PendingAppointment | null>(null);
  const [actionType, setActionType] = useState<"confirm" | "cancel">("confirm");
  const [actionMessage, setActionMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Nouveaux états pour les détails
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] =
    useState<PendingAppointment | null>(null);

  //! Fonction pour ouvrir l'image dans un nouvel onglet
  const openImageInNewTab = (url: string) => {
    console.log("Opening image in new tab:", url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const fetchPendingAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/pending-confirmation/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des rendez-vous en attente"
        );
      }

      const data: PendingAppointmentsResponse = await response.json();

      if (data.error) {
        throw new Error(
          data.message || "Erreur lors de la récupération des données"
        );
      }

      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPendingAppointments();
    }
  }, [userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Vérifier si c'est aujourd'hui
    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui ${date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Vérifier si c'est demain
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Demain ${date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Sinon afficher la date complète
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  };

  const getDaysUntilAppointment = (dateString: string) => {
    const appointmentDate = new Date(dateString);
    const today = new Date();
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  //! Gérer le statut de paiement
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

      // Mettre à jour l'appointment sélectionné si c'est celui qui a été modifié
      if (
        selectedAppointmentDetails &&
        selectedAppointmentDetails.id === rdvId
      ) {
        setSelectedAppointmentDetails({
          ...selectedAppointmentDetails,
          isPayed: isPayed,
        });
      }

      // Refetch des données
      fetchPendingAppointments();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleRdvUpdated = (updatedId: string) => {
    // Refetch des données après mise à jour
    fetchPendingAppointments();

    // Mettre à jour l'appointment sélectionné si nécessaire
    if (
      selectedAppointmentDetails &&
      selectedAppointmentDetails.id === updatedId
    ) {
      const updated = appointments.find((a) => a.id === updatedId);
      if (updated) {
        setSelectedAppointmentDetails(updated);
      }
    }
  };

  const openAppointmentDetails = (appointment: PendingAppointment) => {
    setSelectedAppointmentDetails(appointment);
  };

  const closeAppointmentDetails = () => {
    setSelectedAppointmentDetails(null);
  };

  //! CONFIRMER OU ANNULER UN RDV - actions rapides
  const handleConfirmClick = (appointment: PendingAppointment) => {
    setSelectedAppointment(appointment);
    setActionType("confirm");
    setActionMessage("");
    setIsActionModalOpen(true);
  };

  const handleCancelClick = (appointment: PendingAppointment) => {
    setSelectedAppointment(appointment);
    setActionType("cancel");
    setActionMessage("");
    setIsActionModalOpen(true);
  };

  const handleActionSubmit = async () => {
    if (!selectedAppointment) return;

    setIsProcessing(true);

    try {
      const endpoint = actionType === "confirm" ? "confirm" : "cancel";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/${endpoint}/${selectedAppointment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: actionMessage.trim() || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Erreur lors de la ${
              actionType === "confirm" ? "confirmation" : "annulation"
            }`
        );
      }

      toast.success(
        actionType === "confirm"
          ? "Rendez-vous confirmé avec succès ! Le client va recevoir un email."
          : "Rendez-vous annulé avec succès ! Le client va recevoir un email."
      );

      // Mettre à jour la liste des rendez-vous
      await fetchPendingAppointments();

      // Fermer la modale
      setIsActionModalOpen(false);
      setSelectedAppointment(null);
      setActionMessage("");
    } catch (error) {
      console.error(`Erreur lors de la ${actionType}:`, error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Erreur lors de la ${
              actionType === "confirm" ? "confirmation" : "annulation"
            }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedAppointment(null);
    setActionMessage("");
  };

  //! CHARGEMENT
  if (loading) {
    return (
      <div className="bg-noir-700 rounded-xl border border-white/20 p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white font-one">
            RDV en attente
          </h3>
          <div className="w-4 h-4 border-2 border-orange-500/50 rounded-full animate-spin border-t-orange-400"></div>
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

  //! ERREUR
  if (error) {
    return (
      <div className="bg-noir-700 rounded-xl border border-white/20 p-4 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4 font-one">
          RDV en attente
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
            onClick={fetchPendingAppointments}
            className="cursor-pointer px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-[550px] bg-noir-700 rounded-xl border border-white/20 p-4 overflow-y-auto custom-scrollbar shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white font-one">
            RDV en attente
          </h3>
          <div className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-medium border border-orange-500/50">
            {appointments.length}
          </div>
        </div>

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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Aucun RDV en attente</p>
            <p className="text-gray-500 text-xs mt-1">
              Tous vos rendez-vous sont confirmés
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {appointments.map((appointment) => {
              const daysUntil = getDaysUntilAppointment(appointment.start);
              const isUrgent = daysUntil <= 2;

              return (
                <div
                  key={appointment.id}
                  onClick={() => openAppointmentDetails(appointment)}
                  className={`cursor-pointer border rounded-lg p-3 hover:bg-slate-400/10 transition-all duration-200 bg-slate-300/10 ${
                    isUrgent
                      ? "border-orange-400/40 bg-orange-500/5"
                      : "border-white/20"
                  } ${
                    selectedAppointmentDetails?.id === appointment.id
                      ? "ring-2 ring-tertiary-500/50 border-tertiary-500/50"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-xs">
                          {appointment.client.firstName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white text-sm truncate font-one">
                            {appointment.client.firstName}{" "}
                            {appointment.client.lastName}
                          </h4>
                          {isUrgent && (
                            <span className="text-orange-400 text-xs">⚠️</span>
                          )}
                        </div>
                        <p className="text-[10px] font-one text-gray-300 truncate">
                          {appointment.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs font-one text-gray-400 mt-1">
                          <span>{formatDate(appointment.start)}</span>
                          <span>•</span>
                          <span>
                            {calculateDuration(
                              appointment.start,
                              appointment.end
                            )}
                            min
                          </span>
                          <span>•</span>
                          <span>{appointment.tatoueur.name}</span>
                        </div>
                        {daysUntil <= 1 && appointment.status === "PENDING" && (
                          <div className="text-[10px] text-orange-300 mt-1 font-medium">
                            {daysUntil === 0
                              ? "Aujourd'hui - Confirmation urgente !"
                              : "À confirmer rapidement"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Boutons d'action rapide - empêche la propagation */}
                    <div className="flex flex-col gap-1 ml-2">
                      {appointment.status === "RESCHEDULING" ? (
                        // Message pour les RDV en reprogrammation
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2 text-center">
                          <span className="text-blue-300 text-xs font-one font-medium block">
                            Reprogrammation
                          </span>
                          <span className="text-blue-200/70 text-[10px] font-one">
                            En attente client
                          </span>
                        </div>
                      ) : (
                        // Boutons normaux pour les autres statuts
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmClick(appointment);
                            }}
                            className="cursor-pointer px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded text-xs font-one font-medium transition-colors flex items-center gap-1"
                          >
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Confirmer
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelClick(appointment);
                            }}
                            className="cursor-pointer px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded text-xs font-one font-medium transition-colors flex items-center gap-1"
                          >
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Annuler
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Panneau de détails en overlay */}
        {selectedAppointmentDetails && (
          <>
            {/*
              Ajout d'une variable locale pour le typage
            */}
            {(() => {
              const tattooDetail = selectedAppointmentDetails.tattooDetail;

              return (
                <div className="absolute inset-0 bg-gradient-to-br from-noir-700/98 via-noir-600/98 to-noir-500/98 backdrop-blur-md rounded-xl flex flex-col animate-in slide-in-from-bottom-4 duration-300 border border-white/10">
                  {/* Header du panneau avec design compact */}
                  <div className="relative p-4 border-b border-white/10 bg-gradient-to-r from-noir-700/80 to-noir-500/80">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 to-transparent"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">
                            {selectedAppointmentDetails.client.firstName
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold font-one text-white tracking-wide">
                            {selectedAppointmentDetails.client.firstName}{" "}
                            {selectedAppointmentDetails.client.lastName}
                          </h4>
                          <p className="text-white/70 text-xs font-one">
                            {selectedAppointmentDetails.title}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={closeAppointmentDetails}
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
                            className="w-4 h-4 text-orange-500"
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
                          Statut
                        </h5>
                      </div>

                      <div className="mb-3">
                        {selectedAppointmentDetails.status === "PENDING" ? (
                          <div className="bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-400/30 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                              <span className="text-orange-300 font-medium font-one text-xs">
                                En attente de confirmation
                              </span>
                            </div>
                          </div>
                        ) : selectedAppointmentDetails.status ===
                          "RESCHEDULING" ? (
                          <div className="bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-400/30 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                              <span className="text-blue-300 font-medium font-one text-xs">
                                En attente de reprogrammation
                              </span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Actions compactes */}
                    <div className="border-white/10">
                      <div className="flex items-center gap-1 flex-wrap">
                        {selectedAppointmentDetails.status !== "CONFIRMED" && (
                          <ConfirmRdv
                            rdvId={selectedAppointmentDetails.id}
                            appointment={selectedAppointmentDetails}
                          />
                        )}
                        <UpdateRdv
                          rdv={
                            selectedAppointmentDetails as unknown as UpdateRdvFormProps
                          }
                          userId={userId}
                          onUpdate={() =>
                            handleRdvUpdated(selectedAppointmentDetails.id)
                          }
                        />
                        <ChangeRdv
                          rdvId={selectedAppointmentDetails.id}
                          userId={userId}
                          appointment={selectedAppointmentDetails}
                        />
                        {selectedAppointmentDetails.status !== "CANCELED" && (
                          <CancelRdv
                            rdvId={selectedAppointmentDetails.id}
                            appointment={selectedAppointmentDetails}
                          />
                        )}
                      </div>
                    </div>

                    {/* Informations principales compactes */}
                    <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                      <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
                        <svg
                          className="w-4 h-4 text-orange-500"
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
                                {formatDate(selectedAppointmentDetails.start)}
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
                                {calculateDuration(
                                  selectedAppointmentDetails.start,
                                  selectedAppointmentDetails.end
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
                                {selectedAppointmentDetails.prestation}
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
                                {selectedAppointmentDetails.tatoueur.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact client compact */}
                      {selectedAppointmentDetails.client.email && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                            <p className="text-white/60 text-xs font-one mb-1">
                              Contact
                            </p>
                            <p className="text-white/80 text-xs font-one">
                              {selectedAppointmentDetails.client.email}
                            </p>
                            {selectedAppointmentDetails.client.phone && (
                              <p className="text-white/80 text-xs font-one">
                                {selectedAppointmentDetails.client.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Statut de paiement compact */}
                    {(selectedAppointmentDetails.prestation === "RETOUCHE" ||
                      selectedAppointmentDetails.prestation === "TATTOO" ||
                      selectedAppointmentDetails.prestation === "PIERCING") && (
                      <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                        <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
                          <svg
                            className="w-4 h-4 text-orange-500"
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
                                name={`payment-${selectedAppointmentDetails.id}`}
                                checked={
                                  selectedAppointmentDetails.isPayed === false
                                }
                                onChange={() =>
                                  handlePaymentStatusChange(
                                    selectedAppointmentDetails.id,
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
                                name={`payment-${selectedAppointmentDetails.id}`}
                                checked={
                                  selectedAppointmentDetails.isPayed === true
                                }
                                onChange={() =>
                                  handlePaymentStatusChange(
                                    selectedAppointmentDetails.id,
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
                    {tattooDetail && (
                      <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                        <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
                          <svg
                            className="w-4 h-4 text-orange-500"
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

                          {/* Prix estimé compact */}
                          {tattooDetail.estimatedPrice && (
                            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-lg p-2 border border-orange-400/20">
                              <div className="bg-white/5 rounded-md p-2 border border-white/5">
                                <p className="text-orange-400 font-one font-semibold text-xs">
                                  💰 Estimé: {tattooDetail.estimatedPrice}€
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Images de référence et croquis (s'il y en a) */}
                    {tattooDetail && tattooDetail.reference && (
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <p className="text-white/60 text-xs font-one mb-2">
                          Image de référence
                        </p>
                        <div
                          className="relative w-full h-16 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openImageInNewTab(tattooDetail.reference!);
                          }}
                        >
                          <Image
                            src={tattooDetail.reference}
                            alt="Image de référence"
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
                      </div>
                    )}

                    {tattooDetail && tattooDetail.sketch && (
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <p className="text-white/60 text-xs font-one mb-2">
                          Croquis
                        </p>
                        <div
                          className="relative w-full h-16 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openImageInNewTab(tattooDetail.sketch!);
                          }}
                        >
                          <Image
                            src={tattooDetail.sketch}
                            alt="Croquis du tatouage"
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
                      </div>
                    )}
                  </div>

                  {/* Footer compact */}
                  <div className="p-3 border-t border-white/10 bg-white/5">
                    <button
                      onClick={closeAppointmentDetails}
                      className="cursor-pointer w-full py-2 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one"
                    >
                      Retour à la liste
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Modale d'action rapide - existante */}
      {isActionModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-noir-500 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white font-one tracking-wide">
                  {actionType === "confirm"
                    ? "✅ Confirmer le rendez-vous"
                    : "❌ Annuler le rendez-vous"}
                </h2>
                <button
                  onClick={handleCloseActionModal}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <span className="cursor-pointer text-white text-xl">×</span>
                </button>
              </div>
              <p className="text-white/70 mt-1 text-sm">
                {actionType === "confirm"
                  ? `Confirmer le RDV de ${selectedAppointment.client.firstName} ${selectedAppointment.client.lastName}`
                  : `Annuler le RDV de ${selectedAppointment.client.firstName} ${selectedAppointment.client.lastName}`}
              </p>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Récapitulatif du rendez-vous */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">
                      {selectedAppointment.client.firstName
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white font-one font-semibold mb-1">
                      {selectedAppointment.client.firstName}{" "}
                      {selectedAppointment.client.lastName}
                    </h3>
                    <p className="text-white/80 text-sm font-one mb-2">
                      {selectedAppointment.title}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-white/60 font-one">Date & Heure</p>
                        <p className="text-white font-one">
                          {formatDate(selectedAppointment.start)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 font-one">Durée</p>
                        <p className="text-white font-one">
                          {calculateDuration(
                            selectedAppointment.start,
                            selectedAppointment.end
                          )}{" "}
                          min
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 font-one">Prestation</p>
                        <p className="text-white font-one">
                          {selectedAppointment.prestation}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 font-one">Tatoueur</p>
                        <p className="text-white font-one">
                          {selectedAppointment.tatoueur.name}
                        </p>
                      </div>
                    </div>

                    {selectedAppointment.client.email && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-white/60 text-xs font-one">
                          Contact
                        </p>
                        <p className="text-white/80 text-xs font-one">
                          {selectedAppointment.client.email}
                        </p>
                        {selectedAppointment.client.phone && (
                          <p className="text-white/80 text-xs font-one">
                            {selectedAppointment.client.phone}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Zone de message */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold font-one mb-3 text-sm">
                  {actionType === "confirm"
                    ? "💬 Message de confirmation"
                    : "📝 Raison de l'annulation"}
                </h3>
                <div className="space-y-3">
                  <textarea
                    value={actionMessage}
                    onChange={(e) => setActionMessage(e.target.value)}
                    placeholder={
                      actionType === "confirm"
                        ? "Message personnalisé de confirmation (optionnel)..."
                        : "Expliquez brièvement la raison de l'annulation..."
                    }
                    className="w-full h-20 p-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400 focus:border-transparent resize-none transition-colors"
                    maxLength={300}
                    disabled={isProcessing}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-white/50 font-one">
                      {actionType === "confirm"
                        ? "Le client recevra un email de confirmation"
                        : "Le client recevra un email d'annulation"}
                    </p>
                    <p className="text-xs text-white/50 font-one">
                      {actionMessage.length}/300
                    </p>
                  </div>

                  {/* Suggestions */}
                  {/* <div className="space-y-1">
                    <p className="text-xs text-white/70 font-one">💡 Suggestions :</p>
                    {actionType === 'confirm' ? [
                      "Votre rendez-vous est confirmé ! À bientôt !",
                      "J'ai hâte de réaliser votre projet !",
                      "Rendez-vous confirmé, n'hésitez pas si vous avez des questions.",
                    ] : [
                      "Imprévu de dernière minute, désolé pour la gêne occasionnée.",
                      "Problème technique, nous vous recontacterons rapidement.",
                      "Changement d'agenda, nous proposons de nouvelles dates.",
                    ]}.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setActionMessage(suggestion)}
                        disabled={isProcessing}
                        className="cursor-pointer block w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 hover:border-tertiary-400/30 transition-all text-xs text-white/80 font-one disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div> */}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-2">
              <button
                onClick={handleCloseActionModal}
                disabled={isProcessing}
                className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={isProcessing}
                className={`cursor-pointer px-4 py-2 rounded-lg transition-all duration-300 font-medium font-one text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === "confirm"
                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>
                      {actionType === "confirm"
                        ? "Confirmation..."
                        : "Annulation..."}
                    </span>
                  </>
                ) : (
                  <>
                    {actionType === "confirm" ? (
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    <span>
                      {actionType === "confirm"
                        ? "Confirmer le RDV"
                        : "Annuler le RDV"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
