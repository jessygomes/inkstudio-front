"use client";

import { CalendarDays } from "lucide-react";
import styles from "./SettingsCard.module.css";

import SettingsSwitch from "./SettingsSwitch";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  getSalonLinkedPermissionsAction,
  updateSalonAgendaAccessPermissionAction,
  updateSalonAppointmentCreationPermissionAction,
} from "@/lib/queries/parametre.action";

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
          ? "Le salon relié peut désormais voir ton agenda et tes RDV."
          : "Le salon relié ne peut plus voir ton agenda et tes RDV.",
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
          ? "Le salon relié peut désormais créer des RDV pour toi."
          : "Le salon relié ne peut plus créer de RDV pour toi.",
      );
    } catch {
      toast.error("Impossible de modifier l’autorisation. Veuillez réessayer.");
    } finally {
      setIsSavingCreationPermission(false);
    }
  };

  const statusColor = permissions.canViewAgendaAndAppointments
    ? "bg-emerald-400"
    : "bg-orange-400";
  const statusLabel = permissions.canViewAgendaAndAppointments
    ? "Partage actif avec le salon relié"
    : "Partage inactif";

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
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-tertiary-400/20 bg-tertiary-400/10"><CalendarDays className="h-5 w-5 text-tertiary-400" aria-hidden="true" /></div>
            <h3 className="text-white font-one mb-1 text-base font-semibold">
              Permissions du salon relié
            </h3>
            <p className="text-white/60 text-sm leading-relaxed font-one">
              Définis ce qu&apos;un salon relié peut faire sur ton agenda.
            </p>
            {!isTatoueurAccount && (
              <p className="text-amber-300 text-xs sm:text-sm font-one mt-2">
                Cette section est réservée aux comptes tatoueurs.
              </p>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white text-sm font-one">
                    Autoriser l&apos;accès agenda et RDV
                  </p>
                  <p className="text-white/60 text-sm leading-relaxed font-one mt-2">
                    Le salon relié peut consulter ton agenda et la liste de tes rendez-vous.
                  </p>
                </div>
                <SettingsSwitch label="Autoriser l’accès à l’agenda et aux rendez-vous" busy={isSavingAgendaAccess}
                    checked={permissions.canViewAgendaAndAppointments}
                    onChange={(e) => void handleAgendaAccessChange(e.target.checked)}
                    disabled={!isTatoueurAccount || isSavingAgendaAccess || isSavingCreationPermission}
                   />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/4 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white text-sm font-one">
                    Autoriser la création de RDV par le salon
                  </p>
                  <p className="text-white/60 text-sm leading-relaxed font-one mt-2">
                    Le salon relié peut créer des rendez-vous pour toi.
                  </p>
                </div>
                <SettingsSwitch label="Autoriser la création de rendez-vous par le salon" busy={isSavingCreationPermission}
                    checked={permissions.canCreateAppointmentForMe}
                    onChange={(e) => void handleCreateAppointmentChange(e.target.checked)}
                    disabled={!isTatoueurAccount || isSavingCreationPermission || isSavingAgendaAccess}
                   />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
              <span className="text-xs font-one text-white/75">{statusLabel}</span>
            </div>
            <p className="text-[11px] text-white/55 font-one">
              La création de rendez-vous par le salon nécessite un accès à votre agenda.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
