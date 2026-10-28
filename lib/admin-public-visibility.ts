import type { PublicVisibility } from "./queries/admin-visibility";

export type PublicProfileIdentity = { salonName?: string | null; city?: string | null; postalCode?: string | null };

export const publicVisibilityChoices = [
  { value: "VISIBLE", label: "Visible sur le site", description: "Le profil peut apparaître dans la recherche, les listes et les inspirations." },
  { value: "SEARCH_HIDDEN", label: "Masqué de la recherche", description: "Le profil reste accessible par son lien direct. Ses créations peuvent apparaître dans les inspirations." },
  { value: "HIDDEN", label: "Masqué de tout le site", description: "Le profil et ses créations sont retirés du site public, y compris de l’accès par lien direct." },
] as const;

export function publicVisibilityState(value?: PublicVisibility | null, profile?: PublicProfileIdentity) {
  if (!value) return { kind: "unknown", label: "Statut indisponible", description: "La visibilité de ce compte n’a pas été renseignée.", tone: "neutral" } as const;
  if (value === "HIDDEN") return { kind: "hidden", label: "Masqué du site", description: publicVisibilityChoices[2].description, tone: "danger" } as const;
  if (profile && (!profile.salonName?.trim() || !profile.city?.trim() || !profile.postalCode?.trim())) {
    return { kind: "incomplete", label: "Profil incomplet", description: "Le nom professionnel, la ville et le code postal sont nécessaires à l’affichage du profil public.", tone: "warning" } as const;
  }
  return value === "SEARCH_HIDDEN"
    ? { kind: "searchHidden", label: "Masqué de la recherche", description: publicVisibilityChoices[1].description, tone: "warning" } as const
    : { kind: "visible", label: "Visible sur le site", description: publicVisibilityChoices[0].description, tone: "success" } as const;
}
