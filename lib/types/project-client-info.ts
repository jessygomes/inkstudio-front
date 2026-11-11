// Contrat backend : budget et « premier tatouage » d'un RDV PROJET, pratiques des professionnels.
// Fonctions pures, utilisables côté client comme côté serveur.

/** Budget en centimes EUR (bornes incluses, null = non borné) et premier tatouage (null = non renseigné). */
export interface ProjectClientInfoFields {
  projectBudgetMinCents?: number | null;
  projectBudgetMaxCents?: number | null;
  isFirstTattoo?: boolean | null;
}

export type BudgetOption = { id: string; label: string; min: number | null; max: number | null };

/** Tranches proposées par Studio (le backend accepte toutes bornes entières ≥ 0, min ≤ max). */
export const BUDGET_OPTIONS: BudgetOption[] = [
  { id: "lt200", label: "Moins de 200 €", min: null, max: 20_000 },
  { id: "200-500", label: "200 – 500 €", min: 20_000, max: 50_000 },
  { id: "500-1000", label: "500 – 1 000 €", min: 50_000, max: 100_000 },
  { id: "1000-2000", label: "1 000 – 2 000 €", min: 100_000, max: 200_000 },
  { id: "gt2000", label: "Plus de 2 000 €", min: 200_000, max: null },
];

const euros = (cents: number) =>
  (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: cents % 100 ? 2 : 0 });

export function findBudgetOption(min?: number | null, max?: number | null): BudgetOption | undefined {
  return BUDGET_OPTIONS.find((option) => option.min === (min ?? null) && option.max === (max ?? null));
}

/** Libellé lisible de bornes quelconques (y compris saisies depuis People avec d'autres tranches). */
export function describeBudget(min?: number | null, max?: number | null): string | null {
  const known = findBudgetOption(min, max);
  if (known) return known.label;
  if (min != null && max != null) return min === max ? euros(min) : `${euros(min)} – ${euros(max)}`;
  if (min != null) return `À partir de ${euros(min)}`;
  if (max != null) return `Jusqu’à ${euros(max)}`;
  return null;
}

export function describeFirstTattoo(value?: boolean | null): string {
  return value === true ? "Oui, premier tatouage" : value === false ? "Non, déjà tatoué(e)" : "Non renseigné";
}

// ---------------------------------------------------------------------------
// Pratiques
// ---------------------------------------------------------------------------

export type TattooPractice = "MACHINE" | "HANDPOKE" | "TRADITIONAL" | "OTHER";

export const TATTOO_PRACTICE_OPTIONS: Array<{ value: TattooPractice; label: string; hint: string }> = [
  { value: "MACHINE", label: "Machine", hint: "Machine rotative ou à bobines" },
  { value: "HANDPOKE", label: "Handpoke", hint: "Point par point, à la main" },
  { value: "TRADITIONAL", label: "Technique traditionnelle", hint: "Tebori, tatau, bambou…" },
  { value: "OTHER", label: "Autre", hint: "Précisez votre technique" },
];

export const TATTOO_PRACTICE_DETAILS_MAX = 1000;

export type TattooPracticesValue = { tattooPractices: TattooPractice[]; tattooPracticeDetails: string };

export function normalizeTattooPractices(source?: { tattooPractices?: unknown; tattooPracticeDetails?: unknown } | null): TattooPracticesValue {
  const allowed = new Set(TATTOO_PRACTICE_OPTIONS.map((option) => option.value));
  const list = Array.isArray(source?.tattooPractices) ? source.tattooPractices.filter((item): item is TattooPractice => allowed.has(item as TattooPractice)) : [];
  return {
    tattooPractices: [...new Set(list)],
    tattooPracticeDetails: typeof source?.tattooPracticeDetails === "string" ? source.tattooPracticeDetails : "",
  };
}

/** Body attendu par le backend (texte vide → null pour effacer). */
export function toTattooPracticesPayload(value: TattooPracticesValue) {
  return { tattooPractices: value.tattooPractices, tattooPracticeDetails: value.tattooPracticeDetails.trim() || null };
}

export function validateTattooPractices(value: TattooPracticesValue): string | null {
  if (value.tattooPracticeDetails.length > TATTOO_PRACTICE_DETAILS_MAX) return `La précision ne peut pas dépasser ${TATTOO_PRACTICE_DETAILS_MAX} caractères.`;
  if (value.tattooPractices.includes("OTHER") && !value.tattooPracticeDetails.trim()) return "Précisez la technique utilisée pour « Autre ».";
  return null;
}
