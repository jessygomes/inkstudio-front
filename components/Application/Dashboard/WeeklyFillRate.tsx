"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck } from "lucide-react";
import { weeklyFillRateAction } from "@/lib/queries/appointment";
import DashboardStatCard from "./DashboardStatCard";
import { DashboardPeriod } from "./DashboardPrimitives";
const monday = () => { const day = new Date(); day.setDate(day.getDate() - (day.getDay() + 6) % 7); day.setHours(0, 0, 0, 0); return day; };
export default function WeeklyFillRate({ userId }: { userId: string }) {
  const [week, setWeek] = useState(monday);
  const end = new Date(week); end.setDate(end.getDate() + 6); end.setHours(23, 59, 59, 999);
  const query = useQuery({ queryKey: ["dashboard-fill", userId, week.toISOString()], queryFn: async () => { const result = await weeklyFillRateAction(week.toISOString(), end.toISOString()); if (result.error) throw new Error(result.message || "Chargement impossible."); return result; } });
  const move = (offset: number) => setWeek(current => { const next = new Date(current); next.setDate(next.getDate() + offset * 7); return next; });
  const current = week.getTime() === monday().getTime();
  return <DashboardStatCard title="Remplissage du planning" icon={CalendarCheck} loading={query.isPending} error={query.error} retry={query.refetch} value={Number(query.data?.fillRate || 0).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " %"} description="des créneaux occupés sur la semaine" progress={Number(query.data?.fillRate || 0)} tone="green" footer={<DashboardPeriod currentLabel="Cette semaine" label={week.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) + " – " + end.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} previous={() => move(-1)} next={() => move(1)} nextDisabled={current} current={current} onCurrent={() => setWeek(monday())} />}><dl className="flex items-center justify-between gap-2 text-[11px]"><dt className="text-white/40">Créneaux occupés</dt><dd className="tabular-nums text-white/65">{query.data?.filledSlots || 0}<span className="text-white/30"> / {query.data?.totalSlots || 0}</span></dd></dl></DashboardStatCard>;
}
