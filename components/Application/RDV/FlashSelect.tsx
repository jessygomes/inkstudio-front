"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, Zap } from "lucide-react";
import { getAvailableFlashsByUserAction, type FlashItemDto } from "@/lib/queries/flash";

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? hours + " h" + (rest ? " " + String(rest).padStart(2, "0") : "") : rest + " min";
};

/**
 * Choix facultatif d'un flash disponible pour un rendez-vous de tatouage : le prix du flash s'applique directement
 * au rendez-vous et son visuel est ajouté aux photos. N'affiche rien si le salon n'a aucun flash.
 */
export default function FlashSelect({ userId, value, onChange }: { userId: string; value: FlashItemDto | null; onChange: (flash: FlashItemDto | null) => void }) {
  const [flashs, setFlashs] = useState<FlashItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // la liste ne s'affiche qu'au clic sur « Flash »

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all: FlashItemDto[] = [];
      // Quelques pages suffisent : le formulaire ne propose que les flashs disponibles.
      for (let page = 1; page <= 10; page++) {
        const result = await getAvailableFlashsByUserAction(userId, page, true);
        const data = result.ok ? (result.data as { flashs?: FlashItemDto[]; pagination?: { hasNextPage?: boolean } } | undefined) : undefined;
        if (!data?.flashs) break;
        all.push(...data.flashs);
        if (!data.pagination?.hasNextPage) break;
      }
      if (!cancelled) { setFlashs(all.filter((flash) => flash.isAvailable)); setLoading(false); }
    })().catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  if (loading || flashs.length === 0) return null;
  const minutes = value?.appointmentDurationMinutes || 60;
  return <div className="space-y-2">
    <button type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-left transition hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400">
      <span className="flex min-w-0 items-center gap-2 text-sm text-white"><Zap size={14} className="shrink-0 text-tertiary-400" /><span className="shrink-0">Flash</span><span className="truncate text-xs text-white/45">{value ? "· " + value.title + " · " + value.price.toLocaleString("fr-FR") + " €" : "(facultatif)"}</span></span>
      <ChevronDown size={16} className={"shrink-0 text-white/40 transition-transform " + (open ? "rotate-180" : "")} />
    </button>
    {open && <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 xl:grid-cols-7">
      {flashs.map((flash) => {
        const active = value?.id === flash.id;
        return <button type="button" key={flash.id} aria-pressed={active} title={flash.title + " · " + flash.price.toLocaleString("fr-FR") + " €"} onClick={() => { onChange(active ? null : flash); if (!active) setOpen(false); }} className={"group relative cursor-pointer overflow-hidden rounded-lg text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 " + (active ? "ring-2 ring-tertiary-400" : "ring-1 ring-white/10 hover:ring-white/25")}>
          <div className="relative aspect-square bg-black/20"><Image src={flash.imageUrl} alt={flash.title} fill sizes="110px" unoptimized className="object-cover transition-transform duration-300 group-hover:scale-105" />{active && <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-tertiary-400 text-white"><Check size={11} /></span>}<span className="absolute inset-x-0 bottom-0 bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">{flash.price.toLocaleString("fr-FR")} €</span></div>
        </button>;
      })}
    </div>}
    {value && <p className="rounded-xl bg-tertiary-400/[0.07] px-3 py-2 text-[11px] leading-5 text-white/60">Le prix du flash ({value.price.toLocaleString("fr-FR")} €) est appliqué au rendez-vous et son visuel sera ajouté aux photos. Durée prévue : {formatDuration(minutes)}, soit {Math.max(1, Math.ceil(minutes / 30))} créneau{minutes > 30 ? "x" : ""} de 30 min à sélectionner.</p>}
  </div>;
}
