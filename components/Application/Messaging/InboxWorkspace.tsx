"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";
import {
  ArrowLeft, AtSign, CheckCheck, ChevronLeft, ChevronRight, CircleAlert,
  Clock3, Facebook, ImagePlus, Instagram, Mail, MessageCircle, NotebookPen,
  PanelLeftClose, PanelLeftOpen, Plus, RefreshCw, Search, Send, SlidersHorizontal, Unplug, UserRound, Users, X,
} from "lucide-react";
import { toast } from "sonner";
import LockedFeatureCard from "@/components/Shared/LockedFeatureCard";
import ConversationRDVDetails from "./ConversationRDVDetails";
import { getTatoueursByUserIdAction } from "@/lib/queries/tatoueur";
import { searchClientsAction } from "@/lib/queries/client";
import { getUnreadMessagesCountAction } from "@/lib/queries/conversation.action";
import type { InboxImageAttachment } from "@/lib/queries/inbox.action";
import { useUploadThing } from "@/lib/utils/uploadthing";
import imageCompression from "browser-image-compression";
import {
  addInboxNoteAction, createInboxClientAction, createInboxSavedReplyAction,
  connectInstagramAction, disconnectInstagramAction, getInstagramConnectionsAction,
  getInboxMessagesAction, getInboxNotesAction, getInboxSavedRepliesAction,
  getInboxThreadAction, getInboxThreadsAction, getInboxAppointmentsAction,
  linkInboxClientAction, unlinkInboxClientAction, sendInboxReplyAction, setInboxAssignmentAction,
  setInboxMemberPermissionAction, setInboxReadStateAction, setInboxStatusAction,
} from "@/lib/queries/inbox.action";
import type {
  InboxAppointment, InboxChannel, InboxMessage, InboxNote, InboxSavedReply, InboxStatus,
  InboxThread, InstagramConnection,
} from "@/lib/queries/inbox.types";

const CHANNELS: Array<{ value: "ALL" | InboxChannel; label: string; Icon: typeof MessageCircle; comingSoon?: boolean }> = [
  { value: "ALL", label: "Tous", Icon: MessageCircle },
  { value: "INKERA", label: "Inkera", Icon: MessageCircle },
  { value: "INSTAGRAM", label: "Instagram", Icon: Instagram, comingSoon: true },
  { value: "FACEBOOK", label: "Facebook", Icon: Facebook, comingSoon: true },
  { value: "EMAIL", label: "Emails", Icon: Mail, comingSoon: true },
];

const STATUS: Array<{ value: InboxStatus; label: string }> = [
  { value: "NEW", label: "Nouveau" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "WAITING_CLIENT", label: "En attente client" },
  { value: "DONE", label: "Terminé" },
];

type TeamMember = {
  id: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  linkedUserId?: string | null;
  tatoueurUserId?: string | null;
  isLinkedAccount?: boolean;
};

type SearchClient = { id: string; firstName?: string; lastName?: string; email?: string };

const memberLabel = (member: TeamMember) =>
  member.name || [member.firstName, member.lastName].filter(Boolean).join(" ") || "Tatoueur";

const threadName = (thread: InboxThread) => {
  if (thread.linkedClient) {
    const value = [thread.linkedClient.firstName, thread.linkedClient.lastName].filter(Boolean).join(" ");
    if (value) return value;
  }
  const inkera = thread.conversation?.clientUser;
  if (inkera) return [inkera.firstName, inkera.lastName].filter(Boolean).join(" ") || inkera.email || "Client Inkera";
  const contact = thread.externalConversation?.contact;
  return contact?.displayName || contact?.username || contact?.email || "Contact externe";
};

const threadTitle = (thread: InboxThread) =>
  thread.conversation?.subject || thread.externalConversation?.subject || "Conversation";

const displayDate = (raw?: string | null) => raw
  ? new Date(raw).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
  : "";

const imageUrl = (raw?: string | null, mime?: string | null) => {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    if (mime?.startsWith('image/') || mime === 'image' || /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(raw)) return raw;
  } catch { /* URL relative ou invalide */ }
  return null;
};

const field = "w-full rounded-xl border border-white/10 bg-noir-700/80 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-tertiary-400";
const subtleButton = "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40";
const primaryButton = "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-tertiary-400 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-tertiary-500 disabled:cursor-not-allowed disabled:opacity-40";
const MAX_COMPOSER_LINES = 6;

export default function InboxWorkspace({ toolbarRight }: { toolbarRight?: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const userId = session?.user?.id;
  const isFree = session?.user?.saasPlan === "FREE";
  const isSalon = session?.user?.role === "user_salon" || session?.user?.role === "user";
  const [channel, setChannel] = useState<"ALL" | InboxChannel>("ALL");
  const [status, setStatus] = useState<"" | InboxStatus>("");
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [assignedFilter, setAssignedFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);
  const activeFilters = [status, unreadOnly, assignedFilter].filter(Boolean).length;
  const [page, setPage] = useState(1);
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const liveSocketRef = useRef<ReturnType<typeof io> | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;
  const lastSeenRef = useRef<string | null>(null);
  const [thread, setThread] = useState<InboxThread | null>(null);
  const [instagramConnections, setInstagramConnections] = useState<InstagramConnection[]>([]);
  const [instagramError, setInstagramError] = useState("");
  const [instagramLoading, setInstagramLoading] = useState(true);
  const [instagramConnecting, setInstagramConnecting] = useState(false);
  const isOwner = Boolean(thread && userId === thread.ownerUserId);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [notes, setNotes] = useState<InboxNote[]>([]);
  const [savedReplies, setSavedReplies] = useState<InboxSavedReply[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const { startUpload, isUploading } = useUploadThing("imageUploader");
  const [noteDraft, setNoteDraft] = useState("");
  const [assignment, setAssignment] = useState("");
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState<SearchClient[]>([]);
  const [newClient, setNewClient] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [replyTitle, setReplyTitle] = useState("");
  const [replyFormOpen, setReplyFormOpen] = useState(false);
  const [appointments, setAppointments] = useState<InboxAppointment[]>([]);
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [appointmentTotal, setAppointmentTotal] = useState(0);
  const [appointmentPages, setAppointmentPages] = useState(1);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<InboxAppointment | null>(null);
  const [showDetailsMobile, setShowDetailsMobile] = useState(false);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const lastRenderedMessageRef = useRef<string | null>(null);
  const forceScrollRef = useRef(false);

  useEffect(() => {
    const element = composerRef.current;
    if (!element) return;
    element.style.height = "auto";
    const styles = getComputedStyle(element);
    const lineHeight = Number.parseFloat(styles.lineHeight) || 20;
    const padding = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
    const borders = Number.parseFloat(styles.borderTopWidth) + Number.parseFloat(styles.borderBottomWidth);
    const maxHeight = lineHeight * MAX_COMPOSER_LINES + padding + borders;
    element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`;
    element.style.overflowY = element.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [draft]);

  useEffect(() => {
    const latest = messages.at(-1)?.id || null;
    if (latest === lastRenderedMessageRef.current && !forceScrollRef.current) return;
    lastRenderedMessageRef.current = latest;
    forceScrollRef.current = false;
    const container = messagesScrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  useEffect(() => {
    forceScrollRef.current = true;
    lastRenderedMessageRef.current = null;
    setShowDetailsMobile(false);
    setActiveAppointment(null);
  }, [selectedId]);

  const refreshList = useCallback(async () => {
    if (!userId || isFree) return;
    try {
      setListError("");
      const result = await getInboxThreadsAction({
        ...(channel !== "ALL" && { channel }),
        ...(status && { status }),
        ...(search.trim() && { search: search.trim() }),
        ...(unreadOnly && { unreadOnly }),
        ...(assignedFilter.startsWith('user:') && { assignedUserId: assignedFilter.slice(5) }),
        ...(assignedFilter.startsWith('artist:') && { assignedTatoueurId: assignedFilter.slice(7) }),
        page, limit: 20,
      });
      setThreads(result.data);
      setTotal(result.total);
      setTotalPages(Math.max(1, result.totalPages));
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  }, [userId, isFree, channel, status, search, unreadOnly, assignedFilter, page]);

  const syncNavbarUnread = useCallback(async () => {
    try {
      const count = await getUnreadMessagesCountAction();
      window.dispatchEvent(new CustomEvent('unreadCountChanged', { detail: { count } }));
    } catch { /* La liste reste accessible même si le badge n'est pas joignable. */ }
  }, []);

  const acknowledgeThread = useCallback(async (id: string, newestMessageId: string | undefined) => {
    const marker = `${id}:${newestMessageId || 'empty'}`;
    if (lastSeenRef.current === marker || selectedIdRef.current !== id) return;
    lastSeenRef.current = marker;
    try {
      await setInboxReadStateAction(id, false);
      setThreads((current) => current.map((item) => item.id === id ? { ...item, unreadCount: 0 } : item));
      await syncNavbarUnread();
    } catch { lastSeenRef.current = null; }
  }, [syncNavbarUnread]);

  const refreshDetail = useCallback(async (id: string) => {
    try {
      setDetailError("");
      const result = await getInboxThreadAction(id);
      const msg = await getInboxMessagesAction(id);
      const noteList = await getInboxNotesAction(id);
      if (selectedIdRef.current !== id) return;
      setThread(result);
      setAssignment(result.assignedUserId ? `user:${result.assignedUserId}` : result.assignedTatoueurId ? `artist:${result.assignedTatoueurId}` : "");
      setMessages([...msg.data].reverse());
      setNotes(noteList);
      void acknowledgeThread(id, msg.data[0]?.id);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Conversation indisponible");
    } finally {
      setDetailLoading(false);
    }
  }, [acknowledgeThread]);

  useEffect(() => {
    if (!userId || isFree) return;
    setLoading(true);
    const timeout = window.setTimeout(() => void refreshList(), 250);
    return () => window.clearTimeout(timeout);
  }, [refreshList, userId, isFree]);

  useEffect(() => {
    if (!selectedId) return;
    setDetailLoading(true);
    lastSeenRef.current = null;
    void refreshDetail(selectedId);
  }, [selectedId, refreshDetail]);

  useEffect(() => {
    if (!selectedId) { setAppointments([]); setAppointmentTotal(0); return; }
    let active = true;
    setAppointmentLoading(true);
    void getInboxAppointmentsAction(selectedId, appointmentPage).then((result) => {
      if (!active) return;
      setAppointments(result.data);
      setAppointmentTotal(result.total);
      setAppointmentPages(Math.max(1, result.totalPages));
    }).catch(() => { if (active) setAppointments([]); }).finally(() => { if (active) setAppointmentLoading(false); });
    return () => { active = false; };
  }, [selectedId, thread?.linkedClientId, appointmentPage]);

  useEffect(() => {
    if (!clientFormOpen || thread?.linkedClientId || clientQuery.trim().length < 2) {
      setClientResults([]);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      void searchClientsAction(clientQuery.trim()).then((result) => {
        if (!active) return;
        if (result.error) throw new Error(result.message);
        const clients = [...(result.clients || []), ...(result.userClients || [])] as SearchClient[];
        setClientResults([...new Map(clients.map((client) => [client.id, client])).values()]);
      }).catch(() => { if (active) setClientResults([]); });
    }, 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [clientQuery, clientFormOpen, thread?.linkedClientId]);

  useEffect(() => {
    if (!userId || isFree) return;
    void getInboxSavedRepliesAction().then(setSavedReplies).catch(() => undefined);
    if (isSalon) {
      void getTatoueursByUserIdAction(userId).then((result) => {
        if (result.ok && Array.isArray(result.data)) setTeam(result.data as TeamMember[]);
      });
    }
  }, [userId, isFree, isSalon]);

  const refreshInstagramConnections = useCallback(async () => {
    if (!userId || isFree) return;
    try {
      setInstagramError("");
      setInstagramConnections(await getInstagramConnectionsAction());
    } catch (error) {
      setInstagramError(error instanceof Error ? error.message : "Statut Instagram indisponible");
    } finally {
      setInstagramLoading(false);
    }
  }, [userId, isFree]);

  useEffect(() => { void refreshInstagramConnections(); }, [refreshInstagramConnections]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const result = url.searchParams.get("instagram");
    if (!result) return;
    if (result === "connected") toast.success("Compte Instagram autorisé. Vérifiez le statut des Webhooks.");
    else if (result === "error") toast.error("Connexion Instagram impossible. Vérifiez la configuration Meta.");
    else if (result === "cancelled") toast.message("Connexion Instagram annulée.");
    url.searchParams.delete("instagram");
    window.history.replaceState(window.history.state, "", url.toString());
    void refreshInstagramConnections();
  }, [refreshInstagramConnections]);

  const startInstagramConnection = async () => {
    setInstagramConnecting(true);
    try {
      const { authorizationUrl } = await connectInstagramAction();
      if (new URL(authorizationUrl).origin !== "https://www.instagram.com") throw new Error("URL Instagram invalide");
      window.location.assign(authorizationUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Connexion Instagram indisponible");
      setInstagramConnecting(false);
    }
  };

  const removeInstagramConnection = async (id: string) => {
    if (!window.confirm("Déconnecter Instagram ? Les conversations déjà reçues seront conservées.")) return;
    setInstagramConnecting(true);
    try {
      await disconnectInstagramAction(id);
      await refreshInstagramConnections();
      toast.success("Compte Instagram déconnecté. L’historique reste disponible.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Déconnexion impossible");
    } finally {
      setInstagramConnecting(false);
    }
  };

  useEffect(() => {
    if (!userId || isFree) return;
    const timer = window.setInterval(() => {
      void refreshList();
      if (selectedIdRef.current) void refreshDetail(selectedIdRef.current);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [userId, isFree, refreshList, refreshDetail]);

  useEffect(() => {
    if (!session?.accessToken || isFree) return;
    const base = process.env.NEXT_PUBLIC_BACK_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;
    const socket = io(`${base}/messaging`, {
      auth: { token: session.accessToken }, transports: ['websocket', 'polling'],
    });
    liveSocketRef.current = socket;
    const refresh = () => {
      void refreshList();
      if (selectedIdRef.current) void refreshDetail(selectedIdRef.current);
      void syncNavbarUnread();
    };
    socket.on('new-message', refresh);
    socket.on('inbox-message-updated', refresh);
    socket.on('unread-count-updated', refresh);
    socket.on('connect', () => {
      if (selectedIdRef.current) void refreshDetail(selectedIdRef.current);
      refresh();
    });
    return () => { if (liveSocketRef.current === socket) liveSocketRef.current = null; socket.disconnect(); };
  }, [session?.accessToken, isFree, refreshList, refreshDetail, syncNavbarUnread]);

  useEffect(() => {
    if (!thread?.conversationId || !isOwner) return;
    const socket = liveSocketRef.current;
    socket?.emit('join-conversation', { conversationId: thread.conversationId });
    return () => { socket?.emit('leave-conversation', { conversationId: thread.conversationId }); };
  }, [thread?.conversationId, isOwner]);

  const selectedName = useMemo(() => thread && threadName(thread), [thread]);

  const changeFilter = (next: () => void) => { setPage(1); next(); };

  const mutate = async (action: () => Promise<unknown>, success: string, closeClientForm = false): Promise<boolean> => {
    if (!selectedId) return false;
    setPending(true);
    try {
      await action();
      if (success) toast.success(success);
      if (closeClientForm) setClientFormOpen(false);
      await refreshDetail(selectedId);
      await refreshList();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action impossible");
      return false;
    } finally {
      setPending(false);
    }
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!thread || !["INKERA", "INSTAGRAM"].includes(thread.channel) || (!draft.trim() && !selectedImage) || pending || processingImage || isUploading) return;
    if (thread.channel === "INSTAGRAM" && draft.trim().length > 1000) return;
    const content = draft.trim();
    const image = selectedImage;
    const threadId = thread.id;
    void (async () => {
      setPending(true);
      try {
        setProcessingImage(true);
        let attachments: InboxImageAttachment[] | undefined;
        if (image) {
          if (!image.type.startsWith("image/") || image.size > 15 * 1024 * 1024) {
            throw new Error("Sélectionnez une image de moins de 15 Mo.");
          }
          const compressed = await imageCompression(image, {
            maxSizeMB: 3, maxWidthOrHeight: 1920, useWebWorker: true,
            fileType: "image/webp", initialQuality: 0.8,
          });
          if (compressed.size > 3 * 1024 * 1024) throw new Error("L'image reste trop volumineuse après compression.");
          const uploaded = await startUpload([compressed]);
          if (!uploaded?.[0]) throw new Error("Impossible d'envoyer la photo. Réessayez.");
          attachments = [{
            fileName: compressed.name, fileUrl: uploaded[0].url,
            fileType: compressed.type, fileSize: compressed.size,
            uploadThingKey: uploaded[0].key,
          }];
        }
        await sendInboxReplyAction(threadId, content || "📷 Photo", attachments);
        setDraft("");
        setSelectedImage(null);
        forceScrollRef.current = true;
        await Promise.all([refreshDetail(threadId), refreshList()]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Message non envoyé, veuillez réessayer.");
      } finally {
        setProcessingImage(false);
        setPending(false);
      }
    })();
  };

  if (sessionStatus === "loading") return <p className="p-6 text-sm text-white/60">Chargement de votre espace…</p>;
  if (isFree) return <LockedFeatureCard icon={<MessageCircle size={24} />} title="Messagerie réservée aux comptes abonnés" description="Activez votre abonnement pour centraliser vos échanges Inkera, Instagram, Facebook et vos emails." features={["Conversations Inkera", "Attribution aux tatoueurs", "Suivi client"]} primaryLabel="Passer à PRO" />;

  return (
    <section className="flex h-full min-h-0 flex-col font-one text-white">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-white/10 bg-noir-600 px-4">
        <nav className="-mb-px flex flex-wrap" aria-label="Canaux">
          {CHANNELS.map(({ value, label, Icon, comingSoon }) => (
            <button type="button" key={value} aria-pressed={channel === value}
              disabled={comingSoon} aria-disabled={comingSoon} title={comingSoon ? "Bientôt disponible" : undefined}
              onClick={() => changeFilter(() => { setChannel(value); setSelectedId(null); setThread(null); })}
              className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-medium transition ${comingSoon ? "cursor-not-allowed border-transparent text-white/25" : channel === value ? "border-tertiary-400 text-white" : "border-transparent text-white/50 hover:text-white"}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
          <span className="ml-2 flex items-center self-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/55">
            La connexion de vos comptes externes (Instagram, Facebook, Emails) sera bientôt disponible
          </span>
        </nav>
        <div className="flex items-center gap-3 py-2">
          <button type="button" className={subtleButton} onClick={() => { setLoading(true); void refreshList(); if (selectedId) void refreshDetail(selectedId); }}><RefreshCw size={14} /> Actualiser</button>
          {toolbarRight}
        </div>
      </div>

      {channel === "INSTAGRAM" && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-noir-600 px-4 py-3 text-xs">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-semibold"><Instagram size={16} className="text-tertiary-400" /> Comptes Instagram professionnels</p>
            {instagramLoading ? <p className="mt-1 text-white/45">Vérification des connexions…</p>
              : instagramError ? <p className="mt-1 text-amber-200">{instagramError}</p>
              : instagramConnections.filter((item) => item.status !== "DISCONNECTED").length === 0 ? <p className="mt-1 text-white/50">Connectez un compte pour recevoir ses messages dans Inkera Studio.</p>
              : <div className="mt-2 flex flex-wrap items-center gap-2">{instagramConnections.filter((item) => item.status !== "DISCONNECTED").map((item) => (
                <span key={item.id} className="inline-flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
                  <span className="min-w-0 truncate">@{item.displayName || item.providerAccountId}</span>
                  <span className={item.status === "ACTIVE" ? "text-emerald-300" : "text-amber-300"}>{item.status === "ACTIVE" ? "Connecté" : item.status === "ERROR" ? "Webhooks à vérifier" : "À reconnecter"}</span>
                  <button type="button" disabled={instagramConnecting} title="Déconnecter ce compte" aria-label={`Déconnecter ${item.displayName || item.providerAccountId}`} className="rounded p-0.5 text-white/50 hover:text-white disabled:opacity-40" onClick={() => void removeInstagramConnection(item.id)}><Unplug size={13} /></button>
                </span>
              ))}</div>}
            {instagramConnections.some((item) => item.status === "ERROR" && item.lastError) && <p className="mt-1 text-amber-200/90">{instagramConnections.find((item) => item.status === "ERROR")?.lastError}</p>}
          </div>
          <button type="button" disabled={instagramConnecting} onClick={() => void startInstagramConnection()} className={`${primaryButton} shrink-0 !py-2 !text-xs`}><Instagram size={14} /> {instagramConnecting ? "Redirection…" : "Connecter Instagram"}</button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-px overflow-hidden bg-white/5">
        <aside aria-hidden={!listCollapsed} className={`hidden shrink-0 justify-center overflow-hidden bg-noir-500 pt-3 transition-[width,opacity] duration-300 ease-in-out lg:flex ${listCollapsed ? "w-9 opacity-100" : "pointer-events-none w-0 opacity-0"}`}><button type="button" tabIndex={listCollapsed ? 0 : -1} aria-label="Afficher la liste des conversations" title="Afficher la liste" className={`${subtleButton} h-7 w-7 shrink-0 !rounded-md !px-0`} onClick={() => setListCollapsed(false)}><PanelLeftOpen size={14} /></button></aside>
        <aside aria-hidden={listCollapsed} className={`${listCollapsed ? "lg:pointer-events-none lg:-ml-[290px] lg:opacity-0 xl:-ml-[320px]" : "lg:ml-0 lg:opacity-100"} ${selectedId ? "hidden lg:flex" : "flex"} w-full min-w-0 flex-col bg-noir-500 transition-[margin,opacity] duration-300 ease-in-out lg:w-[290px] lg:shrink-0 xl:w-[320px]`}>
          <div className="relative flex items-center gap-2 p-3">
            <label className="relative block min-w-0 flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input aria-label="Rechercher un client ou un sujet" value={search} onChange={(event) => changeFilter(() => setSearch(event.target.value))} placeholder="Rechercher…" className={`${field} pl-9`} />
            </label>
            <button type="button" aria-label="Filtres" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)} className={`${subtleButton} relative h-[38px] w-[38px] shrink-0 !px-0 ${filtersOpen || activeFilters > 0 ? "!border-tertiary-400 !text-tertiary-400" : ""}`}>
              <SlidersHorizontal size={15} />
              {activeFilters > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tertiary-400 px-1 text-[10px] text-white">{activeFilters}</span>}
            </button>
            <button type="button" aria-label="Masquer la liste des conversations" title="Masquer la liste" className={`${subtleButton} hidden h-[38px] w-[38px] shrink-0 !px-0 lg:inline-flex`} onClick={() => { setFiltersOpen(false); setListCollapsed(true); }}><PanelLeftClose size={15} /></button>
            {filtersOpen && (
              <div className="absolute inset-x-3 top-full z-20 -mt-1 space-y-2 border border-white/10 bg-noir-700 p-3 shadow-xl">
                <select aria-label="Filtrer par statut" className={`${field} text-xs`} value={status} onChange={(event) => changeFilter(() => setStatus(event.target.value as "" | InboxStatus))}>
                  <option value="">Tous les statuts</option>
                  {STATUS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
                <button type="button" aria-pressed={unreadOnly} onClick={() => changeFilter(() => setUnreadOnly(!unreadOnly))} className={`${subtleButton} w-full ${unreadOnly ? "!border-tertiary-400 !text-tertiary-400" : ""}`}><AtSign size={13} /> Non lus uniquement</button>
                {isSalon && team.length > 0 && (
                  <select aria-label="Filtrer par tatoueur" className={`${field} text-xs`} value={assignedFilter} onChange={(event) => changeFilter(() => setAssignedFilter(event.target.value))}>
                    <option value="">Tous les tatoueurs</option>
                    {team.map((member) => { const linked = member.linkedUserId || member.tatoueurUserId; return <option key={member.id} value={linked ? `user:${linked}` : `artist:${member.id}`}>{memberLabel(member)}{linked ? " (compte Inkera)" : " (équipe interne)"}</option>; })}
                  </select>
                )}
                {activeFilters > 0 && <button type="button" className="text-xs text-white/50 underline hover:text-white" onClick={() => changeFilter(() => { setStatus(""); setUnreadOnly(false); setAssignedFilter(""); })}>Réinitialiser</button>}
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Conversations">
            {loading && <p className="px-3 py-8 text-center text-xs text-white/50">Chargement des conversations…</p>}
            {listError && <div className="space-y-2 p-4 text-sm text-red-300"><p>{listError}</p><button className={subtleButton} onClick={() => void refreshList()}>Réessayer</button></div>}
            {!loading && !listError && threads.length === 0 && (
              <div className="px-4 py-16 text-center">
                <Mail size={26} className="mx-auto mb-3 text-white/30" />
                <p className="text-sm">Aucune conversation</p>
                <p className="mt-2 text-xs leading-relaxed text-white/45">{channel === "INSTAGRAM" ? "Les conversations apparaîtront après réception d’un premier message Instagram et activation des Webhooks Meta." : channel !== "ALL" && channel !== "INKERA" ? "Ce canal n’est pas encore connecté. L’intégration des comptes externes sera la prochaine étape." : "Les nouveaux échanges Inkera apparaîtront ici. Vous pouvez aussi les lancer depuis un profil public."}</p>
              </div>
            )}
            {!loading && !listError && threads.map((item) => (
              <button key={item.id} type="button" onClick={() => { setSelectedId(item.id); setAppointmentPage(1); setDetailLoading(true); }}
                className={`w-full border-l-2 px-3 py-2 text-left transition ${selectedId === item.id ? "border-tertiary-400/50 bg-tertiary-400/15" : (item.unreadCount || 0) > 0 ? "border-tertiary-400 bg-tertiary-400/10 hover:bg-tertiary-400/15" : "border-transparent hover:border-white/10 hover:bg-white/5"}`}>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/75">{threadName(item).charAt(0).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2"><strong className={`truncate text-sm ${(item.unreadCount || 0) > 0 ? 'font-bold text-white' : 'font-medium'}`}>{threadName(item)}</strong><span className="shrink-0 text-[10px] text-white/40">{displayDate(item.lastMessageAt)}</span>{(item.unreadCount || 0) > 0 && <span aria-label={`${item.unreadCount} messages non lus`} className="rounded-full bg-tertiary-400 px-1.5 py-0.5 text-[10px] font-bold text-white">{item.unreadCount}</span>}</div>
                    <p className="mt-1 truncate text-xs text-white/50">{threadTitle(item)}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">{CHANNELS.find((entry) => entry.value === item.channel)?.label}</span>
                      {item.ownerUserId !== userId && <span className="rounded-md bg-tertiary-400/15 px-1.5 py-0.5 text-[10px] text-tertiary-400">Salon lié</span>}
                      {item.assignedUser && <span className="rounded-md bg-blue-400/10 px-1.5 py-0.5 text-[10px] text-blue-200">{item.assignedUser.firstName}</span>}
                      {item.assignedTatoueur && <span className="rounded-md bg-blue-400/10 px-1.5 py-0.5 text-[10px] text-blue-200">{item.assignedTatoueur.name}</span>}
                      <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">{STATUS.find((s) => s.value === item.status)?.label}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between p-3 text-xs text-white/55">
            <span>Page {page} / {totalPages}</span>
            <div className="flex gap-2"><button type="button" aria-label="Page précédente" className={subtleButton} disabled={page <= 1} onClick={() => setPage((v) => v - 1)}><ChevronLeft size={14} /></button><button type="button" aria-label="Page suivante" className={subtleButton} disabled={page >= totalPages} onClick={() => setPage((v) => v + 1)}><ChevronRight size={14} /></button></div>
          </div>
        </aside>

        <div className={`${selectedId ? "flex" : "hidden lg:flex"} min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-noir-700`}>
          {!selectedId ? (
            <div className="m-auto max-w-xs px-6 text-center text-white/40"><MessageCircle size={36} className="mx-auto mb-4 text-tertiary-400/40"/><p className="text-base text-white/75">Sélectionnez une conversation</p><p className="mt-2 text-xs leading-relaxed">Les messages, rendez-vous, notes et informations client seront affichés ici.</p></div>
          ) : detailLoading ? (
            <p className="m-auto text-xs text-white/50">Chargement de la conversation…</p>
          ) : detailError ? (
            <div className="m-auto space-y-3 px-5 text-center"><CircleAlert className="mx-auto text-red-300"/><p className="text-sm text-red-300">{detailError}</p><button className={subtleButton} onClick={() => selectedId && void refreshDetail(selectedId)}>Réessayer</button></div>
          ) : thread ? (
            <>
              <header className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <button type="button" aria-label="Retour aux conversations" className={`${subtleButton} lg:hidden`} onClick={() => setSelectedId(null)}><ArrowLeft size={15} /></button>
                  <div className="min-w-0"><h2 className="truncate text-sm font-semibold">{selectedName}</h2><p className="mt-1 truncate text-xs text-white/50">{threadTitle(thread)} · {CHANNELS.find(({ value }) => value === thread.channel)?.label}{thread.ownerUserId !== userId ? " · Salon lié" : ""}</p></div>
                </div>
                <div className="flex gap-1">
                  <button type="button" className={`${subtleButton} xl:hidden`} onClick={() => setShowDetailsMobile(true)}>Afficher les détails</button>
                  <button type="button" disabled={pending} className={subtleButton} onClick={() => void mutate(() => setInboxReadStateAction(thread.id, false), "Conversation marquée lue")}><CheckCheck size={13} /><span className="hidden xl:inline">Lue</span></button>
                  <button type="button" disabled={pending} className={subtleButton} onClick={() => void mutate(() => setInboxReadStateAction(thread.id, true), "Conversation marquée non lue")}><AtSign size={13} /><span className="hidden xl:inline">Non lue</span></button>
                  
                </div>
              </header>

              <div className={`grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] gap-0 overflow-hidden transition-[grid-template-columns] duration-300 ease-in-out ${listCollapsed || activeAppointment ? "xl:grid-cols-[minmax(0,1fr)_540px]" : "xl:grid-cols-[minmax(0,1fr)_340px]"}`}>
                <div className={`${showDetailsMobile || activeAppointment ? "hidden xl:flex" : "flex"} min-h-0 min-w-0 flex-col xl:h-full`}>
                  <div ref={messagesScrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                    {messages.length === 0 && <p className="py-10 text-center text-sm text-white/40">Pas encore de message dans cette conversation.</p>}
                    {messages.map((message) => {
                      const mine = message.sender?.id === userId || (thread.channel !== "INKERA" && message.direction === "OUTBOUND");
                      const fromPro = thread.channel === "INKERA" && message.sender?.id !== thread.conversation?.clientUserId;
                      const outgoing = mine || fromPro;
                      return <article key={message.id} className={`flex ${outgoing ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 ${outgoing ? "bg-tertiary-400/20 text-white" : "bg-white/10 text-white/85"}`}>
                        <p className="mb-1 text-[10px] text-white/50">{message.sender?.firstName || (outgoing ? "Équipe du salon" : "Client")} · {displayDate(message.createdAt)}</p>
                        {(() => { const value = message.content || message.contentText || ''; const inline = imageUrl(value, message.type === 'IMAGE' ? 'image/*' : null); return inline ? <a href={inline} target="_blank" rel="noopener noreferrer"><img src={inline} alt="Photo de la conversation" loading="lazy" className="max-h-80 w-auto max-w-full rounded-lg object-contain" /></a> : <p className="whitespace-pre-wrap wrap-break-word text-[13px] leading-relaxed">{value || (message.attachments?.length ? '' : 'Pièce jointe')}</p>; })()}
                        {message.attachments?.map((file) => { const link = file.fileUrl || file.url; const image = imageUrl(link, file.fileType || file.mimeType); return image ? <a className="mt-2 block" key={file.id} href={image} target="_blank" rel="noopener noreferrer"><img src={image} alt={file.fileName || 'Image jointe'} loading="lazy" className="max-h-80 w-auto max-w-full rounded-lg object-contain" /></a> : link ? <a className="mt-2 block truncate text-xs text-tertiary-400 underline" key={file.id} href={link} target="_blank" rel="noopener noreferrer">{file.fileName || "Pièce jointe"}</a> : null; })}
                      </div></article>;
                    })}
                  </div>
                  {(thread.channel === "INKERA" || (thread.channel === "INSTAGRAM" && ["ACTIVE", "ERROR"].includes(thread.externalConversation?.connection?.status || ""))) ? (
                    <div className="space-y-2 p-3">
                      <div className="flex gap-2"><select aria-label="Insérer une réponse enregistrée" className={`${field} min-w-0 flex-1 !py-1.5 text-[11px]`} defaultValue="" onChange={(event) => { const reply = savedReplies.find((item) => item.id === event.target.value); if (reply) setDraft(reply.content); event.target.value = ""; }}><option value="">Insérer une réponse enregistrée…</option>{savedReplies.filter((item) => !item.channel || item.channel === thread.channel).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
                        <button type="button" className={`${subtleButton} shrink-0 !px-2.5 !py-1.5 text-[11px]`} aria-expanded={replyFormOpen} onClick={() => setReplyFormOpen((open) => !open)}>{replyFormOpen ? <X size={12} /> : <Plus size={12} />} Nouvelle réponse</button></div>
                      {replyFormOpen && <div className="flex gap-2"><input aria-label="Titre de la réponse enregistrée" value={replyTitle} onChange={(event) => setReplyTitle(event.target.value)} placeholder="Titre (le texte saisi ci-dessous sera enregistré)" className={`${field} !py-1.5 text-[11px]`} /><button className={`${subtleButton} shrink-0 !py-1.5 text-[11px]`} type="button" disabled={pending || !replyTitle.trim() || !draft.trim()} onClick={() => void mutate(() => createInboxSavedReplyAction(replyTitle, draft, thread.channel), "Réponse enregistrée").then(async (ok) => { if (ok) { setReplyTitle(""); setReplyFormOpen(false); setSavedReplies(await getInboxSavedRepliesAction()); } })}>Enregistrer</button></div>}
                      <form onSubmit={sendMessage} className="space-y-2">
                        {selectedImage && <div className="flex items-center justify-between gap-2 rounded-lg border border-tertiary-400/20 bg-tertiary-400/5 px-3 py-2 text-xs"><span className="truncate">Image : {selectedImage.name}</span><button type="button" aria-label="Retirer l'image" onClick={() => setSelectedImage(null)}><X size={14} /></button></div>}
                        <div className="flex items-end gap-2">
                          <label className={`${subtleButton} h-11 shrink-0`} title="Joindre une image"><ImagePlus size={17} /><span className="sr-only">Joindre une image</span><input type="file" className="sr-only" accept="image/*" disabled={pending || processingImage || isUploading} onChange={(event) => { setSelectedImage(event.target.files?.[0] || null); event.target.value = ""; }} /></label>
                          <textarea ref={composerRef} aria-label="Votre réponse" value={draft} onChange={(event) => setDraft(event.target.value)} rows={1} maxLength={thread.channel === "INSTAGRAM" ? 1000 : 20000} placeholder={thread.channel === "INSTAGRAM" ? "Répondre sur Instagram…" : "Écrire un message au client…"} className={`${field} min-h-10 resize-none leading-5`} />
                          <button type="submit" className={primaryButton} disabled={pending || processingImage || isUploading || (!draft.trim() && !selectedImage)}><Send size={16} /><span className="hidden sm:inline">{processingImage || isUploading ? "Envoi…" : "Envoyer"}</span></button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 border-t border-white/10 bg-amber-400/5 p-4 text-xs leading-relaxed text-amber-200/85"><CircleAlert size={16} className="shrink-0" /><span>{thread.channel === "INSTAGRAM" ? "Ce compte Instagram est déconnecté. Reconnectez-le dans l’onglet Instagram pour répondre ; l’historique reste consultable." : `Les messages ${CHANNELS.find(({ value }) => value === thread.channel)?.label} sont en lecture seule pour le moment.`}</span></div>
                  )}
                </div>

                <aside className={`${showDetailsMobile || activeAppointment ? "flex" : "hidden xl:flex"} min-h-0 flex-col overflow-y-auto space-y-3 border-l border-white/10 p-3 text-[11px] xl:h-full [&_button]:!px-2.5 [&_button]:!py-1.5 [&_button]:!text-[11px] [&_input]:!px-2.5 [&_input]:!py-1.5 [&_input]:!text-xs [&_select]:!px-2.5 [&_select]:!py-1.5 [&_select]:!text-xs [&_textarea]:!px-2.5 [&_textarea]:!py-1.5 [&_textarea]:!text-xs`}>
                  {activeAppointment ? (
                    <div className="flex min-h-0 flex-1 flex-col">
                      <button type="button" className={`${subtleButton} mb-3 w-fit shrink-0`} onClick={() => setActiveAppointment(null)}><ArrowLeft size={13} /> Retour au suivi</button>
                      <ConversationRDVDetails conversation={{ appointmentId: activeAppointment.id, subject: activeAppointment.title, client: { firstName: activeAppointment.client?.firstName || activeAppointment.clientUser?.firstName || selectedName || 'Client', lastName: activeAppointment.client?.lastName || activeAppointment.clientUser?.lastName || '' } }} />
                    </div>
                  ) : (
                    <>
                  <button type="button" className={`${subtleButton} mb-2 w-fit xl:hidden`} onClick={() => setShowDetailsMobile(false)}><ArrowLeft size={13} /> Retour aux messages</button>
                  <div><h3 className="mb-1.5 flex items-center gap-2 font-semibold text-white"><Clock3 size={14} className="text-tertiary-400" /> Suivi</h3>
                    <select aria-label="Statut de la conversation" className={field} value={thread.status} disabled={pending} onChange={(event) => void mutate(() => setInboxStatusAction(thread.id, event.target.value as InboxStatus), "Statut mis à jour")}>
                      {STATUS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>

                  <div className="border-t border-white/10 pt-3"><h3 className="mb-1.5 flex items-center gap-2 font-semibold"><Users size={14} className="text-tertiary-400" /> Affectation</h3>
                    <p className="mb-2 text-white/50">{thread.assignedUser ? `Responsable : ${[thread.assignedUser.firstName, thread.assignedUser.lastName].filter(Boolean).join(" ")}` : thread.assignedTatoueur ? `Responsable : ${thread.assignedTatoueur.name}` : "Aucun tatoueur attribué"}</p>
                    {isOwner && isSalon && <div className="space-y-2"><select aria-label="Tatoueur responsable" value={assignment} className={field} onChange={(event) => setAssignment(event.target.value)}>
                      <option value="">Non attribuée</option>
                      {team.map((member) => { const linked = member.linkedUserId || member.tatoueurUserId; return <option key={member.id} value={linked ? `user:${linked}` : `artist:${member.id}`}>{memberLabel(member)}{linked ? " (compte Inkera)" : " (équipe interne)"}</option>; })}
                    </select>
                      <button type="button" disabled={pending} className={`${primaryButton} w-full`} onClick={() => void mutate(() => setInboxAssignmentAction(thread.id, assignment.startsWith("user:") ? { assignedUserId: assignment.slice(5) } : assignment.startsWith("artist:") ? { assignedTatoueurId: assignment.slice(7) } : {}), "Attribution mise à jour")}>Attribuer / réattribuer</button>
                      {assignment.startsWith("user:") && <button type="button" disabled={pending} className={`${subtleButton} w-full`} onClick={() => void mutate(() => setInboxMemberPermissionAction(assignment.slice(5)), "Accès autorisé à ce tatoueur")}>Autoriser à consulter et répondre</button>}
                      <p className="text-[11px] leading-relaxed text-white/40">Pour un indépendant lié au salon, autorisez d’abord l’accès, puis attribuez la conversation. Il ne verra que les conversations qui lui sont assignées.</p>
                    </div>}
                  </div>

                  <div className="border-t border-white/10 pt-3"><h3 className="mb-1.5 flex items-center gap-2 font-semibold"><UserRound size={14} className="text-tertiary-400" /> Fiche client</h3>
                    {thread.linkedClient ? <div className="relative rounded-xl bg-white/5 p-3 pr-9"><button aria-label="Dissocier la fiche client" title="Dissocier la fiche client" type="button" disabled={pending} onClick={() => void mutate(() => unlinkInboxClientAction(thread.id), "Fiche client dissociée")} className="absolute right-2 top-2 rounded-md text-white/60 hover:text-white"><X size={15} /></button><p className="font-semibold">{thread.linkedClient.firstName} {thread.linkedClient.lastName}</p><p className="mt-1 break-all text-white/50">{thread.linkedClient.email}</p><p className="mt-1 text-white/50">{thread.linkedClient.phone}</p></div> : <p className="mb-2 text-white/50">Aucune fiche client rattachée.</p>}
                    {!thread.linkedClient && <button type="button" className={`${subtleButton} mt-2 w-full`} onClick={() => setClientFormOpen(!clientFormOpen)}>{clientFormOpen ? <X size={13} /> : <Plus size={13} />}{clientFormOpen ? "Masquer" : "Associer / créer une fiche"}</button>}
                    {clientFormOpen && !thread.linkedClient && <div className="mt-3 space-y-2"><input className={field} aria-label="Rechercher une fiche client" placeholder="Nom ou email…" value={clientQuery} onChange={(event) => setClientQuery(event.target.value)} />
                      {clientResults.map((client) => <button type="button" key={client.id} className="block w-full rounded-lg border border-white/10 p-2 text-left hover:bg-white/5" disabled={pending} onClick={() => void mutate(() => linkInboxClientAction(thread.id, client.id), "Fiche client associée", true)}>{client.firstName} {client.lastName} <span className="block text-white/40">{client.email}</span></button>)}
                      <p className="pt-2 text-[11px] font-semibold uppercase tracking-widest text-white/50">Nouvelle fiche</p>
                      {(["firstName", "lastName", "email", "phone"] as const).map((key) => <input key={key} type={key === "email" ? "email" : "text"} className={field} aria-label={key} placeholder={({ firstName: "Prénom", lastName: "Nom", email: "Email", phone: "Téléphone" })[key]} value={newClient[key]} onChange={(event) => setNewClient((old) => ({ ...old, [key]: event.target.value }))} />)}
                      <button type="button" className={`${primaryButton} w-full`} disabled={pending || Object.values(newClient).some((value) => !value.trim())} onClick={() => void mutate(() => createInboxClientAction(thread.id, newClient), "Fiche client créée et associée", true)}>Créer et associer</button>
                    </div>}
                  </div>

                  <div className="border-t border-white/10 pt-3"><h3 className="mb-1.5 flex items-center gap-2 font-semibold"><CheckCheck size={14} className="text-tertiary-400" /> Rendez-vous liés ({appointmentTotal})</h3>
                    {appointmentLoading && <p className="py-2 text-white/40">Chargement…</p>}
                    {!appointmentLoading && appointments.length === 0 && <p className="py-2 text-white/40">Aucun rendez-vous pour ce client.</p>}
                    {appointments.map((item) => <button type="button" key={item.id} onClick={() => setActiveAppointment(item)} className="mb-1 block w-full rounded-lg bg-white/5 p-2 text-left transition hover:bg-white/10"><span className="block truncate font-semibold text-white/90">{[item.client?.firstName || item.clientUser?.firstName, item.client?.lastName || item.clientUser?.lastName].filter(Boolean).join(' ') || selectedName}</span><span className="mt-0.5 block truncate text-white/60">{item.prestation || item.title} · {displayDate(item.start)}</span></button>)}
                    {appointmentPages > 1 && <div className="flex items-center justify-between gap-2 pt-1"><button type="button" className={subtleButton} disabled={appointmentPage === 1} onClick={() => setAppointmentPage((v) => v - 1)}><ChevronLeft size={13} /> Précédent</button><span className="text-white/50">{appointmentPage}/{appointmentPages}</span><button type="button" className={subtleButton} disabled={appointmentPage >= appointmentPages} onClick={() => setAppointmentPage((v) => v + 1)}>Suivant <ChevronRight size={13} /></button></div>}
                  </div>

                  <div className="border-t border-white/10 pt-3"><h3 className="mb-1.5 flex items-center gap-2 font-semibold"><NotebookPen size={14} className="text-tertiary-400" /> Notes internes</h3>
                    <p className="mb-2 text-[11px] text-white/40">Notes privées de l’équipe, jamais envoyées au client.</p>
                    <div className="max-h-44 space-y-2 overflow-y-auto">{notes.map((note) => <div key={note.id} className="rounded-lg border border-amber-200/10 bg-amber-200/5 p-2.5"><p className="whitespace-pre-wrap wrap-break-word text-white/80">{note.content}</p><p className="mt-2 text-[10px] text-white/40">{note.author?.firstName || "Équipe"} · {displayDate(note.createdAt)}</p></div>)}</div>
                    <textarea aria-label="Note interne" rows={3} className={`${field} mt-2`} maxLength={5000} value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Ajouter une note interne…" />
                    <button type="button" className={`${subtleButton} mt-2 w-full`} disabled={pending || !noteDraft.trim()} onClick={() => void mutate(() => addInboxNoteAction(thread.id, noteDraft), "Note interne ajoutée").then((ok) => { if (ok) setNoteDraft(""); })}><Plus size={13} /> Ajouter la note</button>
                  </div>
                    </>
                  )}
                </aside>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
