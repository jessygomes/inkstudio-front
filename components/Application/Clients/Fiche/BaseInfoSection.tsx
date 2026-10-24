import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays, Check, CircleAlert, ExternalLink, FileText, Mail, MapPin,
  Megaphone, Phone, ShieldCheck, Tag, UserRound, UsersRound,
} from "lucide-react";
import type { ClientProps } from "@/lib/type";

interface BaseInfoSectionProps { client: ClientProps; onOpenConsent: () => void }

const emptyValue = "Non renseigné";

export default function BaseInfoSection({ client, onOpenConsent }: BaseInfoSectionProps) {
  const tags = (Array.isArray(client.tags) ? client.tags : client.tags?.split(",") ?? [])
    .map((tag) => tag.trim()).filter(Boolean);
  return <section aria-label="Informations du profil" className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
    <article className="min-w-0 rounded-2xl border border-white/10 bg-noir-600 p-4 sm:p-5">
      <SectionHeading icon={UserRound} title="Identité & coordonnées" />
      <dl className="mt-3 grid gap-x-6 gap-y-0 divide-white/[0.06] sm:grid-cols-2">
        <InfoItem icon={UserRound} label="Prénom">{client.firstName || emptyValue}</InfoItem>
        <InfoItem icon={UserRound} label="Nom">{client.lastName || emptyValue}</InfoItem>
        <InfoItem icon={Mail} label="Email">{client.email ? <a className="cursor-pointer hover:text-white" href={"mailto:" + client.email}>{client.email}</a> : emptyValue}</InfoItem>
        <InfoItem icon={Phone} label="Téléphone">{client.phone ? <a className="cursor-pointer hover:text-white" href={"tel:" + client.phone}>{client.phone}</a> : emptyValue}</InfoItem>
        <InfoItem icon={CalendarDays} label="Date de naissance">{formatDate(client.birthDate)}</InfoItem>
        <InfoItem icon={MapPin} label="Adresse">{client.address || emptyValue}</InfoItem>
      </dl>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.07] pt-4"><span className="mr-1 inline-flex items-center gap-1.5 text-[10px] text-white/35"><Tag size={12} />Tags</span>{tags.length ? tags.map((tag, index) => <span key={tag + index} className="rounded-lg border border-white/[0.08] bg-white/5 px-2 py-1 text-[10px] text-white/65">{tag}</span>) : <span className="text-[11px] text-white/30">Aucun tag renseigné</span>}</div>
    </article>
    <div className="min-w-0 space-y-4">
      <article className="rounded-2xl border border-white/10 bg-noir-600 p-4 sm:p-5">
        <SectionHeading icon={FileText} title="Consentement" />
        <div className="mt-4 flex items-start gap-2.5"><span className={"mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg " + (client.consentSigned ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-300")}>{client.consentSigned ? <Check size={14} /> : <CircleAlert size={14} />}</span><div><p className={"text-xs font-medium " + (client.consentSigned ? "text-emerald-400" : "text-amber-300")}>{client.consentSigned ? "Document signé" : "Signature en attente"}</p><p className="mt-1 text-[11px] leading-5 text-white/35">{client.consentSignedAt ? "Signé le " + formatDate(client.consentSignedAt) : "Aucune date de signature renseignée"}</p></div></div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onOpenConsent} aria-haspopup="dialog" className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white/75 transition hover:bg-white/10 hover:text-white"><FileText size={12} aria-hidden="true" />{client.consentSigned ? "Ouvrir le formulaire" : "Remplir le consentement"}</button>
          {client.consentFileUrl && <a href={client.consentFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white/65 transition hover:bg-white/10 hover:text-white">Consulter le document<ExternalLink size={12} aria-hidden="true" /></a>}
        </div>
      </article>
      <article className="rounded-2xl border border-white/10 bg-noir-600 p-4 sm:p-5">
        <SectionHeading icon={ShieldCheck} title="Dossier administratif" />
        <dl className="mt-4 divide-y divide-white/[0.07]"><StatusRow icon={UsersRound} label="Statut" positive={!client.isMinor} positiveLabel="Majeur" negativeLabel="Mineur" warning /><StatusRow icon={Megaphone} label="Communications marketing" positive={!!client.marketingConsent} positiveLabel="Autorisées" negativeLabel="Non autorisées" /></dl>
        {(client.isMinor || client.guardianName || client.guardianPhone) && <div className="mt-4 border-t border-white/[0.07] pt-4"><p className="text-[10px] font-medium text-white/40">Représentant légal</p><p className="mt-1.5 text-xs text-white/75">{client.guardianName || emptyValue}</p>{client.guardianPhone ? <a href={"tel:" + client.guardianPhone} className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-white/45 hover:text-white"><Phone size={12} />{client.guardianPhone}</a> : <p className="mt-1 text-[11px] text-white/30">Téléphone non renseigné</p>}</div>}
      </article>
    </div>
  </section>;
}

function SectionHeading({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/45">
        <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h4 className="text-xs font-semibold text-white/85 font-one">{title}</h4>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 border-b border-white/[0.06] py-3">
      <dt className="flex items-center gap-1.5 text-[10px] font-medium text-white/35 font-one"><Icon size={13} aria-hidden="true" />{label}</dt>
      <dd className="mt-1.5 break-words text-xs leading-5 text-white/75 font-two">{children}</dd>
    </div>
  );
}

function StatusRow({ icon: Icon, label, positive, positiveLabel, negativeLabel, warning = false }: { icon: LucideIcon; label: string; positive: boolean; positiveLabel: string; negativeLabel: string; warning?: boolean }) {
  const negativeClass = warning ? "border-amber-400/25 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/[0.05] text-white/55";
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
      <dt className="flex items-center gap-2 text-[11px] text-white/45 font-two"><Icon size={14} className="text-white/35" aria-hidden="true" />{label}</dt>
      <dd><span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[10px] font-medium font-one ${positive ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : negativeClass}`}><span className={`h-1.5 w-1.5 rounded-full ${positive ? "bg-emerald-300" : warning ? "bg-amber-300" : "bg-white/40"}`} />{positive ? positiveLabel : negativeLabel}</span></dd>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return emptyValue;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyValue;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}
