"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { CalendarPlus, ChevronRight, Link2, Plus, UserPlus, type LucideIcon } from "lucide-react";
import RdvActionButton from "@/components/Application/RDV/RdvActionButton";
import BookingLinkCreator from "@/components/Application/BookingLinks/BookingLinkCreator";

type Entry = { label: string; hint: string; icon: LucideIcon } & ({ href: string } | { onSelect: () => void });

/** Bouton « + » du tableau de bord : créer un rendez-vous, un client ou un lien de réservation. */
export default function DashboardCreateMenu() {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Fermeture au clic à côté et à la touche Échap.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const entries: Entry[] = [
    { label: "Nouveau rendez-vous", hint: "Planifier une séance", icon: CalendarPlus, href: "/mes-rendez-vous/creer" },
    { label: "Nouveau client", hint: "Créer une fiche client", icon: UserPlus, href: "/clients/creer" },
    { label: "Lien de réservation", hint: "Laisser le client choisir son créneau", icon: Link2, onSelect: () => setLinkOpen(true) },
  ];
  const itemClass = "flex w-full cursor-pointer items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400";

  return (
    <div ref={root} className="relative">
      <RdvActionButton tone="primary" iconOnly icon={Plus} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} onClick={() => setOpen((value) => !value)}>Créer</RdvActionButton>
      {open && (
        <div id={menuId} role="menu" aria-label="Créer" className="absolute right-0 top-full z-40 mt-2 w-72 rounded-2xl bg-[var(--app-surface-raised)] p-1.5 shadow-xl shadow-black/40">
          {entries.map((entry) => {
            const Icon = entry.icon;
            const content = (
              <>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-tertiary-400/15 text-tertiary-400"><Icon size={16} aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-white">{entry.label}</span>
                  <span className="block text-[11px] text-white/45">{entry.hint}</span>
                </span>
                <ChevronRight size={14} aria-hidden="true" className="shrink-0 text-white/30" />
              </>
            );
            return "href" in entry
              ? <Link key={entry.label} role="menuitem" href={entry.href} onClick={() => setOpen(false)} className={itemClass}>{content}</Link>
              : <button key={entry.label} type="button" role="menuitem" onClick={() => { setOpen(false); entry.onSelect(); }} className={itemClass}>{content}</button>;
          })}
        </div>
      )}
      {linkOpen && <BookingLinkCreator context={{ origin: "standalone" }} onClose={() => setLinkOpen(false)} />}
    </div>
  );
}
