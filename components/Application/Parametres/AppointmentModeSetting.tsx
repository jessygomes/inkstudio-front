"use client";
import SettingsSectionHeader from "./SettingsSectionHeader";
import { CalendarDays } from "lucide-react";

import styles from "./SettingsCard.module.css";

import SettingsSwitch from "./SettingsSwitch";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getSalonLinkedPermissionsAction, updateSalonAgendaAccessPermissionAction, updateSalonAppointmentCreationPermissionAction } from "@/lib/queries/parametre.action";

interface AppointmentModeSettingProps {
  userId: string | null;
  saasPlan: string | null;
}

type LinkedSalonPermissions = {
  canViewAgendaAndAppointments: boolean;
  canCreateAppointmentForMe: boolean;
};

const DEFAULT_PERMISSIONS: LinkedSalonPermissions = {
  canViewAgendaAndAppointments: false,
  canCreateAppointmentForMe: false,
};

export default function AppointmentModeSetting({
  userId,
  saasPlan: _saasPlan,
}: AppointmentModeSettingProps) {
  void _saasPlan;

  const { data: session } = useSession();
  const isTatoueurAccount =
    (session?.user?.role || "").toLowerCase() === "user_tatoueur";

  const [loading, setLoading] = useState(true);
  const [isSavingAgendaAccess, setIsSavingAgendaAccess] = useState(false);
  const [isSavingCreationPermission, setIsSavingCreationPermission] =
    useState(false);
  const [permissions, setPermissions] =
    useState<LinkedSalonPermissions>(DEFAULT_PERMISSIONS);

  useEffect(() => {
    const loadCurrentPermissions = async () => {
      if (!userId || !isTatoueurAccount) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await getSalonLinkedPermissionsAction();

        if (!response.ok || !response.data) {
          toast.error(
            response.message || "Impossible de récupérer les permissions.",
          );
          return;
        }

        setPermissions({
          canViewAgendaAndAppointments: response.data.agendaAccess,
          canCreateAppointmentForMe: response.data.salonAppointmentCreation,
        });
      } catch (error) {
        console.error(
          "Erreur lors du chargement des permissions salon:",
          error,
        );

        toast.error("Impossible de récupérer les permissions.");
      } finally {
        setLoading(false);
      }
    };

    void loadCurrentPermissions();
  }, [userId, isTatoueurAccount]);

  const handleAgendaAccessChange = async (value: boolean) => {
    if (!isTatoueurAccount) {
      toast.error("Cette option est réservée aux comptes tatoueurs.");
      return;
    }

    if (!value && permissions.canCreateAppointmentForMe) {
      toast.error(
        "Désactive d'abord l'autorisation de création de RDV par le salon.",
      );
      return;
    }

    setIsSavingAgendaAccess(true);

    try {
      const response = await updateSalonAgendaAccessPermissionAction(value);

      if (!response.ok) {
        toast.error(response.message || "Mise à jour impossible.");
        return;
      }

      setPermissions((prev) => ({
        ...prev,
        canViewAgendaAndAppointments: value,
      }));

      toast.success(
        value
          ? "Le salon relié peut désormais voir votre agenda et tes RDV."
          : "Le salon relié ne peut plus voir votre agenda et tes RDV.",
      );
    } catch {
      toast.error("Impossible de modifier l’accès. Veuillez réessayer.");
    } finally {
      setIsSavingAgendaAccess(false);
    }
  };

  const handleCreateAppointmentChange = async (value: boolean) => {
    if (!isTatoueurAccount) {
      toast.error("Cette option est réservée aux comptes tatoueurs.");
      return;
    }

    setIsSavingCreationPermission(true);

    try {
      if (value && !permissions.canViewAgendaAndAppointments) {
        const agendaAccessResponse = await updateSalonAgendaAccessPermissionAction(
          true,
        );

        if (!agendaAccessResponse.ok) {
          toast.error(
            agendaAccessResponse.message ||
              "Impossible d'activer l'accès agenda/RDV.",
          );
          return;
        }

        setPermissions((prev) => ({
          ...prev,
          canViewAgendaAndAppointments: true,
        }));

        toast.info(
          "Accès agenda/RDV activé automatiquement pour autoriser la création de RDV.",
        );
      }

      const createPermissionResponse =
        await updateSalonAppointmentCreationPermissionAction(value);

      if (!createPermissionResponse.ok) {
        toast.error(createPermissionResponse.message || "Mise à jour impossible.");
        return;
      }

      setPermissions((prev) => ({
        ...prev,
        canCreateAppointmentForMe: value,
      }));

      toast.success(
        value
          ? "Le salon relié peut désormais créer des RDV pour vous."
          : "Le salon relié ne peut plus créer de RDV pour vous.",
      );
    } catch {
      toast.error("Impossible de modifier l’autorisation. Veuillez réessayer.");
    } finally {
      setIsSavingCreationPermission(false);
    }
  };

  return (<div className={styles.card}><SettingsSectionHeader icon={CalendarDays} title="Accès du salon à votre agenda" description="Gérez ce que votre salon relié peut consulter et organiser."/><div className={styles.body}>{loading ? <p role="status" className={styles.empty}>Chargement des autorisations…</p> : <>
<div className={styles.rows}><div className={styles.row}><div><p className={styles.label}>Consulter votre agenda et vos rendez-vous</p><p className={styles.note}>Le salon peut voir vos disponibilités et les rendez-vous prévus.</p></div><SettingsSwitch label="Autoriser l’accès à l’agenda et aux rendez-vous" busy={isSavingAgendaAccess} checked={permissions.canViewAgendaAndAppointments} onChange={e=>void handleAgendaAccessChange(e.target.checked)} disabled={!isTatoueurAccount || isSavingAgendaAccess || isSavingCreationPermission}/></div>
<div className={styles.row}><div><p className={styles.label}>Créer des rendez-vous pour vous</p><p className={styles.note}>Cette autorisation active également la consultation de votre agenda.</p></div><SettingsSwitch label="Autoriser la création de rendez-vous par le salon" busy={isSavingCreationPermission} checked={permissions.canCreateAppointmentForMe} onChange={e=>void handleCreateAppointmentChange(e.target.checked)} disabled={!isTatoueurAccount || isSavingCreationPermission || isSavingAgendaAccess}/></div></div><p className={styles.note}>Autorisations enregistrées automatiquement. Vous pouvez les modifier à tout moment.</p></>}</div></div>);
}
