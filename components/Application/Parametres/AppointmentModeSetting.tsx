"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

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
  const [permissions, setPermissions] =
    useState<LinkedSalonPermissions>(DEFAULT_PERMISSIONS);

  const storageKey = useMemo(
    () => (userId ? `inkera:tatoueur:salon-permissions:${userId}` : null),
    [userId],
  );

  useEffect(() => {
    if (!storageKey) {
      setLoading(false);
      return;
    }

    try {
      const rawValue = window.localStorage.getItem(storageKey);

      if (rawValue) {
        const parsed = JSON.parse(rawValue) as {
          canViewAgendaAndAppointments?: boolean;
          canCreateAppointmentForMe?: boolean;
        };

        setPermissions({
          canViewAgendaAndAppointments: Boolean(
            parsed.canViewAgendaAndAppointments,
          ),
          canCreateAppointmentForMe: Boolean(parsed.canCreateAppointmentForMe),
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des permissions locales:", error);
    } finally {
      setLoading(false);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || loading) return;

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(permissions),
      );
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des permissions locales:", error);
    }
  }, [storageKey, loading, permissions]);

  const handleAgendaAccessChange = (value: boolean) => {
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

    setPermissions((prev) => ({
      ...prev,
      canViewAgendaAndAppointments: value,
    }));

    toast.success(
      value
        ? "Le salon relié peut désormais voir ton agenda et tes RDV."
        : "Le salon relié ne peut plus voir ton agenda et tes RDV.",
    );
  };

  const handleCreateAppointmentChange = (value: boolean) => {
    if (!isTatoueurAccount) {
      toast.error("Cette option est réservée aux comptes tatoueurs.");
      return;
    }

    if (value && !permissions.canViewAgendaAndAppointments) {
      setPermissions((prev) => ({
        ...prev,
        canViewAgendaAndAppointments: true,
        canCreateAppointmentForMe: true,
      }));

      toast.info(
        "Accès agenda/RDV activé automatiquement pour autoriser la création de RDV.",
      );
    } else {
      setPermissions((prev) => ({
        ...prev,
        canCreateAppointmentForMe: value,
      }));
    }

    toast.success(
      value
        ? "Le salon relié peut désormais créer des RDV pour toi."
        : "Le salon relié ne peut plus créer de RDV pour toi.",
    );
  };

  const statusColor = permissions.canViewAgendaAndAppointments
    ? "bg-emerald-400"
    : "bg-orange-400";
  const statusLabel = permissions.canViewAgendaAndAppointments
    ? "Partage actif avec le salon relié"
    : "Partage inactif";

  return (
    <div className="w-full bg-white/5 rounded-3xl p-3 sm:p-4 border border-white/10">
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
            <h3 className="text-white font-one mb-1 text-sm sm:text-base">
              Permissions du salon relié
            </h3>
            <p className="text-white/60 text-xs sm:text-sm font-one">
              Définis ce qu&apos;un salon relié peut faire sur ton agenda.
            </p>
            {!isTatoueurAccount && (
              <p className="text-amber-300 text-xs sm:text-sm font-one mt-2">
                Cette section est réservée aux comptes tatoueurs.
              </p>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/4 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white text-sm font-one">
                    Autoriser l&apos;accès agenda et RDV
                  </p>
                  <p className="text-white/55 text-xs font-one mt-1">
                    Le salon relié peut consulter ton agenda et la liste de tes rendez-vous.
                  </p>
                </div>
                <label
                  className={`relative inline-flex items-center ${
                    isTatoueurAccount ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={permissions.canViewAgendaAndAppointments}
                    onChange={(e) => handleAgendaAccessChange(e.target.checked)}
                    disabled={!isTatoueurAccount}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-disabled:opacity-50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-400"></div>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/4 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white text-sm font-one">
                    Autoriser la création de RDV par le salon
                  </p>
                  <p className="text-white/55 text-xs font-one mt-1">
                    Le salon relié peut créer des rendez-vous pour toi.
                  </p>
                </div>
                <label
                  className={`relative inline-flex items-center ${
                    isTatoueurAccount ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={permissions.canCreateAppointmentForMe}
                    onChange={(e) => handleCreateAppointmentChange(e.target.checked)}
                    disabled={!isTatoueurAccount}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-disabled:opacity-50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-400"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
              <span className="text-xs font-one text-white/75">{statusLabel}</span>
            </div>
            <p className="text-[11px] text-white/45 font-one">
              Configuration locale temporaire en attendant les routes backend.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
