"use client";

import styles from "./SettingsCard.module.css";

import SettingsSwitch from "./SettingsSwitch";

import {
  getNotificationPreferenceChat,
  updateNotificationPreferenceChat,
} from "@/lib/queries/notification-preference-chat";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CiBellOn } from "react-icons/ci";
import DashboardButton from "@/components/Shared/DashboardButton";

type EmailFrequency = "IMMEDIATE" | "HOURLY" | "DAILY" | "NEVER";

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
  IMMEDIATE: "Immédiat",
  HOURLY: "Toutes les heures",
  DAILY: "Une fois par jour",
  NEVER: "Jamais",
};

const frequencyDescription: Record<EmailFrequency, string> = {
  IMMEDIATE: "Vous recevez une notification dès qu'un nouveau message arrive.",
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
    "IMMEDIATE"
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

  return (
    <div className={styles.card}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl border border-tertiary-400/25 bg-tertiary-400/15 flex items-center justify-center shrink-0">
            <CiBellOn className="w-5 h-5 text-tertiary-500" />
          </div>
          <div className="min-w-0">
            <p className="text-white/50 font-one text-[11px] uppercase tracking-wider">
              Messagerie
            </p>
            <h3 className="text-white font-one text-base font-semibold">
              Notifications email du chat
            </h3>
          </div>
        </div>

        <span
          className={`rounded-2xl px-2 py-1 text-[10px] font-one border ${
            emailNotificationsEnabled
              ? "border-green-500/30 bg-green-500/15 text-green-300"
              : "border-white/20 bg-white/10 text-white/60"
          }`}
        >
          {emailNotificationsEnabled ? "Actives" : "Inactives"}
        </span>
      </div>

      <div className="pt-3 space-y-2.5">
        <div className="rounded-2xl border border-white/10 bg-white/3 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white font-one text-xs sm:text-sm font-medium">
                Activer les notifications
              </p>
              <p className="text-white/55 font-two text-[11px] sm:text-xs mt-0.5">
                Recevoir un email en fonction de la fréquence choisie.
              </p>
            </div>

            <SettingsSwitch label="Recevoir les notifications par email" busy={saving} disabled={!pref}
                checked={emailNotificationsEnabled}
                onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
               />
          </div>
        </div>

        {emailNotificationsEnabled && (
          <div className="rounded-2xl border border-white/10 bg-white/3 px-3 py-2.5 space-y-2">
            <p className="text-white font-one text-xs sm:text-sm font-medium">
              Fréquence des notifications
            </p>

            <fieldset className="grid gap-2 sm:grid-cols-2">
              <legend className="sr-only">Fréquence des notifications</legend>
              {(Object.keys(frequencyLabel) as EmailFrequency[]).map((frequency) => (
                <label key={frequency} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${emailFrequency === frequency ? "border-tertiary-400/40 bg-tertiary-400/10" : "border-white/10 bg-black/10 hover:bg-white/5"}`}>
                  <input type="radio" name="email-frequency" value={frequency} checked={emailFrequency === frequency}
                    onChange={() => setEmailFrequency(frequency)} disabled={saving || !pref} className="mt-1 accent-tertiary-500" />
                  <span><span className="block text-sm text-white">{frequencyLabel[frequency]}</span><span className="mt-1 block text-xs leading-relaxed text-white/55">{frequencyDescription[frequency]}</span></span>
                </label>
              ))}
            </fieldset>

            <p className="text-white/50 text-[11px] font-two">
              {frequencyDescription[emailFrequency]}
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-white/8 bg-white/2 px-3 py-2">
          <p className="text-[11px] font-one text-white/70">
            Votre choix : {emailNotificationsEnabled ? "Active" : "Inactive"}
            {emailNotificationsEnabled && (
              <span className="text-white/55"> · {frequencyLabel[emailFrequency]}</span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
          {hasChanges && <p role="status" className="mr-auto text-xs text-amber-300">Modifications non enregistrées</p>}
          {!hasChanges && (
            <span className="text-[11px] text-white/55 font-two mr-auto">
              Aucun changement en attente
            </span>
          )}

          <DashboardButton
            onClick={handleSave}
            disabled={saving || !hasChanges || !pref}
            className="min-w-[150px] h-9 px-3"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                Sauvegarde...
              </>
            ) : (
              "Sauvegarder"
            )}
          </DashboardButton>
        </div>
      </div>
    </div>
  );
}
