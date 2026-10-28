"use client";
import { useActivityNotifications } from "@/components/Providers/ActivityNotificationsProvider";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCheck, ChevronLeft, ChevronRight, ClipboardCheck, Globe2, Inbox, Loader2, LockKeyhole, Mail, MessageCircle, RefreshCw, Search, Send, Trash2, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/Shared/PageHeader";
import ApplicationToolbar from "@/components/Shared/ApplicationToolbar";
import DashboardButton from "@/components/Shared/DashboardButton";
import SideFormDrawer from "@/components/Shared/SideFormDrawer";
import { deleteSuiviAction, getFollowUpAction, replySuiviAction } from "@/lib/queries/followUp";
import { getTatoueursByUserIdAction } from "@/lib/queries/tatoueur";
import { followUpClientName, followUpDate, type FollowUpArtist, type FollowUpItem } from "@/lib/types/followUp";
import FollowUpCard, { FollowUpRating, FollowUpStatus } from "./FollowUpCard";
import styles from "./FollowUps.module.css";

type StatusFilter = "all" | "answered" | "unanswered";
interface Pagination { currentPage: number; limit: number; totalFollowUps: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean; startIndex: number; endIndex: number }
const filters: { value: StatusFilter; label: string }[] = [{ value: "all", label: "Tous les suivis" }, { value: "unanswered", label: "À traiter" }, { value: "answered", label: "Répondus" }];

export default function ShowSuivis() {
  const { data: session } = useSession();
  const { markRead } = useActivityNotifications();
  const userId = session?.user?.id;
  const params = useSearchParams();
  const paramsKey = params.toString();
  const router = useRouter();
  const pathname = usePathname();
  const rawStatus = params.get("status");
  const status: StatusFilter = rawStatus === "answered" || rawStatus === "unanswered" ? rawStatus : "all";
  const artist = params.get("tatoueurId") || "all";
  const query = params.get("q") || "";
  const page = Math.max(1, Math.floor(Number(params.get("page")) || 1));
  const rawLimit = Number(params.get("limit"));
  const limit = [10, 20, 50].includes(rawLimit) ? rawLimit : 10;
  const [search, setSearch] = useState(query);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [tatoueurs, setTatoueurs] = useState<FollowUpArtist[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestNumber = useRef(0);
  const [selected, setSelected] = useState<FollowUpItem | null>(null);
  const [reply, setReply] = useState("");
  const [replyError, setReplyError] = useState("");
  const [replying, setReplying] = useState(false);
  const replyFormId = useId();
  const [toDelete, setToDelete] = useState<FollowUpItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const activeFilters = status !== "all" || artist !== "all" || Boolean(query);

  const updateParams = useCallback((changes: Record<string, string | null>) => {
    const next = new URLSearchParams(paramsKey);
    Object.entries(changes).forEach(([key, value]) => { if (value && value !== "all") next.set(key, value); else next.delete(key); });
    if (["status", "tatoueurId", "q", "limit"].some(key => key in changes)) next.set("page", "1");
    const suffix = next.toString();
    router.replace(`${pathname}${suffix ? `?${suffix}` : ""}`, { scroll: false });
  }, [paramsKey, pathname, router]);

  const load = useCallback(async () => {
    if (!userId) return;
    const current = ++requestNumber.current;
    setLoading(true); setError("");
    try {
      const result = await getFollowUpAction(page, limit, status, artist, query);
      if (current !== requestNumber.current) return;
      if (!result.ok) throw new Error(result.message || "Impossible de charger les suivis.");
      const nextPagination: Pagination | null = result.data?.pagination ?? null;
      if (nextPagination && page > Math.max(1, nextPagination.totalPages)) {
        updateParams({ page: String(Math.max(1, nextPagination.totalPages)) });
        return;
      }
      setFollowUps(Array.isArray(result.data?.followUps) ? result.data.followUps : []);
      setPagination(nextPagination);
    } catch (cause) { if (current === requestNumber.current) setError(cause instanceof Error ? cause.message : "Impossible de charger les suivis."); }
    finally { if (current === requestNumber.current) setLoading(false); }
  }, [userId, page, limit, status, artist, query, updateParams]);

  const invalidateLoad = useCallback(() => { requestNumber.current++; }, []);
  useEffect(() => { void load(); return invalidateLoad; }, [load, invalidateLoad]);
  useEffect(() => { setSearch(query); }, [query]);
  useEffect(() => {
    if (search.trim() === query) return;
    const timer = setTimeout(() => updateParams({ q: search.trim() || null }), 400);
    return () => clearTimeout(timer);
  }, [search, query, updateParams]);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    getTatoueursByUserIdAction(userId).then(result => { if (active && result.ok) setTatoueurs(result.data); }).catch(() => {});
    return () => { active = false; };
  }, [userId]);

  const artists = useMemo(() => {
    const map = new Map<string, FollowUpArtist>();
    tatoueurs.forEach(item => map.set(item.id, item));
    followUps.forEach(item => { const person = item.appointment?.tatoueur; if (person) map.set(person.id, person); });
    if (artist !== "all" && !map.has(artist)) map.set(artist, { id: artist, name: "Artiste sélectionné" });
    return [...map.values()];
  }, [tatoueurs, followUps, artist]);
  const clearFilters = () => { setSearch(""); updateParams({ status: null, tatoueurId: null, q: null }); };
  const openFollowUp = (item: FollowUpItem) => { markRead("followUps", item.id); setSelected(item); setReply(""); setReplyError(""); };
  const submitReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || replying || !reply.trim()) return;
    setReplying(true); setReplyError("");
    try {
      const result = await replySuiviAction(selected.id, reply.trim());
      if (!result.ok) throw new Error(result.message || "Impossible d’envoyer votre réponse.");
      setSelected(null); setReply(""); toast.success("Réponse envoyée au client par email");
      await load();
    } catch (cause) { setReplyError(cause instanceof Error ? cause.message : "Impossible d’envoyer votre réponse."); }
    finally { setReplying(false); }
  };
  const confirmDelete = async () => {
    if (!toDelete || deleting) return;
    setDeleting(true); setDeleteError("");
    try {
      const result = await deleteSuiviAction(toDelete.id);
      if (!result.ok) throw new Error(result.message || "Impossible de supprimer ce suivi.");
      // Preserve the existing cleanup of UploadThing files after deleting the record.
      try {
        const url = new URL(toDelete.photoUrl);
        const key = url.pathname.match(/\/f\/([^/?]+)/)?.[1];
        if (key && (url.hostname === "utfs.io" || url.hostname.endsWith(".ufs.sh"))) {
          await fetch("/api/uploadthing/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileKeys: [key] }) });
        }
      } catch { /* The follow-up itself has already been deleted. */ }
      setToDelete(null); toast.success("Suivi supprimé"); await load();
    } catch (cause) { setDeleteError(cause instanceof Error ? cause.message : "Impossible de supprimer ce suivi."); }
    finally { setDeleting(false); }
  };
  const currentPage = pagination?.currentPage ?? page;
  const pageCount = Math.max(1, pagination?.totalPages ?? 1);
  const firstPage = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, index) => firstPage + index);

  return <section className={styles.workspace}>
    <PageHeader icon={<ClipboardCheck size={20} className="text-tertiary-400" />} title="Suivi cicatrisation" />
    <ApplicationToolbar><div className={styles.toolbar}>
      <Link href="/clients" aria-label="Retour aux clients" title="Retour aux clients" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"><ArrowLeft size={16} /></Link>
      <label className={styles.search}><Search size={14} /><input type="search" aria-label="Rechercher un client" placeholder="Rechercher un client…" value={search} onChange={event => setSearch(event.target.value)} className="border border-white/10" /></label>
      <div className={styles.statusFilters} role="group" aria-label="Filtrer les suivis par statut">{filters.map(filter => <button type="button" key={filter.value} aria-pressed={status === filter.value} onClick={() => updateParams({ status: filter.value })}>{filter.label}</button>)}</div>
      <select aria-label="Filtrer par tatoueur" value={artist} onChange={event => updateParams({ tatoueurId: event.target.value })} className={styles.select}><option value="all">Tous les artistes</option>{artists.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select>
      {activeFilters && <button type="button" className={styles.clear} onClick={clearFilters}><X size={12} />Effacer</button>}
      <span className={styles.total}><ClipboardCheck size={13} /><strong>{loading ? "…" : pagination?.totalFollowUps ?? 0}</strong>suivis</span>
    </div></ApplicationToolbar>
    <div className={styles.results}><span>{loading ? "Chargement des suivis…" : `${pagination?.startIndex ?? 0}–${pagination?.endIndex ?? 0} sur ${pagination?.totalFollowUps ?? 0} suivis`}{status !== "all" && ` · ${status === "unanswered" ? "À traiter" : "Répondus"}`}</span><span><LockKeyhole size={12} />Les photos sont réservées au suivi, sauf accord du client.</span></div>
    {error ? <div className={styles.state} role="alert"><span className={styles.stateIcon}><TriangleAlert size={24} /></span><h2>Les suivis n’ont pas pu être chargés</h2><p>{error}</p><DashboardButton variant="secondary" onClick={() => void load()}><RefreshCw size={14} />Réessayer</DashboardButton></div>
      : loading ? <div className={styles.grid} role="status" aria-label="Chargement des suivis">{Array.from({ length: 6 }, (_, index) => <div key={index} className={styles.skeleton} aria-hidden="true"><div /><div /><div /><div /></div>)}</div>
        : !followUps.length ? <div className={styles.state}><span className={styles.stateIcon}>{status === "unanswered" ? <CheckCheck size={25} /> : <Inbox size={25} />}</span><h2>{status === "unanswered" && !query && artist === "all" ? "Tous vos suivis ont été traités" : "Aucun suivi à afficher"}</h2><p>{activeFilters ? "Aucun suivi ne correspond à ces filtres. Vous pouvez les ajuster ou afficher tous les suivis." : "Les photos et retours envoyés par vos clients après leur séance apparaîtront ici."}</p>{activeFilters && <DashboardButton variant="secondary" onClick={clearFilters}>Afficher tous les suivis</DashboardButton>}</div>
          : <div className={styles.grid}>{followUps.map(item => <FollowUpCard key={item.id} followUp={item} onOpen={() => openFollowUp(item)} onDelete={() => { setToDelete(item); setDeleteError(""); }} />)}</div>}
    {pagination && !error && <nav className={styles.pagination} aria-label="Pagination des suivis"><span>Page {currentPage} sur {pageCount}</span><div className={styles.pages}><button type="button" disabled={currentPage <= 1 || loading} onClick={() => updateParams({ page: String(currentPage - 1) })} aria-label="Page précédente"><ChevronLeft size={15} /></button>{pages.map(number => <button type="button" key={number} aria-current={number === currentPage ? "page" : undefined} disabled={loading} onClick={() => updateParams({ page: String(number) })}>{number}</button>)}<button type="button" disabled={currentPage >= pageCount || loading} onClick={() => updateParams({ page: String(currentPage + 1) })} aria-label="Page suivante"><ChevronRight size={15} /></button></div><select aria-label="Nombre de suivis par page" value={limit} onChange={event => updateParams({ limit: event.target.value })} className={`${styles.select} rounded-xl border border-white/10 bg-black/15`}>{[10, 20, 50].map(value => <option key={value} value={value}>{value} par page</option>)}</select></nav>}

    {selected && <SideFormDrawer title={selected.isAnswered ? "Détail du suivi" : "Répondre au client"} category="Suivi de cicatrisation" description="Retrouvez le retour du client et sa photo après la séance." busy={replying} onClose={() => setSelected(null)} footer={<><DashboardButton variant="secondary" disabled={replying} onClick={() => setSelected(null)}>{selected.isAnswered ? "Fermer" : "Annuler"}</DashboardButton>{!selected.isAnswered && <DashboardButton type="submit" form={replyFormId} disabled={replying || !reply.trim()}>{replying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}{replying ? "Envoi…" : "Envoyer la réponse"}</DashboardButton>}</>}>
      <div className={styles.drawer}>
        <div className={styles.drawerSummary}><div><h3>{followUpClientName(selected)}</h3><p>{selected.appointment?.title || "Rendez-vous non renseigné"}<br />{selected.appointment?.tatoueur?.name || "Artiste non renseigné"} · Reçu le {followUpDate(selected.createdAt, true)}</p></div><FollowUpStatus answered={selected.isAnswered} /></div>
        {selected.photoUrl && <a className={styles.drawerPhoto} href={selected.photoUrl} target="_blank" rel="noopener noreferrer" aria-label="Agrandir la photo de suivi"><Image src={selected.photoUrl} alt={`Photo de cicatrisation de ${followUpClientName(selected)}`} fill sizes="(max-width: 768px) 100vw, 50vw" /></a>}
        <div className={styles.replyMeta}><FollowUpRating rating={selected.rating} /><span>{selected.isPhotoPublic ? <Globe2 size={12} /> : <LockKeyhole size={12} />}{selected.isPhotoPublic ? "Partage de la photo autorisé" : "Photo privée"}</span></div>
        <section className={styles.detailSection}><h3><MessageCircle size={14} />Le retour du client</h3><p>{selected.review || "Le client n’a pas laissé de commentaire."}</p></section>
        {selected.isAnswered ? <section className={styles.detailSection} data-response="true"><h3><CheckCheck size={14} />Votre réponse</h3><p>{selected.response || "Ce suivi a déjà été traité. Le texte de la réponse n’est pas disponible."}</p></section> : <form id={replyFormId} onSubmit={submitReply} className={styles.replyForm}><label htmlFor={`${replyFormId}-text`} className={styles.replyLabel}><Send size={14} />Votre réponse</label><textarea id={`${replyFormId}-text`} required maxLength={1000} disabled={replying} value={reply} onChange={event => setReply(event.target.value)} placeholder="Rédigez votre retour pour le client…" /><div className={styles.replyMeta}><span><Mail size={12} />La réponse sera envoyée au client par email.</span><span>{reply.length}/1000</span></div><p className={styles.replyHint}>Personnalisez votre réponse à partir de la photo et des informations partagées par le client.</p>{replyError && <p role="alert" className={styles.error}>{replyError}</p>}</form>}
      </div>
    </SideFormDrawer>}
    {toDelete && <SideFormDrawer title="Supprimer ce suivi" category="Suppression" description="Vérifiez le suivi concerné avant de confirmer sa suppression." busy={deleting} onClose={() => setToDelete(null)} footer={<><DashboardButton variant="secondary" disabled={deleting} onClick={() => setToDelete(null)}>Annuler</DashboardButton><DashboardButton variant="danger" disabled={deleting} onClick={() => void confirmDelete()}>{deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}{deleting ? "Suppression…" : "Supprimer le suivi"}</DashboardButton></>}><div className={styles.drawer}><div className={styles.drawerSummary}><div><h3>{followUpClientName(toDelete)}</h3><p>{toDelete.appointment?.title}<br />Reçu le {followUpDate(toDelete.createdAt, true)}</p></div><FollowUpStatus answered={toDelete.isAnswered} /></div><div className={styles.deleteWarning}><TriangleAlert size={18} /><p>Ce suivi, son retour client et sa photo seront supprimés. Cette action est irréversible.</p></div>{deleteError && <p role="alert" className={styles.error}>{deleteError}</p>}</div></SideFormDrawer>}
  </section>;
}
