"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SkeletonHoursForm from "@/components/Skeleton/SkeletonHoursForm";

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
] as const;

type DayKey = (typeof daysOfWeek)[number]["key"];

const defaultHours: SalonHours = {
  monday: { start: "", end: "" },
  tuesday: { start: "", end: "" },
  wednesday: { start: "", end: "" },
  thursday: { start: "", end: "" },
  friday: { start: "", end: "" },
  saturday: { start: "", end: "" },
  sunday: null,
};

export default function HorairesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingHours, setEditingHours] = useState<SalonHours>(defaultHours);

  useEffect(() => {
    const fetchSalonHours = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/users/${session.user.id}`,
          { method: "GET" },
        );

        if (!response.ok) throw new Error("Réponse réseau invalide");

        const data = await response.json();
        if (data.salonHours) {
          setEditingHours(JSON.parse(data.salonHours));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des horaires:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSalonHours();
  }, [session?.user?.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/users/${session.user.id}/hours`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingHours),
        },
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

  const sectionTitleClass =
    "mb-1 text-[14px] font-semibold tracking-wide text-white font-one";
  const labelClass =
    "text-[10px] uppercase tracking-wider text-white/50 font-one";
  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/6 px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one";

  const setDayHours = (day: DayKey, value: OpeningHour) => {
    setEditingHours((prev) => ({
      ...prev,
      [day]: value,
    }));
  };

  const updateDayTime = (day: DayKey, field: "start" | "end", time: string) => {
    setEditingHours((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || { start: "09:00", end: "18:00" }),
        [field]: time,
      },
    }));
  };

  const applyWeekTemplate = () => {
    setEditingHours((prev) => {
      const mondayHours = prev.monday
        ? { start: prev.monday.start ?? "", end: prev.monday.end ?? "" }
        : null;

      return {
        monday: mondayHours ? { ...mondayHours } : null,
        tuesday: mondayHours ? { ...mondayHours } : null,
        wednesday: mondayHours ? { ...mondayHours } : null,
        thursday: mondayHours ? { ...mondayHours } : null,
        friday: mondayHours ? { ...mondayHours } : null,
        saturday: mondayHours ? { ...mondayHours } : null,
        sunday: mondayHours ? { ...mondayHours } : null,
      };
    });
  };

  const openAllDays = () => {
    setEditingHours({
      monday: { start: "09:00", end: "18:00" },
      tuesday: { start: "09:00", end: "18:00" },
      wednesday: { start: "09:00", end: "18:00" },
      thursday: { start: "09:00", end: "18:00" },
      friday: { start: "09:00", end: "18:00" },
      saturday: { start: "09:00", end: "18:00" },
      sunday: { start: "09:00", end: "18:00" },
    });
  };

  const closeAllDays = () => {
    setEditingHours({
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null,
    });
  };

  if (isLoading) return <SkeletonHoursForm />;

  return (
    <div className="wrapper-global pb-16 sm:pb-10 px-3 sm:px-4 lg:px-6">
      <section className="w-full space-y-3 pt-4 pb-10 xl:pb-0">
        <div className="dashboard-hero flex items-center gap-3 px-4 py-3 sm:px-5 lg:py-2.5">
          <div className="flex h-10 w-10 items-center justify-center">
            <Link
              href="/mon-compte"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/8 text-white/70 transition-colors hover:bg-white/12 hover:text-white"
            >
              ←
            </Link>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-white/50 font-one">
              Mon compte
            </p>
            <h1 className="text-base font-bold uppercase tracking-wide text-white font-one sm:text-lg">
              Modifier les horaires
            </h1>
            <p className="mt-0.5 text-[11px] text-white/70 font-one">
              Définissez les horaires d&apos;ouverture de votre salon.
            </p>
          </div>
        </div>

        <div className="w-full rounded-2xl border border-white/10 bg-white/4 p-2.5 sm:p-3">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="dashboard-embedded-section p-2.5 sm:p-3">
              <h3 className={sectionTitleClass}>Configuration des horaires</h3>
              <p className="mb-2.5 text-[12px] text-white/60 font-one">
                Activez un jour, puis choisissez l&apos;heure de début et de fin.
                Utilisez les actions rapides pour gagner du temps.
              </p>

              <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={applyWeekTemplate}
                  className="inline-flex h-8 items-center justify-center rounded-[10px] border border-white/15 bg-white/8 px-2.5 text-[12px] text-white/85 transition-colors hover:bg-white/12 font-one"
                >
                  Copier le lundi sur tous les jours
                </button>
                <button
                  type="button"
                  onClick={openAllDays}
                  className="cursor-pointer inline-flex h-8 items-center justify-center rounded-[10px] border border-emerald-500/35 bg-emerald-500/12 px-2.5 text-[12px] text-emerald-300 transition-colors hover:bg-emerald-500/20 font-one"
                >
                  Tout ouvrir
                </button>
                <button
                  type="button"
                  onClick={closeAllDays}
                  className="cursor-pointer inline-flex h-8 items-center justify-center rounded-[10px] border border-red-500/35 bg-red-500/12 px-2.5 text-[12px] text-red-300 transition-colors hover:bg-red-500/20 font-one"
                >
                  Tout fermer
                </button>
              </div>

              <div className="space-y-1.5">
                {daysOfWeek.map(({ key, label }) => {
                  const value = editingHours[key];
                  const isOpen = Boolean(value);

                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-white/10 bg-white/5 p-2"
                    >
                      <div className="flex flex-col gap-2 sm:gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[11px] tracking-wide text-white/90 font-one">
                            {label}
                          </label>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded-[10px] border px-2 py-0.5 text-[10px] font-one ${
                                isOpen
                                  ? "border-emerald-500/35 bg-emerald-500/12 text-emerald-300"
                                  : "border-red-500/35 bg-red-500/12 text-red-300"
                              }`}
                            >
                              {isOpen ? "Ouvert" : "Fermé"}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setDayHours(
                                  key,
                                  isOpen ? null : { start: "09:00", end: "18:00" },
                                )
                              }
                              className={`cursor-pointer inline-flex h-8 items-center justify-center rounded-[10px] border px-2.5 text-[10px] transition-colors font-one ${
                                isOpen
                                  ? "border-red-500/35 bg-red-500/12 text-red-300 hover:bg-red-500/20"
                                  : "border-green-500/35 bg-green-500/12 text-green-300 hover:bg-green-500/20"
                              }`}
                            >
                              {isOpen ? "Fermer" : "Ouvrir"}
                            </button>
                          </div>
                        </div>

                        {value ? (
                          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            <div className="space-y-0.5">
                              <label className={labelClass}>Début</label>
                              <input
                                type="time"
                                value={value.start ?? ""}
                                onChange={(e) =>
                                  updateDayTime(key, "start", e.target.value)
                                }
                                className={inputClass}
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className={labelClass}>Fin</label>
                              <input
                                type="time"
                                value={value.end ?? ""}
                                onChange={(e) =>
                                  updateDayTime(key, "end", e.target.value)
                                }
                                className={inputClass}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed border-white/15 bg-white/5 px-2.5 py-2 text-[12px] text-white/55 font-one">
                            Ce jour est fermé. Utilisez le bouton Ouvrir pour
                            définir des horaires.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col justify-end gap-1.5 border-t border-white/10 pt-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => router.push("/mon-compte")}
                className="cursor-pointer inline-flex h-8 items-center justify-center rounded-[12px] border border-white/12 bg-white/8 px-3 text-[12px] font-medium text-white/85 transition-colors hover:bg-white/12 font-one"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer inline-flex h-8 items-center justify-center rounded-[12px] bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-3 text-[12px] font-medium text-white transition-all duration-200 hover:from-tertiary-500 hover:to-tertiary-600 disabled:opacity-50 disabled:cursor-not-allowed font-one"
              >
                {isSubmitting ? "Enregistrement..." : "Sauvegarder les horaires"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
