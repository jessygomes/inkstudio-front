/* eslint-disable react/no-unescaped-entities */
"use client";
import SettingsSectionHeader from "./SettingsSectionHeader";
import { Sparkles } from "lucide-react";

import styles from "./SettingsCard.module.css";

import SettingsSwitch from "./SettingsSwitch";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchInspirationSalonStatusAction, toggleInspirationSalonAction } from "@/lib/queries/user";

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

  return (<div className={styles.card}><SettingsSectionHeader icon={Sparkles} title="Visibilité dans les inspirations" description="Faites découvrir votre travail sur Inkera People." /><div className={styles.body}>{loading ? <p role="status" className={styles.empty}>Chargement de la visibilité…</p> : <><div className={styles.row}><div><p className={styles.label}>Partager votre portfolio dans les inspirations</p><p className={styles.note}>Vos photos pourront être découvertes par tous les visiteurs.</p></div><SettingsSwitch label="Afficher mon salon dans les inspirations" busy={updating} disabled={!userId} checked={isInspirationSalon} onChange={handleInspirationToggle}/></div><div className={styles.notice}><span className={styles.badge}>{isInspirationSalon ? "Diffusion autorisée" : "Diffusion désactivée"}</span><p>{isInspirationSalon ? "Votre salon et vos créations peuvent apparaître dans les inspirations Inkera People." : "Votre portfolio n’est pas diffusé dans les inspirations. Activez cette option pour lui donner plus de visibilité."}</p></div><p className={styles.note}>Les changements sont enregistrés automatiquement.</p></>}</div></div>);
}
