"use client";

import {
  getNotificationPreferenceChat,
  updateNotificationPreferenceChat,
} from "@/lib/queries/notification-preference-chat";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CiBellOn } from "react-icons/ci";

interface NotificationPreference {
  id: string;
  userId: string;
  emailNotificationsEnabled: boolean;
  emailFrequency: "IMMEDIATE" | "HOURLY" | "DAILY" | "NEVER";
  mutedConversations: string[];
  createdAt: string;
  updatedAt: string;
}

export default function NotifChatPreference() {
  const [pref, setPref] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(false);
  const [emailFrequency, setEmailFrequency] = useState<
    "IMMEDIATE" | "HOURLY" | "DAILY" | "NEVER"
  >("IMMEDIATE");

  //! Récupérer les préférences de notification chat
  useEffect(() => {
    let isMounted = true;

    const fetchPreferences = async () => {
      try {
        const response = await getNotificationPreferenceChat();
        if (isMounted) {
          setPref(response);
          setEmailNotificationsEnabled(response.emailNotificationsEnabled);
          setEmailFrequency(response.emailFrequency);
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement des préférences");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPreferences();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateNotificationPreferenceChat(
        emailNotificationsEnabled,
        emailFrequency,
      );

      setPref(updated);
      toast.success("Préférences de notification mises à jour");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour des préférences");
      // Réinitialiser aux valeurs précédentes en cas d'erreur
      if (pref) {
        setEmailNotificationsEnabled(pref.emailNotificationsEnabled);
        setEmailFrequency(pref.emailFrequency);
      }
    } finally {
      setSaving(false);
    }
  };

  //! Affichage pendant le chargement
  if (loading) {
    return (
      <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tertiary-400"></div>
          <span className="ml-2 text-white/70 text-sm font-one">
            Chargement...
          </span>
        </div>
      </div>
    );
  }

  //! Affichage des préférences et form
  return (
    <div className="space-y-4">
      {/* Section Notifications de Chat */}
      <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary-400/30 rounded-full flex items-center justify-center">
            <CiBellOn size={20} className="sm:w-6 sm:h-6 text-tertiary-400" />
          </div>
          <h2 className="text-lg sm:text-xl text-white font-one font-bold">
            Notifications de Chat
          </h2>
        </div>

        <div className="space-y-4">
          {/* Toggle Notifications */}
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-white font-one mb-1 text-sm sm:text-base">
                  Activer les notifications
                </h3>
                <p className="text-white/60 text-xs sm:text-sm font-one">
                  <span className="hidden sm:inline">
                    Recevez des notifications par email lors de nouveaux
                    messages
                  </span>
                  <span className="sm:hidden">Notifications par email</span>
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  checked={emailNotificationsEnabled}
                  onChange={(e) =>
                    setEmailNotificationsEnabled(e.target.checked)
                  }
                  className="sr-only peer"
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-400"></div>
              </label>
            </div>
          </div>

          {/* Fréquence de notifications */}
          {emailNotificationsEnabled && (
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
              <h3 className="text-white font-one mb-3 text-sm sm:text-base">
                <span className="hidden sm:inline">
                  Fréquence des notifications
                </span>
                <span className="sm:hidden">Fréquence</span>
              </h3>
              <select
                value={emailFrequency}
                onChange={(e) =>
                  setEmailFrequency(
                    e.target.value as
                      | "IMMEDIATE"
                      | "HOURLY"
                      | "DAILY"
                      | "NEVER",
                  )
                }
                disabled={saving}
                className="w-full p-2 sm:p-3 font-one bg-noir-500 border border-white/20 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-tertiary-400 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <option value="IMMEDIATE">Immédiat</option>
                <option value="HOURLY">Toutes les heures</option>
                <option value="DAILY">Une fois par jour</option>
                <option value="NEVER">Jamais</option>
              </select>
              <p className="text-white/50 text-xs mt-2 font-one">
                {emailFrequency === "IMMEDIATE" &&
                  "Vous recevrez une notification dès qu'un nouveau message arrive."}
                {emailFrequency === "HOURLY" &&
                  "Vous recevrez un résumé toutes les heures."}
                {emailFrequency === "DAILY" &&
                  "Vous recevrez un résumé une fois par jour."}
                {emailFrequency === "NEVER" &&
                  "Vous ne recevrez aucune notification."}
              </p>
            </div>
          )}

          {/* Indicateur de statut */}
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  emailNotificationsEnabled ? "bg-blue-400" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-xs font-one text-white/70">
                {emailNotificationsEnabled ? (
                  <span className="text-blue-300">
                    <span className="hidden sm:inline">
                      Notifications activées (
                      {emailFrequency === "IMMEDIATE"
                        ? "Immédiat"
                        : emailFrequency === "HOURLY"
                          ? "Toutes les heures"
                          : "Une fois par jour"}
                      )
                    </span>
                    <span className="sm:hidden">Activées</span>
                  </span>
                ) : (
                  <span className="text-gray-300">
                    <span className="hidden sm:inline">
                      Notifications désactivées
                    </span>
                    <span className="sm:hidden">Désactivées</span>
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Bouton Sauvegarder */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="cursor-pointer w-full bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 sm:py-3 px-4 rounded-lg transition-all duration-200 text-sm sm:text-base font-one"
          >
            {saving ? (
              <span className="flex items-center justify-center text-white">
                <div className="animate-spin text-white rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </span>
            ) : (
              <span className="font-normal">Sauvegarder les préférences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
