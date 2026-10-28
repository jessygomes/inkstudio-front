/* eslint-disable @next/next/no-img-element */
"use client";

import imageCompression from "browser-image-compression";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  CalendarDays,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileImage,
  Link2,
  Loader2,
  MessageSquarePlus,
  Pencil,
  Trash2,
  Upload,
  Send,
  X,
} from "lucide-react";
import DrawingBoardFilters from "./DrawingBoardFilters";
import DrawingCardEditor from "./DrawingCardEditor";
import DashboardButton from "@/components/Shared/DashboardButton";
import ShowRdvDetails from "@/components/Application/RDV/ShowRdvDetails";
import type { CalendarEvent } from "@/components/Application/RDV/Calendar";
import { fetchAppointmentById, paidAppointmentsAction } from "@/lib/queries/appointment";
import { useUploadThing } from "@/lib/utils/uploadthing";
import { fetchAllAppointments } from "@/lib/queries/appointment";
import {
  getMoodboardByAppointmentAction,
  type MoodboardDto,
} from "@/lib/queries/moodboard";
import {
  addDrawingCardImage,
  addDrawingCardNote,
  approveDrawingCardImage,
  deleteDrawingCard,
  deleteDrawingCardImage,
  getDrawingCards,
  linkDrawingCardToTattooAppointment,
  updateDrawingCard,
  updateDrawingCardImage,
  sendDrawingCardImage,
} from "@/lib/queries/suiviDessin";
import {
  DRAWING_CARD_STATUSES,
  type DrawingCard,
  type DrawingCardNoteType,
  type DrawingCardStatus,
} from "@/lib/types/suiviDessin";

// Configuration visuelle des cinq colonnes du workflow.
// Chaque clé correspond exactement à un statut renvoyé par le backend.
const columns: Record<DrawingCardStatus, { label: string; color: string }> = {
  A_DESSINER: { label: "À dessiner", color: "bg-slate-400" },
  EN_COURS: { label: "En cours", color: "bg-sky-400" },
  A_MODIFIER: { label: "À modifier", color: "bg-amber-400" },
  TERMINE: { label: "Terminé", color: "bg-violet-400" },
  APPROUVE: { label: "Approuvé", color: "bg-emerald-400" },
};

// Construit le nom du client depuis une fiche salon ou un compte connecté.
const personName = (card: DrawingCard) => {
  const client = card.client ?? card.clientUser;
  return (
    [client?.firstName, client?.lastName].filter(Boolean).join(" ") ||
    "Client non renseigné"
  );
};

// Construit le nom de l'artiste depuis un tatoueur interne ou un user tatoueur.
const artistName = (card: DrawingCard) => {
  const artist = card.tatoueur ?? card.performerUser;
  return (
    artist?.name ||
    artist?.salonName ||
    [artist?.firstName, artist?.lastName].filter(Boolean).join(" ") ||
    "Non assigné"
  );
};

/**
 * Tableau principal du Suivi dessin.
 * Charge les cards, applique les filtres et les distribue dans le Kanban.
 */
export default function DrawingBoard() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCardId = searchParams.get("cardId");

  // Liste des cards et card actuellement ouverte dans le panneau latéral.
  const [cards, setCards] = useState<DrawingCard[]>([]);
  const [selected, setSelected] = useState<DrawingCard | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Valeurs contrôlées de la barre de filtres.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DrawingCardStatus | "">("");
  const [artist, setArtist] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Recharge les cards avec les filtres actifs et actualise la card ouverte.
  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDrawingCards({
        search: search.trim() || undefined,
        tatoueurId: artist || undefined,
        appointmentDateFrom: from
          ? new Date(`${from}T00:00:00`).toISOString()
          : undefined,
        appointmentDateTo: to
          ? new Date(`${to}T23:59:59.999`).toISOString()
          : undefined,
      });
      setCards(data);
      setSelected((current) =>
        current ? data.find((card) => card.id === current.id) ?? null : null,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de charger les cards",
      );
    } finally {
      setLoading(false);
    }
  }, [artist, from, search, to]);

  // Évite un appel API à chaque frappe dans le champ de recherche.
  useEffect(() => {
    const timer = setTimeout(reload, 250);
    return () => clearTimeout(timer);
  }, [reload]);

  // Ouvre directement la card demandée depuis le détail d'un rendez-vous.
  useEffect(() => {
    if (loading || !requestedCardId) return;
    const requestedCard = cards.find((card) => card.id === requestedCardId);
    if (requestedCard) setSelected(requestedCard);
  }, [cards, loading, requestedCardId]);

  // Génère les options uniques du filtre tatoueur depuis les cards chargées.
  const artists = useMemo(() => {
    const map = new Map<string, string>();
    cards.forEach((card) => {
      const id = card.tatoueurId ?? card.performerUserId;
      if (id) map.set(id, artistName(card));
    });
    return [...map.entries()];
  }, [cards]);

  // Le filtre de statut limite l'affichage à une colonne.
  const visibleStatuses = statusFilter ? [statusFilter] : DRAWING_CARD_STATUSES;

  // Déplace immédiatement une card, puis confirme le changement avec le backend.
  // En cas d'échec, l'état précédent du Kanban est restauré.
  const move = async (card: DrawingCard, status: DrawingCardStatus) => {
    const previous = cards;
    setCards((items) =>
      items.map((item) => (item.id === card.id ? { ...item, status } : item)),
    );
    try {
      await updateDrawingCard(card.id, { status });
      await reload();
    } catch (error) {
      setCards(previous);
      toast.error(
        error instanceof Error ? error.message : "Déplacement impossible",
      );
    }
  };

  return (
    <div className="mt-3 flex flex-1 flex-col gap-3 [&_button:not(:disabled)]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_select:not(:disabled)]:cursor-pointer [&_select:disabled]:cursor-not-allowed [&_select]:[color-scheme:dark] [&_option]:bg-[#171717] [&_option]:text-white">
      {createOpen && <DrawingCardEditor onClose={() => setCreateOpen(false)} onSaved={async card => { await reload(); setSelected(card); toast.success("Card de dessin créée"); }} />}
      {/* Recherche et filtres du Kanban. */}
      <DrawingBoardFilters
        onCreate={() => setCreateOpen(true)}
        search={search}
        status={statusFilter}
        artist={artist}
        from={from}
        to={to}
        artists={artists}
        statusLabels={{
          A_DESSINER: columns.A_DESSINER.label,
          EN_COURS: columns.EN_COURS.label,
          A_MODIFIER: columns.A_MODIFIER.label,
          TERMINE: columns.TERMINE.label,
          APPROUVE: columns.APPROUVE.label,
        }}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onArtistChange={setArtist}
        onFromChange={setFrom}
        onToChange={setTo}
        onClear={() => {
          setSearch("");
          setStatusFilter("");
          setArtist("");
          setFrom("");
          setTo("");
        }}
      />

      {/* Chargement, puis affichage des colonnes et de leurs cards. */}
      {loading ? (
        <div className="flex min-h-64 items-center justify-center text-white/60">
          <Loader2 className="mr-2 animate-spin" size={18} /> Chargement…
        </div>
      ) : (
        <div
          className="grid flex-1 grid-cols-[repeat(5,minmax(260px,1fr))] items-stretch gap-3 overflow-x-auto xl:grid-cols-[repeat(5,minmax(0,1fr))] xl:overflow-x-visible"
        >
          {visibleStatuses.map((status) => {
            const items = cards.filter((card) => card.status === status);
            return (
              <section
                key={status}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const card = cards.find(
                    (item) =>
                      item.id ===
                      event.dataTransfer.getData("text/drawing-card"),
                  );
                  if (card && card.status !== status) move(card, status);
                }}
                className="min-h-[420px] min-w-0 rounded-2xl border border-white/10 bg-white/[0.025] p-2.5"
              >
                <header className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${columns[status].color}`}
                    />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-white/80">
                      {columns[status].label}
                    </h2>
                  </div>
                  <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/50">
                    {items.length}
                  </span>
                </header>
                <div className="space-y-2.5">
                  {items.map((card) => (
                    <CardItem
                      key={card.id}
                      card={card}
                      onOpen={() => setSelected(card)}
                      onMove={move}
                    />
                  ))}
                  {!items.length && (
                    <p className="py-12 text-center text-[11px] text-white/25">
                      Aucune card
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Détails de la card sélectionnée dans un panneau latéral. */}
      {selected && (
        <CardPanel
          key={selected.id}
          card={selected}
          userId={session?.user?.id}
          onClose={() => {
            setSelected(null);
            if (requestedCardId) router.replace("/suiviDessin");
          }}
          onChanged={reload}
        />
      )}
    </div>
  );
}

/** Card compacte affichée dans une colonne du Kanban. */
function CardItem({
  card,
  onOpen,
  onMove,
}: {
  card: DrawingCard;
  onOpen: () => void;
  onMove: (card: DrawingCard, status: DrawingCardStatus) => void;
}) {
  const index = DRAWING_CARD_STATUSES.indexOf(card.status);

  // Utilise en priorité l'image approuvée, sinon la version la plus récente.
  const cover = [...card.images].sort(
    (a, b) =>
      Number(b.isApproved) - Number(a.isApproved) || b.version - a.version,
  )[0];
  const appointment = card.sourceAppointment ?? card.tattooAppointment;
  return (
    <article
      draggable
      onDragStart={(event) =>
        event.dataTransfer.setData("text/drawing-card", card.id)
      }
      className="cursor-grab overflow-hidden rounded-xl border border-white/10 bg-noir-600/80 shadow-lg transition hover:border-tertiary-400/30 active:cursor-grabbing"
    >
      {cover && (
        <button
          onClick={onOpen}
          className="relative block h-28 w-full overflow-hidden bg-black/20"
        >
          <img
            src={cover.url}
            alt={cover.caption || card.title}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
          />
          {cover.isApproved && (
            <span className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-semibold text-white">
              Approuvée
            </span>
          )}
        </button>
      )}
      <button onClick={onOpen} className="block w-full p-3 text-left">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">
          {card.title}
        </h3>
        <p className="mt-1 text-xs text-white/65">{personName(card)}</p>
        <div className="mt-2 flex items-center justify-between text-[10px] text-white/35">
          <span>{artistName(card)}</span>
          <span>
            {appointment ? new Date(appointment.start).toLocaleDateString("fr-FR") : "Sans RDV"}
          </span>
        </div>
        <div className="mt-2 flex gap-3 text-[10px] text-white/45">
          <span>
            {card.images.length} image{card.images.length > 1 ? "s" : ""}
          </span>
          <span>
            {card.notes.length} note{card.notes.length > 1 ? "s" : ""}
          </span>
        </div>
      </button>
      <div className="flex border-t border-white/8">
        <button
          disabled={index === 0}
          onClick={() => onMove(card, DRAWING_CARD_STATUSES[index - 1])}
          className="flex flex-1 justify-center py-2 text-white/45 hover:bg-tertiary-400/15 disabled:opacity-20"
          aria-label="Colonne précédente"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          disabled={index === DRAWING_CARD_STATUSES.length - 1}
          onClick={() => onMove(card, DRAWING_CARD_STATUSES[index + 1])}
          className="flex flex-1 justify-center border-l border-white/8 py-2 text-white/45 hover:bg-tertiary-400/15 disabled:opacity-20"
          aria-label="Colonne suivante"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </article>
  );
}

/**
 * Panneau détaillé d'une card.
 * Regroupe ses informations, ses images, ses notes et la liaison à un RDV Tattoo.
 */
function CardPanel({
  card,
  userId,
  onClose,
  onChanged,
}: {
  card: DrawingCard;
  userId?: string;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [tab, setTab] = useState<
    "details" | "images" | "notes" | "moodboard"
  >("details");
  const [saving, setSaving] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [associationsOpen, setAssociationsOpen] = useState(false);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState(false);
  const [sourceEvent, setSourceEvent] = useState<CalendarEvent | null>(null);
  const sourceRequest = useRef(0);

  const loadSource = async () => {
    if (!card.sourceAppointmentId) return;
    const request = ++sourceRequest.current;
    setSourceLoading(true);
    setSourceError(false);
    try {
      const appointment = await fetchAppointmentById(card.sourceAppointmentId);
      if (request !== sourceRequest.current) return;
      if (!appointment) throw new Error("Rendez-vous introuvable");
      setSourceEvent({
        ...appointment,
        client: appointment.client ?? appointment.clientUser ?? {
          firstName: "", lastName: "", email: "",
        },
      });
    } catch {
      if (request === sourceRequest.current) setSourceError(true);
    } finally {
      if (request === sourceRequest.current) setSourceLoading(false);
    }
  };

  const refreshSource = async () => {
    await loadSource();
    await onChanged();
  };
  const [moodboard, setMoodboard] = useState<MoodboardDto | null>(null);
  const [moodboardLoading, setMoodboardLoading] = useState(true);

  // Valeurs éditables de l'onglet Informations.
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [additionalInfo, setAdditionalInfo] = useState(
    card.additionalInfo || "",
  );

  // Valeurs des formulaires d'ajout de note et d'image.
  const [note, setNote] = useState("");
  const [noteType, setNoteType] = useState<DrawingCardNoteType>("INTERNAL");
  const [caption, setCaption] = useState("");

  // RDV Tattoo compatibles proposés lorsque la card est approuvée.
  const [tattooAppointments, setTattooAppointments] = useState<
    Array<{ id: string; title: string; start: string; clientId?: string }>
  >([]);
  const [appointmentId, setAppointmentId] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { startUpload, isUploading } = useUploadThing("imageUploader");

  // Le moodboard du client est rattaché au rendez-vous source de la card.
  useEffect(() => {
    let cancelled = false;

    setMoodboard(null);
    if (!card.sourceAppointmentId) {
      setMoodboardLoading(false);
      return;
    }
    setMoodboardLoading(true);
    getMoodboardByAppointmentAction(card.sourceAppointmentId)
      .then((result) => {
        if (!cancelled) setMoodboard(result.ok ? result.data ?? null : null);
      })
      .catch(() => {
        if (!cancelled) setMoodboard(null);
      })
      .finally(() => {
        if (!cancelled) setMoodboardLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [card.sourceAppointmentId]);

  // Charge uniquement les RDV Tattoo du même client que la card approuvée.
  useEffect(() => {
    if (card.status !== "APPROUVE" || !userId) return;
    fetchAllAppointments(
      userId,
      1,
      100,
      undefined,
      undefined,
      undefined,
      "TATTOO",
    )
      .then((result) =>
        setTattooAppointments(
          (result?.appointments || []).filter(
            (item: { clientId?: string }) =>
              !card.clientId || item.clientId === card.clientId,
          ),
        ),
      )
      .catch(() => setTattooAppointments([]));
  }, [card.clientId, card.status, userId]);

  // Centralise les mutations : chargement, notification et rafraîchissement.
  const execute = async (action: () => Promise<unknown>, message: string) => {
    try {
      setSaving(true);
      await action();
      toast.success(message);
      await onChanged();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    } finally {
      setSaving(false);
    }
  };

  // Compresse l'image, l'envoie à UploadThing puis crée une nouvelle version.
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const compressed = await imageCompression(files[0], {
        maxSizeMB: 2,
        maxWidthOrHeight: 2400,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.85,
      });
      const result = await startUpload([compressed]);
      const url = result?.[0]?.ufsUrl ?? result?.[0]?.url;
      if (!url) throw new Error("URL d’image introuvable");
      await execute(
        () =>
          addDrawingCardImage(card.id, {
            url,
            caption: caption.trim() || undefined,
          }),
        "Nouvelle version ajoutée",
      );
      setCaption("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload impossible");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-black/70 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <aside role="dialog" aria-modal="true" aria-labelledby="drawing-panel-title" className="relative flex h-dvh w-full max-w-2xl flex-col border-l border-white/10 bg-noir-700 font-one shadow-2xl">
        <div inert={sourceOpen} className="flex min-h-0 flex-1 flex-col">
        {/* En-tête et identité de la card. */}
        <header className="flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-br from-tertiary-400/10 to-transparent px-5 py-6 sm:px-7">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-widest text-white/80">
              <span className={`h-1.5 w-1.5 rounded-full ${columns[card.status].color}`} />
              {columns[card.status].label}
            </span>
            <h2 id="drawing-panel-title" className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {card.title}
            </h2>
            <p className="text-xs text-white/50">
              {personName(card)} · {artistName(card)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le suivi du dessin"
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </header>

        {/* Navigation entre les différentes parties du panneau. */}
        <nav aria-label="Sections du suivi" className="mx-5 mt-5 grid grid-cols-4 gap-1 rounded-2xl border border-white/8 bg-black/20 p-1 sm:mx-7">
          {(
            [
              ["details", "Informations"],
              ["images", `Images (${card.images.length})`],
              ["notes", `Notes (${card.notes.length})`],
              ["moodboard", "Moodboard"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`rounded-xl px-1 py-2.5 text-[11px] font-medium transition sm:text-xs ${tab === id ? "bg-white/10 text-white shadow-sm" : "text-white/45 hover:bg-white/5 hover:text-white/80"}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
          {/* Informations générales, édition et association à un RDV Tattoo. */}
          {tab === "details" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3"><h3 className="text-xs font-medium text-white/65">Client et rendez-vous</h3><button type="button" disabled={saving} onClick={() => setAssociationsOpen(true)} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-[11px] text-white/65 transition hover:bg-white/5"><Link2 size={13} />Modifier les liaisons</button></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => { if (card.sourceAppointmentId) { setSourceOpen(true); void loadSource(); } else { setAssociationsOpen(true); } }}
                  className="group rounded-2xl border border-tertiary-400/25 bg-tertiary-400/5 p-4 text-left transition hover:border-tertiary-400/50 hover:bg-tertiary-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 sm:col-span-2"
                >
                  <span className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-tertiary-400">
                    <span className="flex items-center gap-2"><CalendarDays size={14} />RDV source</span>
                    <ArrowUpRight size={16} />
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-white">{card.sourceAppointment?.title || "Aucun rendez-vous associé"}</span>
                  <span className="mt-1 block text-xs text-white/55">
                    {card.sourceAppointment ? new Date(card.sourceAppointment.start).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" }) : "Cette card peut être préparée sans rendez-vous."}
                  </span>
                  <span className="mt-3 block text-[11px] text-tertiary-400">{card.sourceAppointment ? "Voir tous les détails du rendez-vous" : "Associer un rendez-vous"}</span>
                </button>
                <Info
                  label="Statut RDV"
                  value={card.sourceAppointment?.status || "Sans rendez-vous"}
                />
                <Info label="Client" value={personName(card)} />
                <Info label="Tatoueur" value={artistName(card)} />
              </div>
              <label className="block text-xs text-white/55">
                Titre
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                />
              </label>
              <label className="block text-xs text-white/55">
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                />
              </label>
              <label className="block text-xs text-white/55">
                Informations complémentaires
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                />
              </label>

              {(card.status === "APPROUVE" || card.tattooAppointment) && (
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3">
                    <p className="mb-2 text-xs font-semibold text-emerald-300">
                      Lier à un RDV Tattoo
                    </p>
                    {card.tattooAppointment ? (
                      <Info
                        label="RDV associé"
                        value={`${card.tattooAppointment.title} · ${new Date(card.tattooAppointment.start).toLocaleDateString("fr-FR")}`}
                      />
                    ) : (
                      <div className="flex gap-2">
                        <select
                          value={appointmentId}
                          onChange={(e) => setAppointmentId(e.target.value)}
                          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-noir-600 p-2 text-xs text-white"
                        >
                          <option value="">Choisir un RDV compatible</option>
                          {tattooAppointments.map((appointment) => (
                            <option key={appointment.id} value={appointment.id}>
                              {appointment.title} ·{" "}
                              {new Date(appointment.start).toLocaleDateString(
                                "fr-FR",
                              )}
                            </option>
                          ))}
                        </select>
                        <button
                          disabled={!appointmentId || saving}
                          onClick={() =>
                            execute(
                              () =>
                                linkDrawingCardToTattooAppointment(
                                  card.id,
                                  appointmentId,
                                ),
                              "RDV Tattoo associé",
                            )
                          }
                          className="rounded-xl bg-emerald-500 px-3 text-white disabled:opacity-40"
                        >
                          <Link2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

              <div className="flex gap-2">
                <DashboardButton
                  variant="primary"
                  disabled={saving}
                  onClick={() =>
                    execute(
                      () =>
                        updateDrawingCard(card.id, {
                          title,
                          description,
                          additionalInfo,
                        }),
                      "Card mise à jour",
                    )
                  }
                >
                  <Pencil size={13} className="mr-2 inline" />
                  Enregistrer
                </DashboardButton>
                <DashboardButton
                  variant="secondary"
                  disabled={saving}
                  onClick={() => {
                    if (window.confirm("Supprimer définitivement cette card ?"))
                      execute(
                        () => deleteDrawingCard(card.id),
                        "Card supprimée",
                      ).then(onClose);
                  }}
                >
                  <Trash2 size={13} className="mr-1 inline" />
                  Supprimer la card
                </DashboardButton>
              </div>
            </div>
          )}
          {/* Upload et gestion des différentes versions du dessin. */}
          {tab === "images" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-white/15 p-3">
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Légende de cette version"
                  className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white"
                />
                <DashboardButton
                  variant="primary"
                  disabled={isUploading}
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full !min-w-0 !rounded-lg"
                >
                  <Upload size={14} />
                  {isUploading ? "Envoi…" : "Ajouter une version"}
                </DashboardButton>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(event) => upload(event.target.files)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[...card.images]
                  .sort((a, b) => b.version - a.version)
                  .map((image) => (
                    <ImageItem
                      key={image.id}
                      cardId={card.id}
                      image={image}
                      execute={execute}
                      onChanged={onChanged}
                      saving={saving}
                    />
                  ))}
                {!card.images.length && (
                  <div className="col-span-2 py-12 text-center text-white/30">
                    <FileImage className="mx-auto mb-2" />
                    Aucune image
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Saisie et historique chronologique des notes et échanges. */}
          {tab === "notes" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Ajouter une note ou un échange…"
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white"
                />
                <div className="mt-2 flex gap-2">
                  <select
                    value={noteType}
                    onChange={(e) =>
                      setNoteType(e.target.value as DrawingCardNoteType)
                    }
                    className="flex-1 rounded-lg border border-white/10 bg-noir-600 p-2 text-xs text-white"
                  >
                    <option value="INTERNAL">Note interne</option>
                    <option value="CLIENT_EXCHANGE">Échange client</option>
                    <option value="DESIGN_UPDATE">Mise à jour dessin</option>
                  </select>
                  <DashboardButton
                    variant="primary"
                    disabled={!note.trim() || saving}
                    onClick={() =>
                      execute(
                        () =>
                          addDrawingCardNote(card.id, {
                            content: note.trim(),
                            type: noteType,
                          }),
                        "Note ajoutée",
                      ).then(() => setNote(""))
                    }
                    className="!min-w-0 !rounded-lg !px-3"
                  >
                    <MessageSquarePlus size={15} />
                  </DashboardButton>
                </div>
              </div>
              <div className="space-y-3">
                {card.notes.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/8 bg-white/[0.025] p-3"
                  >
                    <div className="flex justify-between text-[10px] text-white/35">
                      <span>
                        {item.type === "INTERNAL"
                          ? "Note interne"
                          : item.type === "CLIENT_EXCHANGE"
                            ? "Échange client"
                            : "Mise à jour"}
                      </span>
                      <span>
                        {new Date(item.createdAt).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-white/80">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "moodboard" && (
            <div className="space-y-4">
              {moodboardLoading ? (
                <p className="py-12 text-center text-sm text-white/45">
                  Chargement du moodboard…
                </p>
              ) : !moodboard ? (
                <p className="py-12 text-center text-sm text-white/45">
                  Aucun moodboard
                </p>
              ) : (
                <>
                  {(moodboard.title || moodboard.name || moodboard.description) && (
                    <div>
                      {(moodboard.title || moodboard.name) && (
                        <h3 className="text-sm font-semibold text-white">
                          {moodboard.title || moodboard.name}
                        </h3>
                      )}
                      {moodboard.description && (
                        <p className="mt-1 text-xs leading-relaxed text-white/55">
                          {moodboard.description}
                        </p>
                      )}
                    </div>
                  )}
                  {moodboard.images?.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {moodboard.images.map((image) => {
                        const imageUrl = image.imageUrl || image.url;
                        if (!imageUrl) return null;

                        return (
                          <a
                            key={image.id}
                            href={imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                          >
                            <img
                              src={imageUrl}
                              alt={
                                image.title ||
                                image.caption ||
                                "Image du moodboard"
                              }
                              className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            {(image.title || image.caption || image.description) && (
                              <div className="space-y-1 p-3">
                                {image.title && (
                                  <p className="text-xs font-semibold text-white">
                                    {image.title}
                                  </p>
                                )}
                                {image.caption && (
                                  <p className="text-[11px] text-white/65">
                                    {image.caption}
                                  </p>
                                )}
                                {image.description && (
                                  <p className="text-[11px] text-white/50">
                                    {image.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-12 text-center text-sm text-white/45">
                      Aucun moodboard
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        </div>
        {associationsOpen && <DrawingCardEditor card={card} onClose={() => setAssociationsOpen(false)} onSaved={async () => { sourceRequest.current++; setSourceOpen(false); setSourceEvent(null); setSourceLoading(false); setSourceError(false); await onChanged(); toast.success("Liaisons mises à jour"); }} />}
        {sourceOpen && (
          <div className="absolute inset-0 z-10 flex flex-col bg-noir-700" role="dialog" aria-modal="true" aria-label="Détails du rendez-vous source">
            <div className="shrink-0 border-b border-white/10 px-4 py-3">
              <button type="button" onClick={() => setSourceOpen(false)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-white/70 transition hover:bg-white/5 hover:text-white">
                <ChevronLeft size={15} />Retour au dessin
              </button>
            </div>
            <div className="min-h-0 flex-1">
              {sourceLoading ? (
                <div role="status" className="flex h-full items-center justify-center gap-2 text-sm text-white/60"><Loader2 size={18} className="animate-spin" />Chargement du rendez-vous…</div>
              ) : sourceError ? (
                <div role="alert" className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-sm text-white/60">
                  <p>Impossible de charger le rendez-vous.</p>
                  <button type="button" onClick={() => void loadSource()} className="rounded-xl border border-white/15 px-4 py-2 text-white hover:bg-white/5">Réessayer</button>
                </div>
              ) : sourceEvent && (
                <ShowRdvDetails
                  selectedEvent={sourceEvent}
                  onClose={() => setSourceOpen(false)}
                  userId={userId ?? null}
                  price={sourceEvent.tattooDetail?.price ?? sourceEvent.tattooDetail?.estimatedPrice}
                  handleRdvUpdated={() => { void refreshSource(); }}
                  handleStatusChange={() => { void refreshSource(); }}
                  handlePaymentStatusChange={async (id, isPayed) => {
                    try {
                      await paidAppointmentsAction(id, isPayed);
                      await refreshSource();
                    } catch { toast.error("Impossible de mettre à jour le paiement"); }
                  }}
                />
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

/** Bloc compact utilisé pour une information en lecture seule. */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
      <p className="text-[9px] uppercase tracking-wider text-white/30">
        {label}
      </p>
      <p className="mt-1 text-xs text-white/75">{value}</p>
    </div>
  );
}

/** Version d'image avec actions de légende, approbation et suppression. */
function ImageItem({
  cardId,
  image,
  execute,
  onChanged,
  saving,
}: {
  cardId: string;
  image: DrawingCard["images"][number];
  execute: (action: () => Promise<unknown>, message: string) => Promise<void>;
  onChanged: () => Promise<void>;
  saving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(image.caption || "");
  const [sending, setSending] = useState(false);
  const [delivery, setDelivery] = useState<Awaited<ReturnType<typeof sendDrawingCardImage>> | null>(null);
  const emailSent = Boolean(image.clientEmailSentAt) || Boolean(delivery?.emailSent);
  const messageSent = Boolean(image.clientMessageSentAt) || Boolean(delivery?.messageSent);
  const delivered = emailSent && (messageSent || delivery?.conversationExists === false);
  const sendToClient = async () => {
    if (sending) return;
    setSending(true);
    try {
      const result = await sendDrawingCardImage(cardId, image.id);
      setDelivery(result);
      if (result.emailError || result.messageError) {
        toast.warning([result.emailError, result.messageError].filter(Boolean).join(" "));
      } else {
        toast.success(result.messageSent ? "Dessin envoyé par email et dans la messagerie Inkera" : "Dessin envoyé par email");
      }
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Envoi impossible");
    } finally {
      setSending(false);
    }
  };
  return (
    <div
      className={`overflow-hidden rounded-xl border ${image.isApproved ? "border-emerald-400/50" : "border-white/10"}`}
    >
      <a
        href={image.url}
        target="_blank"
        rel="noreferrer"
        className="block cursor-zoom-in"
      >
        <img
          src={image.url}
          alt={image.caption || `Version ${image.version}`}
          className="h-44 w-full object-cover"
        />
      </a>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">
            Version {image.version}
          </span>
          {image.isApproved && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-300">
              <Check size={11} /> Approuvée
            </span>
          )}
        </div>
        {editing ? (
          <div className="mt-2 flex gap-1">
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-w-0 flex-1 rounded-lg bg-white/5 p-2 text-xs text-white"
            />
            <button
              onClick={() =>
                execute(
                  () => updateDrawingCardImage(cardId, image.id, caption),
                  "Légende modifiée",
                ).then(() => setEditing(false))
              }
              className="rounded-lg bg-tertiary-400/10 px-2 text-white"
            >
              <Check size={13} />
            </button>
          </div>
        ) : (
          <p className="mt-1 min-h-4 text-xs text-white/45">
            {image.caption || "Sans légende"}
          </p>
        )}
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
          <button
            type="button"
            disabled={sending || saving || delivered}
            onClick={() => void sendToClient()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-tertiary-400/25 bg-tertiary-400/10 px-3 py-2.5 text-xs font-medium text-tertiary-400 transition hover:bg-tertiary-400/20 disabled:opacity-50"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : delivered ? <Check size={14} /> : <Send size={14} />}
            {sending ? "Envoi en cours…" : delivered ? "Envoyé au client" : emailSent || messageSent ? "Compléter l’envoi au client" : "Envoyer au client"}
          </button>
          <p className="text-[10px] leading-relaxed text-white/40">
            {emailSent || messageSent ? `${emailSent ? "Email envoyé" : "Email non envoyé"} · ${messageSent ? "Message Inkera envoyé" : delivery?.conversationExists === false ? "Aucune conversation Inkera" : "Message Inkera non envoyé"}. Retour client attendu.` : "Par email et dans la messagerie Inkera si une conversation existe. Le client sera invité à donner son avis."}
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            disabled={image.isApproved || sending || saving}
            onClick={() =>
              execute(
                () => approveDrawingCardImage(cardId, image.id),
                "Image approuvée",
              )
            }
            className="flex-1 rounded-lg bg-emerald-500/15 py-1.5 text-[10px] text-emerald-300 disabled:opacity-30"
          >
            Approuver
          </button>
          <button
            disabled={sending || saving}
            onClick={() => setEditing(!editing)}
            className="rounded-lg bg-tertiary-400/10 px-2 text-white/60"
          >
            <Pencil size={12} />
          </button>
          <button
            disabled={sending || saving}
            onClick={() => {
              if (window.confirm("Supprimer cette image ?"))
                execute(
                  () => deleteDrawingCardImage(cardId, image.id),
                  "Image supprimée",
                );
            }}
            className="rounded-lg bg-red-500/10 px-2 text-red-300"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
