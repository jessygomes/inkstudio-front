import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays, Check, CircleAlert, ExternalLink, FileText, Mail, MapPin,
  Megaphone, Phone, ShieldCheck, Tag, UserRound, UsersRound,
} from "lucide-react";
import type { ClientProps } from "@/lib/type";

interface BaseInfoSectionProps { client: ClientProps }

const emptyValue = "Non renseigné";

export default function BaseInfoSection({ client }: BaseInfoSectionProps) {
  const tags = (Array.isArray(client.tags) ? client.tags : client.tags?.split(",") ?? [])
    .map((tag) => tag.trim()).filter(Boolean);
  return (
    <section aria-label="Informations du profil" className="grid items-stretch gap-3 lg:grid-cols-3">
        <article className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.025] p-4 lg:col-span-2">
          <SectionHeading icon={Mail} title="Coordonnées" />
          <dl className="mt-2 grid gap-x-5 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
            <InfoItem icon={UserRound} label="Prénom">
              {client.firstName ? client.firstName : emptyValue}
            </InfoItem>
            <InfoItem icon={UserRound} label="Nom">
              {client.lastName ? client.lastName : emptyValue}
            </InfoItem>
            <InfoItem icon={CalendarDays} label="Date de naissance">{formatDate(client.birthDate)}</InfoItem>
            <InfoItem icon={Mail} label="E-mail">
              {client.email ? <a className="transition-colors hover:text-tertiary-400" href={`mailto:${client.email}`}>{client.email}</a> : emptyValue}
            </InfoItem>
            <InfoItem icon={Phone} label="Téléphone">
              {client.phone ? <a className="transition-colors hover:text-tertiary-400" href={`tel:${client.phone}`}>{client.phone}</a> : emptyValue}
            </InfoItem>
            <InfoItem icon={MapPin} label="Adresse">{client.address || emptyValue}</InfoItem>
          </dl>
        </article>
        <article className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <SectionHeading icon={ShieldCheck} title="Statut du profil" />
          <dl className="mt-3 divide-y divide-white/[0.07]">
            <StatusRow icon={UsersRound} label="Âge légal" positive={!client.isMinor} positiveLabel="Majeur" negativeLabel="Mineur" warning />
            <StatusRow icon={Megaphone} label="Communication marketing" positive={Boolean(client.marketingConsent)} positiveLabel="Autorisée" negativeLabel="Refusée" />
          </dl>
        </article>
        <article className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <SectionHeading icon={Tag} title="Repères client" />
          {tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag, index) => <span key={`${tag}-${index}`} className="rounded-full border border-tertiary-400/20 bg-tertiary-400/[0.08] px-3 py-1.5 text-[11px] font-medium text-tertiary-400 font-one">{tag}</span>)}
            </div>
          ) : (
            <p className="mt-3 text-xs text-white/55 font-two">Aucun tag enregistré</p>
          )}
        </article>
        <article className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <SectionHeading icon={FileText} title="Consentement" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${client.consentSigned ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
                {client.consentSigned ? <Check size={17} /> : <CircleAlert size={17} />}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium font-one ${client.consentSigned ? "text-emerald-200" : "text-amber-200"}`}>{client.consentSigned ? "Signé" : "En attente de signature"}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/50 font-two">
                  {client.consentSignedAt ? `Signé le ${formatDate(client.consentSignedAt)}` : "Aucune date de signature enregistrée"}
                </p>
              </div>
            </div>
            {client.consentFileUrl && (
              <a href={client.consentFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-tertiary-400/30 bg-tertiary-400/10 px-4 text-xs font-semibold text-tertiary-400 transition-all hover:border-tertiary-400/50 hover:bg-tertiary-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/50 font-one">
                Voir le document <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
          </div>
        </article>
        <article className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <SectionHeading icon={UserRound} title="Tuteur légal" />
          <div className="mt-3 border-t border-white/[0.07] pt-3">
            <p className="text-sm font-medium text-white font-two">{client.guardianName || emptyValue}</p>
            {client.guardianPhone ? (
              <a href={`tel:${client.guardianPhone}`} className="mt-2 inline-flex items-center gap-2 text-xs text-white/55 transition-colors hover:text-tertiary-400 font-two">
                <Phone size={13} aria-hidden="true" />{client.guardianPhone}
              </a>
            ) : <p className="mt-2 text-xs text-white/35 font-two">Aucun numéro associé</p>}
          </div>
        </article>
    </section>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-tertiary-400">
        <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-white font-one">{title}</h4>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 py-2.5">
      <dt className="flex items-center gap-2 text-xs font-medium text-white/55 font-one"><Icon size={13} aria-hidden="true" />{label}</dt>
      <dd className="mt-1.5 break-words text-sm leading-relaxed text-white/85 font-two">{children}</dd>
    </div>
  );
}

function StatusRow({ icon: Icon, label, positive, positiveLabel, negativeLabel, warning = false }: { icon: LucideIcon; label: string; positive: boolean; positiveLabel: string; negativeLabel: string; warning?: boolean }) {
  const negativeClass = warning ? "border-amber-400/25 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/[0.05] text-white/55";
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
      <dt className="flex items-center gap-2 text-xs text-white/55 font-two"><Icon size={14} className="text-white/35" aria-hidden="true" />{label}</dt>
      <dd><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold font-one ${positive ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : negativeClass}`}><span className={`h-1.5 w-1.5 rounded-full ${positive ? "bg-emerald-300" : warning ? "bg-amber-300" : "bg-white/40"}`} />{positive ? positiveLabel : negativeLabel}</span></dd>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return emptyValue;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyValue;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}
