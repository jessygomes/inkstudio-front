"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CalendarClock, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { fetchAppointmentParamAction, updateProjectAppointmentBookingAction } from "@/lib/queries/user";
import DashboardButton from "@/components/Shared/DashboardButton";
import SettingsSectionHeader from "./SettingsSectionHeader";
import SettingsSwitch from "./SettingsSwitch";
import styles from "./SettingsCard.module.css";

type ProjectSettings = { duration: number; free: boolean; price: string };
const inputClass = "mt-2 w-full rounded-xl border border-white/10 bg-noir-700 px-3 py-2.5 text-xs text-white outline-none focus:border-tertiary-400 [color-scheme:dark]";

export default function ProjectAppointmentSetting() {
  const [draft, setDraft] = useState<ProjectSettings | null>(null);
  const [initial, setInitial] = useState<ProjectSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    fetchAppointmentParamAction().then(result => {
      if (!result.ok || !result.data?.user) throw new Error(result.message || "Impossible de charger les réglages du premier échange.");
      if (!current) return;
      const user = result.data.user;
      const settings = { duration: user.projectAppointmentDurationMinutes ?? 60, free: user.projectAppointmentIsFree ?? true, price: user.projectAppointmentPrice == null ? "" : String(user.projectAppointmentPrice) };
      setDraft(settings); setInitial(settings);
    }).catch(error => { if (current) setError(error instanceof Error ? error.message : "Chargement impossible."); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [attempt]);

  const changed = Boolean(draft && initial && JSON.stringify(draft) !== JSON.stringify(initial));
  const valid = draft && Number.isInteger(draft.duration) && draft.duration >= 15 && (draft.free || (draft.price.trim() !== "" && Number.isFinite(Number(draft.price)) && Number(draft.price) > 0));
  const durations = [...new Set([30, 60, 90, 120, 150, 180, 210, 240, ...(draft ? [draft.duration] : [])])].sort((a, b) => a - b);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft || !valid || !changed || saving) return;
    setSaving(true); setError("");
    try {
      const result = await updateProjectAppointmentBookingAction({ projectAppointmentDurationMinutes: draft.duration, projectAppointmentIsFree: draft.free, ...(draft.free ? {} : { projectAppointmentPrice: Number(draft.price) }) });
      if (!result.ok) throw new Error(result.message || "Enregistrement impossible.");
      const saved = { ...draft, price: draft.free ? "" : draft.price };
      setDraft(saved); setInitial(saved);
      toast.success("Réglages du premier échange enregistrés.");
    } catch (error) { setError(error instanceof Error ? error.message : "Enregistrement impossible."); }
    finally { setSaving(false); }
  }

  return <section className={styles.card}>
    <SettingsSectionHeader icon={CalendarClock} title="Préparer le premier échange" description="Définissez la durée et le tarif du rendez-vous Projet, consacré à la préparation de l’idée du client." />
    {loading ? <p className={styles.empty} role="status">Chargement des réglages…</p> : !draft ? <div className={styles.body}><p role="alert" className="text-xs text-red-300">{error}</p><DashboardButton variant="secondary" onClick={() => { setLoading(true); setError(""); setAttempt(value => value + 1); }}>Réessayer</DashboardButton></div> : <form className={styles.body} onSubmit={save}>
      <div className="grid items-start gap-5 sm:grid-cols-2">
        <div><label className={styles.label} htmlFor="project-setting-duration">Durée du rendez-vous</label><select id="project-setting-duration" className={inputClass} value={draft.duration} disabled={saving} onChange={event => setDraft({ ...draft, duration: Number(event.target.value) })}>{durations.map(minutes => <option key={minutes} value={minutes}>{minutes} minutes</option>)}</select><p className={styles.note}>Cette durée sert à proposer les créneaux disponibles pour un rendez-vous Projet.</p></div>
        <div><div className={styles.row}><div><p className={styles.label}>Premier échange gratuit</p><p className={styles.note}>Le client ne paie pas ce rendez-vous.</p></div><SettingsSwitch label="Rendez-vous Projet gratuit" checked={draft.free} busy={saving} onChange={event => setDraft({ ...draft, free: event.target.checked })} /></div>{!draft.free && <div className="mt-2"><label htmlFor="project-setting-price" className={styles.label}>Tarif en euros</label><input id="project-setting-price" className={inputClass} type="number" min="0.01" step="0.01" required value={draft.price} disabled={saving} placeholder="Ex. 50" onChange={event => setDraft({ ...draft, price: event.target.value })} /></div>}</div>
      </div>
      <p className={styles.note}>Ces réglages concernent la prestation Projet. Activez cette prestation dans votre profil pour la proposer aux clients.</p>
      {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
      <div className={styles.footer}><p className={styles.note} role="status">{changed ? "Modifications à enregistrer" : "Réglages à jour"}</p><DashboardButton type="submit" disabled={saving || !changed || !valid} className="!min-w-0">{saving ? <><LoaderCircle size={14} className="animate-spin" />Enregistrement…</> : "Enregistrer le premier échange"}</DashboardButton></div>
    </form>}
  </section>;
}
