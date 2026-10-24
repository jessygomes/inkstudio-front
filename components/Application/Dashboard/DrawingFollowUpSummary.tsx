"use client";
import Link from "next/link";
import { PenTool } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDrawingCards } from "@/lib/queries/suiviDessin";
import type { DrawingCardStatus } from "@/lib/types/suiviDessin";
import { DashboardHeading, DashboardState } from "./DashboardPrimitives";
const meta: Record<DrawingCardStatus, { label: string; color: string }> = {
 A_DESSINER: { label: "À dessiner", color: "text-white/65" }, EN_COURS: { label: "En cours", color: "text-blue-300" }, A_MODIFIER: { label: "À modifier", color: "text-amber-300" }, TERMINE: { label: "Terminés", color: "text-teal-300" }, APPROUVE: { label: "Approuvés", color: "text-emerald-300" },
};
export default function DrawingFollowUpSummary({ userId }: { userId: string }) {
  const query = useQuery({ queryKey: ["dashboard-drawings", userId], queryFn: () => getDrawingCards() });
  const cards = query.data || [];
  const counts = Object.fromEntries((Object.keys(meta) as DrawingCardStatus[]).map(status => [status, cards.filter(card => card.status === status).length])) as Record<DrawingCardStatus, number>;
  const recent = cards.slice().sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0,3);
  return <section className="dashboard-panel @container h-full p-4 lg:p-5"><DashboardHeading title="Avancement des projets" description="Les étapes de préparation de vos dessins." icon={PenTool} count={cards.length} href="/suiviDessin" /><div className="mt-4">{query.isPending || query.error ? <DashboardState loading={query.isPending} error={query.error?.message} retry={() => { void query.refetch(); }} /> : <><div className="grid grid-cols-2 gap-2 @md:grid-cols-5">{(Object.keys(meta) as DrawingCardStatus[]).map(status => <div key={status} className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-3"><p className={"text-lg font-semibold tabular-nums " + meta[status].color}>{counts[status]}</p><p className="mt-1 text-[9px] text-white/45">{meta[status].label}</p></div>)}</div>{cards.length > 0 && <div className="mt-3 flex items-center justify-between gap-3 border-b border-white/[0.07] pb-3 text-[10px]"><span className="text-white/40">Dessins terminés ou approuvés</span><span className="tabular-nums text-white/65">{counts.TERMINE + counts.APPROUVE} / {cards.length}</span></div>}<div className="mt-3 space-y-2">{recent.length ? recent.map(card => { const client = card.client ?? card.clientUser; return <Link key={card.id} href={"/suiviDessin?cardId=" + encodeURIComponent(card.id)} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.015] px-3 py-3 transition hover:border-white/20 hover:bg-white/[0.035]"><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-white/80">{card.title}</p><p className="mt-1 truncate text-[10px] text-white/40">{[client?.firstName, client?.lastName].filter(Boolean).join(" ") || "Client non renseigné"}</p></div><span className={"shrink-0 rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[9px] " + meta[card.status].color}>{meta[card.status].label}</span></Link>; }) : <DashboardState message="Aucun suivi de dessin pour le moment." />}</div></>}</div></section>;
}
