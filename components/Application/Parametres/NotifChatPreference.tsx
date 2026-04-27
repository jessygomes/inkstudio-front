"use client";

import {
  getNotificationPreferenceChat,
  updateNotificationPreferenceChat,
} from "@/lib/queries/notification-preference-chat";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CiBellOn } from "react-icons/ci";

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
  IMMEDIATE: "Immediat",
  HOURLY: "Toutes les heures",
  DAILY: "Une fois par jour",
  NEVER: "Jamais",
};

const frequencyDescription: Record<EmailFrequency, string> = {
  IMMEDIATE: "Vous recevez une notification des qu'un nouveau message arrive.",
  HOURLY: "Vous recevez un resume des messages toutes les heures.",
  DAILY: "Vous recevez un resume quotidien des messages.",
  NEVER: "Aucun email n'est envoye.",
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

      if (pref) {
        setEmailNotificationsEnabled(pref.emailNotificationsEnabled);
        setEmailFrequency(pref.emailFrequency);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-embedded-panel rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4">
        <div className="animate-pulse space-y-2.5">
          <div className="h-4 w-44 rounded bg-white/10" />
          <div className="h-16 rounded-xl bg-white/8" />
          <div className="h-10 rounded-xl bg-white/8" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-embedded-panel rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl border border-tertiary-400/25 bg-tertiary-400/15 flex items-center justify-center shrink-0">
            <CiBellOn className="w-5 h-5 text-tertiary-500" />
          </div>
          <div className="min-w-0">
            <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">
              Messagerie
            </p>
            <h3 className="text-white font-one text-sm sm:text-base font-semibold truncate">
              Notifications email du chat
            </h3>
          </div>
        </div>

        <span
          className={`rounded-[10px] px-2 py-1 text-[10px] font-one border ${
            emailNotificationsEnabled
              ? "border-green-500/30 bg-green-500/15 text-green-300"
              : "border-white/20 bg-white/10 text-white/60"
          }`}
        >
          {emailNotificationsEnabled ? "Actives" : "Inactives"}
        </span>
      </div>

      <div className="pt-3 space-y-2.5">
        <div className="rounded-xl border border-white/10 bg-white/3 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white font-one text-xs sm:text-sm font-medium">
                Activer les notifications
              </p>
              <p className="text-white/55 font-two text-[11px] sm:text-xs mt-0.5">
                Recevoir un email en fonction de la frequence choisie.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={emailNotificationsEnabled}
                onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
                className="sr-only peer"
                disabled={saving}
              />
              <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-tertiary-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>

        {emailNotificationsEnabled && (
          <div className="rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 space-y-2">
            <p className="text-white font-one text-xs sm:text-sm font-medium">
              Frequence des notifications
            </p>

            <select
              value={emailFrequency}
              onChange={(e) => setEmailFrequency(e.target.value as EmailFrequency)}
              disabled={saving}
              className="w-full h-9 px-2.5 font-one bg-noir-500 border border-white/20 rounded-[10px] text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <option value="IMMEDIATE">Immediat</option>
              <option value="HOURLY">Toutes les heures</option>
              <option value="DAILY">Une fois par jour</option>
              <option value="NEVER">Jamais</option>
            </select>

            <p className="text-white/50 text-[11px] font-two">
              {frequencyDescription[emailFrequency]}
            </p>
          </div>
        )}

        <div className="rounded-xl border border-white/8 bg-white/2 px-3 py-2">
          <p className="text-[11px] font-one text-white/70">
            Statut actuel: {emailNotificationsEnabled ? "Active" : "Inactive"}
            {emailNotificationsEnabled && (
              <span className="text-white/55"> · {frequencyLabel[emailFrequency]}</span>
            )}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          {!hasChanges && (
            <span className="text-[11px] text-white/45 font-two mr-auto">
              Aucun changement en attente
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !hasChanges || !pref}
            className="cursor-pointer min-w-[150px] h-9 px-3 rounded-[14px] bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition-all duration-300 font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                Sauvegarde...
              </>
            ) : (
              "Sauvegarder"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
