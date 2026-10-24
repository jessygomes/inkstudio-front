"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getRecentUnreadConversationsAction, type UnreadConversationResponseDto } from "@/lib/queries/conversation.action";
import { DashboardHeading, DashboardState } from "./DashboardPrimitives";

export default function LastMessage({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<UnreadConversationResponseDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true); setError(null);
    try { setConversations(await getRecentUnreadConversationsAction() || []); }
    catch { setError("Impossible de charger les messages."); }
    finally { setLoading(false); }
  }, [userId]);
  useEffect(() => { void load(); }, [load]);
  return <section className="dashboard-panel flex h-full min-w-0 flex-col overflow-hidden p-4">
    <DashboardHeading title="Messages non lus" description="Les conversations à reprendre." icon={MessageSquare} count={conversations.reduce((sum, item) => sum + item.unreadCount, 0)} href="/messagerie" />
    <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain scrollbar-hidden">{loading || error ? <DashboardState loading={loading} error={error} retry={load} /> : !conversations.length ? <DashboardState message="Vous êtes à jour : aucun message non lu." /> : conversations.map(item => <Link key={item.conversationId} href={"/messagerie/" + item.conversationId} className="block cursor-pointer rounded-xl border border-white/10 bg-white/[0.015] p-3 transition hover:border-white/20 hover:bg-white/[0.035]"><div className="flex items-center gap-2.5"><div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 text-[11px] text-white/60">{item.clientImage ? <Image src={item.clientImage} alt="" fill sizes="32px" unoptimized className="object-cover" /> : [item.clientFirstName, item.clientLastName].map(name => name?.charAt(0)).join("") || "C"}</div><p className="min-w-0 flex-1 truncate text-xs font-medium text-white/85">{[item.clientFirstName, item.clientLastName].filter(Boolean).join(" ") || "Client"}</p>{item.unreadCount > 0 && <span className="dashboard-accent-count rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white/75">{item.unreadCount}</span>}</div>{item.subject && <p className="mt-2.5 truncate text-[11px] font-medium text-white/60">{item.subject}</p>}<p className="mt-1 line-clamp-2 text-[11px] leading-5 text-white/45">{item.lastMessage?.content || "Ouvrir la conversation"}</p><p className="mt-2 text-[9px] text-white/30">{new Date(item.lastMessageAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p></Link>)}</div>
  </section>;
}
