"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronRight, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { fetchTodayAppointmentsAction, paidAppointmentsAction, waitingConfirmationAppointmentsAction } from "@/lib/queries/appointment";
import ShowRdvDetails from "../RDV/ShowRdvDetails";
import ShowRdvDetailsMobile from "../RDV/ShowRdvDetailsMobile";
import ConfirmRdv from "../RDV/ConfirmRdv";
import CancelRdv from "../RDV/CancelRdv";
import ClientAvatar from "../Clients/ClientAvatar";
import type { CalendarEvent } from "../RDV/Calendar";
import { DashboardHeading, DashboardPeriod, DashboardState } from "./DashboardPrimitives";

type Appointment = {
  id: string; title: string; start: string; end: string; status: string; prestation?: string; isPayed?: boolean;
  client: { firstName: string; lastName: string; email: string; image?: string | null; linkedUserId?: string | null };
  tatoueur?: { name: string } | null;
  tattooDetail?: { price?: number; estimatedPrice?: number } | null;
};
const statuses: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "text-amber-300 bg-amber-400/5 border-amber-400/15" },
  CONFIRMED: { label: "Confirmé", color: "text-emerald-300 bg-emerald-400/5 border-emerald-400/15" },
  COMPLETED: { label: "Terminé", color: "text-teal-300 bg-teal-400/5 border-teal-400/15" },
  CANCELED: { label: "Annulé", color: "text-red-300 bg-red-400/5 border-red-400/15" },
  NO_SHOW: { label: "Absent", color: "text-orange-300 bg-orange-400/5 border-orange-400/15" },
  RESCHEDULING: { label: "À replanifier", color: "text-blue-300 bg-blue-400/5 border-blue-400/15" },
};
const localDate = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
export type DashboardAppointmentProps = { userId: string; active?: boolean; onDetailsChange?: (open: boolean) => void };

export default function DashboardAppointments({ userId, active, onDetailsChange, mode }: DashboardAppointmentProps & { mode: "today" | "waiting" }) {
  const [date, setDate] = useState(() => localDate(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const generation = useRef(0);
  const selected = appointments.find(item => item.id === selectedId);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const update = () => setMobile(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    const request = ++generation.current;
    setLoading(true); setError(null);
    try {
      const result = mode === "today" ? await fetchTodayAppointmentsAction(date) : await waitingConfirmationAppointmentsAction();
      if (result.error) throw new Error(result.message || "Impossible de charger les rendez-vous.");
      const items: Appointment[] = result.appointments || [];
      if (request === generation.current) { setAppointments(items.slice().sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())); setSelectedId(current => items.some(item => item.id === current) ? current : null); }
    } catch (cause) { if (request === generation.current) setError(cause instanceof Error ? cause.message : "Chargement impossible."); }
    finally { if (request === generation.current) setLoading(false); }
  }, [date, mode, userId]);
  const cancelPending = useCallback(() => { generation.current++; }, []);
  useEffect(() => { void load(); return cancelPending; }, [load, cancelPending]);
  useEffect(() => { onDetailsChange?.(!!selectedId && !mobile); }, [selectedId, mobile, onDetailsChange]);
  useEffect(() => { if (active === false && !mobile) setSelectedId(null); }, [active, mobile]);
  const close = () => setSelectedId(null);
  const open = (id: string) => { onDetailsChange?.(!mobile); setSelectedId(id); };
  const changeDate = (offset: number) => { const next = new Date(date + "T12:00:00"); next.setDate(next.getDate() + offset); setDate(localDate(next)); close(); };
  const payment = async (id: string, paid: boolean) => { try { await paidAppointmentsAction(id, paid); await load(); } catch { toast.error("Impossible de mettre à jour le paiement."); } };
  const statusChanged = async (id: string, status: "COMPLETED" | "NO_SHOW") => {
    setAppointments(current => current.map(item => item.id === id ? { ...item, status } : item));
    await load();
  };
  const details = selected ? { selectedEvent: selected as unknown as CalendarEvent, onClose: close, handleRdvUpdated: load, handleStatusChange: statusChanged, handlePaymentStatusChange: payment, userId, price: selected.tattooDetail?.price ?? selected.tattooDetail?.estimatedPrice } : null;
  return <section className="dashboard-panel relative flex h-full min-w-0 flex-col overflow-hidden p-4" aria-label={mode === "today" ? "Rendez-vous du jour" : "Rendez-vous en attente"}>
    {details && !mobile ? <div className="absolute inset-0 overflow-hidden rounded-2xl"><ShowRdvDetails {...details} /></div> : <>
      <DashboardHeading title={mode === "today" ? "RDV du jour" : "RDV en attente"} description={mode === "today" ? "Votre planning, en un coup d’œil." : "Les demandes à confirmer."} icon={mode === "today" ? CalendarDays : Clock3} count={appointments.length} href="/mes-rendez-vous" />
      
      {mode === "today" && <div className="mb-3 mt-4"><DashboardPeriod label={new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} previous={() => changeDate(-1)} next={() => changeDate(1)} current={date === localDate(new Date())} onCurrent={() => setDate(localDate(new Date()))} /></div>}
      <div className={"scrollbar-hidden min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain" + (mode === "waiting" ? " mt-4" : "")}>{loading || error ? <DashboardState loading={loading} error={error} retry={load} /> : !appointments.length ? <DashboardState message={mode === "today" ? "Aucun rendez-vous pour cette journée." : "Aucune demande en attente de confirmation."} /> : appointments.map(item => {
        const status = statuses[item.status] || { label: item.status, color: "border-white/10 text-white/50" };
        return <article key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.015] transition hover:border-white/20"><button type="button" onClick={() => open(item.id)} className="w-full cursor-pointer p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tertiary-400"><div className="mb-2 flex items-center justify-between gap-2"><span className="text-[11px] font-medium tabular-nums text-white/65">{mode === "waiting" && new Date(item.start).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) + " · "}{new Date(item.start).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}<span className="ml-1 text-white/30">— {new Date(item.end).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span></span><span className={"shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] " + status.color}>{status.label}</span></div><div className="flex items-center gap-2.5"><ClientAvatar client={item.client} className="size-8 rounded-lg" /><div className="min-w-0 flex-1"><h4 className="truncate text-xs font-medium text-white/85">{item.client.firstName} {item.client.lastName}</h4><p className="mt-1 truncate text-[10px] text-white/40">{item.title || item.prestation}{item.tatoueur?.name ? " · " + item.tatoueur.name : ""}</p></div><ChevronRight size={14} className="shrink-0 text-white/25" /></div></button>{mode === "waiting" && item.status === "PENDING" && <div className="grid grid-cols-2 gap-2 border-t border-white/[0.06] px-3 py-2 [&>button]:min-h-8 [&>button]:py-1.5 [&>button]:text-[10px]"><ConfirmRdv rdvId={item.id} appointment={item} onConfirm={load} /><CancelRdv rdvId={item.id} appointment={item} onCancel={load} /></div>}</article>;
      })}</div>
    </>}{details && mobile && <ShowRdvDetailsMobile {...details} />}
  </section>;
}
