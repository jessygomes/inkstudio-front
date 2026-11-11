"use client";

import { useEffect, useId, useState } from "react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { fetchAppointmentParamAction, updateProjectAppointmentBookingAction } from "@/lib/queries/user";
import DashboardButton from "@/components/Shared/DashboardButton";
import SettingsSectionHeader from "./SettingsSectionHeader";
import SettingsSwitch from "./SettingsSwitch";
import styles from "./SettingsCard.module.css";

/** Autoriser ou non les clients à réserver pour aujourd'hui (date Europe/Paris). Activé par défaut. */
export default function SameDayBookingSetting() {
  const descriptionId = useId();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    fetchAppointmentParamAction()
      .then((result) => {
        if (!result.ok || !result.data?.user) throw new Error(result.message || "Impossible de charger ce réglage.");
        if (current) setAllowed(result.data.user.allowSameDayBooking !== false);
      })
      .catch((reason) => { if (current) setError(reason instanceof Error ? reason.message : "Chargement impossible."); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [attempt]);

  const change = async (value: boolean) => {
    if (saving || allowed === null) return;
    const previous = allowed;
    setAllowed(value);
    setSaving(true);
    try {
      const result = await updateProjectAppointmentBookingAction({ allowSameDayBooking: value });
      if (!result.ok) throw new Error(result.message || "Enregistrement impossible.");
      toast.success(value ? "Les clients peuvent réserver pour le jour même." : "Les réservations client pour le jour même sont désactivées.");
    } catch (reason) {
      setAllowed(previous);
      toast.error(reason instanceof Error ? reason.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  return <section className={styles.card}>
    <SettingsSectionHeader icon={CalendarClock} title="Réservation le jour même" description="Choisissez si vos clients peuvent réserver un créneau pour aujourd’hui." />
    {loading ? <p className={styles.empty} role="status">Chargement du réglage…</p>
      : allowed === null ? <div className={styles.body}><p role="alert" className="text-xs text-red-300">{error}</p><DashboardButton variant="secondary" onClick={() => { setLoading(true); setError(""); setAttempt((value) => value + 1); }}>Réessayer</DashboardButton></div>
      : <div className={styles.body}>
        <div className={styles.row}>
          <div><p className={styles.label}>Autoriser les réservations le jour même</p><p id={descriptionId} className={styles.note}>Désactivé, les clients ne voient plus les créneaux d’aujourd’hui (heure de Paris), y compris via vos liens de réservation. Vous pouvez toujours créer un rendez-vous depuis Inkera Studio.</p></div>
          <SettingsSwitch label="Réservation le jour même" checked={allowed} busy={saving} descriptionId={descriptionId} onChange={(event) => void change(event.target.checked)} />
        </div>
      </div>}
  </section>;
}
