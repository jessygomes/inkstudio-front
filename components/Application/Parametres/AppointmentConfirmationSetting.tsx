"use client";
import SettingsSectionHeader from "./SettingsSectionHeader";
import { CalendarCheck } from "lucide-react";

import styles from "./SettingsCard.module.css";
import SettingsSwitch from "./SettingsSwitch";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchAppointmentConfirmationAction, updateAppointmentConfirmationAction } from "@/lib/queries/user";

interface AppointmentConfirmationSettingProps {
  userId: string | null;
}

export default function AppointmentConfirmationSetting({
  userId,
}: AppointmentConfirmationSettingProps) {
  const [confirmationEnabled, setConfirmationEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  //! Récupérer les paramètre de RDV
  const fetchConfirmationSetting = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetchAppointmentConfirmationAction();
      // const responseParam = await fetchAppointmentParamAction();

      if (response.ok) {
        setConfirmationEnabled(
          response.data.user.addConfirmationEnabled || false,
        );
      }
      // if (responseParam.ok) {
      //   setAppointmentParam(
      //     responseParam.data.user.addAppointmentParam || false
      //   );
      // }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du paramètre de confirmation :",
        error,
      );
    }
  }, [userId]);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true);
        // Récupérer les données du plan et le paramètre de confirmation
        await Promise.all([fetchConfirmationSetting()]);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAccountData();
    } else {
      setLoading(false);
    }
  }, [userId, fetchConfirmationSetting]);

  //! Fonction pour changer le paramètre de confirmation des RDV
  const handleConfirmationSettingChange = async (value: boolean) => {
    if (saving || !userId) return;
    setSaving(true);
    try {
      const response = await updateAppointmentConfirmationAction(value);

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du paramètre");
      }

      // Mise à jour de l'état local
      setConfirmationEnabled(value);

      toast.success(
        value
          ? "Confirmation manuelle activée - Les nouveaux RDV devront être confirmés"
          : "Confirmation automatique activée - Les nouveaux RDV seront directement confirmés",
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paramètre :", error);
      toast.error("Erreur lors de la mise à jour du paramètre");
    } finally {
      setSaving(false);
    }
  };

  return (<div className={styles.card}><SettingsSectionHeader icon={CalendarCheck} title="Confirmation des rendez-vous" description="Choisissez comment valider les réservations de vos clients." />
<div className={styles.body}>{loading ? <p role="status" className={styles.empty}>Chargement des préférences…</p> : <>
<div className={styles.row}><div><p className={styles.label}>Valider chaque rendez-vous manuellement</p><p className={styles.note}>Gardez la main sur les nouvelles demandes de réservation.</p></div><SettingsSwitch label="Confirmation manuelle des rendez-vous" checked={confirmationEnabled} busy={saving} disabled={!userId} onChange={e=>void handleConfirmationSettingChange(e.target.checked)} /></div>
<div className={styles.notice}><span className={styles.badge}>{confirmationEnabled ? "Validation manuelle" : "Validation automatique"}</span><p>{confirmationEnabled ? "Les nouvelles demandes restent en attente jusqu’à votre confirmation." : "Les nouveaux rendez-vous sont confirmés automatiquement, sans action de votre part."}</p></div><p className={styles.note}>Les changements sont enregistrés automatiquement.</p></>}</div></div>);
}
