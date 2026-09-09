"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, Copy, LoaderCircle, Save, Sparkles } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import { toast } from "sonner";
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
    if (!session?.user?.id || isSubmitting) return;

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
        toast.success("Horaires enregistrés avec succès.");
        router.push("/mon-compte");
      } else {
        console.error("Erreur lors de la mise à jour des horaires");
        toast.error("Impossible d’enregistrer les horaires. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Impossible d’enregistrer les horaires. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass =
    "mb-1.5 block text-xs font-medium text-white/65 font-one";
  const inputClass =
    "w-full min-w-0 rounded-xl border border-white/10 bg-black/15 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 [color-scheme:dark] font-two";
  const openDaysCount = daysOfWeek.filter(({ key }) => Boolean(editingHours[key])).length;

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
    <div className="wrapper-global pb-24 lg:pb-8">
      <section className="w-full space-y-5 pt-4">
        <header className="flex flex-col gap-4 px-1 py-3 sm:px-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-tertiary-400 font-one">Mon compte</p>
            <h1 className="mt-1 text-xl font-semibold text-white font-one sm:text-2xl">Les horaires de votre salon</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55 font-one">Définissez votre semaine d’ouverture pour aider vos clients à préparer leur visite.</p>
          </div>
          <DashboardButton href="/mon-compte" variant="secondary" className="w-full sm:w-auto">
            <ArrowLeft size={15} aria-hidden="true" />Retour au salon
          </DashboardButton>
        </header>

        <form onSubmit={handleSubmit} className="create-rdv-form tablet-inputs space-y-4">
          <fieldset disabled={isSubmitting} className="min-w-0 space-y-4 disabled:opacity-60">
            <legend className="sr-only">Configurer les horaires d’ouverture</legend>
            <section className="rounded-[22px] border border-tertiary-400/20 bg-gradient-to-br from-tertiary-500/10 via-[#181818] to-[#181818] p-4 sm:p-5" aria-labelledby="hours-shortcuts-title">
              <div className="mb-5 flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/25 bg-tertiary-500/10 text-tertiary-400"><Sparkles size={18} aria-hidden="true" /></span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-tertiary-400/80 font-one">01 · Réglages rapides</p>
                  <h2 id="hours-shortcuts-title" className="mt-1 text-base font-semibold text-white font-one">Préparez votre semaine en un clic</h2>
                  <p className="mt-1 text-xs leading-5 text-white/50 font-two">Appliquez une base commune, puis ajustez chaque jour dans le planning ci-dessous.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <DashboardButton variant="secondary" onClick={applyWeekTemplate} className="min-h-11">
                  <Copy size={15} aria-hidden="true" />Copier le lundi sur les 7 jours
                </DashboardButton>
                <DashboardButton variant="secondary" onClick={openAllDays} className="min-h-11">
                  <Clock3 size={15} aria-hidden="true" />Tout ouvrir · 09:00 – 18:00
                </DashboardButton>
                <DashboardButton variant="secondary" onClick={closeAllDays} className="min-h-11">Tout fermer</DashboardButton>
              </div>
              <p className="mt-3 text-xs leading-5 text-white/40 font-two">Ces actions remplacent les réglages des sept jours, week-end compris.</p>
            </section>

            <section className="dashboard-embedded-section min-w-0 rounded-[22px] p-4 sm:p-5" aria-labelledby="hours-planning-title">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/25 bg-tertiary-500/10 text-tertiary-400"><CalendarDays size={18} aria-hidden="true" /></span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-tertiary-400/80 font-one">02 · Planning hebdomadaire</p>
                    <h2 id="hours-planning-title" className="mt-1 text-base font-semibold text-white font-one">Vos horaires, jour par jour</h2>
                    <p className="mt-1 text-xs leading-5 text-white/50 font-two">Activez les jours d’ouverture et renseignez une heure de début et de fin.</p>
                  </div>
                </div>
                <span role="status" className="rounded-full border border-tertiary-400/25 bg-tertiary-500/10 px-3 py-1.5 text-xs text-tertiary-400 font-one">{openDaysCount} jour{openDaysCount > 1 ? "s" : ""} d’ouverture / 7</span>
              </div>

              <div className="space-y-3">
                {daysOfWeek.map(({ key, label }) => {
                  const value = editingHours[key];
                  const isOpen = Boolean(value);

                  return (
                    <div key={key} role="group" aria-labelledby={`day-${key}`} className={`grid gap-4 rounded-2xl border p-4 transition-colors md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-center sm:p-5 ${isOpen ? "border-white/10 bg-black/15" : "border-white/5 bg-white/[0.015]"}`}>
                      <div className="flex items-center justify-between gap-4 md:pr-5">
                        <div>
                          <h3 id={`day-${key}`} className={`text-sm font-semibold font-one ${isOpen ? "text-white" : "text-white/55"}`}>{label}</h3>
                          <p className={`mt-1 flex items-center gap-1.5 text-xs font-two ${isOpen ? "text-tertiary-400" : "text-white/35"}`}><span className={`size-1.5 rounded-full ${isOpen ? "bg-tertiary-400" : "bg-white/25"}`} aria-hidden="true" />{isOpen ? "Ouvert" : "Fermé"}</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isOpen}
                          aria-label={`Ouverture le ${label.toLowerCase()}`}
                          onClick={() => setDayHours(key, isOpen ? null : { start: "09:00", end: "18:00" })}
                          className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-tertiary-400"
                        >
                          <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${isOpen ? "bg-tertiary-500" : "bg-white/15"}`} aria-hidden="true"><span className={`size-5 rounded-full bg-white shadow-sm transition-transform ${isOpen ? "translate-x-5" : "translate-x-0"}`} /></span>
                        </button>
                      </div>

                      {value ? (
                        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="min-w-0">
                            <label htmlFor={`hours-${key}-start`} className={labelClass}>Ouverture</label>
                            <input id={`hours-${key}-start`} type="time" value={value.start ?? ""} onChange={(event) => updateDayTime(key, "start", event.target.value)} className={inputClass} />
                          </div>
                          <div className="min-w-0">
                            <label htmlFor={`hours-${key}-end`} className={labelClass}>Fermeture</label>
                            <input id={`hours-${key}-end`} type="time" value={value.end ?? ""} onChange={(event) => updateDayTime(key, "end", event.target.value)} className={inputClass} />
                          </div>
                        </div>
                      ) : (
                        <p className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-xs leading-5 text-white/35 font-two">Jour de fermeture. Activez l’interrupteur pour ajouter des horaires.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </fieldset>

          <div className="sticky bottom-4 z-20 flex flex-col-reverse justify-end gap-3 rounded-2xl border border-white/10 bg-noir-700/90 p-4 backdrop-blur-xl sm:flex-row sm:items-center">
            <DashboardButton variant="secondary" onClick={() => router.push("/mon-compte")} disabled={isSubmitting} className="w-full sm:w-auto">Annuler</DashboardButton>
            <DashboardButton type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
              {isSubmitting ? "Enregistrement…" : "Enregistrer les horaires"}
            </DashboardButton>
          </div>
        </form>
      </section>
    </div>
  );
}
