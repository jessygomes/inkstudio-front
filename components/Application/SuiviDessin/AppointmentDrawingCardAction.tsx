"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, FilePenLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createDrawingCard,
  getDrawingCards,
  getAppointmentDrawingCardStatus,
} from "@/lib/queries/suiviDessin";
import type { AppointmentCardStatus } from "@/lib/types/suiviDessin";
import Link from "next/link";

const drawingStatuses = {
 A_DESSINER: { label: "À dessiner", style: "border-white/15 bg-white/5 text-white/60" },
 EN_COURS: { label: "En cours", style: "border-blue-400/20 bg-blue-400/5 text-blue-300" },
 A_MODIFIER: { label: "À modifier", style: "border-amber-400/20 bg-amber-400/5 text-amber-300" },
 TERMINE: { label: "Terminé", style: "border-teal-400/20 bg-teal-400/5 text-teal-300" },
 APPROUVE: { label: "Approuvé", style: "border-emerald-400/20 bg-emerald-400/5 text-emerald-300" },
};

export default function AppointmentDrawingCardAction({
  appointmentId,
  allowCreate = true,
}: {
  appointmentId: string;
  allowCreate?: boolean;
}) {
  const [status, setStatus] = useState<AppointmentCardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [statusUnavailable, setStatusUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setStatusUnavailable(false);
    const statusRequest = allowCreate
      ? getAppointmentDrawingCardStatus(appointmentId)
      : getDrawingCards().then((cards) => {
          const card = cards.find(
            (drawingCard) => drawingCard.tattooAppointmentId === appointmentId,
          );

          return {
            appointmentId,
            appointmentCompleted: false,
            canCreate: false,
            cardExists: Boolean(card),
            cardId: card?.id ?? null,
            cardStatus: card?.status ?? null,
          };
        });

    statusRequest
      .then(result => { if (active) setStatus(result); })
      .catch(() => {
        if (!active) return;
        setStatus(null);
        setStatusUnavailable(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [allowCreate, appointmentId]);

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
      setStatus((current) => ({
        appointmentId,
        appointmentCompleted: current?.appointmentCompleted ?? false,
        canCreate: true,
        cardExists: true,
        cardId: card.id,
        cardStatus: card.status,
      }));
      setStatusUnavailable(false);
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
  const actionClass = "inline-flex min-h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-[11px] font-medium text-white/75 transition hover:border-white/20 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed disabled:opacity-50";
  return <section aria-label="Suivi de dessin" className="rounded-2xl border border-white/10 bg-noir-600 p-3 font-one">
    <div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-xs font-semibold text-white/85"><FilePenLine size={14} className="text-white/40" />Suivi de dessin</h3>{badge && <span className={"inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-medium " + badge.style}><span className="size-1.5 rounded-full bg-current" />{badge.label}</span>}</div>
    <p className="mt-2 text-[11px] leading-5 text-white/45">{statusUnavailable ? "Le suivi de dessin est momentanément indisponible." : status?.cardExists ? "Retrouvez le dessin, ses versions et les échanges associés." : !allowCreate ? "Aucun suivi de dessin associé à ce rendez-vous." : "Créez un suivi pour préparer le dessin de ce projet."}</p>
    {(status?.cardExists || allowCreate) && <div className="mt-3 flex justify-end border-t border-white/[0.07] pt-3">{status?.cardExists ? <Link href={status.cardId ? "/suiviDessin?cardId=" + encodeURIComponent(status.cardId) : "/suiviDessin"} className={actionClass}>Ouvrir le suivi<ArrowUpRight size={14} /></Link> : <button type="button" onClick={create} disabled={creating} className={actionClass}>{creating ? <Loader2 size={14} className="animate-spin" /> : <FilePenLine size={14} />}{creating ? "Création…" : "Créer le suivi"}</button>}</div>}
  </section>;
}
