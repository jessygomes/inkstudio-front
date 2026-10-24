"use client";

import { CalendarDays, Check, ChevronRight, FileSignature, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import ClientAvatar from "./ClientAvatar";
import type { ClientProps } from "@/lib/type";

export default function ClientCard({ client, onOpen, onEdit, onDelete, onConsent }: {
  client: ClientProps;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onConsent: () => void;
}) {
  const name = [client.firstName, client.lastName].filter(Boolean).join(" ") || "Client";
  const tags = [...new Set((Array.isArray(client.tags) ? client.tags : (client.tags || "").split(",")).map((tag) => tag.trim()).filter(Boolean))];
  const appointmentsCount = client.appointments?.length || 0;
  const iconButtonClass = "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400";

  return <article className="group relative isolate min-w-0 rounded-xl border border-white/10 bg-noir-600 font-one transition-colors hover:border-white/20 hover:bg-white/[0.025] focus-within:border-white/20">
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <ClientAvatar client={client} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2"><h3 title={name} className="min-w-0 truncate text-xs font-semibold tracking-tight text-white"><button type="button" onClick={onOpen} aria-label={`Ouvrir la fiche de ${name}`} className="max-w-full cursor-pointer truncate text-left after:absolute after:inset-0 after:z-0 after:rounded-xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-tertiary-400">{name}</button></h3>{client.isMinor && <span className="shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] text-white/50">Mineur</span>}</div>
          <div className="mt-1 flex items-center gap-2 overflow-hidden">
            <span className="inline-flex shrink-0 items-center gap-1 text-[10px] text-white/40"><CalendarDays size={11} aria-hidden="true" />{appointmentsCount} RDV</span>
            {tags.slice(0, 2).map((tag) => <span key={tag} title={tag} className="max-w-24 truncate rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] text-white/45">{tag}</span>)}
            {tags.length > 2 && <span title={tags.slice(2).join(", ")} className="text-[9px] text-white/35">+{tags.length - 2}</span>}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-[11px] text-white/50">
        {client.email ? <a href={`mailto:${client.email}`} title={client.email} className="pointer-events-auto relative z-10 inline-flex max-w-full cursor-pointer items-center gap-2 rounded py-0.5 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400"><Mail size={12} className="shrink-0 text-white/30" aria-hidden="true" /><span className="truncate">{client.email}</span></a> : <span className="inline-flex items-center gap-2 text-white/25"><Mail size={12} aria-hidden="true" />Email non renseigné</span>}
        {client.phone ? <a href={`tel:${client.phone}`} className="pointer-events-auto relative z-10 inline-flex max-w-full cursor-pointer items-center gap-2 rounded py-0.5 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400"><Phone size={12} className="shrink-0 text-white/30" aria-hidden="true" /><span className="truncate">{client.phone}</span></a> : <span className="inline-flex items-center gap-2 text-white/25"><Phone size={12} aria-hidden="true" />Téléphone non renseigné</span>}
      </div>
      </div>

      <div className="relative z-10 ml-auto flex shrink-0 items-center justify-end gap-1.5">
        <button type="button" onClick={onConsent} title="Ouvrir le formulaire de consentement" aria-label={`Consentement ${client.consentSigned ? "signé" : "à signer"} de ${name}`} className={`inline-flex min-h-7 cursor-pointer items-center gap-1 rounded-lg border px-1.5 py-1 text-[10px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 ${client.consentSigned ? "border-emerald-400/15 bg-emerald-400/5 text-emerald-400 hover:bg-emerald-400/10" : "border-amber-400/15 bg-amber-400/5 text-amber-300/80 hover:bg-amber-400/10"}`}>{client.consentSigned ? <Check size={12} aria-hidden="true" /> : <FileSignature size={12} aria-hidden="true" />}<span className="hidden sm:inline">{client.consentSigned ? "Signé" : "À signer"}</span></button>
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" onClick={onEdit} title="Modifier le client" aria-label={`Modifier ${name}`} className={iconButtonClass}><Pencil size={14} aria-hidden="true" /></button>
          <button type="button" onClick={onDelete} title="Supprimer le client" aria-label={`Supprimer ${name}`} className={`${iconButtonClass} hover:!bg-red-400/10 hover:!text-red-300`}><Trash2 size={14} aria-hidden="true" /></button>
          <button type="button" onClick={onOpen} title="Ouvrir la fiche client" aria-label={`Voir la fiche de ${name}`} className={`${iconButtonClass} hidden lg:inline-flex`}><ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></button>
        </div>
      </div>
    </div>
  </article>;
}
