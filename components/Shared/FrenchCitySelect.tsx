"use client";

import { useEffect, useMemo, useState } from "react";

type Commune = { nom: string; code: string; codesPostaux: string[] };
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
  const [query, setQuery] = useState("");
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    communesRequest ??= fetch("/data/communes-france.json").then(response => {
      if (!response.ok) throw new Error("Communes indisponibles");
      return response.json() as Promise<Commune[]>;
    }).catch(error => { communesRequest = undefined; throw error; });
    communesRequest.then(data => { if (active) setCommunes(data); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [attempt]);

  const selected = communes.find(commune => commune.nom === city && commune.codesPostaux.includes(postalCode || ""));
  const selection = selected ? `${selected.code}:${postalCode}` : "";
  const results = useMemo(() => {
    const search = normalize(query);
    if (search.length < 2) return [];
    return communes.filter(commune => normalize(commune.nom).includes(search) || commune.codesPostaux.some(code => code.startsWith(search)));
  }, [communes, query]);
  const options = results.flatMap(commune => commune.codesPostaux.map(code => ({ value: `${commune.code}:${code}`, city: commune.nom, postalCode: code })));
  const visible = options.slice(0, 100);
  if (selected && !visible.some(option => option.value === selection)) visible.unshift({ value: selection, city: selected.nom, postalCode: postalCode! });

  return <div className="space-y-2">
    <input id={`${id}-search`} type="search" value={query} onChange={event => setQuery(event.target.value)}
      aria-label="Rechercher une commune par nom ou code postal" aria-describedby={`${id}-hint`} autoComplete="off"
      placeholder="Nom de ville ou code postal…" className={className} disabled={disabled} />
    <select id={id} required disabled={disabled} className={className} value={selection}
      aria-describedby={`${id}-hint`} onChange={event => {
        const option = visible.find(option => option.value === event.target.value);
        onChange(option?.city || "", option?.postalCode || "");
      }}>
      <option value="">Sélectionnez une commune</option>
      {visible.map(option => <option key={option.value} value={option.value}>{option.city} ({option.postalCode})</option>)}
    </select>
    <p id={`${id}-hint`} className="text-xs text-white/50" role="status">
      {error ? "Impossible de charger les communes." : !communes.length ? "Chargement des communes…" : query.length < 2 ? "Saisissez au moins 2 caractères, puis choisissez votre commune dans la liste." : options.length === 0 ? "Aucune commune trouvée. Essayez un autre nom ou code postal." : options.length > 100 ? "Les 100 premiers résultats sont affichés. Précisez votre recherche." : `${options.length} résultat(s). Le code postal est associé à votre choix.`}
    </p>
    {error && <button type="button" className="text-xs underline" onClick={() => { setError(false); setAttempt(value => value + 1); }}>Réessayer</button>}
    {city && !selected && communes.length > 0 && <p className="text-xs text-amber-300">Veuillez sélectionner votre commune dans la liste pour confirmer la localisation.</p>}
  </div>;
}
