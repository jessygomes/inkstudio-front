"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, Instagram, Link2, LoaderCircle, Pencil, Phone, Trash2, Unlink } from "lucide-react";
import type { TeamTatoueur } from "./TatoueurSalon";

export function teamMemberName(member: TeamTatoueur) {
  return member.name || [member.firstName, member.lastName].filter(Boolean).join(" ") || member.email || "Tatoueur";
}

export default function TeamMemberCard({ member, linked, bookingEnabled, updating, removing, onToggleBooking, onRemove }: {
  member: TeamTatoueur;
  linked: boolean;
  bookingEnabled: boolean;
  updating: boolean;
  removing: boolean;
  onToggleBooking: () => void;
  onRemove: () => void;
}) {
  const name = teamMemberName(member);
  const image = member.img || member.image;
  const instagram = member.instagram?.trim();
  const instagramUrl = instagram
    ? /^https?:\/\//i.test(instagram) ? instagram
      : /^(www\.)?instagram\.com\//i.test(instagram) ? `https://${instagram}`
        : `https://www.instagram.com/${instagram.replace(/^@/, "")}`
    : undefined;
  const actionClass = "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-white/70 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-40";

  return <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-noir-600 transition-colors hover:border-white/20">
    <div className="flex-1 p-4 sm:p-5">
      <div className="flex items-start gap-3.5">
        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:size-16">
          {image ? <Image src={image} alt={name} fill sizes="64px" className="object-cover" /> : <span className="text-xl font-medium text-white/50">{name.charAt(0).toUpperCase()}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-semibold tracking-tight text-white">{name}</h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-white/40">{linked && <Link2 size={12} />} {linked ? "Compte indépendant lié" : "Profil géré par le salon"}</p>
          <span className={`mt-2 inline-flex items-center gap-1.5 text-[11px] ${bookingEnabled ? "text-emerald-400" : "text-white/35"}`}><span className={`size-1.5 rounded-full ${bookingEnabled ? "bg-emerald-400" : "bg-white/25"}`} />{bookingEnabled ? "Disponible à la réservation" : "Réservation désactivée"}</span>
        </div>
      </div>

      {member.description && <p className="mt-4 line-clamp-2 text-xs leading-5 text-white/50">{member.description}</p>}

      <div className="mt-4 space-y-3">
        {([{ label: "Compétences", values: member.skills }, { label: "Styles", values: member.style }]).map(({ label, values }) => values?.length ? <div key={label} className="flex items-start gap-3"><span className="w-[74px] shrink-0 pt-1 text-[10px] text-white/35">{label}</span><div className="flex min-w-0 flex-wrap gap-1.5">{values.map((value) => <span key={value} className="max-w-full break-words rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] leading-4 text-white/65">{value}</span>)}</div></div> : null)}
        {!member.skills?.length && !member.style?.length && <p className="text-[11px] text-white/30">Spécialités à compléter</p>}
      </div>

      {(member.phone || instagramUrl) && <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.06] pt-3 text-[11px] text-white/50">
        {member.phone && <a href={`tel:${member.phone}`} className="inline-flex min-w-0 items-center gap-1.5 py-1 transition hover:text-white"><Phone size={12} className="shrink-0" /><span className="break-all">{member.phone}</span></a>}
        {instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 py-1 transition hover:text-white"><Instagram size={12} />Instagram<span className="sr-only"> (nouvel onglet)</span></a>}
      </div>}
    </div>

    <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] bg-black/10 px-4 py-3 sm:px-5">
      {linked ? <button type="button" disabled={updating || removing} aria-pressed={bookingEnabled} onClick={onToggleBooking} className={actionClass}>{updating ? <LoaderCircle size={13} className="animate-spin" /> : <CalendarCheck size={13} />}{updating ? "Mise à jour…" : bookingEnabled ? "Désactiver les RDV" : "Activer les RDV"}</button>
        : <Link href={`/mon-compte/ajouter-tatoueur?id=${member.id}`} className={actionClass}><Pencil size={12} />Modifier le profil</Link>}
      <button type="button" disabled={removing || updating} onClick={onRemove} aria-label={`${linked ? "Retirer" : "Supprimer"} ${name}`} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] text-white/35 transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40">{removing ? <LoaderCircle size={13} className="animate-spin" /> : linked ? <Unlink size={13} /> : <Trash2 size={13} />}{removing ? "Retrait…" : linked ? "Retirer" : "Supprimer"}</button>
    </footer>
  </article>;
}
