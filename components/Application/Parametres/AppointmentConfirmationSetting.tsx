"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchAppointmentConfirmationAction,
  updateAppointmentConfirmationAction,
} from "@/lib/queries/user";

interface AppointmentConfirmationSettingProps {
  userId: string | null;
}

export default function AppointmentConfirmationSetting({
  userId,
}: AppointmentConfirmationSettingProps) {
  const [confirmationEnabled, setConfirmationEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  //! Récupérer les paramètre de RDV
  const fetchConfirmationSetting = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetchAppointmentConfirmationAction();
      // const responseParam = await fetchAppointmentParamAction();

      if (response.ok) {
        setConfirmationEnabled(
          response.data.user.addConfirmationEnabled || false
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
        error
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
          : "Confirmation automatique activée - Les nouveaux RDV seront directement confirmés"
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paramètre :", error);
      toast.error("Erreur lors de la mise à jour du paramètre");
    }
  };

  return (
    <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tertiary-400"></div>
          <span className="ml-2 text-white/70 text-sm font-one">
            Chargement...
          </span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-one mb-1 text-sm sm:text-base">
                <span className="hidden sm:inline">
                  Confirmation manuelle des rendez-vous
                </span>
                <span className="sm:hidden">Confirmation RDV</span>
              </h3>
              <p className="text-white/60 text-xs sm:text-sm font-one">
                <span className="hidden sm:inline">
                  Si activé, vous devrez confirmer manuellement chaque rendez-vous
                  pris par un client
                </span>
                <span className="sm:hidden">Confirmation manuelle des RDV</span>
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={confirmationEnabled}
                onChange={(e) => handleConfirmationSettingChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-400"></div>
            </label>
          </div>

          {/* Indicateur de statut */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  confirmationEnabled ? "bg-orange-400" : "bg-green-400"
                }`}
              ></div>
              <span className="text-xs font-one text-white/70">
                {confirmationEnabled ? (
                  <span className="text-orange-300">
                    <span className="hidden sm:inline">
                      Les nouveaux RDV seront en attente de votre confirmation
                    </span>
                    <span className="sm:hidden">RDV en attente</span>
                  </span>
                ) : (
                  <span className="text-green-300">
                    <span className="hidden sm:inline">
                      Les nouveaux RDV sont automatiquement confirmés
                    </span>
                    <span className="sm:hidden">RDV auto-confirmés</span>
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
