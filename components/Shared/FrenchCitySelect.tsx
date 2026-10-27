"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";

type Commune = { nom: string; code: string; codesPostaux: string[] };
type Option = { value: string; city: string; postalCode: string };
let communesRequest: Promise<Commune[]> | undefined;
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export default function FrenchCitySelect({ id, city, postalCode, onChange, className, disabled = false }: {
  id: string;
  city?: string | null;
  postalCode?: string | null;
  onChange: (city: string, postalCode: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  const [communes, setCommunes] = useState<Commune[]>([]);
  // Editing always clears the saved location, even if the draft spells it exactly.
  const [draft, setDraft] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [invalid, setInvalid] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const query = draft ?? city ?? "";

  useEffect(() => {
    let active = true;
    communesRequest ??= fetch("/data/communes-france.json").then(response => {
      if (!response.ok) throw new Error("Communes indisponibles");
      return response.json() as Promise<Commune[]>;
    }).catch(error => { communesRequest = undefined; throw error; });
    communesRequest.then(data => { if (active) setCommunes(data); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [attempt]);

  const selected = draft === null && communes.some(commune => commune.nom === city && commune.codesPostaux.includes(postalCode || ""));
  useEffect(() => {
    inputRef.current?.setCustomValidity(selected ? "" : "Sélectionnez une ville dans les suggestions.");
  }, [selected, query]);

  const options = useMemo(() => {
    const search = normalize(query);
    if (!search) return [];
    return communes.filter(commune => normalize(commune.nom).includes(search) || commune.codesPostaux.some(code => code.startsWith(search)))
      .sort((a, b) => Number(normalize(b.nom) === search) - Number(normalize(a.nom) === search)
        || Number(normalize(b.nom).startsWith(search)) - Number(normalize(a.nom).startsWith(search))
        || a.nom.localeCompare(b.nom, "fr"))
      .flatMap(commune => commune.codesPostaux.filter(code => !/^\d+$/.test(search) || code.startsWith(search))
        .map(code => ({ value: `${commune.code}:${code}`, city: commune.nom, postalCode: code })));
  }, [communes, query]);
  const visible = options.slice(0, 50);
  const expanded = open && !disabled;
  useEffect(() => {
    if (activeIndex >= 0) listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function choose(option: Option) {
    onChange(option.city, option.postalCode);
    setDraft(null);
    setActiveIndex(-1);
    setInvalid(false);
    inputRef.current?.setCustomValidity("");
    inputRef.current?.focus();
    setOpen(false);
  }

  return <div className="relative" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false);
      if (draft !== null) setInvalid(true);
    }
  }}>
    <div className="relative">
      <input ref={inputRef} id={id} type="text" role="combobox" required value={query}
        aria-autocomplete="list" aria-expanded={expanded} aria-controls={`${id}-list`}
        aria-activedescendant={expanded && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
        aria-invalid={invalid || undefined} aria-describedby={`${id}-hint`}
        autoComplete="off" spellCheck={false} placeholder="Rechercher une ville ou un code postal…"
        className={`${className ?? "w-full rounded-xl border border-white/10 bg-noir-700 px-3.5 py-2.5 text-sm text-white outline-none focus:border-tertiary-400"} !pr-10`}
        disabled={disabled} onFocus={() => { setOpen(true); setActiveIndex(-1); }}
        onChange={event => {
          setDraft(event.target.value);
          onChange("", "");
          inputRef.current?.setCustomValidity("Sélectionnez une ville dans les suggestions.");
          setOpen(true);
          setActiveIndex(-1);
          setInvalid(false);
        }} onInvalid={() => { setInvalid(true); setOpen(true); }}
        onKeyDown={event => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex(index => visible.length ? (event.key === "ArrowDown" ? Math.min(index + 1, visible.length - 1) : index <= 0 ? visible.length - 1 : index - 1) : -1);
          } else if (event.key === "Enter" && expanded) {
            event.preventDefault();
            if (activeIndex >= 0 && visible[activeIndex]) choose(visible[activeIndex]);
            else if (!selected) setInvalid(true);
            else setOpen(false);
          } else if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          }
        }} />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/35" aria-hidden="true">
        {selected ? <Check size={16} className="text-tertiary-400" /> : <ChevronDown size={16} />}
      </span>
    </div>
    {expanded && <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#191918] text-white shadow-[0_18px_50px_rgba(0,0,0,0.5)]">
      <div className="border-b border-white/[0.07] px-3.5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-white/40">Choisissez votre commune</div>
      <ul ref={listRef} id={`${id}-list`} role="listbox" aria-label="Communes françaises" className="max-h-64 overflow-y-auto overscroll-contain p-1.5 [color-scheme:dark]">
        {visible.map((option, index) => <li key={option.value} id={`${id}-option-${index}`} role="option"
          aria-selected={selected && option.city === city && option.postalCode === postalCode}
          onMouseDown={event => event.preventDefault()} onClick={() => choose(option)} onMouseMove={() => setActiveIndex(index)}
          className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${index === activeIndex ? "bg-tertiary-400/10 text-tertiary-400" : "text-white/85 hover:bg-white/5"}`}>
          <MapPin size={15} className="shrink-0 opacity-50" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-sm font-medium">{option.city}</span>
          <span className="shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] tabular-nums text-white/55">{option.postalCode}</span>
        </li>)}
      </ul>
      {(!visible.length || options.length > 50) && <p className="px-4 py-3 text-xs text-white/50" role="status">
        {error ? "Impossible de charger les communes." : !communes.length ? "Chargement des communes…" : !normalize(query) ? "Commencez à saisir une ville ou un code postal." : !visible.length ? "Aucune ville trouvée. Essayez un autre nom ou code postal." : "Précisez votre recherche pour afficher les autres villes."}
      </p>}
      {error && <button type="button" className="m-3 text-xs text-tertiary-400 underline" onClick={() => { setError(false); setAttempt(value => value + 1); }}>Réessayer</button>}
    </div>}
    <p id={`${id}-hint`} className={`mt-2 text-[11px] ${invalid ? "text-amber-300" : "text-white/40"}`} role="status">
      {invalid ? "Sélectionnez une ville dans les suggestions pour continuer." : selected ? "Ville sélectionnée · code postal associé automatiquement." : "Sélectionnez une suggestion pour valider votre ville."}
    </p>
  </div>;
}
