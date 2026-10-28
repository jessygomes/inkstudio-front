/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, FilePenLine, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createDrawingCard,
  getLinkableDrawingCards,
  linkDrawingCardToAppointment,
  getAppointmentDrawingCardStatus,
} from "@/lib/queries/suiviDessin";
import type { AppointmentCardStatus, DrawingCard } from "@/lib/types/suiviDessin";
import Link from "next/link";
import DrawingDialog from "./DrawingDialog";

const drawingStatuses = {
 A_DESSINER: { label: "À dessiner", style: "border-white/15 bg-white/5 text-white/60" },
 EN_COURS: { label: "En cours", style: "border-blue-400/20 bg-blue-400/5 text-blue-300" },
 A_MODIFIER: { label: "À modifier", style: "border-amber-400/20 bg-amber-400/5 text-amber-300" },
 TERMINE: { label: "Terminé", style: "border-teal-400/20 bg-teal-400/5 text-teal-300" },
 APPROUVE: { label: "Approuvé", style: "border-emerald-400/20 bg-emerald-400/5 text-emerald-300" },
};

export default function AppointmentDrawingCardAction({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const [status, setStatus] = useState<AppointmentCardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [statusUnavailable, setStatusUnavailable] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [linkCards, setLinkCards] = useState<DrawingCard[]>([]);
  const [linkId, setLinkId] = useState("");
  const [linkSearch, setLinkSearch] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setStatus(null);
    setLinkOpen(false);
    setStatusUnavailable(false);
    const statusRequest = getAppointmentDrawingCardStatus(appointmentId);

    statusRequest
      .then(result => { if (active) setStatus(result); })
      .catch(() => {
        if (!active) return;
        setStatus(null);
        setStatusUnavailable(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [appointmentId]);

  const applyCard = (card: DrawingCard) => {
    setStatus(current => ({ appointmentId, appointmentCompleted: current?.appointmentCompleted ?? false, canCreate: true, cardExists: true, cardId: card.id, cardStatus: card.status, latestImage: [...card.images].sort((a, b) => b.version - a.version)[0] ?? null }));
    setStatusUnavailable(false);
  };
  const loadLinkCards = async () => {
    setLinkLoading(true); setLinkError("");
    try { setLinkCards(await getLinkableDrawingCards(appointmentId)); }
    catch (cause) { setLinkError(cause instanceof Error ? cause.message : "Impossible de charger les cards."); }
    finally { setLinkLoading(false); }
  };
  const linkCard = async () => {
    if (!linkId || linking) return;
    setLinking(true); setLinkError("");
    try {
      applyCard(await linkDrawingCardToAppointment(linkId, appointmentId));
      setLinkOpen(false);
      toast.success("Card reliée au rendez-vous");
    } catch (cause) { setLinkError(cause instanceof Error ? cause.message : "Impossible de relier cette card."); }
    finally { setLinking(false); }
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-noir-600 p-4 text-xs text-white/40">
        <Loader2 size={13} className="animate-spin" /> Vérification du suivi
        dessin…
      </div>
    );

  const create = async () => {
    try {
      setCreating(true);
      const card = await createDrawingCard({
        sourceAppointmentId: appointmentId,
      });
      applyCard(card);
      toast.success("Suivi de dessin créé");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Création impossible",
      );
    } finally {
      setCreating(false);
    }
  };

  const badge = status?.cardStatus ? drawingStatuses[status.cardStatus] : status?.cardExists ? { label: "Statut indisponible", style: "border-white/10 bg-white/5 text-white/45" } : null;
  const visibleCards = linkCards.filter(card => `${card.title} ${card.client?.firstName ?? card.clientUser?.firstName ?? ""} ${card.client?.lastName ?? card.clientUser?.lastName ?? ""}`.toLocaleLowerCase("fr").includes(linkSearch.toLocaleLowerCase("fr")));
  const actionClass = "inline-flex min-h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-[11px] font-medium text-white/75 transition hover:border-white/20 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed disabled:opacity-50";
  return <section aria-label="Suivi de dessin" className="rounded-2xl border border-white/10 bg-noir-600 p-3 font-one">
    <div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-xs font-semibold text-white/85"><FilePenLine size={14} className="text-white/40" />Suivi de dessin</h3>{badge && <span className={"inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-medium " + badge.style}><span className="size-1.5 rounded-full bg-current" />{badge.label}</span>}</div>
    {status?.latestImage && <Link href={"/suiviDessin?cardId=" + encodeURIComponent(status.cardId!)} className="mt-3 block overflow-hidden rounded-xl border border-white/10 transition hover:border-tertiary-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400">
      <img src={status.latestImage.url} alt={status.latestImage.caption || `Dernière version du dessin : version ${status.latestImage.version}`} className="max-h-60 w-full bg-black/20 object-contain" />
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/[0.025] px-3 py-2 text-[10px]">
        <span className="text-white/65">Dernière version · V{status.latestImage.version}</span>
        <span className={status.latestImage.isApproved ? "text-emerald-300" : "text-amber-300"}>{status.latestImage.isApproved ? "Approuvée" : status.latestImage.clientEmailSentAt || status.latestImage.clientMessageSentAt ? "Envoyée · Retour attendu" : "À envoyer au client"}</span>
      </div>
    </Link>}
    <p className="mt-2 text-[11px] leading-5 text-white/45">{statusUnavailable ? "Le suivi de dessin est momentanément indisponible." : status?.cardExists ? "Retrouvez le dessin, ses versions et les échanges associés." : "Reliez une card existante ou créez-en une pour ce rendez-vous. Son client sera repris automatiquement."}</p>
    {(status?.cardExists || status?.canCreate) && <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-white/[0.07] pt-3">{status?.cardExists ? <Link href={status.cardId ? "/suiviDessin?cardId=" + encodeURIComponent(status.cardId) : "/suiviDessin"} className={actionClass}>Ouvrir le suivi<ArrowUpRight size={14} /></Link> : <>
      <button type="button" onClick={() => { setLinkOpen(true); setLinkId(""); setLinkSearch(""); void loadLinkCards(); }} disabled={creating || statusUnavailable} className={actionClass}><Link2 size={14} />Relier une card</button>
      <button type="button" onClick={create} disabled={creating || statusUnavailable} className={actionClass}>{creating ? <Loader2 size={14} className="animate-spin" /> : <FilePenLine size={14} />}{creating ? "Création…" : "Créer une card"}</button>
    </>}</div>}
    {linkOpen && <DrawingDialog title="Relier une card" description="Choisissez une card existante. Son client doit correspondre à celui du rendez-vous ; une card sans client reprendra celui du RDV." busy={linking} onClose={() => setLinkOpen(false)}>
      <div className="space-y-4 p-5 sm:p-6">
        <input aria-label="Rechercher une card" disabled={linking} value={linkSearch} onChange={event => { setLinkSearch(event.target.value); setLinkId(""); }} placeholder="Titre ou nom du client…" className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-tertiary-400/50" />
        {linkLoading ? <p role="status" className="flex items-center gap-2 py-8 text-xs text-white/50"><Loader2 size={15} className="animate-spin" />Chargement des cards…</p> : <div className="max-h-72 space-y-2 overflow-y-auto">
          {visibleCards.map(card => <label key={card.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${linkId === card.id ? "border-tertiary-400/40 bg-tertiary-400/10" : "border-white/10 hover:bg-white/5"}`}>
            <input type="radio" name="drawing-card" disabled={linking} value={card.id} checked={linkId === card.id} onChange={() => { setLinkId(card.id); setLinkError(""); }} className="accent-tertiary-400" />
            <span className="min-w-0"><span className="block truncate text-sm font-medium text-white/85">{card.title}</span><span className="mt-1 block text-[11px] text-white/45">{[card.client?.firstName ?? card.clientUser?.firstName, card.client?.lastName ?? card.clientUser?.lastName].filter(Boolean).join(" ") || "Sans client"} · {drawingStatuses[card.status].label}</span></span>
          </label>)}
          {!linkCards.length && <p className="py-6 text-center text-xs leading-relaxed text-white/45">Aucune card disponible. Créez une card sans RDV depuis le suivi des dessins, ou utilisez un dessin approuvé pour l’associer à un RDV Tattoo.</p>}
          {linkCards.length > 0 && !visibleCards.length && <p className="py-6 text-center text-xs text-white/45">Aucune card ne correspond à votre recherche.</p>}
        </div>}
        {linkError && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-xs leading-relaxed text-red-200">{linkError}</div>}
        {!linkCards.length && linkError && <button type="button" onClick={() => void loadLinkCards()} className={actionClass}>Réessayer</button>}
        <div className="flex justify-end gap-2 border-t border-white/10 pt-4"><button type="button" disabled={linking} onClick={() => setLinkOpen(false)} className={actionClass}>Annuler</button><button type="button" disabled={!linkId || linking || linkLoading} onClick={() => void linkCard()} className={actionClass}>{linking ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}{linking ? "Liaison…" : "Relier au rendez-vous"}</button></div>
      </div>
    </DrawingDialog>}
  </section>;
}
