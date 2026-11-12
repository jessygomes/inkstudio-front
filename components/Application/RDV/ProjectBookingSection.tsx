"use client";

import { useEffect, useId, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CalendarHeart, Link2, LoaderCircle, Pencil, X } from "lucide-react";
import { updateDesiredTattooPeriodAction } from "@/lib/queries/booking-links";
import {
  DESIRED_PERIOD_OPTIONS, civilDatePart, describeApiError, describeDesiredPeriod, toDesiredPeriodPayload, validateDesiredPeriod,
  type DesiredTattooPeriod, type DesiredTattooPeriodFields,
} from "@/lib/types/booking-links";
import BookingLinkCreator from "@/components/Application/BookingLinks/BookingLinkCreator";
import ProjectClientInfoCard from "./ProjectClientInfoCard";
import RdvActionButton from "./RdvActionButton";
import type { CalendarEvent } from "./Calendar";

const field = "w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3 py-2 text-xs text-white outline-none transition focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 [color-scheme:dark]";

function pickPeriod(source: DesiredTattooPeriodFields): DesiredTattooPeriodFields {
  return {
    desiredTattooPeriod: source.desiredTattooPeriod ?? null,
    desiredTattooDate: civilDatePart(source.desiredTattooDate),
    desiredTattooStartDate: civilDatePart(source.desiredTattooStartDate),
    desiredTattooEndDate: civilDatePart(source.desiredTattooEndDate),
  };
}

/** Période souhaitée (lecture/édition) + « Proposer un RDV tatouage » pour un RDV Projet. */
export default function ProjectBookingSection({ appointment, onUpdated }: {
  appointment: CalendarEvent;
  onUpdated?: (id: string) => void;
}) {
  const formId = useId();
  const { data: session } = useSession();
  // Création de RDV (et donc de liens) indisponible en plan gratuit, comme le bouton « Nouveau ».
  const canCreateLink = session?.user?.saasPlan !== "FREE";
  const [saved, setSaved] = useState<DesiredTattooPeriodFields>(() => pickPeriod(appointment));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DesiredTattooPeriodFields>(saved);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);

  // Resynchronise si un autre RDV est sélectionné ou si les données sont rechargées
  const sourceKey = [appointment.id, appointment.desiredTattooPeriod, appointment.desiredTattooDate, appointment.desiredTattooStartDate, appointment.desiredTattooEndDate].join("|");
  useEffect(() => {
    const next = pickPeriod(appointment);
    setSaved(next);
    setDraft(next);
    setEditing(false);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey]);

  if (appointment.prestation !== "PROJET") return null;

  const description = describeDesiredPeriod(saved);
  const save = async () => {
    if (saving) return;
    const input = toDesiredPeriodPayload({
      desiredTattooPeriod: (draft.desiredTattooPeriod ?? null) as DesiredTattooPeriod | null,
      desiredTattooDate: draft.desiredTattooDate,
      desiredTattooStartDate: draft.desiredTattooStartDate,
      desiredTattooEndDate: draft.desiredTattooEndDate,
    });
    const invalid = validateDesiredPeriod(input);
    if (invalid) { setError(invalid); return; }
    setSaving(true);
    setError(null);
    try {
      const result = await updateDesiredTattooPeriodAction(appointment.id, input);
      if (!result.ok) {
        const message = describeApiError(result, "Impossible d’enregistrer la période souhaitée.");
        setError(message);
        toast.error(message);
        return;
      }
      const next = pickPeriod(result.data.appointment ?? input);
      setSaved(next);
      setDraft(next);
      setEditing(false);
      toast.success("Période souhaitée mise à jour");
      onUpdated?.(appointment.id);
    } finally {
      setSaving(false);
    }
  };

  const clientLabel = [appointment.client?.firstName, appointment.client?.lastName].filter(Boolean).join(" ");
  const artistLabel = appointment.performerUser?.salonName
    || [appointment.performerUser?.firstName, appointment.performerUser?.lastName].filter(Boolean).join(" ")
    || appointment.tatoueur?.name;

  return <>
    <ProjectClientInfoCard appointmentId={appointment.id} info={appointment} onUpdated={onUpdated} />

    <section aria-label="Période souhaitée pour le tatouage" className="rounded-2xl bg-noir-600 p-4 font-one">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2.5 text-[13px] font-medium text-white/90"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-tertiary-400/10 text-tertiary-400"><CalendarHeart size={14} /></span>Période souhaitée pour le tatouage</h3>
        {!editing && <div className="flex items-center gap-2">
          <RdvActionButton tone="neutral" icon={Pencil} size="sm" iconOnly onClick={() => { setDraft(saved); setEditing(true); }}>Modifier</RdvActionButton>
          {canCreateLink && <RdvActionButton tone="primary" icon={Link2} size="sm" title="Générez un lien pour que le client réserve sa séance lui-même." onClick={() => setCreatorOpen(true)}>Proposer un RDV</RdvActionButton>}
        </div>}
      </div>

      {!editing ? <>
        <p className={`text-sm ${description ? "text-white" : "text-white/45"}`}>{description ?? "Non renseignée"}</p>
        <p className="mt-1.5 text-[11px] leading-5 text-white/35">Information indicative : elle ne bloque aucun créneau dans l’agenda.</p>
      </> : <form id={formId} onSubmit={(event) => { event.preventDefault(); void save(); }} className="space-y-3">
        <div>
          <label htmlFor={`${formId}-period`} className="mb-1 block text-[11px] text-white/60">Préférence du client</label>
          <select id={`${formId}-period`} value={draft.desiredTattooPeriod ?? ""} onChange={(event) => setDraft({ desiredTattooPeriod: (event.target.value || null) as DesiredTattooPeriod | null, desiredTattooDate: draft.desiredTattooDate, desiredTattooStartDate: draft.desiredTattooStartDate, desiredTattooEndDate: draft.desiredTattooEndDate })} className={field}>
            <option value="">Non renseignée</option>
            {DESIRED_PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          {draft.desiredTattooPeriod && <p className="mt-1 text-[11px] text-white/35">{DESIRED_PERIOD_OPTIONS.find((option) => option.value === draft.desiredTattooPeriod)?.hint}</p>}
        </div>
        {draft.desiredTattooPeriod === "EXACT_DATE" && <div>
          <label htmlFor={`${formId}-date`} className="mb-1 block text-[11px] text-white/60">Date souhaitée</label>
          <input id={`${formId}-date`} type="date" value={draft.desiredTattooDate ?? ""} onChange={(event) => setDraft({ ...draft, desiredTattooDate: event.target.value || null })} className={field} />
        </div>}
        {draft.desiredTattooPeriod === "DATE_RANGE" && <div className="grid grid-cols-2 gap-2">
          <div><label htmlFor={`${formId}-from`} className="mb-1 block text-[11px] text-white/60">Du</label><input id={`${formId}-from`} type="date" value={draft.desiredTattooStartDate ?? ""} onChange={(event) => setDraft({ ...draft, desiredTattooStartDate: event.target.value || null })} className={field} /></div>
          <div><label htmlFor={`${formId}-to`} className="mb-1 block text-[11px] text-white/60">Au (inclus)</label><input id={`${formId}-to`} type="date" min={draft.desiredTattooStartDate ?? undefined} value={draft.desiredTattooEndDate ?? ""} onChange={(event) => setDraft({ ...draft, desiredTattooEndDate: event.target.value || null })} className={field} /></div>
        </div>}
        {error && <p role="alert" className="text-[11px] text-red-300">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" disabled={saving} onClick={() => { setEditing(false); setDraft(saved); setError(null); }} className="inline-flex min-h-8 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-[11px] text-white/70 hover:bg-white/5"><X size={12} />Annuler</button>
          <button type="submit" disabled={saving} className="inline-flex min-h-8 items-center gap-1.5 rounded-xl bg-tertiary-400 px-3 text-[11px] font-medium text-white hover:bg-tertiary-500 disabled:opacity-50">{saving && <LoaderCircle size={12} className="animate-spin" />}{saving ? "Enregistrement…" : "Enregistrer"}</button>
        </div>
      </form>}

    </section>

    {creatorOpen && <BookingLinkCreator onClose={() => setCreatorOpen(false)} context={{
      origin: "project",
      projectAppointmentId: appointment.id,
      originLabel: `RDV Projet · ${appointment.title}`,
      inheritedArtistLabel: artistLabel || undefined,
      inheritedVenueLabel: appointment.venueName || undefined,
      client: clientLabel ? { label: clientLabel, detail: appointment.client?.email } : undefined,
    }} />}
  </>;
}
