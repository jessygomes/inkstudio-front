"use client";
import { useQuery } from "@tanstack/react-query";
import { CalendarX2 } from "lucide-react";
import { cancelRateAction } from "@/lib/queries/appointment";
import DashboardStatCard from "./DashboardStatCard";
export default function CancelFillRate({ userId }: { userId: string }) {
  const query = useQuery({ queryKey: ["dashboard-cancellations", userId], queryFn: async () => { const result = await cancelRateAction(); if (result.error) throw new Error(result.message || "Chargement impossible."); return result; } });
  return <DashboardStatCard title="Taux d’annulation" icon={CalendarX2} loading={query.isPending} error={query.error} retry={query.refetch} value={Number(query.data?.cancellationRate || 0).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " %"} description="sur l’ensemble de vos rendez-vous" progress={Number(query.data?.cancellationRate || 0)} tone="red" footer={<p className="border-t border-white/[0.07] py-2.5 text-[10px] text-white/35">Toutes les périodes</p>}><dl className="grid grid-cols-2 gap-x-4 gap-y-2">{[{ label: "Annulés", count: query.data?.cancelledAppointments }, { label: "Total RDV", count: query.data?.totalAppointments }, { label: "Confirmés", count: query.data?.confirmedAppointments }, { label: "Terminés", count: query.data?.completedAppointments }].map(item => <div key={item.label} className="flex items-center justify-between gap-2 text-[10px]"><dt className="text-white/40">{item.label}</dt><dd className="tabular-nums text-white/70">{item.count || 0}</dd></div>)}</dl></DashboardStatCard>;
}
