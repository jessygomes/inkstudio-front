"use client";
import type { ReactNode } from "react";
import Image from "next/image";
import { CalendarDays, Check, Clock3, CreditCard, FileText, UserRound } from "lucide-react";
import AppointmentPhotos from "./AppointmentPhotos";
import { formatSkinTone, getSkinTonePreviewHex } from "@/lib/utils/formatSkinTone";
import { openImageInNewTab } from "@/lib/utils/openImage";
type AppointmentInformation = {
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
const panel = "rounded-2xl border border-white/10 bg-noir-600 p-4 font-one";
const serviceNames: Record<string, string> = { TATTOO: "Tatouage", PROJET: "Projet", RETOUCHE: "Retouche", PIERCING: "Piercing" };
export function RdvPlanningCard({ appointment }: {
    appointment: AppointmentInformation;
}) {
    const start = new Date(appointment.start);
    const end = new Date(appointment.end);
    const time = (date: Date) => date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    const artist = appointment.performerUser?.salonName || [appointment.performerUser?.firstName, appointment.performerUser?.lastName].filter(Boolean).join(" ") || appointment.tatoueur?.name;
    return <section aria-label="Planning du rendez-vous" className={panel}>
    <div className="mb-4 flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-xs font-semibold text-white/85"><CalendarDays size={14} className="text-white/35"/>Date & horaire</h3><span className="shrink-0 rounded-md border border-tertiary-400/20 bg-tertiary-400/10 px-2 py-1 text-[10px] font-medium text-tertiary-400">{serviceNames[appointment.prestation || ""] || appointment.prestation}</span></div>
    <div className="flex items-center gap-3"><div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025]"><span className="text-lg font-semibold leading-none text-white/85">{start.toLocaleDateString("fr-FR", { day: "2-digit" })}</span><span className="mt-1 text-[9px] uppercase text-white/35">{start.toLocaleDateString("fr-FR", { month: "short" })}</span></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-white/80">{start.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p><p className="mt-1.5 text-sm font-medium tabular-nums text-white">{time(start)}<span className="mx-1.5 text-white/25">–</span>{time(end)}</p></div></div>
    <dl className="mt-4 divide-y divide-white/[0.06] border-t border-white/[0.06]"><div className="flex items-center justify-between gap-3 py-2.5"><dt className="flex items-center gap-1.5 text-[11px] text-white/35"><Clock3 size={12}/>Durée</dt><dd className="text-xs text-white/70">{minutes >= 60 ? Math.floor(minutes / 60) + " h" + (minutes % 60 ? " " + minutes % 60 : "") : minutes + " min"}</dd></div><div className="flex items-center justify-between gap-3 pt-2.5"><dt className="flex items-center gap-1.5 text-[11px] text-white/35"><UserRound size={12}/>Artiste</dt><dd className="min-w-0 truncate text-xs text-white/70">{artist || "Non assigné"}</dd></div></dl>
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
    const facts = [
        { label: "Zone", value: detail?.zone || appointment.zone },
        { label: "Dimensions", value: detail?.size || appointment.size },
        { label: "Style / Couleur", value: detail?.colorStyle },
        { label: "Carnation", value: appointment.skin ? formatSkinTone(appointment.skin) : undefined },
        { label: "Zone de piercing", value: detail?.piercingZone },
        { label: "Type de piercing", value: piercingZoneName },
    ].filter((item) => item.value);
    return <section aria-label="Détails de la prestation" className={panel}>
    <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold text-white/85"><FileText size={14} className="text-white/35"/>La prestation</h3>
    {description && <p className="mb-4 whitespace-pre-wrap break-words text-xs leading-6 text-white/65">{description}</p>}
    {facts.length > 0 && <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-3">{facts.map((fact) => <div key={fact.label} className="min-w-0"><dt className="text-[10px] text-white/35">{fact.label}</dt><dd className="mt-1 flex items-center gap-1.5 break-words text-xs text-white/75">{fact.label === "Carnation" && <span className="size-2.5 shrink-0 rounded-full border border-white/15" style={{ backgroundColor: getSkinTonePreviewHex(appointment.skin || "") || undefined }}/>}{fact.value}</dd></div>)}</dl>}
    {typeof displayPrice === "number" && displayPrice > 0 && <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5"><span className="text-[11px] text-white/40">{detail?.price ? "Prix de la prestation" : "Tarif estimé"}</span><span className="text-base font-semibold tabular-nums text-white/90">{displayPrice.toLocaleString("fr-FR")}<span className="ml-1 text-xs font-normal text-white/40">€</span></span></div>}
    {(detail?.reference || detail?.sketch) && <div className="mb-4"><p className="mb-2 text-[10px] text-white/35">Références du projet</p><div className="grid grid-cols-2 gap-2">{[{ url: detail?.reference, label: "Référence" }, { url: detail?.sketch, label: "Croquis" }].map((item) => item.url ? <button type="button" key={item.label} aria-label={"Voir le visuel : " + item.label} onClick={() => openImageInNewTab(item.url!)} className="relative h-24 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400"><Image src={item.url} alt={item.label} fill sizes="200px" unoptimized className="object-cover"/><span className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-[10px] text-white">{item.label}</span></button> : null)}</div></div>}
    <div className="border-t border-white/[0.07] pt-3"><AppointmentPhotos appointmentId={appointment.id}/></div>
    {children && <div className="mt-4 border-t border-white/[0.07] pt-3">{children}</div>}
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
    return <section aria-label="Règlement" className={panel}><div className="mb-3 flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-xs font-semibold text-white/85"><CreditCard size={14} className="text-white/35"/>Paiement</h3>{!onPaymentChange && <span className={"text-[10px] " + (appointment.isPayed ? "text-emerald-400" : "text-white/35")}>{appointment.isPayed ? "Réglé" : "En attente"}</span>}</div>{onPaymentChange ? <div role="group" aria-label="État du paiement" className="grid grid-cols-2 gap-2">{[{ value: false, label: "Non réglé" }, { value: true, label: "Réglé" }].map((option) => <button type="button" key={option.label} aria-pressed={appointment.isPayed === option.value} onClick={() => onPaymentChange(option.value)} className={"flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 " + (appointment.isPayed === option.value ? option.value ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-400" : "border-white/20 bg-white/[0.07] text-white/80" : "border-white/10 text-white/35 hover:bg-white/5")}>{appointment.isPayed === option.value && <Check size={12}/>}{option.label}</button>)}</div> : <p className="text-xs leading-5 text-white/45">{appointment.isPayed ? "Le règlement de cette prestation est enregistré." : "Le règlement de cette prestation reste à effectuer."}</p>}</section>;
}
