"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import { totalPaidAppointmentsAction } from "@/lib/queries/appointment";
import { loadDashboardBlock } from "@/lib/dashboard-summary";
import DashboardStatCard, { useDashboardMonth } from "./DashboardStatCard";
import { DashboardPeriod } from "./DashboardPrimitives";
export default function TotalPayed({ userId }: { userId: string }) {
  const period = useDashboardMonth();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["dashboard-paid", userId, period.month, period.year], queryFn: async () => { const result = period.current ? await loadDashboardBlock(queryClient, userId, "paid") : await totalPaidAppointmentsAction(period.month, period.year); if (result.error) throw new Error(result.message || "Chargement impossible."); return result; } });
  return <DashboardStatCard title="Montant encaissé" icon={Wallet} loading={query.isPending} error={query.error} retry={query.refetch} value={Number(query.data?.totalPaid || 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 })} description="des rendez-vous marqués comme réglés" footer={<DashboardPeriod currentLabel="Ce mois-ci" label={period.label} previous={() => period.move(-1)} next={() => period.move(1)} nextDisabled={period.current} current={period.current} onCurrent={period.reset} />}><p className="text-[11px] leading-5 text-white/45">Ce montant correspond aux paiements enregistrés dans vos rendez-vous.</p></DashboardStatCard>;
}
