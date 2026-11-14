"use client";
import NotificationBadge from "@/components/Shared/NotificationBadge";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { io } from "socket.io-client";
import {
  ArrowLeft, AtSign, CheckCheck, ChevronLeft, ChevronRight, CircleAlert,
  CalendarDays, CalendarPlus, Clock3, Eye, Facebook, ImagePlus, Instagram, Lock, Mail, MessageCircle, NotebookPen,
  PanelLeftClose, PanelLeftOpen, Plus, RefreshCw, Search, Send, SlidersHorizontal, Unplug, UserPlus, UserRound, Users, X, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import ConversationRDVDetails from "./ConversationRDVDetails";
import BookingLinkCreator, { type BookingLinkCreatorContext } from "@/components/Application/BookingLinks/BookingLinkCreator";
import styles from "./InboxWorkspace.module.css";
import { sortInboxThreads } from "@/lib/utils/sort-inbox-threads";
import { getTatoueursByUserIdAction } from "@/lib/queries/tatoueur";
import { getSalonClientsAction, searchClientsAction } from "@/lib/queries/client";
import InfoClient from "@/components/Application/Clients/InfoClient";
import type { ClientProps } from "@/lib/type";
import { getUnreadMessagesCountAction } from "@/lib/queries/conversation.action";
import type { InboxImageAttachment } from "@/lib/queries/inbox.action";
import { useUploadThing } from "@/lib/utils/uploadthing";
import imageCompression from "browser-image-compression";
import RdvActionButton from "@/components/Application/RDV/RdvActionButton";
import FilterSelect from "@/components/Shared/FilterSelect";
import {
  addInboxNoteAction, createInboxClientAction, createInboxSavedReplyAction,
  connectInstagramAction, disconnectInstagramAction, getInstagramConnectionsAction,
  getInboxMessagesAction, getInboxNotesAction, getInboxSavedRepliesAction,
  getInboxThreadAction, getInboxThreadsAction, getInboxAppointmentsAction,
  linkInboxClientAction, sendInboxReplyAction, setInboxAssignmentAction,
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

type SearchClient = { id: string; firstName?: string; lastName?: string; email?: string };

const STATUS_TONES: Record<InboxStatus, string> = {
  NEW: "bg-blue-400/15 text-blue-300",
  IN_PROGRESS: "bg-amber-400/15 text-amber-300",
  WAITING_CLIENT: "bg-orange-400/15 text-orange-300",
  DONE: "bg-emerald-400/15 text-emerald-300",
};

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

function ThreadAvatar({ thread, large = false }: { thread: InboxThread; large?: boolean }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = thread.conversation?.clientUser?.image?.trim() || thread.linkedClient?.image?.trim();
  return (
    <span aria-hidden="true" className={`relative ${large ? "h-11 w-11 text-sm" : "h-9 w-9 text-xs"} flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 font-bold text-white/75`}>
      {source && source !== failedSource ? (
        <Image src={source} alt="" width={44} height={44} sizes="44px" className="h-full w-full object-cover" onError={() => setFailedSource(source)} />
      ) : threadName(thread).charAt(0).toUpperCase()}
    </span>
  );
}

const lastMessagePreview = (thread: InboxThread, userId?: string) => {
  const message = thread.lastMessage;
  if (!message) return "Aucun message";
  const text = message.content?.trim();
  const mine = message.direction === "OUTBOUND" || (!!userId && message.senderId === userId);
  const body = text ? text : /image|photo/i.test(message.type || "") ? "📷 Photo" : "Message";
  return (mine ? "Vous : " : "") + body;
};

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

const field = "[&>option]:bg-noir-700 [&>option]:text-white w-full rounded-xl border border-white/10 bg-noir-700/80 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-tertiary-400";
const subtleButton = "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-tertiary-400/10 px-3 py-2 text-xs text-white/80 transition hover:bg-tertiary-400/15 disabled:cursor-not-allowed disabled:opacity-40";
const primaryButton = "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-tertiary-400 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-tertiary-500 disabled:cursor-not-allowed disabled:opacity-40";
// Champs du panneau de droite : fond translucide sans contour, anneau d'accent au focus.
const panelField = "[&>option]:bg-noir-700 [&>option]:text-white h-10 w-full rounded-xl border border-transparent bg-white/[0.06] px-3 text-xs text-white outline-none transition placeholder:text-white/35 hover:bg-white/[0.09] focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/15 disabled:opacity-50";

// Section du panneau de droite : carte avec titre (icône dans une tuile d'accent), aide facultative et contenu.
function PanelSection({ icon: Icon, title, hint, right, children }: { icon: LucideIcon; title: string; hint?: string; right?: ReactNode; children: ReactNode }) {
  return <section className="rounded-2xl bg-noir-600 p-4">
    <div className="mb-3 flex items-center justify-between gap-2"><h3 className="flex min-w-0 items-center gap-2.5 text-[13px] font-medium text-white/90"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-tertiary-400/10 text-tertiary-400"><Icon size={14} aria-hidden="true" /></span><span className="truncate">{title}</span></h3>{right}</div>
    {hint && <p className="mb-3 -mt-1 text-[11px] leading-relaxed text-white/40">{hint}</p>}
    {children}
  </section>;
}

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
  const sortedThreads = useMemo(() => sortInboxThreads(threads), [threads]);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const listRequestRef = useRef(0);
  const listFetchingRef = useRef(false);
  const loadedPagesRef = useRef(1);
  const workspaceRef = useRef<HTMLElement>(null);
  const threadListRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef(0);
  const [listError, setListError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const liveSocketRef = useRef<ReturnType<typeof io> | null>(null);
  // « Le client écrit… » : affichage (user-typing reçu) et émission de notre propre frappe.
  const [peerTyping, setPeerTyping] = useState(false);
  const peerTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const typingState = useRef<{ active: boolean; timer: ReturnType<typeof setTimeout> | null }>({ active: false, timer: null });
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
  const [clientFormOpen, setClientFormOpen] = useState(false); // panneau « Relier un client »
  const [clientFile, setClientFile] = useState<ClientProps | null>(null); // fiche client ouverte depuis la conversation
  const [clientFileLoading, setClientFileLoading] = useState(false);
  const [replyTitle, setReplyTitle] = useState("");
  const [replyFormOpen, setReplyFormOpen] = useState(false);
  const [appointments, setAppointments] = useState<InboxAppointment[]>([]);
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [appointmentTotal, setAppointmentTotal] = useState(0);
  const [appointmentPages, setAppointmentPages] = useState(1);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<InboxAppointment | null>(null);
  const [showDetailsMobile, setShowDetailsMobile] = useState(false);
  const [bookingLinkOpen, setBookingLinkOpen] = useState(false);
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

  const fetchListPage = useCallback((requestedPage: number) => getInboxThreadsAction({
    ...(channel !== "ALL" && { channel }),
    ...(status && { status }),
    ...(search.trim() && { search: search.trim() }),
    ...(unreadOnly && { unreadOnly }),
    ...(assignedFilter.startsWith('user:') && { assignedUserId: assignedFilter.slice(5) }),
    ...(assignedFilter.startsWith('artist:') && { assignedTatoueurId: assignedFilter.slice(7) }),
    page: requestedPage, limit: 20,
  }), [channel, status, search, unreadOnly, assignedFilter]);

  const refreshList = useCallback(async () => {
    if (!userId || listFetchingRef.current) return;
    listFetchingRef.current = true;
    const request = ++listRequestRef.current;
    try {
      setListError("");
      const results = await Promise.all(Array.from({ length: loadedPagesRef.current }, (_, index) => fetchListPage(index + 1)));
      if (request !== listRequestRef.current) return;
      const result = results[0];
      setThreads([...new Map(results.flatMap((item) => item.data).map((item) => [item.id, item])).values()]);
      setTotal(result.total);
      setTotalPages(Math.max(1, result.totalPages));
      loadedPagesRef.current = Math.min(loadedPagesRef.current, Math.max(1, result.totalPages));
      setPage(loadedPagesRef.current);
    } catch (error) {
      if (request === listRequestRef.current) setListError(error instanceof Error ? error.message : "Chargement impossible");
    } finally {
      if (request === listRequestRef.current) {
        listFetchingRef.current = false;
        setLoading(false);
      }
    }
  }, [userId, fetchListPage]);

  const loadMore = useCallback(async () => {
    if (!userId || listFetchingRef.current || loadedPagesRef.current >= totalPages) return;
    listFetchingRef.current = true;
    setLoadingMore(true);
    setLoadMoreError("");
    const request = ++listRequestRef.current;
    const nextPage = loadedPagesRef.current + 1;
    try {
      const result = await fetchListPage(nextPage);
      if (request !== listRequestRef.current) return;
      setThreads((current) => [...new Map([...current, ...result.data].map((item) => [item.id, item])).values()]);
      loadedPagesRef.current = nextPage;
      setPage(nextPage);
      setTotal(result.total);
      setTotalPages(Math.max(1, result.totalPages));
    } catch (error) {
      if (request === listRequestRef.current) setLoadMoreError(error instanceof Error ? error.message : "Chargement impossible");
    } finally {
      if (request === listRequestRef.current) {
        listFetchingRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [userId, totalPages, fetchListPage]);

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
    if (!userId) return;
    const invalidateRequests = () => {
      listRequestRef.current++;
      listFetchingRef.current = false;
    };
    invalidateRequests();
    loadedPagesRef.current = 1;
    setPage(1);
    setThreads([]);
    setTotalPages(1);
    setLoadMoreError("");
    setLoadingMore(false);
    setLoading(true);
    const timeout = window.setTimeout(() => void refreshList(), 250);
    return () => {
      window.clearTimeout(timeout);
      invalidateRequests();
    };
  }, [refreshList, userId, isFree]);

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>("[data-app-mobile-nav]");
    if (!nav) return;
    const updateHeight = () => workspaceRef.current?.style.setProperty("--inbox-nav-height", `${nav.getBoundingClientRect().height}px`);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [sessionStatus]);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const frame = window.requestAnimationFrame(() => window.scrollTo({ top: selectedId ? 0 : listScrollRef.current, behavior: "instant" }));
    return () => window.cancelAnimationFrame(frame);
  }, [selectedId]);

  useEffect(() => {
    if (loading || loadingMore || listError || loadMoreError || page >= totalPages) return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    let observer: IntersectionObserver | undefined;
    const observe = () => {
      observer?.disconnect();
      if ((!desktop.matches && selectedId) || (desktop.matches && listCollapsed)) return;
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) void loadMore();
      }, { root: desktop.matches ? threadListRef.current : null, rootMargin: "200px" });
      observer.observe(sentinel);
    };
    observe();
    desktop.addEventListener("change", observe);
    return () => { observer?.disconnect(); desktop.removeEventListener("change", observe); };
  }, [loading, loadingMore, listError, loadMoreError, page, totalPages, selectedId, listCollapsed, loadMore, threads]);

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
    if (!userId) return;
    void getInboxSavedRepliesAction().then(setSavedReplies).catch(() => undefined);
    if (isSalon) {
      void getTatoueursByUserIdAction(userId).then((result) => {
        if (result.ok && Array.isArray(result.data)) setTeam(result.data as TeamMember[]);
      });
    }
  }, [userId, isFree, isSalon]);

  const refreshInstagramConnections = useCallback(async () => {
    if (!userId) return;
    try {
      setInstagramError("");
      setInstagramConnections(await getInstagramConnectionsAction());
    } catch (error) {
      setInstagramError(error instanceof Error ? error.message : "Statut Instagram indisponible");
    } finally {
      setInstagramLoading(false);
    }
  }, [userId]);

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
    if (!userId) return;
    const timer = window.setInterval(() => {
      void refreshList();
      if (selectedIdRef.current) void refreshDetail(selectedIdRef.current);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [userId, isFree, refreshList, refreshDetail]);

  useEffect(() => {
    if (!session?.accessToken) return;
    const base = process.env.NEXT_PUBLIC_BACK_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;
    const socket = io(`${base}/messaging`, {
      // Sans tryAllTransports, un échec du websocket (proxy, réseau d'entreprise…) n'essaie jamais le polling HTTP.
      auth: { token: session.accessToken }, transports: ['websocket', 'polling'], tryAllTransports: true,
    });
    liveSocketRef.current = socket;
    const refresh = () => {
      void refreshList();
      if (selectedIdRef.current) void refreshDetail(selectedIdRef.current);
      void syncNavbarUnread();
    };
    socket.on('new-message', (message: { conversationId?: string; sender?: { id?: string } }) => {
      // Son auteur vient d'envoyer : il n'est plus « en train d'écrire ».
      if (message?.conversationId === conversationIdRef.current && message.sender?.id !== userId) setPeerTyping(false);
      refresh();
    });
    socket.on('inbox-message-updated', refresh);
    socket.on('unread-count-updated', refresh);
    socket.on('user-typing', (event: { conversationId?: string; userId?: string }) => {
      if (event?.conversationId !== conversationIdRef.current || event.userId === userId) return;
      setPeerTyping(true);
      if (peerTypingTimer.current) clearTimeout(peerTypingTimer.current);
      peerTypingTimer.current = setTimeout(() => setPeerTyping(false), 4000);
    });
    socket.on('user-stopped-typing', (event: { conversationId?: string }) => {
      if (event?.conversationId === conversationIdRef.current) setPeerTyping(false);
    });
    socket.on('connect', () => {
      if (selectedIdRef.current) void refreshDetail(selectedIdRef.current);
      refresh();
    });
    return () => { if (liveSocketRef.current === socket) liveSocketRef.current = null; socket.disconnect(); };
  }, [session?.accessToken, isFree, userId, refreshList, refreshDetail, syncNavbarUnread]);

  useEffect(() => {
    if (!thread?.conversationId || !isOwner) return;
    const socket = liveSocketRef.current;
    const conversationId = thread.conversationId;
    const state = typingState.current; // même objet pendant toute la vie du composant
    socket?.emit('join-conversation', { conversationId });
    return () => {
      socket?.emit('leave-conversation', { conversationId });
      // On arrête notre indicateur et on masque celui du client pour la conversation quittée.
      if (state.timer) clearTimeout(state.timer);
      state.timer = null;
      if (state.active) socket?.emit('user-stopped-typing', { conversationId });
      state.active = false;
      setPeerTyping(false);
    };
  }, [thread?.conversationId, isOwner]);

  useEffect(() => { conversationIdRef.current = thread?.conversationId ?? null; }, [thread?.conversationId]);

  // Notre frappe : un signal au début, un arrêt après 2 s d'inactivité (comme la messagerie du site People).
  const endTyping = useCallback(() => {
    const state = typingState.current;
    if (state.timer) clearTimeout(state.timer);
    state.timer = null;
    const conversationId = conversationIdRef.current;
    if (state.active && conversationId) liveSocketRef.current?.emit('user-stopped-typing', { conversationId });
    state.active = false;
  }, []);

  const handleDraftChange = (value: string) => {
    setDraft(value);
    const conversationId = conversationIdRef.current;
    if (!conversationId || !isOwner || thread?.channel !== 'INKERA') return;
    if (!value) { endTyping(); return; }
    const state = typingState.current;
    if (!state.active) { liveSocketRef.current?.emit('user-typing', { conversationId }); state.active = true; }
    if (state.timer) clearTimeout(state.timer);
    state.timer = setTimeout(endTyping, 2000);
  };

  const selectedName = useMemo(() => thread && threadName(thread), [thread]);

  // Proposer un RDV : l'envoi direct n'est possible que si le composer existant l'est aussi.
  const canReplyInThread = Boolean(thread) && !thread?.contactBlocked && !thread?.conversation?.projectContactPending && !isFree
    && (thread?.channel === "INKERA" || (thread?.channel === "INSTAGRAM" && ["ACTIVE", "ERROR"].includes(thread?.externalConversation?.connection?.status || "")));
  const bookingLinkContext = useMemo<BookingLinkCreatorContext | null>(() => {
    if (!thread) return null;
    const fullName = (person?: { firstName?: string | null; lastName?: string | null } | null) => [person?.firstName, person?.lastName].filter(Boolean).join(" ");
    const channelLabel = CHANNELS.find(({ value }) => value === thread.channel)?.label;
    const isArtistAccount = session?.user?.role === "user_tatoueur";
    return {
      origin: "conversation",
      originLabel: `Conversation avec ${selectedName || "le client"}${channelLabel ? ` · ${channelLabel}` : ""}`,
      inboxThreadId: thread.id,
      ownerUserId: thread.ownerUserId,
      initialTatoueurId: thread.assignedTatoueurId ?? (thread.assignedUserId ? `linked_${thread.assignedUserId}` : undefined),
      initialTatoueurLabel: thread.assignedTatoueur?.name || fullName(thread.assignedUser) || undefined,
      initialVenueSalonId: isArtistAccount && thread.ownerUserId !== userId ? thread.ownerUserId : undefined,
      // Seules les associations confirmées sont reprises : jamais de rapprochement automatique d'un contact externe.
      client: thread.linkedClient
        ? { label: fullName(thread.linkedClient) || "Fiche client", detail: thread.linkedClient.email }
        : thread.channel === "INKERA" && thread.conversation?.clientUser
          ? { label: fullName(thread.conversation.clientUser) || selectedName || "Client Inkera", detail: "Compte client Inkera" }
          : undefined,
      clientNotice: thread.channel !== "INKERA" && !thread.linkedClientId
        ? "Ce contact n’est relié à aucune fiche client : le lien ne sera associé à aucune fiche. Pour l’associer, utilisez « Associer / créer une fiche » dans le panneau de la conversation avant de générer le lien."
        : undefined,
    };
  }, [thread, selectedName, session?.user?.role, userId]);

  const changeFilter = (next: () => void) => { next(); };

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
    endTyping();
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
          const uploaded = await startUpload([compressed], {});
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

  // Ouvre la fiche client complète (la même que sur la page Clients) pour la personne de cette conversation.
  const openClientFile = async () => {
    if (clientFileLoading || !thread) return;
    const email = thread.linkedClient?.email || thread.conversation?.clientUser?.email || "";
    setClientFileLoading(true);
    try {
      const data = await getSalonClientsAction(1, email || selectedName || "");
      const list: ClientProps[] = Array.isArray(data?.clients) ? data.clients : [];
      const found = list.find((candidate) => (thread.linkedClientId && candidate.id === thread.linkedClientId) || (email && candidate.email === email));
      if (found) setClientFile(found);
      else toast.error("Aucune fiche client associée à cette conversation.");
    } catch {
      toast.error("Impossible de charger la fiche client.");
    } finally {
      setClientFileLoading(false);
    }
  };

  if (sessionStatus === "loading") return <p className="p-6 text-sm text-white/60">Chargement de votre espace…</p>;
  return (
    <section ref={workspaceRef} data-conversation-open={Boolean(selectedId)} className={`${styles.workspace} flex min-h-0 flex-col font-one text-white lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:grid-rows-[auto_auto_minmax(0,1fr)]`}>
      <div className={`${selectedId ? "hidden lg:flex" : "flex"} shrink-0 flex-nowrap items-center justify-between gap-x-4 gap-y-2 bg-[var(--app-surface-raised)] px-3 py-2 lg:col-start-2 lg:row-start-1 lg:px-4`}>
        <div className="relative flex min-w-0 flex-1 items-center gap-2">
          <button type="button" aria-label={listCollapsed ? "Afficher la liste des conversations" : "Masquer la liste des conversations"} title={listCollapsed ? "Afficher la liste" : "Masquer la liste"} aria-pressed={listCollapsed} className={`${subtleButton} hidden h-10 w-10 shrink-0 !border-transparent !bg-white/[0.04] !px-0 hover:!bg-white/[0.09] lg:inline-flex`} onClick={() => { setFiltersOpen(false); setListCollapsed((collapsed) => !collapsed); }}>{listCollapsed ? <PanelLeftOpen size={15} aria-hidden="true" /> : <PanelLeftClose size={15} aria-hidden="true" />}</button>
          <label className="relative block min-w-0 flex-1 lg:w-64 lg:flex-none">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input aria-label="Rechercher un client ou un sujet" value={search} onChange={(event) => changeFilter(() => setSearch(event.target.value))} placeholder="Rechercher…" className="h-10 w-full rounded-xl bg-white/[0.04] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/35 hover:bg-white/[0.09] focus:ring-2 focus:ring-tertiary-400/30" />
        </label>
          <div className="w-36 shrink-0 sm:w-52">
          <FilterSelect buttonClassName="flex h-10 w-full min-w-0 items-center gap-2 rounded-xl bg-white/[0.04] px-3 text-left text-xs text-white/80 outline-none transition hover:bg-white/[0.09] focus-visible:ring-2 focus-visible:ring-tertiary-400/30" label="Canal de conversation" placeholder="Tous les canaux" unit="canal" icon={<MessageCircle size={14} aria-hidden="true" />} multiple={false} align="left"
            selected={channel === "ALL" ? [] : [channel]}
            options={CHANNELS.filter(({ value }) => value !== "ALL").map(({ value, label, comingSoon }) => ({ value, label, disabled: comingSoon }))}
            onApply={(values) => changeFilter(() => { setChannel((values[0] as InboxChannel | undefined) || "ALL"); setSelectedId(null); setThread(null); })} />
          </div>
          {/* Le panneau des filtres s'ouvre juste sous le bouton Filtres. */}
          <div className="relative shrink-0">
            <button type="button" aria-label="Filtres" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)} className={`${subtleButton} relative h-10 w-10 shrink-0 !border-transparent !bg-white/[0.04] !px-0 hover:!bg-white/[0.09] ${filtersOpen || activeFilters > 0 ? "!border-tertiary-400 !text-tertiary-400" : ""}`}>
              <SlidersHorizontal size={15} />
              {activeFilters > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tertiary-400 px-1 text-[10px] text-white">{activeFilters}</span>}
            </button>
            {filtersOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] space-y-2 rounded-xl border border-white/10 bg-noir-700 p-3 shadow-xl">
                <select aria-label="Filtrer par statut" className={`${field} text-xs`} value={status} onChange={(event) => changeFilter(() => setStatus(event.target.value as "" | InboxStatus))}>
                  <option value="">Tous les statuts</option>
                  {STATUS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
                <RdvActionButton tone={unreadOnly ? "primary" : "neutral"} icon={AtSign} aria-pressed={unreadOnly} onClick={() => changeFilter(() => setUnreadOnly(!unreadOnly))}>Non lus uniquement</RdvActionButton>
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
        </div>
        {toolbarRight && <div className="flex items-center gap-2">{toolbarRight}</div>}
        <button type="button" aria-label="Actualiser les conversations" title="Actualiser" disabled={loading || loadingMore} className={`${subtleButton} h-10 w-10 shrink-0 ml-auto !border-transparent !bg-white/[0.04] !px-0 hover:!bg-white/[0.09]`} onClick={() => { void refreshList(); if (selectedId) void refreshDetail(selectedId); }}><RefreshCw size={15} className={loading || loadingMore ? "motion-safe:animate-spin" : ""} aria-hidden="true" /></button>
      </div>

      {channel === "INSTAGRAM" && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 bg-noir-600 px-4 py-3 text-xs lg:col-start-2 lg:row-start-2">
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

      <div className={`${styles.columns} flex min-h-0 flex-1 gap-px bg-white/5 lg:contents`}>
        <aside className={`${listCollapsed ? "lg:invisible lg:pointer-events-none lg:-ml-[290px] lg:opacity-0 xl:-ml-[320px]" : "lg:ml-0 lg:opacity-100"} ${selectedId ? "hidden lg:flex" : "flex"} w-full min-w-0 flex-col bg-noir-700 transition-[margin,opacity] duration-300 ease-in-out lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:min-h-0 lg:w-[290px] lg:shrink-0 lg:overflow-hidden xl:w-[320px]`}>

          <div ref={threadListRef} className={`${styles.threadList} scrollbar-hidden min-h-0 flex-1 p-2`} aria-label="Conversations" aria-busy={loading || loadingMore}>
            {loading && <p className="px-3 py-8 text-center text-xs text-white/50">Chargement des conversations…</p>}
            {listError && <div className="space-y-2 p-4 text-sm text-red-300"><p>{listError}</p><button className={subtleButton} onClick={() => void refreshList()}>Réessayer</button></div>}
            {!loading && !listError && threads.length === 0 && (
              <div className="px-4 py-16 text-center">
                <Mail size={26} className="mx-auto mb-3 text-white/30" />
                <p className="text-sm">Aucune conversation</p>
                <p className="mt-2 text-xs leading-relaxed text-white/45">{channel === "INSTAGRAM" ? "Les conversations apparaîtront après réception d’un premier message Instagram et activation des Webhooks Meta." : channel !== "ALL" && channel !== "INKERA" ? "Ce canal n’est pas encore connecté. L’intégration des comptes externes sera la prochaine étape." : "Les nouveaux échanges Inkera apparaîtront ici. Vous pouvez aussi les lancer depuis un profil public."}</p>
              </div>
            )}
            {!loading && sortedThreads.map((item) => {
              const unread = item.unreadCount || 0;
              const selected = selectedId === item.id;
              const channelLabel = CHANNELS.find((entry) => entry.value === item.channel)?.label;
              const assignee = item.assignedUser?.firstName || item.assignedTatoueur?.name;
              return (
              <button key={item.id} type="button" onClick={() => { listScrollRef.current = window.scrollY; setSelectedId(item.id); setAppointmentPage(1); setDetailLoading(true); }}
                className={`group mb-1 w-full rounded-2xl px-3 py-3 text-left transition ${selected ? "bg-tertiary-400/15" : unread > 0 ? "bg-white/[0.05] hover:bg-white/[0.08]" : "hover:bg-white/[0.05]"}`}>
                <div className="flex items-start gap-3">
                  <ThreadAvatar thread={item} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <strong className={`truncate text-sm ${unread > 0 ? "font-semibold text-white" : "font-medium text-white/85"}`}>{threadName(item)}</strong>
                      <span className={`shrink-0 text-[10px] ${unread > 0 ? "text-tertiary-400" : "text-white/35"}`}>{displayDate(item.lastMessageAt)}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className={`min-w-0 flex-1 truncate text-xs ${unread > 0 ? "text-white/80" : "text-white/45"}`}>{lastMessagePreview(item, userId)}</p>
                      <NotificationBadge count={unread} label="messages non lus" />
                    </div>
                    {(item.channel !== "INKERA" || item.ownerUserId !== userId || assignee) && <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      {item.channel !== "INKERA" && <span className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[10px] text-white/55">{channelLabel}</span>}
                      {item.ownerUserId !== userId && <span className="rounded-md bg-tertiary-400/10 px-1.5 py-0.5 text-[10px] text-tertiary-400">Salon lié</span>}
                      {assignee && <span className="inline-flex items-center gap-1 rounded-md bg-blue-400/10 px-1.5 py-0.5 text-[10px] text-blue-300"><UserRound size={9} aria-hidden="true" />{assignee}</span>}
                    </div>}
                  </div>
                </div>
              </button>
              );
            })}
            <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
            {loadingMore && <p role="status" className="flex items-center justify-center gap-2 py-5 text-xs text-white/45"><RefreshCw size={14} className="motion-safe:animate-spin" aria-hidden="true" /> Chargement des conversations…</p>}
            {loadMoreError && <div role="alert" className="space-y-2 p-3 text-center text-xs text-red-300"><p>{loadMoreError}</p><button type="button" className={subtleButton} onClick={() => void loadMore()}>Réessayer</button></div>}
            {!loading && !loadingMore && !listError && threads.length > 0 && page >= totalPages && <p className="py-4 text-center text-[11px] text-white/30">Toutes vos conversations sont affichées</p>}
          </div>
        </aside>

        <div className={`${selectedId ? "flex" : "hidden lg:flex"} min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-surface-raised)] lg:col-start-2 lg:row-start-3`}>
          {!selectedId ? (
            <div className="m-auto max-w-xs px-6 text-center text-white/40"><MessageCircle size={36} className="mx-auto mb-4 text-tertiary-400/40"/><p className="text-base text-white/75">Sélectionnez une conversation</p><p className="mt-2 text-xs leading-relaxed">Les messages, rendez-vous, notes et informations client seront affichés ici.</p></div>
          ) : detailLoading ? (
            <p className="m-auto text-xs text-white/50">Chargement de la conversation…</p>
          ) : detailError ? (
            <div className="m-auto space-y-3 px-5 text-center"><CircleAlert className="mx-auto text-red-300"/><p className="text-sm text-red-300">{detailError}</p><button className={subtleButton} onClick={() => selectedId && void refreshDetail(selectedId)}>Réessayer</button></div>
          ) : thread ? (
            <>
              <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3.5 xl:hidden">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <RdvActionButton tone="neutral" iconOnly icon={ArrowLeft} className="lg:!hidden" onClick={() => setSelectedId(null)}>Retour aux conversations</RdvActionButton>
                  <ThreadAvatar thread={thread} large />
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold leading-tight">{selectedName}</h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex h-5 items-center gap-1.5 rounded-md px-2 text-[10px] font-semibold ${STATUS_TONES[thread.status]}`}><span className="size-1.5 rounded-full bg-current" />{STATUS.find((entry) => entry.value === thread.status)?.label}</span>
                      <span className="inline-flex h-5 items-center rounded-md bg-white/[0.07] px-2 text-[10px] text-white/55">{CHANNELS.find(({ value }) => value === thread.channel)?.label}</span>
                      {thread.ownerUserId !== userId && <span className="inline-flex h-5 items-center rounded-md bg-tertiary-400/10 px-2 text-[10px] text-tertiary-400">Salon lié</span>}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {!isFree && <RdvActionButton tone="primary" icon={CalendarPlus} className="!w-auto" title="Proposer un RDV (lien de réservation)" onClick={() => setBookingLinkOpen(true)}>Proposer un RDV</RdvActionButton>}
                  <RdvActionButton tone="neutral" size="sm" iconOnly icon={Eye} className="xl:!hidden" aria-expanded={showDetailsMobile} onClick={() => { setActiveAppointment(null); setShowDetailsMobile((open) => !open); }}>{showDetailsMobile ? "Afficher les messages" : "Afficher les détails"}</RdvActionButton>
                  <RdvActionButton tone="neutral" size="sm" iconOnly icon={CheckCheck} disabled={pending} onClick={() => void mutate(() => setInboxReadStateAction(thread.id, false), "Conversation marquée lue")}>Marquer comme lue</RdvActionButton>
                  <RdvActionButton tone="neutral" size="sm" iconOnly icon={AtSign} disabled={pending} onClick={() => void mutate(() => setInboxReadStateAction(thread.id, true), "Conversation marquée non lue")}>Marquer comme non lue</RdvActionButton>
                  
                </div>
              </header>

              <div className={`grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] gap-0 overflow-hidden transition-[grid-template-columns] duration-300 ease-in-out ${activeAppointment ? "xl:grid-cols-[minmax(0,1fr)_540px]" : listCollapsed ? "xl:grid-cols-[minmax(0,1fr)_420px]" : "xl:grid-cols-[minmax(0,1fr)_340px]"}`}>
                <div className={`${showDetailsMobile || activeAppointment ? "hidden xl:flex" : "flex"} min-h-0 min-w-0 flex-col xl:h-full`}>
                  <div ref={messagesScrollRef} className="scrollbar-hidden min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
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
                    {peerTyping && <p className="text-xs italic text-white/40">Le client est en train d’écrire…</p>}
                  </div>
                  {(thread.contactBlocked || thread.conversation?.projectContactPending) ? <p className="border-t border-white/10 p-4 text-sm text-white/60">{thread.contactBlocked ? "Ce contact est bloqué." : "La demande de contact doit être acceptée par le client avant de poursuivre la conversation."}</p> : isFree ? (
                    <div className="flex items-start gap-2 border-t border-white/10 bg-tertiary-400/5 p-4 text-xs leading-relaxed text-white/70"><Lock size={16} className="shrink-0 text-tertiary-400" /><span>Conversation en lecture seule : l&apos;envoi et la réception de messages sont réservés aux comptes PRO ou BUSINESS.</span></div>
                  ) : (thread.channel === "INKERA" || (thread.channel === "INSTAGRAM" && ["ACTIVE", "ERROR"].includes(thread.externalConversation?.connection?.status || ""))) ? (
                    <div className="space-y-2 p-3">
                      {replyFormOpen && <div className="flex gap-2"><input aria-label="Titre de la réponse enregistrée" value={replyTitle} onChange={(event) => setReplyTitle(event.target.value)} placeholder="Titre (le texte saisi ci-dessous sera enregistré)" className={`${field} !py-1.5 text-[11px]`} /><button className={`${subtleButton} shrink-0 !py-1.5 text-[11px]`} type="button" disabled={pending || !replyTitle.trim() || !draft.trim()} onClick={() => void mutate(() => createInboxSavedReplyAction(replyTitle, draft, thread.channel), "Réponse enregistrée").then(async (ok) => { if (ok) { setReplyTitle(""); setReplyFormOpen(false); setSavedReplies(await getInboxSavedRepliesAction()); } })}>Enregistrer</button></div>}
                      <form onSubmit={sendMessage} className="space-y-2">
                        {selectedImage && <div className="flex items-center justify-between gap-2 rounded-lg border border-tertiary-400/20 bg-tertiary-400/5 px-3 py-2 text-xs"><span className="truncate">Image : {selectedImage.name}</span><button type="button" aria-label="Retirer l'image" onClick={() => setSelectedImage(null)}><X size={14} /></button></div>}
                        <div className="flex items-end gap-2">
                          <label className={`${subtleButton} h-11 shrink-0 !border-transparent !bg-white/[0.04] hover:!bg-white/[0.09]`} title="Joindre une image"><ImagePlus size={17} /><span className="sr-only">Joindre une image</span><input type="file" className="sr-only" accept="image/*" disabled={pending || processingImage || isUploading} onChange={(event) => { setSelectedImage(event.target.files?.[0] || null); event.target.value = ""; }} /></label>
                          <button type="button" aria-label={replyFormOpen ? "Fermer la nouvelle réponse enregistrée" : "Créer une réponse enregistrée"} title="Nouvelle réponse enregistrée" aria-expanded={replyFormOpen} className={`${subtleButton} h-11 w-11 shrink-0 !border-transparent !bg-white/[0.04] !px-0 hover:!bg-white/[0.09]`} onClick={() => setReplyFormOpen((open) => !open)}>{replyFormOpen ? <X size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}</button>
                          <textarea ref={composerRef} aria-label="Votre réponse" value={draft} onChange={(event) => handleDraftChange(event.target.value)} rows={1} maxLength={thread.channel === "INSTAGRAM" ? 1000 : 20000} placeholder={thread.channel === "INSTAGRAM" ? "Répondre sur Instagram…" : "Écrire un message au client…"} className={`${field} min-h-10 resize-none leading-5`} />
                          <button type="submit" aria-label={processingImage || isUploading ? "Envoi en cours" : "Envoyer le message"} className={`${primaryButton} shrink-0`} disabled={pending || processingImage || isUploading || (!draft.trim() && !selectedImage)}><Send size={16} /><span className="hidden sm:inline">{processingImage || isUploading ? "Envoi…" : "Envoyer"}</span></button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 border-t border-white/10 bg-amber-400/5 p-4 text-xs leading-relaxed text-amber-200/85"><CircleAlert size={16} className="shrink-0" /><span>{thread.channel === "INSTAGRAM" ? "Ce compte Instagram est déconnecté. Reconnectez-le dans l’onglet Instagram pour répondre ; l’historique reste consultable." : `Les messages ${CHANNELS.find(({ value }) => value === thread.channel)?.label} sont en lecture seule pour le moment.`}</span></div>
                  )}
                </div>

                <aside className={`${showDetailsMobile || activeAppointment ? "flex" : "hidden xl:flex"} scrollbar-hidden min-h-0 flex-col gap-3 overflow-y-auto p-4 text-xs xl:h-full`}>
                  {activeAppointment ? (
                    <div className="flex min-h-0 flex-1 flex-col">
                      <RdvActionButton tone="neutral" icon={ArrowLeft} className="mb-3 !w-auto shrink-0 self-start" onClick={() => setActiveAppointment(null)}>Retour à la conversation</RdvActionButton>
                      <ConversationRDVDetails conversation={{ appointmentId: activeAppointment.id, subject: activeAppointment.title, client: { firstName: activeAppointment.client?.firstName || activeAppointment.clientUser?.firstName || selectedName || 'Client', lastName: activeAppointment.client?.lastName || activeAppointment.clientUser?.lastName || '' } }} />
                    </div>
                  ) : (
                    <>
                  <RdvActionButton tone="neutral" icon={ArrowLeft} className="!w-auto shrink-0 self-start xl:!hidden" onClick={() => setShowDetailsMobile(false)}>Retour aux messages</RdvActionButton>

                  <section className="rounded-2xl bg-noir-600 p-4">
                    <div className="flex items-center gap-3">
                      <ThreadAvatar thread={thread} large />
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-base font-semibold leading-tight">{selectedName}</h2>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className={`inline-flex h-5 items-center gap-1.5 rounded-md px-2 text-[10px] font-semibold ${STATUS_TONES[thread.status]}`}><span className="size-1.5 rounded-full bg-current" />{STATUS.find((entry) => entry.value === thread.status)?.label}</span>
                          <span className="inline-flex h-5 items-center rounded-md bg-white/[0.07] px-2 text-[10px] text-white/55">{CHANNELS.find(({ value }) => value === thread.channel)?.label}</span>
                          {thread.ownerUserId !== userId && <span className="inline-flex h-5 items-center rounded-md bg-tertiary-400/10 px-2 text-[10px] text-tertiary-400">Salon lié</span>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <RdvActionButton tone="neutral" icon={thread.linkedClient ? UserRound : UserPlus} iconOnly loading={clientFileLoading} aria-expanded={thread.linkedClient ? undefined : clientFormOpen} onClick={() => {
                        if (thread.linkedClient) { void openClientFile(); return; }
                        // Conversation Inkera : fiche préremplie avec le compte, pour qu'elle y soit reliée (même e-mail).
                        const account = thread.channel === "INKERA" ? thread.conversation?.clientUser : null;
                        if (!clientFormOpen && account) setNewClient({ firstName: account.firstName ?? "", lastName: account.lastName ?? "", email: account.email ?? "", phone: "" });
                        setClientFormOpen((open) => !open);
                      }}>{thread.linkedClient ? "Fiche client" : "Relier un client"}</RdvActionButton>
                      {!isFree && <RdvActionButton tone="neutral" icon={CalendarPlus} className="!w-auto flex-1" title="Proposer un RDV (lien de réservation)" onClick={() => setBookingLinkOpen(true)}>Proposer un RDV</RdvActionButton>}
                      <RdvActionButton tone="neutral" size="sm" iconOnly icon={CheckCheck} disabled={pending} onClick={() => void mutate(() => setInboxReadStateAction(thread.id, false), "Conversation marquée lue")}>Marquer comme lue</RdvActionButton>
                      <RdvActionButton tone="neutral" size="sm" iconOnly icon={AtSign} disabled={pending} onClick={() => void mutate(() => setInboxReadStateAction(thread.id, true), "Conversation marquée non lue")}>Marquer comme non lue</RdvActionButton>
                    </div>
                  </section>

                  {clientFormOpen && !thread.linkedClient && <PanelSection icon={UserPlus} title="Relier un client" hint="Choisissez une fiche existante ou créez-en une nouvelle.">
                    <div className="space-y-2">
                      <input className={panelField} aria-label="Rechercher une fiche client" placeholder="Rechercher un client (nom ou e-mail)…" value={clientQuery} onChange={(event) => setClientQuery(event.target.value)} />
                      {clientResults.map((client) => <button type="button" key={client.id} className="block w-full rounded-xl bg-white/[0.04] p-2.5 text-left transition hover:bg-white/[0.08]" disabled={pending} onClick={() => void mutate(() => linkInboxClientAction(thread.id, client.id), "Fiche client associée", true)}><span className="text-xs font-medium text-white/90">{client.firstName} {client.lastName}</span> <span className="block text-[11px] text-white/40">{client.email}</span></button>)}
                      <p className="pt-2 text-[10px] font-medium uppercase tracking-wider text-white/40">Ou créer une nouvelle fiche</p>
                      {thread.channel === "INKERA" && thread.conversation?.clientUser?.email && <p className="text-[11px] leading-relaxed text-white/45">Avec l’e-mail de son compte Inkera, la fiche sera reliée à son compte : rendez-vous visibles dans son espace, notifications et messagerie.</p>}
                      {(["firstName", "lastName", "email", "phone"] as const).map((key) => <input key={key} type={key === "email" ? "email" : "text"} className={panelField} aria-label={key} placeholder={({ firstName: "Prénom", lastName: "Nom", email: "E-mail", phone: "Téléphone" })[key]} value={newClient[key]} onChange={(event) => setNewClient((old) => ({ ...old, [key]: event.target.value }))} />)}
                      <RdvActionButton tone="primary" icon={Plus} disabled={pending || isFree || Object.values(newClient).some((value) => !value.trim())} onClick={() => void mutate(() => createInboxClientAction(thread.id, newClient), "Fiche client créée et associée", true)}>Créer et associer</RdvActionButton>
                    </div>
                  </PanelSection>}

                  <PanelSection icon={Clock3} title="Statut" hint="Où en est cette conversation ?">
                    <FilterSelect buttonClassName="flex h-10 w-full min-w-0 items-center gap-2 rounded-xl bg-white/[0.04] px-3 text-left text-xs text-white/80 outline-none transition hover:bg-white/[0.09] focus-visible:ring-2 focus-visible:ring-tertiary-400/30 disabled:opacity-50" label="Statut de la conversation" placeholder="Statut" unit="statut" icon={<Clock3 size={14} aria-hidden="true" />} multiple={false} clearable={false} disabled={pending}
                      selected={[thread.status]}
                      options={STATUS.map(({ value, label }) => ({ value, label }))}
                      onApply={(values) => { const next = values[0] as InboxStatus | undefined; if (next && next !== thread.status) void mutate(() => setInboxStatusAction(thread.id, next), "Statut mis à jour"); }} />
                  </PanelSection>

                  <PanelSection icon={Users} title="Responsable" hint={thread.assignedUser ? undefined : thread.assignedTatoueur ? undefined : "Personne n’est encore chargé de cette conversation."}>
                    {(thread.assignedUser || thread.assignedTatoueur) && <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-tertiary-400/10 text-[11px] font-semibold text-tertiary-400">{(thread.assignedUser ? thread.assignedUser.firstName : thread.assignedTatoueur?.name)?.charAt(0).toUpperCase() || "?"}</span><div className="min-w-0"><p className="text-[10px] text-white/40">Attribuée à</p><p className="truncate text-xs font-medium text-white/90">{thread.assignedUser ? [thread.assignedUser.firstName, thread.assignedUser.lastName].filter(Boolean).join(" ") : thread.assignedTatoueur?.name}</p></div></div>}
                    {isOwner && isSalon && <div className="mt-3 space-y-2"><FilterSelect buttonClassName="flex h-10 w-full min-w-0 items-center gap-2 rounded-xl bg-white/[0.04] px-3 text-left text-xs text-white/80 outline-none transition hover:bg-white/[0.09] focus-visible:ring-2 focus-visible:ring-tertiary-400/30 disabled:opacity-50" label="Tatoueur responsable" placeholder="Non attribuée" unit="tatoueur" icon={<Users size={14} aria-hidden="true" />} multiple={false}
                      selected={assignment ? [assignment] : []}
                      options={team.map((member) => { const linked = member.linkedUserId || member.tatoueurUserId; return { value: linked ? `user:${linked}` : `artist:${member.id}`, label: memberLabel(member) + (linked ? " (compte Inkera)" : " (équipe interne)") }; })}
                      onApply={(values) => setAssignment(values[0] || "")} />
                      <RdvActionButton tone="primary" icon={Users} disabled={pending} onClick={() => void mutate(() => setInboxAssignmentAction(thread.id, assignment.startsWith("user:") ? { assignedUserId: assignment.slice(5) } : assignment.startsWith("artist:") ? { assignedTatoueurId: assignment.slice(7) } : {}), "Attribution mise à jour")}>Attribuer la conversation</RdvActionButton>
                      {assignment.startsWith("user:") && <RdvActionButton tone="neutral" icon={CheckCheck} disabled={pending} onClick={() => void mutate(() => setInboxMemberPermissionAction(assignment.slice(5)), "Accès autorisé à ce tatoueur")}>Autoriser à répondre</RdvActionButton>}
                      <p className="text-[11px] leading-relaxed text-white/40">Un tatoueur indépendant lié au salon doit d’abord être autorisé, puis la conversation peut lui être attribuée. Il ne verra que les conversations qui lui sont attribuées.</p>
                    </div>}
                  </PanelSection>

                  <PanelSection icon={CalendarDays} title="Rendez-vous" right={<span className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[10px] tabular-nums text-white/55">{appointmentTotal}</span>}>
                    {appointmentLoading && <p className="py-1 text-white/40">Chargement…</p>}
                    {!appointmentLoading && appointments.length === 0 && <p className="text-white/45">Aucun rendez-vous pour ce client.</p>}
                    <div className="space-y-1.5">{appointments.map((item) => <button type="button" key={item.id} onClick={() => setActiveAppointment(item)} className="flex w-full items-center gap-2.5 rounded-xl bg-white/[0.04] p-2.5 text-left transition hover:bg-white/[0.08]"><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-white/90">{item.prestation || item.title}</span><span className="mt-0.5 block truncate text-[11px] text-white/50">{displayDate(item.start)}</span></span><ChevronRight size={14} className="shrink-0 text-white/30" aria-hidden="true" /></button>)}</div>
                    {appointmentPages > 1 && <div className="mt-3 flex items-center justify-between gap-2"><RdvActionButton tone="neutral" size="sm" iconOnly icon={ChevronLeft} disabled={appointmentPage === 1} onClick={() => setAppointmentPage((v) => v - 1)}>Page précédente</RdvActionButton><span className="text-[11px] text-white/50">{appointmentPage} / {appointmentPages}</span><RdvActionButton tone="neutral" size="sm" iconOnly icon={ChevronRight} disabled={appointmentPage >= appointmentPages} onClick={() => setAppointmentPage((v) => v + 1)}>Page suivante</RdvActionButton></div>}
                  </PanelSection>

                  <PanelSection icon={NotebookPen} title="Notes internes" hint="Visibles par l’équipe uniquement, jamais envoyées au client.">
                    {notes.length > 0 && <div className="mb-3 max-h-52 space-y-2 overflow-y-auto scrollbar-hidden">{notes.map((note) => <div key={note.id} className="rounded-xl bg-amber-400/[0.07] p-3"><p className="whitespace-pre-wrap wrap-break-word text-xs leading-5 text-white/85">{note.content}</p><p className="mt-2 text-[10px] text-white/40">{note.author?.firstName || "Équipe"} · {displayDate(note.createdAt)}</p></div>)}</div>}
                    <textarea aria-label="Note interne" rows={3} className={panelField + " h-auto resize-none py-2.5 leading-5"} maxLength={5000} value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Ajouter une note pour l’équipe…" />
                    <RdvActionButton tone="neutral" icon={Plus} className="mt-2" disabled={pending || !noteDraft.trim()} onClick={() => void mutate(() => addInboxNoteAction(thread.id, noteDraft), "Note interne ajoutée").then((ok) => { if (ok) setNoteDraft(""); })}>Ajouter la note</RdvActionButton>
                  </PanelSection>
                    </>
                  )}
                </aside>
              </div>
            </>
          ) : null}
        </div>
      </div>
      {clientFile && <InfoClient client={clientFile} isOpen onClose={() => setClientFile(null)} salonName={session?.user?.salonName ?? "Mon Salon"} />}
      {bookingLinkOpen && thread && bookingLinkContext && (
        <BookingLinkCreator
          context={bookingLinkContext}
          onClose={() => setBookingLinkOpen(false)}
          delivery={canReplyInThread ? {
            sendLabel: thread.channel === "INSTAGRAM" ? "Envoyer sur Instagram" : "Envoyer dans la conversation",
            send: async (message) => {
              const threadId = thread.id;
              await sendInboxReplyAction(threadId, message);
              forceScrollRef.current = true;
              await Promise.all([refreshDetail(threadId), refreshList()]);
            },
            insert: (message) => {
              setDraft((current) => (current.trim() ? `${current.trimEnd()}\n${message}` : message));
              setTimeout(() => composerRef.current?.focus(), 0);
            },
          } : undefined}
        />
      )}
    </section>
  );
}
