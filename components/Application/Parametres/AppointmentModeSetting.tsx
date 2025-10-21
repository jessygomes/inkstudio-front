"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchAppointmentParamAction,
  updateAppointmentParamAction,
} from "@/lib/queries/user";

interface AppointmentModeSettingProps {
  userId: string | null;
}

export default function AppointmentModeSetting({
  userId,
}: AppointmentModeSettingProps) {
  const [appointmentParam, setAppointmentParam] = useState(false);
  const [loading, setLoading] = useState(true);

  //! Récupérer les paramètre de RDV
  const fetchConfirmationSetting = useCallback(async () => {
    if (!userId) return;

    try {
      const responseParam = await fetchAppointmentParamAction();
      if (responseParam.ok) {
        setAppointmentParam(
          responseParam.data.user.addAppointmentParam || false
        );
      }
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

  //! Fonction pour changer le paramètre de prise de RDV
  const handleAppointmentSettingChange = async (value: boolean) => {
    try {
      const response = await updateAppointmentParamAction(value);

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du paramètre");
      }

      // Mise à jour de l'état local
      setAppointmentParam(value);

      toast.success(
        value
          ? "La prise de RDV est globale au salon."
          : "La prise de RDV est individuelle aux tatoueurs."
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
                  Mode de prise de rendez-vous
                </span>
                <span className="sm:hidden">Mode RDV</span>
              </h3>
              <p className="text-white/60 text-xs sm:text-sm font-one">
                <span className="hidden sm:inline">
                  Si activé, prise de RDV globale au salon (agenda unique). <br />
                  Si désactivé, le client choisit son tatoueur et voit son agenda
                  personnel.
                </span>
                <span className="sm:hidden">Agenda global ou par tatoueur</span>
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={appointmentParam}
                onChange={(e) => handleAppointmentSettingChange(e.target.checked)}
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
                  appointmentParam ? "bg-blue-400" : "bg-green-400"
                }`}
              ></div>
              <span className="text-xs font-one text-white/70">
                {appointmentParam ? (
                  <span className="text-blue-300">
                    <span className="hidden sm:inline">
                      Agenda global du salon (moins de créneaux disponibles)
                    </span>
                    <span className="sm:hidden">Agenda salon</span>
                  </span>
                ) : (
                  <span className="text-green-300">
                    <span className="hidden sm:inline">
                      Agenda par tatoueur (client choisit son tatoueur)
                    </span>
                    <span className="sm:hidden">Par tatoueur</span>
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
