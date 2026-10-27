"use client";
import SettingsSectionHeader from "./SettingsSectionHeader";
import { Bell } from "lucide-react";

import styles from "./SettingsCard.module.css";

import SettingsSwitch from "./SettingsSwitch";

import { getNotificationPreferenceChat, updateNotificationPreferenceChat } from "@/lib/queries/notification-preference-chat";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import DashboardButton from "@/components/Shared/DashboardButton";

type EmailFrequency = "HOURLY" | "DAILY" | "NEVER";

interface NotificationPreference {
  id: string;
  userId: string;
  emailNotificationsEnabled: boolean;
  emailFrequency: EmailFrequency;
  mutedConversations: string[];
  createdAt: string;
  updatedAt: string;
}

const frequencyLabel: Record<EmailFrequency, string> = {
  HOURLY: "Toutes les heures",
  DAILY: "Une fois par jour",
  NEVER: "Jamais",
};

const frequencyDescription: Record<EmailFrequency, string> = {
  HOURLY: "Vous recevez un résumé des messages toutes les heures.",
  DAILY: "Vous recevez un résumé quotidien des messages.",
  NEVER: "Aucun email n'est envoyé.",
};

export default function NotifChatPreference() {
  const [pref, setPref] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(false);
  const [emailFrequency, setEmailFrequency] = useState<EmailFrequency>(
    "HOURLY"
  );

  useEffect(() => {
    let isMounted = true;

    const fetchPreferences = async () => {
      try {
        const response = await getNotificationPreferenceChat();
        if (!isMounted) return;

        setPref(response);
        setEmailNotificationsEnabled(response.emailNotificationsEnabled);
        setEmailFrequency(response.emailFrequency);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement des preferences");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPreferences();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasChanges = useMemo(() => {
    if (!pref) return false;
    return (
      pref.emailNotificationsEnabled !== emailNotificationsEnabled ||
      pref.emailFrequency !== emailFrequency
    );
  }, [pref, emailNotificationsEnabled, emailFrequency]);

  const handleSave = async () => {
    if (!pref || !hasChanges) return;

    setSaving(true);
    try {
      const updated = await updateNotificationPreferenceChat(
        emailNotificationsEnabled,
        emailFrequency
      );

      setPref(updated);
      setEmailNotificationsEnabled(updated.emailNotificationsEnabled);
      setEmailFrequency(updated.emailFrequency);
      toast.success("Preferences de chat mises a jour");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise a jour des preferences");

    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <div className="animate-pulse space-y-2.5">
          <div className="h-4 w-44 rounded bg-white/10" />
          <div className="h-16 rounded-xl bg-white/8" />
          <div className="h-10 rounded-xl bg-white/8" />
        </div>
      </div>
    );
  }

  return (<div className={styles.card}>
<SettingsSectionHeader icon={Bell} title="Notifications email" description="Gardez le contact avec vos clients, à votre rythme." />
<div className={styles.body}>
<div className={styles.row}><div><p className={styles.label}>Recevoir les nouveaux messages par email</p><p className={styles.note}>En complément des notifications dans la messagerie.</p></div><SettingsSwitch label="Recevoir les notifications par email" busy={saving} disabled={!pref} checked={emailNotificationsEnabled} onChange={e=>setEmailNotificationsEnabled(e.target.checked)} /></div>
{emailNotificationsEnabled && <fieldset className={styles.options}><legend className={styles.label}>Fréquence d’envoi</legend>{(Object.keys(frequencyLabel) as EmailFrequency[]).map(frequency=><label key={frequency} className={styles.option}><input type="radio" name="email-frequency" value={frequency} checked={emailFrequency===frequency} onChange={()=>setEmailFrequency(frequency)} disabled={saving || !pref}/><span><span className={styles.label}>{frequencyLabel[frequency]}</span><span className={styles.note}>{frequencyDescription[frequency]}</span></span></label>)}</fieldset>}
<div className={styles.footer}><p role="status" className={styles.note}>{!pref ? "Impossible de charger vos préférences." : hasChanges ? "Modifications à enregistrer" : "Préférences à jour"}</p><DashboardButton onClick={handleSave} disabled={saving || !hasChanges || !pref} className="min-w-0! h-9 px-4">{saving ? "Enregistrement…" : "Enregistrer"}</DashboardButton></div>
</div></div>);
}
