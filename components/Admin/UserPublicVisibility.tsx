"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAdminPublicVisibility, type PublicVisibility } from "@/lib/queries/admin-visibility";
import styles from "./UserProfile.module.css";

const choices = [
  { value: "VISIBLE", label: "Visible", description: "Le profil apparaît dans la recherche et reste accessible sur le site public." },
  { value: "SEARCH_HIDDEN", label: "Masqué de la recherche", description: "Absent de la recherche de salons et indépendants. Son profil reste accessible par un lien direct et ses créations peuvent apparaître dans les inspirations." },
  { value: "HIDDEN", label: "Masqué de tout le site public", description: "Absent des listes et des inspirations. Le profil public est introuvable, même avec son lien. Le compte privé reste accessible." },
] as const;

export default function UserPublicVisibility({ userId, initialValue }: { userId: string; initialValue: PublicVisibility }) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  async function save() {
    if (pending || value === saved) return;
    setPending(true);
    try {
      const result = await updateAdminPublicVisibility(userId, value);
      if (!result.ok) { toast.error(result.message); return; }
      setSaved(value);
      toast.success("Visibilité publique mise à jour.");
      router.refresh();
    } catch { toast.error("Impossible de modifier la visibilité. Veuillez réessayer."); }
    finally { setPending(false); }
  }
  return <section className={styles.section} aria-labelledby="public-visibility-title">
    <header className={styles.sectionHeading}><div><h2 id="public-visibility-title">Visibilité publique</h2><p>Contrôlez la présence de ce compte sur le site public.</p></div></header>
    <fieldset disabled={pending} className="space-y-3 p-5 disabled:opacity-60"><legend className="sr-only">Visibilité du profil</legend>
      {choices.map(choice => <label key={choice.value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 text-sm text-white/80"><input type="radio" name={"visibility-" + userId} value={choice.value} checked={value === choice.value} onChange={() => setValue(choice.value)} className="mt-1 accent-amber-400" /><span><strong className="block font-medium">{choice.label}</strong><span className="mt-1 block text-xs leading-5 text-white/50">{choice.description}</span></span></label>)}
      <button type="button" onClick={() => void save()} disabled={pending || value === saved} className="min-h-11 cursor-pointer rounded-xl border border-white/15 px-4 text-sm text-white disabled:cursor-default disabled:opacity-40">{pending ? "Enregistrement…" : "Enregistrer la visibilité"}</button>
    </fieldset>
  </section>;
}
