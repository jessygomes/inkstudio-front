/* eslint-disable react/no-unescaped-entities */
"use client";

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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-one mb-1 text-sm sm:text-base">
                <span className="hidden sm:inline">
                  Afficher mon salon dans les inspirations
                </span>
                <span className="sm:hidden">Salon en inspiration</span>
              </h3>
              <p className="text-white/60 text-xs sm:text-sm font-one">
                <span className="hidden sm:inline">
                  Si activé, les images de votre portfolio peuvent être affichées
                  sur la page inspiration de InkeraPeople.
                </span>
                <span className="sm:hidden">
                  Afficher mes images sur InkeraPeople
                </span>
              </p>
            </div>
            <label
              className={`relative inline-flex items-center ${
                updating ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={isInspirationSalon}
                onChange={handleInspirationToggle}
                disabled={updating}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-disabled:opacity-50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-400"></div>
            </label>
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
