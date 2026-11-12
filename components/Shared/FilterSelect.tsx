"use client";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import RdvActionButton from "@/components/Application/RDV/RdvActionButton";

type FilterOption = { value: string; label: string; disabled?: boolean };

type FilterSelectProps = {
  label: string;
  placeholder: string;
  unit: string;
  icon: ReactNode;
  selected: string[];
  options: FilterOption[];
  onApply: (values: string[]) => void;
  align?: "left" | "right";
  multiple?: boolean;
  /** Choix unique : propose un premier choix vide (le libellé d'exemple) pour effacer la valeur. `false` : toutes les options sont de vraies valeurs (ex. un statut). */
  clearable?: boolean;
  disabled?: boolean;
  /** Remplace le style du bouton déclencheur. */
  buttonClassName?: string;
};

/**
 * Select de filtre : un bouton qui ouvre un panneau (titre, liste de choix, Effacer / Appliquer).
 * Même présentation que les filtres de la page Inspirations du site People ; une option peut être désactivée (ex. canal bientôt disponible).
 */
export default function FilterSelect({ label, placeholder, unit, icon, selected, options, onApply, align = "left", multiple = true, clearable = true, disabled = false, buttonClassName }: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!containerRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); buttonRef.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  const singleLabel = options.find((option) => option.value === (selected[0] || ""))?.label || selected[0];
  const displayOptions: FilterOption[] = multiple ? options : clearable ? [{ value: "", label: placeholder }, ...options.filter((option) => option.value)] : options;
  return <div ref={containerRef} className="relative min-w-0 font-one">
    <button ref={buttonRef} type="button" disabled={disabled} aria-expanded={open} aria-controls={id} onClick={() => { setDraft(selected); setOpen((value) => !value); }} className={buttonClassName || "flex h-10 w-full min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-noir-700 px-3 text-left text-xs text-white/80 outline-none transition hover:border-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10"}><span className="shrink-0 text-tertiary-400/80" aria-hidden="true">{icon}</span><span className="sr-only">{label} : </span><span className="flex-1 truncate">{selected.length > 1 ? selected.length + " " + unit + "s" : singleLabel || placeholder}</span><ChevronDown size={12} aria-hidden="true" className={open ? "shrink-0 rotate-180" : "shrink-0"} /></button>
    {open && <div id={id} className={`absolute top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/10 bg-noir-700 shadow-xl shadow-black/30 ${align === "left" ? "left-0" : "right-0"}`}>
      <div className="border-b border-white/[0.08] px-3 py-3"><p className="text-xs text-white/80">{label}</p><p className="mt-1 text-[10px] leading-5 text-white/40">{multiple ? `Vous pouvez sélectionner plusieurs ${unit}s.` : `Sélectionnez un ${unit}.`}</p></div>
      <div role={multiple ? "group" : "radiogroup"} aria-label={label} className="max-h-64 overflow-y-auto p-1.5">{displayOptions.map((option) => {
        const checked = !multiple && !option.value ? !draft.length : draft.includes(option.value);
        return <label key={option.value} className={"flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition " + (option.disabled ? "cursor-not-allowed text-white/30" : "cursor-pointer text-white/75 hover:bg-white/5")}><input type={multiple ? "checkbox" : "radio"} name={multiple ? undefined : id} disabled={option.disabled} checked={checked} onChange={() => {
          // Choix unique : appliqué tout de suite, sans bouton « Appliquer » ; la liste se referme.
          if (!multiple) { const next = option.value ? [option.value] : []; setDraft(next); onApply(next); setOpen(false); buttonRef.current?.focus(); return; }
          setDraft((values) => checked ? values.filter((value) => value !== option.value) : [...values, option.value]);
        }} className="size-3.5 accent-tertiary-400" />{option.label}</label>;
      })}{!displayOptions.length && <p className="px-2 py-3 text-xs text-white/40">Aucune option disponible.</p>}</div>
      {multiple && <div className="flex justify-between gap-2 border-t border-white/[0.08] p-2"><RdvActionButton tone="neutral" size="sm" className="!w-auto" onClick={() => setDraft([])}>Tout décocher</RdvActionButton><RdvActionButton tone="primary" size="sm" className="!w-auto" onClick={() => { onApply(draft); setOpen(false); buttonRef.current?.focus(); }}>{"Appliquer" + (draft.length ? " (" + draft.length + ")" : "")}</RdvActionButton></div>}
    </div>}
  </div>;
}
