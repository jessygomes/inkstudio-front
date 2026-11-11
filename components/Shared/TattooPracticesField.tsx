"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import {
  TATTOO_PRACTICE_DETAILS_MAX, TATTOO_PRACTICE_OPTIONS, type TattooPracticesValue,
} from "@/lib/types/project-client-info";

/** Sélection multiple des pratiques de tatouage + texte de précision (salon, indépendant, tatoueur interne). */
export default function TattooPracticesField({ value, onChange, error, disabled }: {
  value: TattooPracticesValue;
  onChange: (value: TattooPracticesValue) => void;
  error?: string | null;
  disabled?: boolean;
}) {
  const id = useId();
  const toggle = (practice: TattooPracticesValue["tattooPractices"][number]) => {
    const has = value.tattooPractices.includes(practice);
    onChange({ ...value, tattooPractices: has ? value.tattooPractices.filter((item) => item !== practice) : [...value.tattooPractices, practice] });
  };
  const otherSelected = value.tattooPractices.includes("OTHER");

  return <div className="space-y-3 font-one">
    <div role="group" aria-label="Pratiques de tatouage" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {TATTOO_PRACTICE_OPTIONS.map((option) => {
        const checked = value.tattooPractices.includes(option.value);
        return <button key={option.value} type="button" role="checkbox" aria-checked={checked} disabled={disabled} onClick={() => toggle(option.value)}
          className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "border-tertiary-400/50 bg-tertiary-400/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}>
          <span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded border ${checked ? "border-tertiary-400 bg-tertiary-400 text-white" : "border-white/25"}`}>{checked && <Check size={11} />}</span>
          <span><span className="block text-xs font-semibold text-white">{option.label}</span><span className="mt-0.5 block text-[11px] text-white/45">{option.hint}</span></span>
        </button>;
      })}
    </div>
    <div>
      <label htmlFor={`${id}-details`} className="mb-1.5 block text-xs text-white/70">Précisions{otherSelected ? " *" : " (facultatif)"}</label>
      <textarea id={`${id}-details`} rows={3} maxLength={TATTOO_PRACTICE_DETAILS_MAX} disabled={disabled} value={value.tattooPracticeDetails}
        aria-invalid={Boolean(error)} aria-describedby={`${id}-hint`}
        onChange={(event) => onChange({ ...value, tattooPracticeDetails: event.target.value })}
        placeholder={otherSelected ? "Décrivez la technique utilisée…" : "Ex. machine pour les lignes, handpoke pour les petites pièces…"}
        className="w-full min-w-0 resize-y rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 aria-[invalid=true]:border-red-400/50" />
      <p id={`${id}-hint`} className="mt-1 flex justify-between gap-2 text-[11px] text-white/35"><span>Affiché sur votre profil public.</span><span>{value.tattooPracticeDetails.length}/{TATTOO_PRACTICE_DETAILS_MAX}</span></p>
      {error && <p role="alert" className="mt-1 text-[11px] text-red-300">{error}</p>}
    </div>
  </div>;
}
