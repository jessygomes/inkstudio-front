/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  confirmAppointmentAction,
  paidAppointmentsAction,
  waitingConfirmationAppointmentsAction,
} from "@/lib/queries/appointment";
import WaitingRdvDetailsPanel from "./WaitingRdvDetailsPanel";

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
  visio?: boolean; // Indique si le RDV est en visioconférence
  visioRoom?: string; // Lien de la salle de visioconférence
}

// interface PendingAppointmentsResponse {
//   error: boolean;
//   appointments?: PendingAppointment[];
//   totalAppointments?: number;
//   message?: string;
// }

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

  const fetchPendingAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await waitingConfirmationAppointmentsAction();

      if (data.error) {
        throw new Error("Erreur lors de la récupération des données");
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
      await paidAppointmentsAction(rdvId, isPayed);

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

      await confirmAppointmentAction(
        selectedAppointment.id,
        endpoint,
        actionMessage
      );

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
      <div className="h-[550px] bg-noir-700 rounded-xl border border-white/20 p-4 overflow-y-auto custom-scrollbar shadow-2xl relative lg:overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white font-one">
            RDV en attente
          </h3>
          <div className="px-2 py-1 bg-tertiary-500/20 text-tertiary-400 rounded-lg text-xs font-medium border border-tertiary-500/50">
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
                      ? "border-tertiary-400/40 bg-tertiary-500/5"
                      : "border-white/20"
                  } ${
                    selectedAppointmentDetails?.id === appointment.id
                      ? "ring-2 ring-tertiary-500/50 border-tertiary-500/50"
                      : ""
                  }`}
                >
                  <div className="flex flex-col gap-2 lg:flex-row lg:gap-0 items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-tertiary-500 to-tertiary-400 rounded-full flex items-center justify-center flex-shrink-0">
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
                    <div className="flex flex-col gap-1 lg:ml-2 w-full lg:w-auto">
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

        {/* Panneau de détails */}
        {selectedAppointmentDetails && (
          <WaitingRdvDetailsPanel
            selectedAppointment={selectedAppointmentDetails}
            onClose={closeAppointmentDetails}
            handleRdvUpdated={handleRdvUpdated}
            handlePaymentStatusChange={handlePaymentStatusChange}
            userId={userId}
          />
        )}
      </div>

      {/* Modale d'action rapide - existante */}
      {isActionModalOpen && selectedAppointment && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm lg:flex lg:items-center lg:justify-center lg:p-4"
          style={{ height: "100dvh", width: "100vw" }}
        >
          <div className="bg-noir-500 lg:rounded-3xl w-full lg:max-w-2xl h-full lg:max-h-[90vh] overflow-hidden flex flex-col border-0 lg:border border-white/20 shadow-2xl">
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
            <div className="p-4 border-t border-white/10 bg-white/5 flex flex-col lg:flex-row justify-end gap-2">
              <button
                onClick={handleCloseActionModal}
                disabled={isProcessing}
                className="cursor-pointer px-4 py-3 lg:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm lg:text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={isProcessing}
                className={`cursor-pointer px-4 py-3 lg:py-2 rounded-lg transition-all duration-300 font-medium font-one text-sm lg:text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
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
