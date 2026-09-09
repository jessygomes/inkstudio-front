/* eslint-disable react/no-unescaped-entities */
"use client";

import { Sparkles } from "lucide-react";
import styles from "./SettingsCard.module.css";

import SettingsSwitch from "./SettingsSwitch";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchInspirationSalonStatusAction,
  toggleInspirationSalonAction,
} from "@/lib/queries/user";

interface InspirationSalonSettingProps {
  userId: string | null;
}

export default function InspirationSalonSetting({
  userId,
}: InspirationSalonSettingProps) {
  const [isInspirationSalon, setIsInspirationSalon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchInspirationStatus = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetchInspirationSalonStatusAction(userId);

      if (response.ok) {
        setIsInspirationSalon(response.data?.isInspirationSalon ?? false);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du statut inspiration du salon :",
        error,
      );
    }
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchInspirationStatus()]);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [fetchInspirationStatus, userId]);

  const handleInspirationToggle = async () => {
    if (updating) return;

    try {
      setUpdating(true);
      const response = await toggleInspirationSalonAction();

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut inspiration");
      }

      const nextStatus =
        response.data?.user?.isInspirationSalon ?? !isInspirationSalon;
      setIsInspirationSalon(nextStatus);

      toast.success(
        response.data?.message ||
          (nextStatus
            ? "Vos images sont maintenant affichées dans les inspirations."
            : "Vos images sont retirées des inspirations."),
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut inspiration :", error);
      toast.error("Erreur lors de la mise à jour du statut inspiration");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={styles.card}>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tertiary-400"></div>
          <span className="ml-2 text-white/70 text-sm font-one">
            Chargement...
          </span>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-tertiary-400/20 bg-tertiary-400/10"><Sparkles className="h-5 w-5 text-tertiary-400" aria-hidden="true" /></div>
              <h3 className="text-white font-one mb-1 text-base font-semibold">
                <span className="hidden sm:inline">
                  Afficher mon salon dans les inspirations
                </span>
                <span className="sm:hidden">Salon en inspiration</span>
              </h3>
              <p className="text-white/60 text-sm leading-relaxed font-one">
                <span className="hidden sm:inline">
                  Si activé, les images de votre portfolio peuvent être affichées
                  sur la page inspiration de InkeraPeople.
                </span>
                <span className="sm:hidden">
                  Afficher mes images sur InkeraPeople
                </span>
              </p>
            </div>
            <SettingsSwitch label="Afficher mon salon dans les inspirations" busy={updating}
                checked={isInspirationSalon}
                onChange={handleInspirationToggle}
               />
          </div>

          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isInspirationSalon ? "bg-green-400" : "bg-white/40"
                }`}
              ></div>
              <span className="text-xs font-one text-white/70">
                {isInspirationSalon ? (
                  <span className="text-green-300">
                    <span className="hidden sm:inline">
                      Votre salon peut apparaître dans les inspirations
                      Inkera People.
                    </span>
                    <span className="sm:hidden">Visible en inspiration</span>
                  </span>
                ) : (
                  <span className="text-white/60">
                    <span className="hidden sm:inline">
                      Votre salon n'apparaît pas dans les inspirations
                      Inkera People. <br/> <br/>
                    </span>
                    <span className="hidden sm:inline">
                      Activez cette option pour que vos images soient visibles par tous. Les salons affichés dans les inspirations bénéficient d'une meilleure visibilité et peuvent attirer plus de clients.
                    </span>
                    <span className="sm:hidden">Non visible en inspiration</span>
                  </span>
                )}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
