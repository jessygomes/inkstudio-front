"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CalendarClock, CalendarRange, Check, Clock3, Copy, Hourglass, Link2, LoaderCircle, MessageSquarePlus,
  Paintbrush, Search, Send, UserRound, X,
} from "lucide-react";
import SideFormDrawer from "@/components/Shared/SideFormDrawer";
import DashboardButton from "@/components/Shared/DashboardButton";
import FormSectionHeader from "@/components/Shared/FormSectionHeader";
import { createBookingLinkAction } from "@/lib/queries/booking-links";
import { searchClientsAction } from "@/lib/queries/client";
import { residencyRequest } from "@/lib/residencies-client";
import {
  BOOKING_PRESTATION_LABELS, ERROR_FIELDS, addDaysToCivilDate, civilDateDiff, describeApiError, describeBookingRules,
  formatCivilDate, formatDateTime, formatDuration, isUsableBookingUrl, isValidCivilDate, parisToday,
  type BookingLinkMode, type BookingLinkPrestation, type CreateBookingLinkRequest, type CreateBookingLinkResponse,
} from "@/lib/types/booking-links";
import { bookingLinkMessage, copyToClipboard, rememberBookingUrl } from "./bookingLinkClient";

export type BookingLinkCreatorContext = {
  origin: "project" | "conversation" | "standalone";
  /** Libellé affiché pour rappeler l'origine (titre du projet, conversation…). */
  originLabel?: string;
  projectAppointmentId?: string;
  inboxThreadId?: string;
  conversationId?: string;
  /** Propriétaire de l'agenda dont on liste les tatoueurs (par défaut : professionnel connecté). */
  ownerUserId?: string;
  /** Projet : tatoueur et lieu hérités par le backend, affichés en lecture seule. */
  inheritedArtistLabel?: string;
  inheritedVenueLabel?: string;
  /** Client connu (affiché en lecture seule). `id` n'est envoyé qu'en création autonome. */
  client?: { id?: string; label: string; detail?: string | null };
  clientNotice?: string;
  initialTatoueurId?: string;
  initialTatoueurLabel?: string;
  initialVenueSalonId?: string;
  initial?: Partial<Pick<CreateBookingLinkRequest, "prestation" | "durationMinutes" | "mode" | "fixedStartTime">>;
};

export type BookingLinkDelivery = {
  /** Envoi via un canal existant et opérationnel (ex. réponse dans la conversation). */
  send?: (message: string) => Promise<void>;
  sendLabel?: string;
  /** Insère le message dans la zone de saisie existante sans l'envoyer. */
  insert?: (message: string) => void;
};

type Artist = { id: string; name: string };
type Residency = { id: string; salonId: string; salonAllowsArtistCreate?: boolean; salon?: { salonName?: string | null; city?: string | null } };
type ClientOption = { id: string; firstName?: string | null; lastName?: string | null; email?: string | null };

const DURATION_PRESETS = [30, 60, 90, 120, 180, 240, 300, 360, 480];
const WINDOW_PRESETS = [{ days: 13, label: "2 semaines" }, { days: 30, label: "1 mois" }, { days: 91, label: "3 mois" }, { days: 182, label: "6 mois" }];

const field = "w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark] aria-[invalid=true]:border-red-400/50";
const panel = "rounded-2xl border border-white/10 bg-noir-600 p-4";
const label = "mb-1.5 block text-xs text-white/70";
const chip = (active: boolean) =>
  `inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${active ? "border-tertiary-400/50 bg-tertiary-400/15 text-white" : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white"}`;

function FieldError({ message }: { message?: string }) {
  return message ? <p role="alert" className="mt-1.5 text-[11px] text-red-300">{message}</p> : null;
}

function ReadOnlyRow({ icon, title, value, detail }: { icon: ReactNode; title: string; value: string; detail?: string | null }) {
  return <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
    <span className="mt-0.5 text-white/35 [&_svg]:size-4" aria-hidden="true">{icon}</span>
    <div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.12em] text-white/35">{title}</p><p className="mt-1 break-words text-sm text-white/85">{value}</p>{detail && <p className="mt-0.5 break-all text-[11px] text-white/45">{detail}</p>}</div>
  </div>;
}

export default function BookingLinkCreator({ context, delivery, onClose, onCreated }: {
  context: BookingLinkCreatorContext;
  delivery?: BookingLinkDelivery;
  onClose: () => void;
  onCreated?: (response: CreateBookingLinkResponse) => void;
}) {
  const formId = useId();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isUserTatoueur = session?.user?.role === "user_tatoueur";
  const ownerId = context.ownerUserId || session?.user?.id;
  const isProject = context.origin === "project";

  const today = parisToday();
  const [prestation, setPrestation] = useState<BookingLinkPrestation>(context.initial?.prestation ?? "TATTOO");
  const initialDuration = context.initial?.durationMinutes ?? 120;
  const [duration, setDuration] = useState<number>(initialDuration);
  const [customDuration, setCustomDuration] = useState(!DURATION_PRESETS.includes(initialDuration));
  const [customDurationInput, setCustomDurationInput] = useState(String(initialDuration));
  const [mode, setMode] = useState<BookingLinkMode>(context.initial?.mode ?? "FIXED_START");
  const [fixedStartTime, setFixedStartTime] = useState(context.initial?.fixedStartTime ?? "10:00");
  const [allowedFrom, setAllowedFrom] = useState(today);
  const [allowedTo, setAllowedTo] = useState(addDaysToCivilDate(today, 30));
  const [expiresAt, setExpiresAt] = useState("");
  const [tatoueurId, setTatoueurId] = useState(context.initialTatoueurId ?? "");
  const [venueSalonId, setVenueSalonId] = useState(context.initialVenueSalonId ?? "");
  const [pickedClient, setPickedClient] = useState<{ id: string; label: string; detail?: string | null } | null>(null);
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState<ClientOption[]>([]);
  const [clientSearching, setClientSearching] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<{ message: string; details?: string[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const [created, setCreated] = useState<CreateBookingLinkResponse | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Tatoueurs du salon (même source que le formulaire de création de RDV)
  const artists = useQuery({
    queryKey: ["booking-link-artists", ownerId],
    enabled: Boolean(ownerId) && !isUserTatoueur && !isProject,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Artist[]> => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/for-appointment/${encodeURIComponent(ownerId!)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Impossible de charger les tatoueurs.");
      const data = await response.json();
      return Array.isArray(data) ? data.filter((item) => item?.id).map((item) => ({ id: String(item.id), name: String(item.name || "Tatoueur") })) : [];
    },
  });

  // Salons de résidence d'un tatoueur rattaché
  const residencies = useQuery({
    queryKey: ["booking-link-residencies", session?.user?.id],
    enabled: isUserTatoueur && !isProject,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Residency[]> => {
      const data = await residencyRequest();
      return Array.isArray(data?.residencies) ? data.residencies : [];
    },
  });
  const venueOptions = (residencies.data ?? []).filter((item) => item.salonAllowsArtistCreate !== false);

  const artistOptions = useMemo(() => {
    const list = artists.data ?? [];
    if (context.initialTatoueurId && !list.some((item) => item.id === context.initialTatoueurId)) {
      return [{ id: context.initialTatoueurId, name: context.initialTatoueurLabel || "Tatoueur assigné" }, ...list];
    }
    return list;
  }, [artists.data, context.initialTatoueurId, context.initialTatoueurLabel]);

  // Recherche de fiche client (création autonome uniquement — jamais d'association automatique)
  const canPickClient = context.origin === "standalone" && !context.client;
  useEffect(() => {
    if (!canPickClient || pickedClient || clientQuery.trim().length < 2) { setClientResults([]); setClientSearching(false); return; }
    let active = true;
    setClientSearching(true);
    const timer = setTimeout(() => {
      searchClientsAction(clientQuery).then((result) => {
        if (!active) return;
        setClientResults(Array.isArray(result.clients) ? (result.clients as ClientOption[]).slice(0, 6) : []);
      }).finally(() => { if (active) setClientSearching(false); });
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [clientQuery, canPickClient, pickedClient]);

  const artistLabel = (() => {
    if (isProject) return context.inheritedArtistLabel || "Tatoueur du projet";
    if (isUserTatoueur) return session?.user?.salonName || session?.user?.name || "Vous";
    return artistOptions.find((item) => item.id === tatoueurId)?.name || "—";
  })();

  const validate = () => {
    const next: Record<string, string> = {};
    if (!Number.isInteger(duration) || duration < 1 || duration > 1440) next.duration = "Indiquez une durée entière entre 1 et 1 440 minutes.";
    if (mode === "FIXED_START" && !/^([01]\d|2[0-3]):[0-5]\d$/.test(fixedStartTime)) next.fixedStartTime = "Indiquez une heure de début au format HH:MM.";
    if (!isValidCivilDate(allowedFrom) || !isValidCivilDate(allowedTo)) next.window = "Indiquez une date de début et une date de fin.";
    else if (allowedFrom < today) next.window = "La période ne peut pas commencer dans le passé.";
    else if (allowedFrom > allowedTo) next.window = "La date de début doit précéder la date de fin.";
    else if (civilDateDiff(allowedFrom, allowedTo) + 1 > 366) next.window = "La période autorisée ne peut pas dépasser 366 jours.";
    if (expiresAt) {
      const date = new Date(expiresAt);
      if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) next.expiresAt = "La date d’expiration doit être située dans le futur.";
    }
    if (!isProject && !isUserTatoueur && !tatoueurId) next.tatoueur = "Choisissez le tatoueur concerné.";
    return next;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitLock.current) return;
    const next = validate();
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length) return;

    const clientId = context.origin === "standalone" ? pickedClient?.id ?? context.client?.id : undefined;
    const payload: CreateBookingLinkRequest = {
      prestation,
      durationMinutes: duration,
      mode,
      allowedFrom,
      allowedTo,
      ...(mode === "FIXED_START" && { fixedStartTime }),
      ...(expiresAt && { expiresAt: new Date(expiresAt).toISOString() }),
      ...(context.projectAppointmentId && { projectAppointmentId: context.projectAppointmentId }),
      ...(context.inboxThreadId && { inboxThreadId: context.inboxThreadId }),
      ...(context.conversationId && { conversationId: context.conversationId }),
      ...(clientId && { clientId }),
      ...(!isProject && !isUserTatoueur && tatoueurId && { tatoueurId }),
      ...(!isProject && isUserTatoueur && venueSalonId && { venueSalonId }),
    };

    submitLock.current = true;
    setSubmitting(true);
    try {
      const result = await createBookingLinkAction(payload);
      if (!result.ok) {
        const message = describeApiError(result, "Impossible de générer le lien.");
        const target = result.code ? ERROR_FIELDS[result.code] : undefined;
        if (target) setErrors({ [target]: message });
        setFormError({ message, details: result.messages && result.messages.length > 1 ? result.messages : undefined });
        toast.error(message);
        return;
      }
      if (!isUsableBookingUrl(result.data.bookingUrl) || !result.data.link?.id) {
        setFormError({ message: "Le serveur n’a pas renvoyé d’URL de réservation exploitable. Vérifiez la liste des liens avant de réessayer." });
        toast.error("Lien généré sans URL exploitable.");
        void queryClient.invalidateQueries({ queryKey: ["booking-links"] });
        return;
      }
      rememberBookingUrl(result.data.link.id, result.data.bookingUrl);
      void queryClient.invalidateQueries({ queryKey: ["booking-links"] });
      toast.success("Lien de réservation généré");
      setCreated(result.data);
      onCreated?.(result.data);
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const copy = async () => {
    if (!created) return;
    if (await copyToClipboard(created.bookingUrl)) toast.success("Lien copié dans le presse-papiers");
    else toast.error("Copie impossible : sélectionnez le lien et copiez-le manuellement.");
  };

  const send = async () => {
    if (!created || !delivery?.send || sending || sent) return;
    setSending(true);
    try {
      await delivery.send(bookingLinkMessage(created.link.prestation, created.bookingUrl));
      setSent(true);
      toast.success("Lien envoyé au client");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Envoi impossible. Copiez le lien pour le partager.");
    } finally {
      setSending(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Fenêtre de confirmation
  // ---------------------------------------------------------------------------
  if (created) {
    const link = created.link;
    return <SideFormDrawer category="Lien de réservation" title="Votre lien est prêt" description="Partagez ce lien avec votre client : il pourra réserver directement le créneau selon les règles définies." busy={sending} onClose={onClose}
      footer={<>
        <DashboardButton variant="secondary" onClick={onClose} disabled={sending}>Fermer</DashboardButton>
        {delivery?.insert && !sent && <DashboardButton variant="secondary" disabled={sending} onClick={() => { delivery.insert!(bookingLinkMessage(link.prestation, created.bookingUrl)); toast.success("Lien inséré dans votre réponse"); onClose(); }}><MessageSquarePlus size={14} />Insérer dans la réponse</DashboardButton>}
        {delivery?.send && <DashboardButton variant="secondary" disabled={sending || sent} onClick={() => void send()}>{sending ? <LoaderCircle size={14} className="animate-spin" /> : sent ? <Check size={14} /> : <Send size={14} />}{sent ? "Envoyé" : sending ? "Envoi…" : delivery.sendLabel || "Envoyer au client"}</DashboardButton>}
        <DashboardButton onClick={() => void copy()} disabled={sending}><Copy size={14} />Copier le lien</DashboardButton>
      </>}>
      <div className="space-y-4">
        <div className={`${panel} border-tertiary-400/25`}>
          <FormSectionHeader compact eyebrow="Lien généré" title="Lien de réservation personnel" description="Ce lien n’est affiché qu’une fois : copiez-le maintenant. Il reste copiable depuis la liste tant que cette page est ouverte." icon={<Link2 />} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <input readOnly aria-label="Lien de réservation" value={created.bookingUrl} onFocus={(event) => event.currentTarget.select()} className={`${field} font-mono text-xs`} />
            <button type="button" onClick={() => void copy()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 text-xs text-white transition hover:bg-white/10"><Copy size={14} />Copier</button>
          </div>
          {!delivery?.send && <p className="mt-2 text-[11px] leading-5 text-white/40">Collez-le dans votre échange (Instagram, WhatsApp, SMS, email…).</p>}
        </div>
        <dl className={`${panel} grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2`}>
          <div><dt className="text-[10px] text-white/35">Type de rendez-vous</dt><dd className="mt-1 text-sm text-white/85">{BOOKING_PRESTATION_LABELS[link.prestation] ?? link.prestation}</dd></div>
          <div><dt className="text-[10px] text-white/35">Durée</dt><dd className="mt-1 text-sm text-white/85">{formatDuration(link.durationMinutes)}</dd></div>
          <div><dt className="text-[10px] text-white/35">Tatoueur</dt><dd className="mt-1 text-sm text-white/85">{artistLabel}</dd></div>
          <div><dt className="text-[10px] text-white/35">Période proposée</dt><dd className="mt-1 text-sm text-white/85">Du {formatCivilDate(link.allowedFrom)} au {formatCivilDate(link.allowedTo)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-[10px] text-white/35">Règles horaires</dt><dd className="mt-1 text-sm leading-6 text-white/85">{describeBookingRules(link)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-[10px] text-white/35">Expiration</dt><dd className="mt-1 text-sm text-white/85">{link.expiresAt ? formatDateTime(link.expiresAt) : `Après le ${formatCivilDate(link.allowedTo)}`}</dd></div>
        </dl>
        <p className="text-[11px] leading-5 text-white/40">Aucun créneau n’est bloqué tant que le client n’a pas confirmé. Une fois réservé, le rendez-vous apparaîtra automatiquement dans votre agenda.</p>
      </div>
    </SideFormDrawer>;
  }

  // ---------------------------------------------------------------------------
  // Formulaire
  // ---------------------------------------------------------------------------
  const clientDisplay = context.client ?? pickedClient;
  return <SideFormDrawer category="Lien de réservation" title={isProject ? "Proposer un RDV tatouage" : "Créer un lien de réservation"}
    description="Définissez la prestation et les règles horaires : votre client choisira lui-même son créneau parmi vos disponibilités."
    busy={submitting} onClose={onClose}
    footer={<>
      <DashboardButton variant="secondary" onClick={onClose} disabled={submitting}>Annuler</DashboardButton>
      <DashboardButton type="submit" form={formId} disabled={submitting}>{submitting ? <LoaderCircle size={14} className="animate-spin" /> : <Link2 size={14} />}{submitting ? "Génération…" : "Générer le lien"}</DashboardButton>
    </>}>
    <form id={formId} noValidate onSubmit={(event) => void submit(event)} className="space-y-4">
      {context.originLabel && <p className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[11px] text-white/55">Origine : <span className="text-white/80">{context.originLabel}</span></p>}

      {/* Type */}
      <section className={panel}>
        <FormSectionHeader compact eyebrow="Prestation" title="Type de rendez-vous" description="Les liens de réservation concernent les séances de tatouage et de retouche." icon={<Paintbrush />} />
        <div role="radiogroup" aria-label="Type de rendez-vous" className="grid grid-cols-3 gap-2">
          {(["TATTOO", "RETOUCHE"] as const).map((value) => <button key={value} type="button" role="radio" aria-checked={prestation === value} onClick={() => setPrestation(value)} className={chip(prestation === value)}>{prestation === value && <Check size={13} />}{BOOKING_PRESTATION_LABELS[value]}</button>)}
          <button type="button" role="radio" aria-checked={false} disabled aria-describedby={`${formId}-projet`} title="Non disponible pour les liens de réservation" className={`${chip(false)} opacity-40`}>Projet</button>
        </div>
        <p id={`${formId}-projet`} className="mt-2 text-[11px] leading-5 text-white/35">Un RDV Projet se planifie depuis « Nouveau » : il n’est pas réservable par lien.</p>
      </section>

      {/* Professionnel */}
      <section className={panel}>
        <FormSectionHeader compact eyebrow="Professionnel" title="Tatoueur et lieu" description={isProject ? "Repris automatiquement du RDV Projet d’origine." : "Le client verra uniquement les disponibilités de ce professionnel."} icon={<UserRound />} />
        {isProject ? <div className="grid gap-2 sm:grid-cols-2">
          <ReadOnlyRow icon={<UserRound />} title="Tatoueur" value={artistLabel} />
          <ReadOnlyRow icon={<CalendarRange />} title="Salon" value={context.inheritedVenueLabel || session?.user?.salonName || "Salon du projet"} />
        </div> : isUserTatoueur ? <div className="space-y-3">
          <ReadOnlyRow icon={<UserRound />} title="Tatoueur" value={artistLabel} />
          {residencies.isLoading ? <p className="text-xs text-white/45">Chargement de vos salons…</p> : residencies.isError ? <p role="alert" className="text-xs text-red-300">Impossible de charger vos salons. Rechargez la page.</p> : venueOptions.length > 0 && <div>
            <label htmlFor={`${formId}-venue`} className={label}>Salon du rendez-vous</label>
            <select id={`${formId}-venue`} value={venueSalonId} aria-invalid={Boolean(errors.venue)} onChange={(event) => setVenueSalonId(event.target.value)} className={field}>
              <option value="">Mon propre lieu</option>
              {context.initialVenueSalonId && !venueOptions.some((item) => item.salonId === context.initialVenueSalonId) && <option value={context.initialVenueSalonId}>Salon de la conversation</option>}
              {venueOptions.map((item) => <option key={item.id} value={item.salonId}>{item.salon?.salonName}{item.salon?.city ? ` · ${item.salon.city}` : ""}</option>)}
            </select>
            <FieldError message={errors.venue} />
            <p className="mt-1.5 text-[11px] leading-5 text-white/35">Les disponibilités tiennent compte de vos dates de présence dans ce salon.</p>
          </div>}
        </div> : <div>
          <label htmlFor={`${formId}-artist`} className={label}>Tatoueur *</label>
          <select id={`${formId}-artist`} value={tatoueurId} aria-invalid={Boolean(errors.tatoueur)} aria-required="true" disabled={artists.isLoading} onChange={(event) => setTatoueurId(event.target.value)} className={field}>
            <option value="">{artists.isLoading ? "Chargement…" : "Choisissez un tatoueur"}</option>
            {artistOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          {artists.isError && <p role="alert" className="mt-1.5 text-[11px] text-red-300">Impossible de charger les tatoueurs.</p>}
          <FieldError message={errors.tatoueur} />
        </div>}
      </section>

      {/* Durée */}
      <section className={panel}>
        <FormSectionHeader compact eyebrow="Durée" title="Durée de la séance" description="La durée réservée sera exactement celle indiquée ici." icon={<Hourglass />} />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {DURATION_PRESETS.map((value) => <button key={value} type="button" aria-pressed={!customDuration && duration === value} onClick={() => { setCustomDuration(false); setDuration(value); setCustomDurationInput(String(value)); }} className={chip(!customDuration && duration === value)}>{formatDuration(value)}</button>)}
          <button type="button" aria-pressed={customDuration} onClick={() => setCustomDuration(true)} className={chip(customDuration)}>Personnalisée</button>
        </div>
        {customDuration && <div className="mt-3">
          <label htmlFor={`${formId}-duration`} className={label}>Durée en minutes</label>
          <div className="flex items-center gap-3">
            <input id={`${formId}-duration`} type="number" inputMode="numeric" min={1} max={1440} step={1} value={customDurationInput} aria-invalid={Boolean(errors.duration)}
              onChange={(event) => { setCustomDurationInput(event.target.value); setDuration(event.target.value === "" ? NaN : Number(event.target.value)); }} className={`${field} max-w-40`} />
            <span className="text-xs text-white/45">{Number.isFinite(duration) && duration > 0 ? `= ${formatDuration(duration)}` : ""}</span>
          </div>
        </div>}
        <FieldError message={errors.duration} />
      </section>

      {/* Mode horaire */}
      <section className={panel}>
        <FormSectionHeader compact eyebrow="Mode horaire" title="Comment le client choisit son créneau" description="Les disponibilités tiennent compte de vos horaires, pauses, indisponibilités et rendez-vous existants." icon={<Clock3 />} />
        <div role="radiogroup" aria-label="Mode horaire" className="grid gap-2 sm:grid-cols-2">
          {([
            { value: "FIXED_START" as const, title: "Heure de début prédéfinie", text: "Le client choisit uniquement une date disponible." },
            { value: "AUTOMATIC" as const, title: "Créneaux calculés automatiquement", text: "Le client choisit une date et une heure compatibles avec la durée." },
          ]).map((option) => <button key={option.value} type="button" role="radio" aria-checked={mode === option.value} onClick={() => setMode(option.value)}
            className={`rounded-xl border p-3 text-left transition ${mode === option.value ? "border-tertiary-400/50 bg-tertiary-400/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}>
            <span className="flex items-center gap-2 text-xs font-semibold text-white">{mode === option.value ? <Check size={13} className="text-tertiary-400" /> : <span className="size-[13px] rounded-full border border-white/25" />}{option.title}</span>
            <span className="mt-1.5 block text-[11px] leading-5 text-white/50">{option.text}</span>
          </button>)}
        </div>
        {mode === "FIXED_START" && <div className="mt-3">
          <label htmlFor={`${formId}-start`} className={label}>Heure de début (heure de Paris) *</label>
          <input id={`${formId}-start`} type="time" step={60} value={fixedStartTime} aria-invalid={Boolean(errors.fixedStartTime)} onChange={(event) => setFixedStartTime(event.target.value)} className={`${field} max-w-40`} />
          <FieldError message={errors.fixedStartTime} />
          {!errors.fixedStartTime && /^\d{2}:\d{2}$/.test(fixedStartTime) && Number.isFinite(duration) && duration > 0 && <p className="mt-1.5 text-[11px] text-white/45">Exemple : début à {fixedStartTime.replace(":", " h ")}, durée {formatDuration(duration)}.</p>}
        </div>}
      </section>

      {/* Période et expiration */}
      <section className={panel}>
        <FormSectionHeader compact eyebrow="Calendrier" title="Période autorisée et expiration" description="Limitez les dates proposées au client. Le lien expire au plus tard après le dernier jour autorisé." icon={<CalendarClock />} />
        <div className="mb-3 flex flex-wrap gap-2">
          {WINDOW_PRESETS.map((preset) => {
            const active = allowedFrom === today && allowedTo === addDaysToCivilDate(today, preset.days);
            return <button key={preset.label} type="button" aria-pressed={active} onClick={() => { setAllowedFrom(today); setAllowedTo(addDaysToCivilDate(today, preset.days)); }} className={chip(active)}>{preset.label}</button>;
          })}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label htmlFor={`${formId}-from`} className={label}>À partir du *</label><input id={`${formId}-from`} type="date" min={today} value={allowedFrom} aria-invalid={Boolean(errors.window)} onChange={(event) => setAllowedFrom(event.target.value)} className={field} /></div>
          <div><label htmlFor={`${formId}-to`} className={label}>Jusqu’au (inclus) *</label><input id={`${formId}-to`} type="date" min={allowedFrom || today} value={allowedTo} aria-invalid={Boolean(errors.window)} onChange={(event) => setAllowedTo(event.target.value)} className={field} /></div>
        </div>
        <FieldError message={errors.window} />
        <div className="mt-4 border-t border-white/[0.07] pt-3">
          <label htmlFor={`${formId}-expires`} className={label}>Expiration du lien (facultatif)</label>
          <div className="flex items-center gap-2">
            <input id={`${formId}-expires`} type="datetime-local" value={expiresAt} aria-invalid={Boolean(errors.expiresAt)} onChange={(event) => setExpiresAt(event.target.value)} className={`${field} max-w-64`} />
            {expiresAt && <button type="button" aria-label="Retirer la date d’expiration" onClick={() => setExpiresAt("")} className="grid size-9 place-items-center rounded-xl border border-white/10 text-white/50 hover:text-white"><X size={14} /></button>}
          </div>
          <FieldError message={errors.expiresAt} />
          <p className="mt-1.5 text-[11px] leading-5 text-white/35">Après cette date, le client ne pourra plus réserver avec ce lien.</p>
        </div>
      </section>

      {/* Client */}
      <section className={panel}>
        <FormSectionHeader compact eyebrow="Client" title="Client associé" description={context.origin === "standalone" ? "Facultatif : sans fiche, le client renseignera ses coordonnées lors de la réservation." : "Repris automatiquement du contexte d’origine."} icon={<UserRound />} />
        {clientDisplay ? <div className="relative">
          <ReadOnlyRow icon={<UserRound />} title="Client" value={clientDisplay.label} detail={clientDisplay.detail} />
          {pickedClient && <button type="button" aria-label="Retirer le client" onClick={() => setPickedClient(null)} className="absolute right-2 top-2 grid size-7 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"><X size={14} /></button>}
        </div> : canPickClient ? <div>
          <label htmlFor={`${formId}-client`} className="sr-only">Rechercher une fiche client</label>
          <div className="relative"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" /><input id={`${formId}-client`} value={clientQuery} onChange={(event) => setClientQuery(event.target.value)} placeholder="Rechercher une fiche (nom ou email)…" autoComplete="off" className={`${field} pl-9`} /></div>
          {clientSearching && <p className="mt-2 text-[11px] text-white/40">Recherche…</p>}
          {clientResults.length > 0 && <ul className="mt-2 space-y-1">{clientResults.map((client) => <li key={client.id}><button type="button" onClick={() => { setPickedClient({ id: client.id, label: [client.firstName, client.lastName].filter(Boolean).join(" ") || "Client", detail: client.email }); setClientQuery(""); }} className="w-full rounded-xl border border-white/10 px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5">{[client.firstName, client.lastName].filter(Boolean).join(" ")}<span className="block text-[11px] text-white/40">{client.email}</span></button></li>)}</ul>}
          {!clientSearching && clientQuery.trim().length >= 2 && clientResults.length === 0 && <p className="mt-2 text-[11px] text-white/40">Aucune fiche trouvée. Vous pouvez générer le lien sans client.</p>}
        </div> : <p className="text-xs text-white/50">Aucun client associé.</p>}
        {context.clientNotice && <p className="mt-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-[11px] leading-5 text-amber-200/85">{context.clientNotice}</p>}
      </section>

      {formError && <div role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2.5 text-xs text-red-200">
        <p>{formError.message}</p>
        {formError.details && <ul className="mt-1.5 list-disc pl-4 text-[11px] text-red-200/80">{formError.details.map((item) => <li key={item}>{item}</li>)}</ul>}
      </div>}
    </form>
  </SideFormDrawer>;
}
