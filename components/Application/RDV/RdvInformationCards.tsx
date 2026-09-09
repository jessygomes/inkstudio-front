import { ReactNode } from "react";
import Image from "next/image";
import { Check, MoreHorizontal, CreditCard, FileText, Image as ImageIcon, MapPin, Ruler } from "lucide-react";
import { AppointmentProps } from "@/lib/type";
import { formatSkinTone, getSkinTonePreviewHex } from "@/lib/utils/formatSkinTone";
import { openImageInNewTab } from "@/lib/utils/openImage";

type AppointmentInformation = Omit<Pick<AppointmentProps, "start" | "end" | "prestation" | "tatoueur" | "skin" | "tattooDetail">, "start" | "end" | "prestation" | "skin"> & {
  start: string | Date;
  end: string | Date;
  prestation?: string;
  skin?: string | null;
  performerUser?: { firstName?: string; lastName?: string; salonName?: string };
};

export function RdvPlanningCard({ appointment: selectedEvent }: { appointment: AppointmentInformation }) {
  const durationMin = Math.round(
    (new Date(selectedEvent.end).getTime() -
      new Date(selectedEvent.start).getTime()) /
      60000,
  );

  const startDate = new Date(selectedEvent.start).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const startTime = new Date(selectedEvent.start).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(selectedEvent.end).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });


  return (<div className="dashboard-embedded-section overflow-hidden p-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-tertiary-400/80 font-one">
                Rendez-vous
              </p>
              <p className="mt-1 text-[11px] text-white/40 font-one">
                Planning et prestation
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] text-white/45 font-one">
              {selectedEvent.prestation}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-linear-to-l from-noir-500 to-noir-700 px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/15">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-medium uppercase tracking-wider text-blue-200/55 font-one">Date et heure</p>
                <p className="mt-0.5 text-sm font-semibold text-white font-one capitalize">{startDate}</p>
                <p className="text-[11px] text-white/55 font-one tabular-nums">{startTime} - {endTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-linear-to-l from-noir-500 to-noir-700 px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-purple-400/15 bg-purple-500/10">
                <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Durée</p>
                <p className="text-xs font-semibold text-white font-one">{durationMin} min</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-linear-to-l from-noir-500 to-noir-700 px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-500/10">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Prestation</p>
                <p className="text-xs font-medium text-white/90 font-one truncate">{selectedEvent.prestation}</p>
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-2.5 rounded-2xl border border-tertiary-400/15 bg-tertiary-500/[0.06] px-2.5 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/15 bg-tertiary-500/10">
                <svg className="w-3.5 h-3.5 text-tertiary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/35 font-one">Artiste</p>
                <p className="text-xs font-medium text-white/90 font-one truncate">
                  {selectedEvent.performerUser?.salonName ||
                    (selectedEvent.performerUser?.firstName ||
                    selectedEvent.performerUser?.lastName
                      ? `${selectedEvent.performerUser?.firstName ?? ""} ${selectedEvent.performerUser?.lastName ?? ""}`.trim()
                      : selectedEvent.tatoueur?.name) || (
                      <span className="text-white/35 italic">Non assigné</span>
                    )}
                </p>
              </div>
            </div>
          </div>
        </div>);
}

export function RdvPrestationCard({ appointment: selectedEvent, price, piercingZoneName, children }: {
  appointment: AppointmentInformation;
  price?: number;
  piercingZoneName?: string | null;
  children?: ReactNode;
}) {
  const tattooDetail = selectedEvent.tattooDetail;
  const displayPrice = price ?? tattooDetail?.price ?? tattooDetail?.estimatedPrice;
  const hasPrice = typeof displayPrice === "number" && displayPrice > 0;
  return (<>{tattooDetail && (
          <div className="dashboard-embedded-section overflow-hidden p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">
                  Détails de la prestation
                </p>
                <p className="mt-1 text-xs font-semibold text-white font-one">
                  {selectedEvent.prestation}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <FileText size={14} className="text-white/55" />
              </div>
            </div>

            <div className="space-y-2.5">
              {tattooDetail.description && (
                <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <FileText size={13} className="text-white/40" />
                    <p className="text-[9px] font-medium uppercase tracking-wider text-white/35 font-one">Description</p>
                  </div>
                  <p className="text-xs leading-relaxed text-white/80 font-one">{tattooDetail.description}</p>
                </div>
              )}

              {(tattooDetail.zone ||
                tattooDetail.size ||
                selectedEvent.skin ||
                tattooDetail.piercingZone ||
                piercingZoneName) && (
                <div className="grid grid-cols-2 gap-2">
                  {tattooDetail.zone && (
                    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.035] px-2.5 py-2">
                      <MapPin size={13} className="shrink-0 text-tertiary-300/80" />
                      <span className="min-w-0 truncate text-[11px] text-white/75 font-one"><span className="mr-1 text-[9px] text-white/35">Zone</span>{tattooDetail.zone}</span>
                    </div>
                  )}
                  {tattooDetail.size && (
                    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.035] px-2.5 py-2">
                      <Ruler size={13} className="shrink-0 text-tertiary-300/80" />
                      <span className="min-w-0 truncate text-[11px] text-white/75 font-one"><span className="mr-1 text-[9px] text-white/35">Taille</span>{tattooDetail.size}</span>
                    </div>
                  )}
                  {selectedEvent.skin && (
                    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.035] px-2.5 py-2 text-[11px] font-one text-white/75">
                      <span className="inline-block h-2.5 w-2.5 rounded-full border border-white/15 shrink-0" style={{ backgroundColor: getSkinTonePreviewHex(selectedEvent.skin) ?? undefined }} />
                      {formatSkinTone(selectedEvent.skin)}
                    </span>
                  )}
                  {tattooDetail.piercingZone && (
                    <span className="inline-flex min-w-0 items-center gap-1 rounded-xl border border-white/8 bg-white/[0.035] px-2.5 py-2 text-[11px] font-one text-white/75">
                      <span className="text-white/40 text-[9px]">Piercing</span> {tattooDetail.piercingZone}
                    </span>
                  )}
                  {piercingZoneName && (
                    <span className="inline-flex min-w-0 items-center gap-1 rounded-xl border border-white/8 bg-white/[0.035] px-2.5 py-2 text-[11px] font-one text-white/75">
                      <span className="text-white/40 text-[9px]">Zone spéc.</span> {piercingZoneName}
                    </span>
                  )}
                </div>
              )}

              {hasPrice && (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 to-transparent px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-emerald-300" />
                    <span className="text-[9px] uppercase tracking-wider text-white/45 font-one">
                    {tattooDetail.price ? "Prix final" : "Estimation"}
                    </span>
                  </div>
                  <span className="text-base font-bold text-white font-one">
                    {displayPrice}
                    <span className="ml-0.5 text-xs font-medium text-white/55">€</span>
                  </span>
                </div>
              )}

              {(tattooDetail.reference || tattooDetail.sketch) && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <ImageIcon size={13} className="text-white/40" />
                    <p className="text-[9px] font-medium uppercase tracking-wider text-white/35 font-one">Références visuelles</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {tattooDetail.reference && (
                      <button
                        onClick={() => openImageInNewTab(tattooDetail.reference as string)}
                        className="group relative h-28 w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                      >
                        <Image src={tattooDetail.reference} alt="Référence" fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-end justify-center pb-2">
                          <span className="text-[10px] font-one text-white/0 group-hover:text-white/90 transition-colors font-medium">Référence</span>
                        </div>
                      </button>
                    )}
                    {tattooDetail.sketch && (
                      <button
                        onClick={() => openImageInNewTab(tattooDetail.sketch as string)}
                        className="group relative h-28 w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                      >
                        <Image src={tattooDetail.sketch} alt="Croquis" fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-end justify-center pb-2">
                          <span className="text-[10px] font-one text-white/0 group-hover:text-white/90 transition-colors font-medium">Croquis</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
              {children}
            </div>
          </div>
        )}</>);
}

export function RdvPaymentCard({ appointment: selectedEvent, onPaymentChange }: {
  appointment: { id: string; prestation?: string; isPayed?: boolean };
  onPaymentChange?: (isPayed: boolean) => void;
}) {
  const Option = onPaymentChange ? "label" : "div";
  return (<>{/* Paiement */}
        {(selectedEvent.prestation === "RETOUCHE" ||
          selectedEvent.prestation === "TATTOO" ||
          selectedEvent.prestation === "PIERCING") && (
          <div className="dashboard-embedded-section p-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">Paiement</p>
                <p className="mt-1 text-[11px] text-white/40 font-one">{onPaymentChange ? "Indiquez si la prestation a été réglée." : "État du règlement de la prestation."}</p>
              </div>
              <CreditCard size={15} className="text-emerald-300/80" />
            </div>
            <div className={`grid grid-cols-2 gap-2 ${onPaymentChange ? "[&_label]:cursor-pointer" : "pointer-events-none"}`}>
              <Option className={`group flex items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 transition-all ${selectedEvent.isPayed === false ? "border-red-400/35 bg-red-500/15 text-red-200 shadow-lg shadow-red-950/20" : "border-white/8 bg-white/[0.035] text-white/45 hover:border-red-400/20 hover:bg-red-500/[0.07]"}`}>
                {onPaymentChange && <input type="radio" name={`payment-${selectedEvent.id}`} checked={selectedEvent.isPayed === false} onChange={() => onPaymentChange?.(false)} className="sr-only" />}
                <span className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${selectedEvent.isPayed === false ? "bg-red-400/20" : "bg-white/5"}`}><MoreHorizontal size={13} /></span>
                  <span className="text-xs font-medium font-one">Non payé</span>
                </span>
                {selectedEvent.isPayed === false && <Check size={14} />}
              </Option>
              <Option className={`group flex items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 transition-all ${selectedEvent.isPayed === true ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-200 shadow-lg shadow-emerald-950/20" : "border-white/8 bg-white/[0.035] text-white/45 hover:border-emerald-400/20 hover:bg-emerald-500/[0.07]"}`}>
                {onPaymentChange && <input type="radio" name={`payment-${selectedEvent.id}`} checked={selectedEvent.isPayed === true} onChange={() => onPaymentChange?.(true)} className="sr-only" />}
                <span className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${selectedEvent.isPayed === true ? "bg-emerald-400/20" : "bg-white/5"}`}><Check size={13} /></span>
                  <span className="text-xs font-medium font-one">Payé</span>
                </span>
                {selectedEvent.isPayed === true && <Check size={14} />}
              </Option>
            </div>
          </div>
        )}</>);
}
