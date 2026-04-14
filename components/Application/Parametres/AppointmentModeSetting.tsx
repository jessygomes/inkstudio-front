"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchAppointmentParamAction,
  updateAppointmentParamAction,
} from "@/lib/queries/user";

interface AppointmentModeSettingProps {
  userId: string | null;
  saasPlan: string | null;
}

export default function AppointmentModeSetting({
  userId,
  saasPlan,
}: AppointmentModeSettingProps) {
  const [appointmentParam, setAppointmentParam] = useState(false);
  const [loading, setLoading] = useState(true);
  const canUseIndividualAgenda = saasPlan === "BUSINESS";

  //! Récupérer les paramètre de RDV
  const fetchConfirmationSetting = useCallback(async () => {
    if (!userId) return;

    try {
      const responseParam = await fetchAppointmentParamAction();
      if (responseParam.ok) {
        const agendaMode = responseParam.data?.user?.agendaMode;
        const nextAppointmentParam = agendaMode
          ? agendaMode === "PAR_TATOUEUR"
          : (responseParam.data?.user?.addAppointmentParam ?? false);

        if (!canUseIndividualAgenda && nextAppointmentParam) {
          await updateAppointmentParamAction(false);
          setAppointmentParam(false);
          return;
        }

        setAppointmentParam(canUseIndividualAgenda ? nextAppointmentParam : false);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du paramètre de confirmation :",
        error,
      );
    }
  }, [canUseIndividualAgenda, userId]);

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
    if (!canUseIndividualAgenda) {
      setAppointmentParam(false);
      toast.error(
        "Cette option est disponible uniquement avec le plan BUSINESS.",
      );
      return;
    }

    try {
      const response = await updateAppointmentParamAction(value);

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du paramètre");
      }

      // Mise à jour de l'état local
      setAppointmentParam(value);

      toast.success(
        value
          ? "La prise de RDV est individuelle aux tatoueurs."
          : "La prise de RDV est globale au salon.",
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paramètre :", error);
      toast.error("Erreur lors de la mise à jour du paramètre");
    }
  };

  return (
    <div className="w-full bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
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
                  Si activé, le client choisit son tatoueur et voit son agenda
                  personnel. <br />
                  Si désactivé, la prise de RDV est globale au salon (agenda
                  unique).
                </span>
                <span className="sm:hidden">Agenda global ou par tatoueur</span>
              </p>
              {!canUseIndividualAgenda && (
                <p className="text-amber-300 text-xs sm:text-sm font-one mt-2">
                  Option réservée au plan BUSINESS. Votre agenda reste global au
                  salon.
                </p>
              )}
            </div>
            <label
              className={`relative inline-flex items-center ${
                canUseIndividualAgenda ? "cursor-pointer" : "cursor-not-allowed"
              }`}
            >
              <input
                type="checkbox"
                checked={appointmentParam}
                onChange={(e) =>
                  handleAppointmentSettingChange(e.target.checked)
                }
                disabled={!canUseIndividualAgenda}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-disabled:opacity-50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-400"></div>
            </label>
          </div>

          {/* Indicateur de statut */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  appointmentParam ? "bg-green-400" : "bg-blue-400"
                }`}
              ></div>
              <span className="text-xs font-one text-white/70">
                {appointmentParam ? (
                  <span className="text-green-300">
                    <span className="hidden sm:inline">
                      Agenda par tatoueur (client choisit son tatoueur)
                    </span>
                    <span className="sm:hidden">Par tatoueur</span>
                  </span>
                ) : (
                  <span className="text-blue-300">
                    <span className="hidden sm:inline">
                      Agenda global du salon (moins de créneaux disponibles)
                    </span>
                    <span className="sm:hidden">Agenda salon</span>
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
