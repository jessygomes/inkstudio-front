"use client";
import { useState, type ComponentProps } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { HeartPulse, ImageIcon, MessageSquare, Star } from "lucide-react";
import { getUnansweredFollowUpsAction } from "@/lib/queries/followUp";
import NotAnswerClientReplyPanel from "./NotAnswerClientReplyPanel";
import DashboardDetailOverlay from "./DashboardDetailOverlay";
import { DashboardHeading, DashboardState, dashboardControl } from "./DashboardPrimitives";
type FollowUp = ComponentProps<typeof NotAnswerClientReplyPanel>["selectedFollowUp"];
export default function NotAnswerClient({ userId }: { userId: string }) {
  const [selected, setSelected] = useState<FollowUp | null>(null);
  const query = useQuery({ queryKey: ["dashboard-followups", userId], queryFn: async () => { const result = await getUnansweredFollowUpsAction(); if (!result.ok) throw new Error("Impossible de charger les suivis."); return (result.data.followUps || []) as FollowUp[]; } });
  const items = query.data || [];
  return <section className="dashboard-panel flex min-w-0 flex-col p-4 lg:p-5"><DashboardHeading title="Suivis en attente" description="Les retours de cicatrisation à accompagner." icon={HeartPulse} count={items.length} />
    <div className="mt-4 max-h-96 space-y-2 overflow-y-auto overscroll-contain scrollbar-hidden">{query.isPending || query.error ? <DashboardState loading={query.isPending} error={query.error?.message} retry={() => { void query.refetch(); }} /> : !items.length ? <DashboardState message="Tous les suivis ont été traités. Aucun retour en attente." /> : items.map(item => <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.015] p-3"><div className="flex items-start gap-3"><div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5 text-white/30">{item.photoUrl ? <Image src={item.photoUrl} alt="Photo de cicatrisation" fill sizes="48px" unoptimized className="object-cover" /> : <ImageIcon size={17} />}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h4 className="truncate text-xs font-medium text-white/85">{item.appointment.client.firstName} {item.appointment.client.lastName}</h4><span className="shrink-0 rounded-md border border-amber-400/15 bg-amber-400/5 px-1.5 py-0.5 text-[9px] text-amber-300">À répondre</span></div><p className="mt-1 truncate text-[10px] text-white/40">{item.appointment.title}{item.appointment.tatoueur?.name ? " · " + item.appointment.tatoueur.name : ""}</p><p className="mt-2 flex items-center gap-1.5 text-[10px] text-white/55"><Star size={11} className="text-amber-300" />{item.rating}/5<span className="ml-1 text-white/30">{new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span></p></div></div>{item.review && <p className="mt-2.5 line-clamp-2 text-[11px] leading-5 text-white/50">{item.review}</p>}<div className="mt-3 flex justify-end"><button type="button" onClick={() => setSelected(item)} className={dashboardControl}><MessageSquare size={12} />Répondre au suivi</button></div></article>)}</div>
    {selected && <DashboardDetailOverlay title="Répondre au suivi de cicatrisation" onClose={() => setSelected(null)}><NotAnswerClientReplyPanel key={selected.id} selectedFollowUp={selected} onClose={() => setSelected(null)} onReplySuccess={() => { void query.refetch(); }} /></DashboardDetailOverlay>}
  </section>;
}
