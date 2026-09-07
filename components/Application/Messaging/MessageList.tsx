"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, Archive, Inbox, MailOpen, MessageCircle, RefreshCw, Search } from "lucide-react";
import {
  getConversationsAction,
  type ConversationDto,
  type ConversationStatus,
  type PaginatedConversationsDto,
} from "@/lib/queries/conversation.action";
import { useMessagingContext } from "@/components/Providers/MessagingProvider";
import ApplicationToolbar from "@/components/Shared/ApplicationToolbar";
import DashboardButton from "@/components/Shared/DashboardButton";
import LockedFeatureCard from "@/components/Shared/LockedFeatureCard";
import PageHeader from "@/components/Shared/PageHeader";
import MessageListSkeleton from "@/components/Skeleton/MessageListSkeleton";
import ConversationCard from "./ConversationCard";

export default function MessageList() {
  const { data: session } = useSession();
  const isFreeAccount = session?.user?.saasPlan === "FREE";
  const { conversations, setConversations, unreadCount } = useMessagingContext();
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ConversationStatus>("ACTIVE");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchConversations = useCallback(async (page = 1, status?: ConversationStatus) => {
    try {
      setLoading(true);
      setError(null);
      const result: PaginatedConversationsDto = await getConversationsAction(page, 20, status);
      setConversations(result.data);
      setCurrentPage(result.page);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Erreur inconnue");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [setConversations]);

  useEffect(() => { fetchConversations(1, statusFilter); }, [fetchConversations, statusFilter]);
  useEffect(() => {
    const handleConversationLeft = () => fetchConversations(currentPage, statusFilter);
    window.addEventListener("conversationLeft", handleConversationLeft);
    return () => window.removeEventListener("conversationLeft", handleConversationLeft);
  }, [currentPage, fetchConversations, statusFilter]);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => {
      const otherUser = conversation.salonId === session?.user?.id ? conversation.client : conversation.salon;
      const name = (otherUser?.salonName || `${otherUser?.firstName || ""} ${otherUser?.lastName || ""}`.trim()).toLowerCase();
      return name.includes(query) || (conversation.subject || "").toLowerCase().includes(query);
    });
  }, [conversations, search, session?.user?.id]);

  const pageNumbers = useMemo(() => {
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  return (
    <section className="w-full space-y-4 pb-20 lg:pb-8">
      <PageHeader icon={<MessageCircle size={17} className="text-tertiary-400" />} title="Messagerie" />

      {!isFreeAccount && (
        <>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            <SummaryCard icon={<Inbox size={17} />} label="Conversations" value={total} />
            <SummaryCard icon={<MailOpen size={17} />} label="Non lus" value={unreadCount} accent={unreadCount > 0} />
            <SummaryCard icon={statusFilter === "ACTIVE" ? <MessageCircle size={17} /> : <Archive size={17} />} label="Vue actuelle" value={statusFilter === "ACTIVE" ? "Actives" : "Archivées"} className="col-span-2 lg:col-span-1" />
          </div>

          <ApplicationToolbar
            search={
              <label className="relative block w-full">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <span className="sr-only">Rechercher une conversation</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un client ou un sujet…" className="h-10 w-full py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 font-one" />
              </label>
            }
            filters={
              <div className="flex rounded-xl border border-white/10 bg-black/15 p-1">
                {(["ACTIVE", "ARCHIVED"] as const).map((status) => (
                  <button key={status} type="button" aria-pressed={statusFilter === status} onClick={() => { setStatusFilter(status); setCurrentPage(1); }} className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition font-one ${statusFilter === status ? "bg-tertiary-400/15 text-tertiary-400" : "text-white/45 hover:bg-white/[0.05] hover:text-white/75"}`}>
                    {status === "ACTIVE" ? <MessageCircle size={13} /> : <Archive size={13} />}{status === "ACTIVE" ? "Actives" : "Archivées"}
                  </button>
                ))}
              </div>
            }
            // summary={!loading ? `${filteredConversations.length} affichée${filteredConversations.length > 1 ? "s" : ""}` : undefined}
          />
        </>
      )}

      {isFreeAccount ? (
        <LockedFeatureCard className="dashboard-embedded-section" icon={<MessageCircle size={24} />} title="Messagerie améliorée disponible avec un abonnement" description="Débloquez les notifications en temps réel, la messagerie interne illimitée et les pièces jointes." features={["Messagerie interne illimitée", "Pièces jointes", "Réponses automatiques"]} primaryLabel="Passer à PRO" />
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-gradient-to-br from-white/[0.045] to-white/[0.015] shadow-xl shadow-black/15">
          <header className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3.5 sm:px-5">
            <div><h2 className="text-sm font-semibold text-white font-one">{statusFilter === "ACTIVE" ? "Boîte de réception" : "Conversations archivées"}</h2><p className="mt-0.5 text-[11px] text-white/40 font-two">{statusFilter === "ACTIVE" ? "Vos échanges clients les plus récents" : "Les échanges que vous avez classés"}</p></div>
            {!loading && totalPages > 1 && <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1 text-[10px] text-white/45 font-one">Page {currentPage}/{totalPages}</span>}
          </header>

          <div className="p-2 sm:p-3">
            {loading && <MessageListSkeleton />}
            {error && <EmptyState icon={<AlertCircle size={24} />} title="Impossible de charger les conversations" description={error} tone="error"><DashboardButton onClick={() => fetchConversations(1, statusFilter)} className="mt-4 !min-w-0"><RefreshCw size={14} />Réessayer</DashboardButton></EmptyState>}
            {!loading && !error && conversations.length === 0 && <EmptyState icon={statusFilter === "ACTIVE" ? <Inbox size={25} /> : <Archive size={25} />} title={statusFilter === "ACTIVE" ? "Votre boîte de réception est vide" : "Aucune conversation archivée"} description={statusFilter === "ACTIVE" ? "Les nouveaux échanges avec vos clients apparaîtront ici." : "Les conversations archivées apparaîtront ici."} />}
            {!loading && !error && conversations.length > 0 && filteredConversations.length === 0 && <EmptyState icon={<Search size={24} />} title="Aucun résultat" description={`Aucune conversation ne correspond à « ${search} ».`} />}
            {!loading && !error && filteredConversations.length > 0 && <div className="space-y-2">{filteredConversations.map((conversation) => <ConversationCard key={conversation.id} conversation={conversation} isSelected={selectedConversation?.id === conversation.id} onSelect={setSelectedConversation} currentUserId={session?.user?.id ?? undefined} />)}</div>}
          </div>

          {!loading && !error && totalPages > 1 && (
            <footer className="flex items-center justify-between gap-2 border-t border-white/[0.08] px-3 py-3 sm:px-4">
              <DashboardButton variant="secondary" onClick={() => fetchConversations(Math.max(1, currentPage - 1), statusFilter)} disabled={currentPage === 1} className="!min-w-0">Précédent</DashboardButton>
              <div className="hidden items-center gap-1 sm:flex">{pageNumbers.map((page) => <button key={page} type="button" onClick={() => fetchConversations(page, statusFilter)} aria-current={currentPage === page ? "page" : undefined} className={`h-8 min-w-8 cursor-pointer rounded-lg px-2 text-xs transition font-one ${currentPage === page ? "bg-tertiary-400 text-white" : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white"}`}>{page}</button>)}</div>
              <DashboardButton variant="secondary" onClick={() => fetchConversations(Math.min(totalPages, currentPage + 1), statusFilter)} disabled={currentPage === totalPages} className="!min-w-0">Suivant</DashboardButton>
            </footer>
          )}
        </div>
      )}
    </section>
  );
}

function SummaryCard({ icon, label, value, accent = false, className = "" }: { icon: ReactNode; label: string; value: string | number; accent?: boolean; className?: string }) {
  return <div className={`flex items-center gap-3 rounded-2xl border p-3 ${accent ? "border-tertiary-400/25 bg-tertiary-400/[0.08]" : "border-white/[0.08] bg-white/[0.025]"} ${className}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${accent ? "border-tertiary-400/25 bg-tertiary-400/10 text-tertiary-400" : "border-white/10 bg-white/[0.04] text-white/45"}`}>{icon}</span><div><p className="text-[10px] uppercase tracking-[0.1em] text-white/35 font-one">{label}</p><p className={`mt-0.5 text-sm font-semibold font-one ${accent ? "text-tertiary-400" : "text-white"}`}>{value}</p></div></div>;
}

function EmptyState({ icon, title, description, tone = "default", children }: { icon: ReactNode; title: string; description: string; tone?: "default" | "error"; children?: ReactNode }) {
  return <div className="flex min-h-72 flex-col items-center justify-center px-4 py-10 text-center"><span className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${tone === "error" ? "border-red-400/20 bg-red-400/10 text-red-300" : "border-tertiary-400/20 bg-tertiary-400/[0.08] text-tertiary-400"}`}>{icon}</span><h3 className="text-base font-semibold text-white font-one">{title}</h3><p className={`mt-1.5 max-w-md text-xs leading-relaxed font-two ${tone === "error" ? "text-red-200/70" : "text-white/40"}`}>{description}</p>{children}</div>;
}
