"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Eye, EyeOff, Globe2, Loader2, Pencil, SearchX } from "lucide-react";
import { updateAdminPublicVisibility, type PublicVisibility } from "@/lib/queries/admin-visibility";
import { publicVisibilityChoices, publicVisibilityState, type PublicProfileIdentity } from "@/lib/admin-public-visibility";
import PublicVisibilityBadge from "./PublicVisibilityBadge";
import profileStyles from "./UserProfile.module.css";
import workspaceStyles from "./UsersWorkspace.module.css";
import styles from "./UserPublicVisibility.module.css";

const icons = { VISIBLE: Eye, SEARCH_HIDDEN: SearchX, HIDDEN: EyeOff };

export default function UserPublicVisibility({ userId, initialValue, profile }: { userId: string; initialValue: PublicVisibility; profile?: PublicProfileIdentity }) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const state = publicVisibilityState(saved, profile);
  const choice = publicVisibilityChoices.find(item => item.value === saved);
  async function save() {
    if (pending || value === saved) return;
    setPending(true); setError("");
    try {
      const result = await updateAdminPublicVisibility(userId, value);
      if (!result.ok) { setError(result.message); toast.error(result.message); return; }
      setSaved(value);
      setEditing(false);
      toast.success("Visibilité publique mise à jour.");
      router.refresh();
    } catch { setError("Impossible de modifier la visibilité. Veuillez réessayer."); toast.error("Impossible de modifier la visibilité. Veuillez réessayer."); }
    finally { setPending(false); }
  }
  return <section id="visibilite" className={profileStyles.section} aria-labelledby="public-visibility-title">
    <header className={profileStyles.sectionHeading}><span className={profileStyles.sectionIcon}><Globe2 size={16} /></span><div><h2 id="public-visibility-title">Présence sur le site</h2><p>Affichage du profil et des créations sur Inkera.</p></div><span className={styles.currentBadge}><PublicVisibilityBadge value={saved} profile={profile} /></span></header>
    <div className={styles.overview}><div><p>{state.description}</p>{state.kind === "incomplete" && <span>Réglage actuel : {choice?.label}.</span>}</div>{!editing && <button type="button" className={workspaceStyles.button} onClick={() => { setValue(saved); setEditing(true); setError(""); }} aria-expanded={false} aria-controls="visibility-editor"><Pencil size={12} />Modifier</button>}</div>
    {editing && <div id="visibility-editor" className={styles.editor}>
      <fieldset disabled={pending} className={styles.choices}><legend className="sr-only">Choisir la visibilité du profil</legend>
        {publicVisibilityChoices.map(option => { const Icon = icons[option.value]; return <label key={option.value} className={styles.option} data-selected={value === option.value}><span className={styles.optionIcon}><Icon size={16} /></span><span><strong>{option.label}</strong><small>{option.description}</small></span><input type="radio" name={`visibility-${userId}`} value={option.value} checked={value === option.value} onChange={() => { setValue(option.value); setError(""); }} /></label>; })}
      </fieldset>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <footer className={styles.footer}><p><Globe2 size={12} />Le compte privé reste accessible.</p><div><button type="button" disabled={pending} className={workspaceStyles.button} onClick={() => { setValue(saved); setEditing(false); setError(""); }}>Annuler</button><button type="button" onClick={() => void save()} disabled={pending || value === saved} className={workspaceStyles.primaryButton}>{pending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}{pending ? "Enregistrement…" : "Enregistrer"}</button></div></footer>
    </div>}
  </section>;
}
