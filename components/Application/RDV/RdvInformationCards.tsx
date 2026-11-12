"use client";
import type { ReactNode } from "react";
import Image from "next/image";
import { CalendarDays, Check, Clock3, CreditCard, Droplet, FileText, Gem, Hourglass, MapPin, Palette, Ruler, UserRound, type LucideIcon } from "lucide-react";
import AppointmentPhotos from "./AppointmentPhotos";
import { formatSkinTone, getSkinTonePreviewHex } from "@/lib/utils/formatSkinTone";
import { openImageInNewTab } from "@/lib/utils/openImage";
type AppointmentInformation = {
  venueSalonId?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  venueCity?: string | null;
  venuePostalCode?: string | null;

    id: string;
    start: string | Date;
    end: string | Date;
    prestation?: string;
    skin?: string | null;
    tatoueur?: {
        name: string;
    } | null;
    tattooDetail?: {
        description?: string | null;
        zone?: string | null;
        size?: string | number | null;
        colorStyle?: string | null;
        price?: number | null;
        estimatedPrice?: number | null;
        reference?: string | null;
        sketch?: string | null;
        piercingZone?: string | null;
    } | null;
    description?: string;
    zone?: string;
    size?: string | number;
    estimatedPrice?: number;
    performerUser?: {
        firstName?: string;
        lastName?: string;
        salonName?: string;
    } | null;
};
const panel = "rounded-2xl bg-noir-600 p-4 font-one";
const serviceNames: Record<string, string> = { TATTOO: "Tatouage", PROJET: "Projet", RETOUCHE: "Retouche", PIERCING: "Piercing" };
// Titre de section : icône dans une tuile teintée d'accent, comme sur l'app mobile.
function SectionTitle({ icon: Icon, children, right }: { icon: typeof FileText; children: ReactNode; right?: ReactNode }) {
    return <div className="mb-4 flex items-center justify-between gap-2"><h3 className="flex min-w-0 items-center gap-2.5 text-[13px] font-medium text-white/90"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-tertiary-400/10 text-tertiary-400"><Icon size={14}/></span><span className="truncate">{children}</span></h3>{right}</div>;
}
const tile = "min-w-0 rounded-xl bg-white/[0.04] px-3 py-2.5";
export function RdvPlanningCard({ appointment }: {
    appointment: AppointmentInformation;
}) {
    const start = new Date(appointment.start);
    const end = new Date(appointment.end);
    const time = (date: Date) => date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    const artist = appointment.performerUser?.salonName || [appointment.performerUser?.firstName, appointment.performerUser?.lastName].filter(Boolean).join(" ") || appointment.tatoueur?.name;
    return <section aria-label="Planning du rendez-vous" className={panel}>
    <SectionTitle icon={CalendarDays} right={<span className="shrink-0 rounded-md bg-tertiary-400/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-tertiary-400">{serviceNames[appointment.prestation || ""] || appointment.prestation}</span>}>Date & horaire</SectionTitle>
    <div className="flex items-center gap-4"><div className="flex h-[68px] w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-tertiary-400 to-tertiary-500 text-white shadow-lg shadow-tertiary-500/20"><span className="text-2xl font-semibold leading-none">{start.toLocaleDateString("fr-FR", { day: "2-digit" })}</span><span className="mt-1 text-[10px] font-medium uppercase tracking-wider">{start.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}</span></div><div className="min-w-0 flex-1"><p className="text-xl font-semibold tabular-nums text-white">{time(start)}<span className="mx-1.5 text-white/25">–</span>{time(end)}</p><p className="mt-1 text-xs capitalize text-white/55">{start.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div></div>
    {appointment.venueName && <div className={tile + " mt-4"}><p className="text-sm text-white">{appointment.venueName}</p><p className="mt-1 text-xs text-white/55">{[appointment.venueAddress, appointment.venuePostalCode, appointment.venueCity].filter(Boolean).join(", ")}</p></div>}
    <dl className="mt-4 grid grid-cols-2 gap-2"><div className={tile}><dt className="flex items-center gap-1.5 text-[10px] text-white/40"><Clock3 size={11}/>Durée</dt><dd className="mt-1 text-sm font-medium text-white/85">{minutes >= 60 ? Math.floor(minutes / 60) + " h" + (minutes % 60 ? " " + minutes % 60 : "") : minutes + " min"}</dd></div><div className={tile}><dt className="flex items-center gap-1.5 text-[10px] text-white/40"><UserRound size={11}/>Artiste</dt><dd className="mt-1 truncate text-sm font-medium text-white/85">{artist || "Non assigné"}</dd></div></dl>
  </section>;
}
export function RdvPrestationCard({ appointment, price, piercingZoneName, children }: {
    appointment: AppointmentInformation;
    price?: number;
    piercingZoneName?: string | null;
    children?: ReactNode;
}) {
    const detail = appointment.tattooDetail;
    const description = detail?.description || appointment.description;
    const displayPrice = price ?? detail?.price ?? detail?.estimatedPrice ?? appointment.estimatedPrice;
    const hasPrice = typeof displayPrice === "number" && displayPrice > 0;
    const facts: Array<{ label: string; value?: string | number | null; icon: LucideIcon }> = [
        { label: "Zone", value: detail?.zone || appointment.zone, icon: MapPin },
        { label: "Dimensions", value: detail?.size || appointment.size, icon: Ruler },
        { label: "Style / Couleur", value: detail?.colorStyle, icon: Palette },
        { label: "Carnation", value: appointment.skin ? formatSkinTone(appointment.skin) : undefined, icon: Droplet },
        { label: "Zone de piercing", value: detail?.piercingZone, icon: MapPin },
        { label: "Type de piercing", value: piercingZoneName, icon: Gem },
    ].filter((item) => item.value);
    return <section aria-label="Détails de la prestation" className={panel}>
    <SectionTitle icon={FileText} right={hasPrice ? <div className="shrink-0 text-right"><p className="text-[10px] leading-none text-white/40">{detail?.price ? "Prix" : "Tarif estimé"}</p><p className="mt-1 text-xl font-semibold leading-none tabular-nums text-tertiary-400">{displayPrice!.toLocaleString("fr-FR")}<span className="ml-0.5 text-sm font-normal text-tertiary-400/70">€</span></p></div> : undefined}>La prestation</SectionTitle>
    {description && <div className="mb-3 rounded-xl bg-white/[0.04] p-3"><p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/35">Description</p><p className="whitespace-pre-wrap break-words text-xs leading-6 text-white/75">{description}</p></div>}
    {facts.length > 0 && <dl className="mb-3 grid grid-cols-2 gap-2">{facts.map((fact) => <div key={fact.label} className={tile + " flex items-center gap-2.5"}><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-white/45">{fact.label === "Carnation" ? <span className="size-3.5 rounded-full border border-white/20" style={{ backgroundColor: getSkinTonePreviewHex(appointment.skin || "") || undefined }}/> : <fact.icon size={14}/>}</span><div className="min-w-0"><dt className="text-[10px] text-white/40">{fact.label}</dt><dd className="mt-0.5 break-words text-xs font-medium leading-4 text-white/90">{fact.value}</dd></div></div>)}</dl>}
    {(detail?.reference || detail?.sketch) && <div className="mb-3"><p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/35">Références du projet</p><div className="grid grid-cols-2 gap-2">{[{ url: detail?.reference, label: "Référence" }, { url: detail?.sketch, label: "Croquis" }].map((item) => item.url ? <button type="button" key={item.label} aria-label={"Voir le visuel : " + item.label} onClick={() => openImageInNewTab(item.url!)} className="group relative h-28 cursor-pointer overflow-hidden rounded-xl bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400"><Image src={item.url} alt={item.label} fill sizes="240px" unoptimized className="object-cover transition-transform duration-300 group-hover:scale-105"/><span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">{item.label}</span></button> : null)}</div></div>}
    <div className="border-t border-white/[0.07] pt-3"><AppointmentPhotos appointmentId={appointment.id} actions={children}/></div>
  </section>;
}
export function RdvPaymentCard({ appointment, onPaymentChange }: {
    appointment: {
        id: string;
        prestation?: string;
        isPayed?: boolean;
    };
    onPaymentChange?: (isPayed: boolean) => void;
}) {
    if (!["TATTOO", "RETOUCHE", "PIERCING"].includes(appointment.prestation || ""))
        return null;
    const paid = !!appointment.isPayed;
    const StatusIcon = paid ? Check : Hourglass;
    // Une seule tuile lisible d'un coup d'œil : vert quand c'est réglé, orange sinon, avec l'interrupteur à droite.
    return <section aria-label="Règlement" className={"flex items-center gap-3 rounded-2xl p-3.5 font-one transition-colors " + (paid ? "bg-emerald-400/[0.08]" : "bg-amber-400/[0.07]")}>
    <span className={"grid size-10 shrink-0 place-items-center rounded-xl " + (paid ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300")}><StatusIcon size={18}/></span>
    <div className="min-w-0 flex-1">
      <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/40"><CreditCard size={11}/>Paiement</p>
      <p className={"mt-0.5 text-sm font-semibold " + (paid ? "text-emerald-300" : "text-amber-300")}>{paid ? "Réglé" : "En attente de règlement"}</p>
      <p className="mt-0.5 text-[11px] leading-4 text-white/45">{onPaymentChange ? (paid ? "Désactivez si le paiement est annulé." : "Activez quand le paiement est reçu.") : paid ? "Le règlement de cette prestation est enregistré." : "Le règlement de cette prestation reste à effectuer."}</p>
    </div>
    {onPaymentChange && <button type="button" role="switch" aria-checked={paid} aria-label="Marquer comme réglé" onClick={() => onPaymentChange(!paid)} className={"relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 " + (paid ? "bg-emerald-500" : "bg-white/15")}><span className={"absolute top-0.5 size-5 rounded-full bg-white shadow transition-all " + (paid ? "left-[22px]" : "left-0.5")}/></button>}
  </section>;
}
