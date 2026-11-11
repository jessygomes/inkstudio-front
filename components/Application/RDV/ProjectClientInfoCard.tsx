"use client";

import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, Pencil, Wallet, X } from "lucide-react";
import { updateDesiredTattooPeriodAction } from "@/lib/queries/booking-links";
import { describeApiError } from "@/lib/types/booking-links";
import {
  BUDGET_OPTIONS, describeBudget, describeFirstTattoo, findBudgetOption, type ProjectClientInfoFields,
} from "@/lib/types/project-client-info";

const field = "w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3 py-2 text-xs text-white outline-none transition focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 [color-scheme:dark]";

type Saved = { min: number | null; max: number | null; first: boolean | null };
const pick = (source: ProjectClientInfoFields): Saved => ({ min: source.projectBudgetMinCents ?? null, max: source.projectBudgetMaxCents ?? null, first: source.isFirstTattoo ?? null });
const toEuros = (cents: number | null) => (cents == null ? "" : String(cents / 100));
const toCents = (euros: string) => (euros.trim() === "" ? null : Math.round(Number(euros.replace(",", ".")) * 100));

/** Budget du client et « premier tatouage » d'un RDV Projet (lecture + modification). */
export default function ProjectClientInfoCard({ appointmentId, info, onUpdated }: {
  appointmentId: string;
  info: ProjectClientInfoFields;
  onUpdated?: (id: string) => void;
}) {
  const formId = useId();
  const [saved, setSaved] = useState<Saved>(() => pick(info));
  const [editing, setEditing] = useState(false);
  const [budgetChoice, setBudgetChoice] = useState("");
  const [customMin, setCustomMin] = useState("");
  const [customMax, setCustomMax] = useState("");
  const [first, setFirst] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sourceKey = [appointmentId, info.projectBudgetMinCents, info.projectBudgetMaxCents, info.isFirstTattoo].join("|");
  useEffect(() => {
    setSaved(pick(info));
    setEditing(false);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey]);

  const startEditing = () => {
    const known = findBudgetOption(saved.min, saved.max);
    setBudgetChoice(saved.min == null && saved.max == null ? "" : known ? known.id : "custom");
    setCustomMin(toEuros(saved.min));
    setCustomMax(toEuros(saved.max));
    setFirst(saved.first);
    setError(null);
    setEditing(true);
  };

  const save = async () => {
    if (saving) return;
    let min: number | null = null;
    let max: number | null = null;
    if (budgetChoice === "custom") {
      min = toCents(customMin);
      max = toCents(customMax);
      if ([min, max].some((value) => value !== null && (!Number.isFinite(value) || value < 0))) { setError("Indiquez des montants positifs."); return; }
      if (min === null && max === null) { setError("Indiquez au moins un montant, ou choisissez « Non renseigné »."); return; }
      if (min !== null && max !== null && min > max) { setError("Le minimum doit être inférieur ou égal au maximum."); return; }
    } else if (budgetChoice) {
      const option = BUDGET_OPTIONS.find((item) => item.id === budgetChoice);
      min = option?.min ?? null;
      max = option?.max ?? null;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await updateDesiredTattooPeriodAction(appointmentId, { projectBudgetMinCents: min, projectBudgetMaxCents: max, isFirstTattoo: first });
      if (!result.ok) {
        const message = describeApiError(result, "Impossible d’enregistrer ces informations.");
        setError(message);
        toast.error(message);
        return;
      }
      const appointment = result.data.appointment;
      setSaved(appointment ? pick(appointment) : { min, max, first });
      setEditing(false);
      toast.success("Informations du projet mises à jour");
      onUpdated?.(appointmentId);
    } finally {
      setSaving(false);
    }
  };

  const budget = describeBudget(saved.min, saved.max);
  return <section aria-label="Budget et expérience du client" className="rounded-2xl border border-white/10 bg-noir-600 p-4 font-one">
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-xs font-semibold text-white/85"><Wallet size={14} className="text-white/35" />Budget et expérience</h3>
      {!editing && <button type="button" onClick={startEditing} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/60 transition hover:bg-white/5 hover:text-white"><Pencil size={11} />Modifier</button>}
    </div>

    {!editing ? <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      <div className="min-w-0"><dt className="text-[10px] text-white/35">Budget du client</dt><dd className={`mt-1 text-sm ${budget ? "text-white" : "text-white/45"}`}>{budget ?? "Non renseigné"}</dd></div>
      <div className="min-w-0"><dt className="text-[10px] text-white/35">Premier tatouage</dt><dd className={`mt-1 text-sm ${saved.first === null ? "text-white/45" : "text-white"}`}>{describeFirstTattoo(saved.first)}</dd></div>
    </dl> : <form onSubmit={(event) => { event.preventDefault(); void save(); }} className="space-y-3">
      <div>
        <label htmlFor={`${formId}-budget`} className="mb-1 block text-[11px] text-white/60">Budget du client</label>
        <select id={`${formId}-budget`} value={budgetChoice} onChange={(event) => setBudgetChoice(event.target.value)} className={field}>
          <option value="">Non renseigné</option>
          {BUDGET_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          <option value="custom">Montants personnalisés</option>
        </select>
      </div>
      {budgetChoice === "custom" && <div className="grid grid-cols-2 gap-2">
        <div><label htmlFor={`${formId}-min`} className="mb-1 block text-[11px] text-white/60">Minimum (€)</label><input id={`${formId}-min`} type="number" min={0} step="0.01" inputMode="decimal" value={customMin} onChange={(event) => setCustomMin(event.target.value)} className={field} /></div>
        <div><label htmlFor={`${formId}-max`} className="mb-1 block text-[11px] text-white/60">Maximum (€)</label><input id={`${formId}-max`} type="number" min={0} step="0.01" inputMode="decimal" value={customMax} onChange={(event) => setCustomMax(event.target.value)} className={field} /></div>
      </div>}
      <div>
        <p id={`${formId}-first`} className="mb-1 text-[11px] text-white/60">Premier tatouage ?</p>
        <div role="radiogroup" aria-labelledby={`${formId}-first`} className="grid grid-cols-3 gap-1.5">
          {([[true, "Oui"], [false, "Non"], [null, "Non renseigné"]] as const).map(([value, label]) => <button key={label} type="button" role="radio" aria-checked={first === value} onClick={() => setFirst(value)}
            className={`min-h-8 rounded-xl border px-2 text-[11px] transition ${first === value ? "border-tertiary-400/50 bg-tertiary-400/15 text-white" : "border-white/10 text-white/55 hover:border-white/20 hover:text-white"}`}>{label}</button>)}
        </div>
      </div>
      {error && <p role="alert" className="text-[11px] text-red-300">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" disabled={saving} onClick={() => { setEditing(false); setError(null); }} className="inline-flex min-h-8 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-[11px] text-white/70 hover:bg-white/5"><X size={12} />Annuler</button>
        <button type="submit" disabled={saving} className="inline-flex min-h-8 items-center gap-1.5 rounded-xl bg-tertiary-400 px-3 text-[11px] font-medium text-white hover:bg-tertiary-500 disabled:opacity-50">{saving && <LoaderCircle size={12} className="animate-spin" />}{saving ? "Enregistrement…" : "Enregistrer"}</button>
      </div>
    </form>}
  </section>;
}
