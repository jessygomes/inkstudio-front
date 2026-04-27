"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  confirmAppointmentAction,
  paidAppointmentsAction,
  waitingConfirmationAppointmentsAction,
} from "@/lib/queries/appointment";
import { useScrollLock } from "@/lib/hook/useScrollLock";
import { calculateDuration } from "@/lib/utils/calculateDuration";
import WaitingRdvDetailsPanelMobile from "./WaitingRdvDetailsPanelMobile";
import WaitingRdvDetailsPanelDesktop from "./WaitingRdvDetailsPanelDesktop";

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
  sketch: string | null;
  reference: string | null;
  description: string;
  estimatedPrice: number;
  price: number;
  piercingZone?: string;
  piercingServicePriceId: string | null;
}

interface PendingAppointment {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  status: "PENDING" | "CONFIRMED" | "CANCELED" | "RESCHEDULING";
  prestation: string;
  skin?: string | null;
  client: Client;
  clientId: string;
  tatoueur: Tatoueur;
  tatoueurId: string;
  tattooDetail: TattooDetail | null;
  tattooDetailId: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isPayed?: boolean;
  visio?: boolean;
  visioRoom?: string;
  conversation?: { id: string } | null;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);

  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return `Aujourd'hui ${date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  if (date.toDateString() === tomorrow.toDateString()) {
    return `Demain ${date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDaysUntilAppointment(dateString: string) {
  const appointmentDate = new Date(dateString);
  const today = new Date();
  const diffTime = appointmentDate.getTime() - today.getTime();

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function SummaryTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-[16px] border border-white/8 bg-white/[0.03] px-2 py-1.5 backdrop-blur-sm">
      <p className="text-[9px] uppercase tracking-[0.12em] text-white/40 font-one leading-none">
        {label}
      </p>
      <div className="mt-1 flex items-center justify-between gap-1.5">
        <span className="text-[13px] font-semibold leading-none text-white font-one">
          {value}
        </span>
        <span className={`h-1.5 w-1.5 rounded-full ${accent}`} />
      </div>
    </div>
  );
}

export default function WaitingRdvModern({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<PendingAppointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<PendingAppointment | null>(null);
  const [actionType, setActionType] = useState<"confirm" | "cancel">("confirm");
  const [actionMessage, setActionMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] =
    useState<PendingAppointment | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useScrollLock(isActionModalOpen || (!!selectedAppointmentDetails && isMobile));

  const fetchPendingAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await waitingConfirmationAppointmentsAction();

      if (data.error) {
        throw new Error("Erreur lors de la récupération des données");
      }

      const nextAppointments = data.appointments || [];
      setAppointments(nextAppointments);
      return nextAppointments;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      return [] as PendingAppointment[];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      void fetchPendingAppointments();
    }
  }, [userId]);

  const syncSelectedDetails = (
    nextAppointments: PendingAppointment[],
    appointmentId: string,
  ) => {
    const updatedAppointment = nextAppointments.find(
      (appointment) => appointment.id === appointmentId,
    );

    setSelectedAppointmentDetails(updatedAppointment ?? null);
  };

  const handlePaymentStatusChange = async (rdvId: string, isPayed: boolean) => {
    try {
      await paidAppointmentsAction(rdvId, isPayed);
      const nextAppointments = await fetchPendingAppointments();
      syncSelectedDetails(nextAppointments, rdvId);
    } catch (paymentError) {
      console.error("Erreur:", paymentError);
    }
  };

  const handleRdvUpdated = async (updatedId: string) => {
    const nextAppointments = await fetchPendingAppointments();
    syncSelectedDetails(nextAppointments, updatedId);
  };

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

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedAppointment(null);
    setActionMessage("");
  };

  const handleActionSubmit = async () => {
    if (!selectedAppointment) {
      return;
    }

    setIsProcessing(true);

    try {
      const endpoint = actionType === "confirm" ? "confirm" : "cancel";

      await confirmAppointmentAction(
        selectedAppointment.id,
        endpoint,
        actionMessage,
      );

      toast.success(
        actionType === "confirm"
          ? "Rendez-vous confirmé avec succès ! Le client va recevoir un email."
          : "Rendez-vous annulé avec succès ! Le client va recevoir un email.",
      );

      await fetchPendingAppointments();
      setIsActionModalOpen(false);
      setSelectedAppointment(null);
      setActionMessage("");
    } catch (submitError) {
      console.error(`Erreur lors de la ${actionType}:`, submitError);
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : `Erreur lors de la ${
              actionType === "confirm" ? "confirmation" : "annulation"
            }`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const urgentCount = appointments.filter(
    (appointment) =>
      appointment.status === "PENDING" &&
      getDaysUntilAppointment(appointment.start) <= 1,
  ).length;
  const reschedulingCount = appointments.filter(
    (appointment) => appointment.status === "RESCHEDULING",
  ).length;

  if (loading) {
    return (
      <div className="dashboard-panel dashboard-panel-featured p-4 lg:p-5">
        <div className="dashboard-panel-content">
          <div className="dashboard-card-header mb-4">
            <div>
              <h3 className="dashboard-card-title">RDV en attente</h3>
            </div>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-tertiary-500/40 border-t-tertiary-400" />
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[48px] animate-pulse rounded-[16px] border border-white/6 bg-white/5"
              />
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[100px] animate-pulse rounded-[22px] border border-white/6 bg-white/5"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-panel dashboard-panel-featured p-4 lg:p-5">
        <div className="dashboard-panel-content">
          <div className="dashboard-card-header mb-4">
            <div>
              <h3 className="dashboard-card-title">RDV en attente</h3>
            </div>
          </div>

          <div className="dashboard-empty-state px-4 py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
              <svg
                className="h-5 w-5 text-red-300"
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
            <p className="text-sm font-medium text-red-300">{error}</p>
            <button
              onClick={() => void fetchPendingAppointments()}
              className="mt-4 rounded-2xl border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/12 font-one"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-panel dashboard-panel-featured relative h-[540px] overflow-y-auto p-3.5 lg:overflow-hidden lg:p-4">
        <div
          className={`dashboard-panel-content flex h-full flex-col ${
            selectedAppointmentDetails ? "lg:pointer-events-none lg:opacity-0" : ""
          }`}
        >
          <div className="dashboard-card-header mb-3.5">
            <div>
              <h3 className="dashboard-card-title">RDV en attente</h3>
            </div>

            <div className="dashboard-count-pill bg-linear-to-t from-tertiary-400/30 to-tertiary-500/30 border border-tertiary-400/50">{appointments.length}</div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <SummaryTile label="À traiter" value={appointments.length} accent="bg-tertiary-400" />
            <SummaryTile label="Urgents" value={urgentCount} accent="bg-amber-400" />
            <SummaryTile label="Reprog." value={reschedulingCount} accent="bg-sky-400" />
          </div>

          {appointments.length === 0 ? (
            <div className="dashboard-empty-state mt-3 flex-1 px-4 py-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/8 bg-white/5">
                <svg
                  className="h-6 w-6 text-white/40"
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
              <p className="text-sm text-white/72 font-one">Aucun RDV en attente</p>
              <p className="mt-1 text-xs text-white/45 font-one">
                Tous les rendez-vous sont déjà traités côté confirmation.
              </p>
            </div>
          ) : (
            <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 md:space-y-3">
              {appointments.map((appointment) => {
                const daysUntil = getDaysUntilAppointment(appointment.start);
                const isUrgent = appointment.status === "PENDING" && daysUntil <= 1;

                return (
                  <div
                    key={appointment.id}
                    className={`rounded-[20px] border p-2.5 transition-all duration-200 sm:p-3 md:p-3.5 ${
                      selectedAppointmentDetails?.id === appointment.id
                        ? "border-tertiary-400/35 bg-tertiary-500/[0.08] shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
                        : isUrgent
                          ? "border-red-400/25 bg-red-500/[0.07]"
                          : "border-tertiary-400/15 bg-tertiary-500/[0.04]"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:gap-2.5 xl:flex-row xl:items-start xl:justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedAppointmentDetails(appointment)}
                        className="flex min-w-0 flex-1 items-start gap-2 text-left sm:gap-2.5"
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-tertiary-400 to-tertiary-500 text-xs font-semibold text-white shadow-lg shadow-tertiary-500/15 font-one sm:h-10 sm:w-10 sm:rounded-[14px]">
                          {appointment.client.firstName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <h4 className="w-full truncate text-sm font-semibold text-white font-one sm:w-auto sm:flex-1">
                              {appointment.client.firstName} {appointment.client.lastName}
                            </h4>

                            <span
                              className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium font-one sm:ml-auto ${
                                appointment.status === "RESCHEDULING"
                                  ? "border-sky-400/25 bg-sky-500/10 text-sky-200"
                                  : "border-amber-400/25 bg-amber-500/10 text-amber-200"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  appointment.status === "RESCHEDULING"
                                    ? "bg-sky-400"
                                    : "bg-amber-400"
                                }`}
                              />
                              {appointment.status === "RESCHEDULING"
                                ? "Reprogrammation"
                                : "En attente"}
                            </span>

                            {isUrgent && (
                              <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-amber-200 font-one sm:ml-1">
                                Urgent
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 truncate text-[11px] text-white/62 font-one">
                            {appointment.title}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="rounded-full border border-white/8 bg-white/6 px-2 py-0.5 text-[10px] text-white/78 font-one">
                              {formatDate(appointment.start)}
                            </span>
                            <span className="rounded-full border border-white/8 bg-white/6 px-2 py-0.5 text-[10px] text-white/65 font-one">
                              {calculateDuration(appointment.start, appointment.end)} min
                            </span>
                            <span className="rounded-full border border-white/8 bg-white/6 px-2 py-0.5 text-[10px] text-white/65 font-one">
                              {appointment.tatoueur?.name || "Non assigné"}
                            </span>
                          </div>

                          {isUrgent && (
                            <p className="mt-2 text-[10px] text-red-300/90 font-one">
                              {daysUntil <= 0
                                ? "Le rendez-vous est prévu aujourd'hui et attend encore une validation."
                                : "Validation recommandée avant demain pour sécuriser le créneau."}
                            </p>
                          )}
                        </div>
                      </button>

                      <div className="grid w-full grid-cols-2 gap-2 md:gap-1.5 xl:w-auto xl:min-w-[132px] xl:grid-cols-1">
                        {appointment.status === "RESCHEDULING" ? (
                          <div className="col-span-2 rounded-[16px] border border-sky-400/20 bg-sky-500/10 px-2.5 py-1.5 text-center xl:col-span-1">
                            <span className="block text-[11px] font-medium text-sky-200 font-one">
                              En attente client
                            </span>
                            <span className="text-[9px] text-sky-100/70 font-one">
                              Nouveau créneau à choisir
                            </span>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleConfirmClick(appointment);
                              }}
                              className="cursor-pointer inline-flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-emerald-400/22 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-200 transition-colors hover:bg-emerald-500/16 font-one"
                            >
                              <svg
                                className="h-3 w-3"
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
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCancelClick(appointment);
                              }}
                              className="cursor-pointer inline-flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-rose-400/22 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-medium text-rose-200 transition-colors hover:bg-rose-500/16 font-one"
                            >
                              <svg
                                className="h-3 w-3"
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

          {selectedAppointmentDetails && isMobile && (
            <WaitingRdvDetailsPanelMobile
              selectedAppointment={selectedAppointmentDetails}
              onClose={() => setSelectedAppointmentDetails(null)}
              handleRdvUpdated={handleRdvUpdated}
              handlePaymentStatusChange={handlePaymentStatusChange}
              userId={userId}
            />
          )}
        </div>

        {selectedAppointmentDetails && !isMobile && (
          <div className="absolute inset-0 z-50">
            <WaitingRdvDetailsPanelDesktop
              selectedAppointment={selectedAppointmentDetails}
              onClose={() => setSelectedAppointmentDetails(null)}
              handleRdvUpdated={handleRdvUpdated}
              handlePaymentStatusChange={handlePaymentStatusChange}
              userId={userId}
            />
          </div>
        )}
      </div>

      {isActionModalOpen && selectedAppointment && (
        <div
          className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-[2px] p-3 md:p-4 lg:flex lg:items-center lg:justify-center"
          style={{
            height: "100dvh",
            width: "100vw",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 9999,
          }}
        >
          <div className="dashboard-embedded-panel !h-auto mx-auto flex w-full max-w-[560px] flex-col overflow-hidden rounded-[28px] border border-white/12 bg-[#1a1a1a] shadow-[0_32px_64px_rgba(0,0,0,0.45)] max-h-[calc(100dvh-1.5rem)] md:max-h-[88vh]">
            <div className="dashboard-embedded-header rounded-t-[28px] px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold tracking-wide text-white font-one">
                    {actionType === "confirm"
                      ? "Confirmer le rendez-vous"
                      : "Annuler le rendez-vous"}
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-white/65 font-one">
                    {selectedAppointment.client.firstName} {selectedAppointment.client.lastName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeActionModal}
                  className="shrink-0 rounded-xl p-1.5 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <svg
                    className="h-4 w-4"
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

            <div className="space-y-2.5 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              <div className="dashboard-embedded-section p-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-tertiary-500 to-primary-500 text-xs font-semibold text-white shadow-lg shadow-tertiary-500/15 font-one">
                    {selectedAppointment.client.firstName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-white font-one">
                      {selectedAppointment.client.firstName} {selectedAppointment.client.lastName}
                    </h3>
                    <p className="mt-0.5 truncate text-[11px] text-white/65 font-one">
                      {selectedAppointment.title}
                    </p>

                    <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] font-one">
                      <div className="rounded-xl border border-white/8 bg-white/4 px-2 py-1.5">
                        <p className="text-[10px] uppercase tracking-wider text-white/35">Date</p>
                        <p className="mt-0.5 truncate text-white/90 text-xs">
                          {new Date(selectedAppointment.start).toLocaleDateString("fr-FR", {
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-white/4 px-2 py-1.5">
                        <p className="text-[10px] uppercase tracking-wider text-white/35">Heure</p>
                        <p className="mt-0.5 text-white/90 text-xs">
                          {new Date(selectedAppointment.start).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" - "}
                          {new Date(selectedAppointment.end).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-white/4 px-2 py-1.5">
                        <p className="text-[10px] uppercase tracking-wider text-white/35">Durée</p>
                        <p className="mt-0.5 text-white/90 text-xs">
                          {calculateDuration(selectedAppointment.start, selectedAppointment.end)} min
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-white/4 px-2 py-1.5">
                        <p className="text-[9px] uppercase tracking-wider text-white/35">Prestation</p>
                        <p className="mt-0.5 truncate text-white/90 text-xs">{selectedAppointment.prestation}</p>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-white/4 px-2 py-1.5">
                        <p className="text-[9px] uppercase tracking-wider text-white/35">Tatoueur</p>
                        <p className="mt-0.5 truncate text-white/90 text-xs">
                          {selectedAppointment.tatoueur?.name || "Non assigné"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-embedded-section p-3">
                <h3 className="mb-2 text-[12px] font-semibold text-white font-one">
                  {actionType === "confirm"
                    ? "Message de confirmation"
                    : "Raison de l'annulation"}
                </h3>

                <textarea
                  value={actionMessage}
                  onChange={(event) => setActionMessage(event.target.value)}
                  placeholder={
                    actionType === "confirm"
                      ? "Ajouter un message personnalisé pour le client..."
                      : "Expliquez brièvement la raison de l'annulation..."
                  }
                  className="h-20 w-full resize-none rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one"
                  maxLength={300}
                  disabled={isProcessing}
                />

                <div className="mt-2 flex items-center justify-between gap-2 text-[12px] text-white/45 font-one">
                  <p>
                    {actionType === "confirm"
                      ? "Le client recevra un email de confirmation."
                      : "Le client recevra un email d'annulation."}
                  </p>
                  <p>{actionMessage.length}/300</p>
                </div>
              </div>
            </div>

            <div className="dashboard-embedded-footer flex items-center justify-end gap-2 rounded-b-[28px] px-4 py-2.5">
              <button
                type="button"
                onClick={closeActionModal}
                disabled={isProcessing}
                className="cursor-pointer inline-flex items-center justify-center rounded-[14px] border border-white/12 bg-white/8 px-3.5 py-1.5 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50 font-one"
              >
                Fermer
              </button>

              <button
                type="button"
                onClick={() => void handleActionSubmit()}
                disabled={isProcessing}
                className={`cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-[14px] px-3.5 py-1.5 text-[11px] font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 font-one ${
                  actionType === "confirm"
                    ? "bg-emerald-600/90 hover:bg-emerald-500"
                    : "bg-rose-600/90 hover:bg-rose-500"
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Traitement...
                  </>
                ) : actionType === "confirm" ? (
                  "Confirmer"
                ) : (
                  "Annuler"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}