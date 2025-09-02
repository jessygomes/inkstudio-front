"use client";

import { useUser } from "@/components/Auth/Context/UserContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type OpeningHour = { start: string; end: string } | null;

type SalonHours = {
  monday: OpeningHour;
  tuesday: OpeningHour;
  wednesday: OpeningHour;
  thursday: OpeningHour;
  friday: OpeningHour;
  saturday: OpeningHour;
  sunday: OpeningHour;
};

const daysOfWeek = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
];

export default function HorairesPage() {
  const user = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentHours, setCurrentHours] = useState<string | null>(null);

  const initialHours: SalonHours = currentHours
    ? JSON.parse(currentHours)
    : {
        monday: { start: "", end: "" },
        tuesday: { start: "", end: "" },
        wednesday: { start: "", end: "" },
        thursday: { start: "", end: "" },
        friday: { start: "", end: "" },
        saturday: { start: "", end: "" },
        sunday: null,
      };

  const [editingHours, setEditingHours] = useState<SalonHours>(initialHours);

  useEffect(() => {
    const fetchSalonHours = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/users/${user.id}`,
          { method: "GET" }
        );

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setCurrentHours(data.salonHours);

        if (data.salonHours) {
          setEditingHours(JSON.parse(data.salonHours));
        }
      } catch (error) {
        console.error("Error fetching salon hours:", error);
      }
    };

    fetchSalonHours();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/users/${user.id}/hours`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingHours),
        }
      );

      if (res.ok) {
        router.push("/mon-compte");
      } else {
        console.error("Erreur lors de la mise à jour des horaires");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-noir-700">
      <div className="container pt-24 px-3 sm:px-6 lg:px-8">
        {/* Header responsive - même style que modifier-salon */}
        <div className="flex items-center gap-3 sm:gap-4 max-w-6xl mx-auto mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            <Link
              href="/mon-compte"
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 border border-white/20"
            >
              ←
            </Link>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-one tracking-widest">
              <span className="hidden sm:inline">Modifier les horaires</span>
              <span className="sm:hidden">Horaires</span>
            </h1>
            <p className="text-white/70 text-xs font-one mt-1">
              <span className="hidden sm:inline">
                Définissez les horaires d&apos;ouverture de votre salon
              </span>
              <span className="sm:hidden">Horaires d&apos;ouverture</span>
            </p>
          </div>
        </div>

        {/* Form responsive */}
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-3xl p-4 sm:p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                <span className="hidden sm:inline">
                  Configuration des horaires
                </span>
                <span className="sm:hidden">Configuration</span>
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {daysOfWeek.map(({ key, label }) => (
                  <div
                    key={key}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <label className="w-full sm:w-24 text-xs text-white/70 font-one">
                        {label}
                      </label>

                      {editingHours[key as keyof SalonHours] ? (
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:flex-1">
                          <input
                            type="time"
                            value={
                              editingHours[key as keyof SalonHours]?.start ?? ""
                            }
                            onChange={(e) =>
                              setEditingHours((prev) => ({
                                ...prev,
                                [key]: {
                                  ...(prev[key as keyof SalonHours] || {
                                    start: "",
                                    end: "",
                                  }),
                                  start: e.target.value,
                                },
                              }))
                            }
                            className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                          />
                          <span className="text-white/70 text-xs">à</span>
                          <input
                            type="time"
                            value={
                              editingHours[key as keyof SalonHours]?.end ?? ""
                            }
                            onChange={(e) =>
                              setEditingHours((prev) => ({
                                ...prev,
                                [key]: {
                                  ...(prev[key as keyof SalonHours] || {
                                    start: "",
                                    end: "",
                                  }),
                                  end: e.target.value,
                                },
                              }))
                            }
                            className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditingHours((prev) => ({
                                ...prev,
                                [key]: null,
                              }))
                            }
                            className="cursor-pointer px-2 sm:px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-xs hover:bg-red-500/30 transition-colors"
                          >
                            Fermé
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:flex-1 justify-between sm:justify-end">
                          <span className="text-red-300 text-xs">Fermé</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingHours((prev) => ({
                                ...prev,
                                [key]: { start: "09:00", end: "18:00" },
                              }))
                            }
                            className="cursor-pointer px-2 sm:px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded text-xs hover:bg-green-500/30 transition-colors"
                          >
                            Ouvrir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer avec boutons d'action responsive */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => router.back()}
                className="cursor-pointer px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs text-center"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer px-6 sm:px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
              >
                {isSubmitting ? (
                  <span className="hidden sm:inline">Enregistrement...</span>
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      Sauvegarder les horaires
                    </span>
                    <span className="sm:hidden">Sauvegarder</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
