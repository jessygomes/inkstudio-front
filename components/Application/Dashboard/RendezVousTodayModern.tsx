"use client";

import { useEffect, useState } from "react";
import {
  fetchTodayAppointmentsAction,
  paidAppointmentsAction,
} from "@/lib/queries/appointment";
import { useScrollLock } from "@/lib/hook/useScrollLock";
import { formatTime } from "@/lib/utils/formatTime";
import { formatSkinTone, getSkinTonePreviewHex } from "@/lib/utils/formatSkinTone";
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
  price?: number;
  piercingZone?: string;
  piercingServicePriceId?: string;
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
  skin?: string | null;
  client: Client;
  clientId: string;
  tatoueur?: Tatoueur | null;
  tatoueurId?: string | null;
  tattooDetail: TattooDetail;
  tattooDetailId: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isPayed?: boolean;
  visio?: boolean;
  visioRoom?: string;
  conversation?: { id: string } | null;
}

function getStatusMeta(status: RendezVous["status"]) {
  switch (status) {
    case "PENDING":
      return {
        label: "En attente",
        className:
          "border-amber-400/25 bg-amber-500/10 text-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.08)]",
        dotClassName: "bg-amber-400",
      };
    case "CONFIRMED":
      return {
        label: "Confirmé",
        className:
          "border-emerald-400/25 bg-emerald-500/10 text-emerald-200 shadow-[0_0_0_1px_rgba(52,211,153,0.08)]",
        dotClassName: "bg-emerald-400",
      };
    case "COMPLETED":
      return {
        label: "Complété",
        className:
          "border-teal-400/25 bg-teal-500/10 text-teal-200 shadow-[0_0_0_1px_rgba(45,212,191,0.08)]",
        dotClassName: "bg-teal-400",
      };
    case "NO_SHOW":
      return {
        label: "Absent",
        className:
          "border-orange-400/25 bg-orange-500/10 text-orange-200 shadow-[0_0_0_1px_rgba(251,146,60,0.08)]",
        dotClassName: "bg-orange-400",
      };
    case "CANCELED":
      return {
        label: "Annulé",
        className:
          "border-rose-400/25 bg-rose-500/10 text-rose-200 shadow-[0_0_0_1px_rgba(251,113,133,0.08)]",
        dotClassName: "bg-rose-400",
      };
    case "RESCHEDULING":
      return {
        label: "Reprogrammation",
        className:
          "border-sky-400/25 bg-sky-500/10 text-sky-200 shadow-[0_0_0_1px_rgba(56,189,248,0.08)]",
        dotClassName: "bg-sky-400",
      };
    default:
      return {
        label: status,
        className: "border-white/10 bg-white/5 text-white/80",
        dotClassName: "bg-white/70",
      };
  }
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

export default function RendezVousTodayModern({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedAppointment, setSelectedAppointment] =
    useState<RendezVous | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useScrollLock(!!selectedAppointment && isMobile);

  const fetchTodayAppointments = async (date = currentDate) => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchTodayAppointmentsAction(date);
      const nextAppointments = data.appointments || [];

      setAppointments(nextAppointments);
      return nextAppointments;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      return [] as RendezVous[];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchTodayAppointmentsAction(currentDate);
        setAppointments(data.appointments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    void loadAppointments();
  }, [userId, currentDate]);

  const syncSelectedAppointment = (
    nextAppointments: RendezVous[],
    appointmentId: string,
  ) => {
    const updatedAppointment = nextAppointments.find(
      (appointment) => appointment.id === appointmentId,
    );

    setSelectedAppointment(updatedAppointment ?? null);
  };

  const changeDay = (offset: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + offset);

    const formattedDate = nextDate.toISOString().split("T")[0];
    setCurrentDate(formattedDate);
    void fetchTodayAppointments(formattedDate);
  };

  const handlePaymentStatusChange = async (rdvId: string, isPayed: boolean) => {
    try {
      await paidAppointmentsAction(rdvId, isPayed);
      const nextAppointments = await fetchTodayAppointments(currentDate);
      syncSelectedAppointment(nextAppointments, rdvId);
    } catch (paymentError) {
      console.error("Erreur:", paymentError);
    }
  };

  const handleRdvUpdated = async (updatedId: string) => {
    const nextAppointments = await fetchTodayAppointments(currentDate);
    syncSelectedAppointment(nextAppointments, updatedId);
  };

  const handleStatusChange = async (
    rdvId: string,
    status: "COMPLETED" | "NO_SHOW",
  ) => {
    if (selectedAppointment?.id === rdvId) {
      setSelectedAppointment({
        ...selectedAppointment,
        status,
      });
    }

    const nextAppointments = await fetchTodayAppointments(currentDate);
    syncSelectedAppointment(nextAppointments, rdvId);
  };

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "CONFIRMED",
  ).length;
  const unpaidCount = appointments.filter(
    (appointment) =>
      ["RETOUCHE", "TATTOO", "PIERCING"].includes(appointment.prestation) &&
      appointment.isPayed !== true,
  ).length;

  if (loading) {
    return (
      <div className="dashboard-panel dashboard-panel-featured p-4 lg:p-5">
        <div className="dashboard-panel-content">
          <div className="dashboard-card-header mb-4">
            <div>
              <h3 className="dashboard-card-title">RDV du jour</h3>
            </div>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-tertiary-500/40 border-t-tertiary-300" />
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
                className="h-[92px] animate-pulse rounded-[22px] border border-white/6 bg-white/5"
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
              <h3 className="dashboard-card-title">RDV du jour</h3>
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
              onClick={() => void fetchTodayAppointments(currentDate)}
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
    <div className="dashboard-panel dashboard-panel-featured relative h-[540px] overflow-y-auto p-3.5 shadow-2xl lg:overflow-hidden lg:p-4">
      <div
        className={`dashboard-panel-content flex h-full flex-col ${
          selectedAppointment ? "lg:pointer-events-none lg:opacity-0" : ""
        }`}
      >
        <div className="dashboard-card-header mb-3.5">
          <div>
            <h3 className="dashboard-card-title">RDV du jour</h3>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => changeDay(-1)} className="dashboard-nav-button cursor-pointer">
              <svg
                className="h-3.5 w-3.5"
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

            <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-medium text-white/78 font-one sm:block">
              {getDateLabel(currentDate)}
            </div>

            <button onClick={() => changeDay(1)} className="dashboard-nav-button cursor-pointer">
              <svg
                className="h-3.5 w-3.5"
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
          </div>
        </div>

        <div className="mb-3 rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-center text-[11px] font-medium text-white/78 font-one sm:hidden">
          {getDateLabel(currentDate)}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <SummaryTile label="Total" value={appointments.length} accent="bg-tertiary-400" />
          <SummaryTile label="Confirmés" value={confirmedCount} accent="bg-emerald-400" />
          <SummaryTile label="À régler" value={unpaidCount} accent="bg-amber-400" />
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-white/72 font-one">
              Aucun rendez-vous {getDateLabel(currentDate).toLowerCase()}
            </p>
            <p className="mt-1 text-xs text-white/45 font-one">
              La liste se remplira automatiquement dès qu&apos;un créneau sera programmé.
            </p>
          </div>
        ) : (
          <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {appointments.map((appointment) => {
              const statusMeta = getStatusMeta(appointment.status);
              const isSelected = selectedAppointment?.id === appointment.id;

              return (
                <button
                  key={appointment.id}
                  type="button"
                  onClick={() => setSelectedAppointment(appointment)}
                  className={`group w-full rounded-[22px] border p-3 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-tertiary-400/35 bg-tertiary-500/[0.08] shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
                      : "border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] hover:border-white/14 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex min-w-0 flex-1 gap-2.5">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-tertiary-400 to-tertiary-500 text-xs font-semibold text-white shadow-lg shadow-tertiary-500/15 font-one">
                        {appointment.client.firstName.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="truncate text-sm font-semibold text-white font-one">
                            {appointment.client.firstName} {appointment.client.lastName}
                          </h4>
                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium font-one ${statusMeta.className}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClassName}`} />
                            {statusMeta.label}
                          </span>
                        </div>

                        <p className="mt-0.5 truncate text-[11px] text-white/62 font-one">
                          {appointment.title}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded-full border border-white/8 bg-white/6 px-2 py-0.5 text-[10px] text-white/78 font-one">
                            {formatTime(appointment.start)} - {formatTime(appointment.end)}
                          </span>
                          <span className="rounded-full border border-white/8 bg-white/6 px-2 py-0.5 text-[10px] text-white/65 font-one">
                            {calculateDuration(appointment.start, appointment.end)} min
                          </span>
                          <span className="rounded-full border border-white/8 bg-white/6 px-2 py-0.5 text-[10px] text-white/65 font-one">
                            {appointment.prestation}
                          </span>
                          {appointment.tattooDetail?.zone && (
                            <span className="rounded-full border border-white/8 bg-white/6 px-2 py-0.5 text-[10px] text-white/65 font-one">
                              {appointment.tattooDetail.zone}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-white/50 font-one">
                          <span>
                            Tatoueur: {appointment.tatoueur?.name || "Non assigné"}
                          </span>

                          {appointment.skin && (
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full border border-white/20"
                                style={{
                                  backgroundColor:
                                    getSkinTonePreviewHex(appointment.skin) ?? undefined,
                                }}
                                aria-hidden="true"
                              />
                              {formatSkinTone(appointment.skin)}
                            </span>
                          )}

                          {appointment.visio && (
                            <span className="inline-flex items-center gap-1 text-sky-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                              Visio
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-[12px] border border-white/8 bg-white/5 text-white/40 transition-colors group-hover:text-white sm:flex">
                      <svg
                        className="h-3.5 w-3.5"
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
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedAppointment && (
        <>
          {!isMobile && (
            <div className="absolute inset-0 z-50">
              <RdvDetailsPanelDesktop
                selectedAppointment={selectedAppointment}
                onClose={() => setSelectedAppointment(null)}
                handleRdvUpdated={handleRdvUpdated}
                handleStatusChange={handleStatusChange}
                handlePaymentStatusChange={handlePaymentStatusChange}
                userId={userId}
              />
            </div>
          )}

          {isMobile && (
            <RdvDetailsPanelMobile
              selectedAppointment={selectedAppointment}
              onClose={() => setSelectedAppointment(null)}
              handleRdvUpdated={handleRdvUpdated}
              handleStatusChange={handleStatusChange}
              handlePaymentStatusChange={handlePaymentStatusChange}
              userId={userId}
            />
          )}
        </>
      )}
    </div>
  );
}