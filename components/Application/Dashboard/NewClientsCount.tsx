"use client";
import { useQuery } from "@tanstack/react-query";
import { UserRoundPlus } from "lucide-react";
import { newClientsCountAction } from "@/lib/queries/appointment";
import DashboardStatCard, { useDashboardMonth } from "./DashboardStatCard";
import { DashboardPeriod } from "./DashboardPrimitives";
export default function NewClientsCount({ userId }: { userId: string }) {
  const period = useDashboardMonth();
  const query = useQuery({ queryKey: ["dashboard-new-clients", userId, period.month, period.year], queryFn: async () => { const result = await newClientsCountAction(userId, period.month, period.year); if (result.error) throw new Error(result.message || "Chargement impossible."); return result; } });
  return <DashboardStatCard title="Nouveaux clients" icon={UserRoundPlus} loading={query.isPending} error={query.error} retry={query.refetch} value={Number(query.data?.newClientsCount || 0).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} description="clients ajoutés pendant ce mois" footer={<DashboardPeriod currentLabel="Ce mois-ci" label={period.label} previous={() => period.move(-1)} next={() => period.move(1)} nextDisabled={period.current} current={period.current} onCurrent={period.reset} />}><p className="text-[11px] leading-5 text-white/45">Retrouvez leur fiche et leur historique dans votre liste de clients.</p></DashboardStatCard>;
}
