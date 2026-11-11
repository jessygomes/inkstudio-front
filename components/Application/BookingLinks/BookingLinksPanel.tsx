"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarCheck2, ChevronLeft, ChevronRight, Copy, Eye, Link2, LoaderCircle, RefreshCw, Repeat2, ShieldOff, TriangleAlert, X } from "lucide-react";
import SideFormDrawer from "@/components/Shared/SideFormDrawer";
import DashboardButton from "@/components/Shared/DashboardButton";
import { getBookingLinkAction, listBookingLinksAction, revokeBookingLinkAction } from "@/lib/queries/booking-links";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import {
  BOOKING_LINK_STATUS_META, BOOKING_PRESTATION_LABELS, describeApiError, describeBookingRules, effectiveBookingLinkStatus,
  formatCivilDate, formatDateTime, formatDuration, type BookingLink,
} from "@/lib/types/booking-links";
import BookingLinkCreator, { type BookingLinkCreatorContext } from "./BookingLinkCreator";
import { copyToClipboard, useBookingUrl } from "./bookingLinkClient";

const PAGE_SIZE = 20;

type AppointmentSummary = { title?: string; client?: { firstName?: string; lastName?: string } | null; tatoueur?: { name?: string } | null; venueName?: string | null };

/** Nom du client et contexte, résolus via le RDV existant (projet d'origine ou RDV créé). */
function useLinkedAppointment(appointmentId: string | null) {
  return useQuery({
    queryKey: ["booking-link-appointment", appointmentId],
    enabled: Boolean(appointmentId),
    staleTime: 5 * 60_000,
    retry: false,
    // Appel client direct (parallèle) : les server actions sont exécutées en file et bloqueraient les autres actions.
    queryFn: async (): Promise<AppointmentSummary | null> => {
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_BACK_URL}/appointments/${encodeURIComponent(appointmentId!)}`, { cache: "no-store" });
      if (!response.ok) return null;
      const result = await response.json().catch(() => null);
      return (result?.appointment ?? result) || null;
    },
  });
}

function useArtistNames() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const isUserTatoueur = session?.user?.role === "user_tatoueur";
  const { data } = useQuery({
    queryKey: ["booking-link-artists", userId],
    enabled: Boolean(userId) && !isUserTatoueur,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/for-appointment/${encodeURIComponent(userId!)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Impossible de charger les tatoueurs.");
      const list = await response.json();
      return Array.isArray(list) ? list.filter((item) => item?.id).map((item) => ({ id: String(item.id), name: String(item.name || "Tatoueur") })) : [];
    },
  });
  return (link: BookingLink, fallback?: string | null) => {
    if (link.performerUserId && link.performerUserId === userId) return "Vous";
    const byId = data?.find((item) => item.id === link.tatoueurId || (link.performerUserId && item.id === `linked_${link.performerUserId}`));
    return byId?.name || fallback || (link.tatoueurId || link.performerUserId ? "Tatoueur" : "—");
  };
}

function clientLabel(link: BookingLink, appointment?: AppointmentSummary | null) {
  const name = [appointment?.client?.firstName, appointment?.client?.lastName].filter(Boolean).join(" ");
  if (name) return name;
  if (link.clientId) return "Fiche client liée";
  if (link.clientUserId) return "Compte client Inkera";
  return "Sans client";
}

function StatusBadge({ link }: { link: BookingLink }) {
  const meta = BOOKING_LINK_STATUS_META[effectiveBookingLinkStatus(link)];
  return <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-1 text-[11px] font-medium ${meta.className}`}><span className="size-1.5 rounded-full bg-current" />{meta.label}</span>;
}

function CopyLinkButton({ link, compact = false }: { link: BookingLink; compact?: boolean }) {
  const url = useBookingUrl(link.id);
  if (effectiveBookingLinkStatus(link) !== "ACTIVE") return null;
  const title = url ? "Copier le lien" : "Le lien n’est affiché qu’à sa création. Pour le renvoyer, révoquez-le puis générez-en un nouveau.";
  return <button type="button" disabled={!url} title={title} aria-label={title}
    onClick={async (event) => { event.stopPropagation(); if (url && (await copyToClipboard(url))) toast.success("Lien copié"); else toast.error("Copie impossible."); }}
    className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white/75 transition hover:bg-white/10 hover:text-white disabled:opacity-35 ${compact ? "size-9" : "min-h-9 px-3"}`}>
    <Copy size={14} />{!compact && "Copier"}
  </button>;
}

function LinkRow({ link, selected, artistName, onOpen, onOpenAppointment }: { link: BookingLink; selected: boolean; artistName: (link: BookingLink, fallback?: string | null) => string; onOpen: () => void; onOpenAppointment: (id: string) => void }) {
  const appointment = useLinkedAppointment(link.appointmentId ?? link.projectAppointmentId);
  const status = effectiveBookingLinkStatus(link);
  return <li>
    <div role="button" tabIndex={0} onClick={onOpen} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(); } }}
      aria-current={selected ? "true" : undefined}
      className={`group flex cursor-pointer flex-col gap-3 rounded-2xl border p-3 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 sm:flex-row sm:items-center ${selected ? "border-tertiary-400/50 bg-tertiary-400/10" : "border-white/8 bg-white/[0.03] hover:border-white/20"}`}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-tertiary-400"><Link2 size={18} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-white">{BOOKING_PRESTATION_LABELS[link.prestation] ?? link.prestation}</p>
            <span className="rounded-full border border-white/12 bg-white/6 px-2 py-0.5 text-[11px] text-white/70">{formatDuration(link.durationMinutes)}</span>
            <span className="sm:hidden"><StatusBadge link={link} /></span>
          </div>
          <p className="mt-1 truncate text-xs text-white/60">{clientLabel(link, appointment.data)}<span className="mx-1.5">·</span>{artistName(link, appointment.data?.tatoueur?.name)}</p>
          <p className="mt-1 text-[11px] text-white/40">Créé le {formatDateTime(link.createdAt)}<span className="mx-1.5">·</span>{link.expiresAt ? `Expire le ${formatDateTime(link.expiresAt)}` : `Valable jusqu’au ${formatCivilDate(link.allowedTo)}`}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2">
        <span className="hidden sm:inline-flex"><StatusBadge link={link} /></span>
        <CopyLinkButton link={link} compact />
        {status === "USED" && link.appointmentId && <button type="button" title="Voir le rendez-vous créé" aria-label="Voir le rendez-vous créé" onClick={(event) => { event.stopPropagation(); onOpenAppointment(link.appointmentId!); }} className="grid size-9 place-items-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-200 transition hover:bg-blue-400/20"><CalendarCheck2 size={15} /></button>}
        <button type="button" title="Consulter les paramètres" aria-label="Consulter les paramètres" onClick={(event) => { event.stopPropagation(); onOpen(); }} className="grid size-9 place-items-center rounded-xl border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white"><Eye size={15} /></button>
      </div>
    </div>
  </li>;
}

/**
 * Détails d'un lien. `pane` : colonne de droite (comme le détail d'un RDV) ; `drawer` : panneau plein écran (mobile/tablette).
 */
export function BookingLinkDetails({ link: initial, variant, onClose, onOpenAppointment }: {
  link: BookingLink;
  variant: "pane" | "drawer";
  onClose: () => void;
  onOpenAppointment: (id: string) => void;
}) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const artistName = useArtistNames();
  const [duplicateContext, setDuplicateContext] = useState<BookingLinkCreatorContext | null>(null);
  const onDuplicate = setDuplicateContext;
  const detail = useQuery({
    queryKey: ["booking-links", "detail", initial.id],
    queryFn: async () => {
      const result = await getBookingLinkAction(initial.id);
      if (!result.ok) throw new Error(describeApiError(result));
      return result.data.link;
    },
  });
  const link = detail.data ?? initial;
  const appointment = useLinkedAppointment(link.appointmentId ?? link.projectAppointmentId);
  const project = useLinkedAppointment(link.projectAppointmentId);
  const status = effectiveBookingLinkStatus(link);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [revoking, setRevoking] = useState(false);
  useEffect(() => { setConfirmRevoke(false); }, [initial.id]);

  const revoke = async () => {
    if (revoking) return;
    setRevoking(true);
    try {
      const result = await revokeBookingLinkAction(link.id);
      if (!result.ok) { toast.error(describeApiError(result, "Révocation impossible.")); return; }
      toast.success("Lien révoqué : il ne permet plus de réserver.");
      setConfirmRevoke(false);
      await queryClient.invalidateQueries({ queryKey: ["booking-links"] });
    } finally {
      setRevoking(false);
    }
  };

  const duplicate = () => {
    const base = { initial: { prestation: link.prestation, durationMinutes: link.durationMinutes, mode: link.mode, fixedStartTime: link.fixedStartTime ?? undefined } };
    if (link.projectAppointmentId) {
      onDuplicate({ ...base, origin: "project", projectAppointmentId: link.projectAppointmentId, originLabel: project.data?.title ? `RDV Projet · ${project.data.title}` : "RDV Projet d’origine", inheritedArtistLabel: artistName(link, project.data?.tatoueur?.name), inheritedVenueLabel: project.data?.venueName ?? undefined, client: { label: clientLabel(link, project.data) } });
      return;
    }
    const tatoueurId = session?.user?.role === "user_tatoueur" ? undefined : link.tatoueurId ?? (link.performerUserId ? `linked_${link.performerUserId}` : undefined);
    if (link.inboxThreadId || link.conversationId) {
      onDuplicate({ ...base, origin: "conversation", originLabel: "Conversation d’origine", inboxThreadId: link.inboxThreadId ?? undefined, conversationId: link.inboxThreadId ? undefined : link.conversationId ?? undefined, initialTatoueurId: tatoueurId, initialTatoueurLabel: artistName(link), initialVenueSalonId: link.venueSalonId ?? undefined });
      return;
    }
    onDuplicate({ ...base, origin: "standalone", initialTatoueurId: tatoueurId, initialTatoueurLabel: artistName(link), initialVenueSalonId: link.venueSalonId ?? undefined, client: link.clientId ? { id: link.clientId, label: clientLabel(link, appointment.data) } : undefined });
  };

  const origin = link.projectAppointmentId ? `RDV Projet${project.data?.title ? ` · ${project.data.title}` : ""}` : link.inboxThreadId || link.conversationId ? "Conversation" : "Lien autonome";
  const rows: Array<[string, string]> = [
    ["Type de rendez-vous", BOOKING_PRESTATION_LABELS[link.prestation] ?? link.prestation],
    ["Durée", formatDuration(link.durationMinutes)],
    ["Tatoueur", artistName(link, appointment.data?.tatoueur?.name)],
    ["Client", clientLabel(link, appointment.data)],
    ["Période autorisée", `Du ${formatCivilDate(link.allowedFrom)} au ${formatCivilDate(link.allowedTo)}`],
    ["Expiration", link.expiresAt ? formatDateTime(link.expiresAt) : `Après le ${formatCivilDate(link.allowedTo)}`],
    ["Origine", origin],
    ["Créé le", formatDateTime(link.createdAt)],
    ...(link.usedAt ? [["Utilisé le", formatDateTime(link.usedAt)] as [string, string]] : []),
    ...(link.revokedAt ? [["Révoqué le", formatDateTime(link.revokedAt)] as [string, string]] : []),
  ];

  const footer = <>
    {variant === "drawer" && <DashboardButton variant="secondary" onClick={onClose} disabled={revoking}>Fermer</DashboardButton>}
    <DashboardButton variant="secondary" onClick={duplicate} disabled={revoking} className={variant === "pane" ? "!min-w-0 flex-1" : undefined}><Repeat2 size={14} />Générer un lien similaire</DashboardButton>
    {status === "USED" && link.appointmentId && <DashboardButton onClick={() => onOpenAppointment(link.appointmentId!)} className={variant === "pane" ? "!min-w-0 flex-1" : undefined}><CalendarCheck2 size={14} />Voir le rendez-vous</DashboardButton>}
  </>;

  const body = <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-noir-600 p-4">
        <div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.12em] text-white/35">Statut</p><p className="mt-1 text-sm text-white/80">{status === "ACTIVE" ? "Le client peut réserver avec ce lien." : status === "USED" ? "Le client a réservé : le rendez-vous est dans votre agenda." : status === "EXPIRED" ? "Ce lien ne permet plus de réserver." : "Ce lien a été désactivé."}</p></div>
        <StatusBadge link={link} />
      </div>
      {detail.isFetching && <p className="flex items-center gap-2 text-[11px] text-white/40"><LoaderCircle size={12} className="animate-spin" />Actualisation…</p>}
      {detail.isError && <p role="alert" className="text-[11px] text-amber-200/80">{detail.error instanceof Error ? detail.error.message : "Impossible d’actualiser ce lien."}</p>}
      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-2xl border border-white/10 bg-noir-600 p-4 sm:grid-cols-2">
        {rows.map(([term, value]) => <div key={term} className="min-w-0"><dt className="text-[10px] text-white/35">{term}</dt><dd className="mt-1 break-words text-sm text-white/85">{value}</dd></div>)}
        <div className="sm:col-span-2"><dt className="text-[10px] text-white/35">Règles horaires</dt><dd className="mt-1 text-sm leading-6 text-white/85">{describeBookingRules(link)}</dd></div>
      </dl>
      {status === "ACTIVE" && <div className="space-y-3 rounded-2xl border border-white/10 bg-noir-600 p-4">
        <div className="flex flex-wrap items-center gap-2"><CopyLinkButton link={link} /><p className="text-[11px] leading-5 text-white/40">Pour des raisons de sécurité, l’adresse du lien n’est visible qu’à sa création.</p></div>
        {!confirmRevoke ? <button type="button" onClick={() => setConfirmRevoke(true)} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 text-xs text-red-300 transition hover:bg-red-500/20"><ShieldOff size={14} />Révoquer ce lien</button>
          : <div role="alertdialog" aria-label="Confirmer la révocation" className="rounded-xl border border-red-400/25 bg-red-500/10 p-3">
            <p className="flex items-start gap-2 text-xs leading-5 text-red-200"><TriangleAlert size={15} className="mt-0.5 shrink-0" />Le client ne pourra plus réserver avec ce lien. Cette action est définitive.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={revoking} onClick={() => setConfirmRevoke(false)} className="min-h-9 rounded-xl border border-white/12 px-3 text-xs text-white/75 hover:bg-white/5">Annuler</button>
              <button type="button" disabled={revoking} onClick={() => void revoke()} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/25 px-3 text-xs font-medium text-red-100 hover:bg-red-500/35 disabled:opacity-50">{revoking ? <LoaderCircle size={14} className="animate-spin" /> : <ShieldOff size={14} />}{revoking ? "Révocation…" : "Confirmer la révocation"}</button>
            </div>
          </div>}
      </div>}
    </div>;

  const creator = duplicateContext && <BookingLinkCreator context={duplicateContext} onClose={() => setDuplicateContext(null)} />;

  if (variant === "drawer") {
    return <>
      {!duplicateContext && <SideFormDrawer category="Lien de réservation" title="Paramètres du lien" description="Consultez les règles de ce lien et son état." busy={revoking} onClose={onClose} footer={footer}>{body}</SideFormDrawer>}
      {creator}
    </>;
  }

  return <>
    <div className="flex h-full flex-col bg-noir-700 font-one [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-noir-600 px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-tertiary-400/15 text-tertiary-400"><Link2 size={17} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-white">Lien · {BOOKING_PRESTATION_LABELS[link.prestation] ?? link.prestation}</h2>
          <p className="mt-1 truncate text-[11px] text-white/45">{formatDuration(link.durationMinutes)} · {artistName(link, appointment.data?.tatoueur?.name)}</p>
        </div>
        <StatusBadge link={link} />
        <button type="button" onClick={onClose} disabled={revoking} aria-label="Fermer le lien" className="grid size-8 shrink-0 place-items-center rounded-lg text-white/45 transition hover:bg-tertiary-400/15 hover:text-white"><X size={17} /></button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">{body}</div>
      <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-white/10 bg-noir-700 px-4 py-2.5">{footer}</footer>
    </div>
    {creator}
  </>;
}

export default function BookingLinksPanel({ onOpenAppointment, onCreate, selectedId, onSelect }: {
  onOpenAppointment: (appointmentId: string) => void;
  onCreate?: () => void;
  selectedId?: string | null;
  onSelect: (link: BookingLink) => void;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const artistName = useArtistNames();

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["booking-links", "list", session?.user?.id, page],
    enabled: Boolean(session?.user?.id),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const result = await listBookingLinksAction(page, PAGE_SIZE);
      if (!result.ok) throw new Error(describeApiError(result, "Impossible de charger les liens."));
      return result.data;
    },
  });
  const links = data?.data ?? [];

  // Un lien qui passe à « Utilisé » signifie qu'un RDV a été créé : on rafraîchit l'agenda existant.
  const knownStatuses = useRef(new Map<string, string>());
  useEffect(() => {
    let booked = false;
    for (const link of data?.data ?? []) {
      const previous = knownStatuses.current.get(link.id);
      if (previous && previous !== "USED" && link.status === "USED") booked = true;
      knownStatuses.current.set(link.id, link.status);
    }
    if (booked) {
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Un client a réservé via un lien : le rendez-vous est ajouté à votre agenda.");
    }
  }, [data, queryClient]);


  return <section aria-label="Liens de réservation" className="space-y-3 p-3 font-one sm:p-0">
    <div className="flex items-center justify-between gap-3">
      <div><h2 className="text-base font-semibold text-white sm:text-lg">Liens de réservation</h2><p className="mt-0.5 text-xs text-white/45">Liens personnels envoyés à vos clients pour réserver une séance de tatouage ou de retouche.</p></div>
      <div className="flex shrink-0 items-center gap-2">
        {onCreate && <DashboardButton onClick={onCreate} aria-label="Créer un lien de réservation" className="!min-w-0 !rounded-xl whitespace-nowrap"><Link2 size={14} /><span className="hidden sm:inline">Créer un lien</span></DashboardButton>}
        <button type="button" onClick={() => void refetch()} disabled={isFetching} aria-label="Actualiser" title="Actualiser" className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-50"><RefreshCw size={15} className={isFetching ? "animate-spin" : ""} /></button>
      </div>
    </div>
    <div className="h-px w-full bg-gradient-to-r from-tertiary-400/50 via-white/30 to-transparent" />

    {isLoading ? <ul className="space-y-2" aria-busy="true">{Array.from({ length: 4 }, (_, index) => <li key={index} className="h-[74px] animate-pulse rounded-2xl border border-white/8 bg-white/[0.03]" />)}</ul>
      : isError ? <div role="alert" className="space-y-3 rounded-2xl border border-red-400/20 bg-red-500/5 p-6 text-center"><p className="text-sm text-red-200">{error instanceof Error ? error.message : "Impossible de charger les liens."}</p><button type="button" onClick={() => void refetch()} className="rounded-xl border border-white/12 px-3 py-2 text-xs text-white/75 hover:bg-white/5">Réessayer</button></div>
      : links.length === 0 ? <div className="flex flex-col items-center gap-3 py-16 text-center"><span className="grid size-16 place-items-center rounded-full bg-white/10 text-white"><Link2 size={26} /></span><p className="font-two text-xl text-white">{page > 1 ? "Aucun autre lien" : "Aucun lien de réservation"}</p><p className="max-w-sm text-sm text-white/55">Générez un lien depuis un RDV Projet, une conversation ou directement ici, puis partagez-le avec votre client.</p>{onCreate && page === 1 && <DashboardButton onClick={onCreate}><Link2 size={14} />Créer un lien de réservation</DashboardButton>}</div>
      : <ul className="space-y-2">{links.map((link) => <LinkRow key={link.id} link={link} selected={selectedId === link.id} artistName={artistName} onOpen={() => onSelect(link)} onOpenAppointment={onOpenAppointment} />)}</ul>}

    {(page > 1 || data?.hasMore) && <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
      <span className="text-xs text-white/50">Page {page}</span>
      <div className="flex gap-2">
        <button type="button" disabled={page === 1 || isFetching} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20 disabled:opacity-50"><ChevronLeft size={13} />Précédent</button>
        <button type="button" disabled={!data?.hasMore || isFetching} onClick={() => setPage((value) => value + 1)} className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20 disabled:opacity-50">Suivant<ChevronRight size={13} /></button>
      </div>
    </div>}

  </section>;
}
