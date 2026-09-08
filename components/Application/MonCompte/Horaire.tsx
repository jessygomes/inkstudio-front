"use client";
import React, { useState, useEffect } from "react";
import { CalendarOff, ChevronDown, Clock3, Pencil } from "lucide-react";
import BlockedSlots from "./BlockedSlots";
import DashboardButton from "@/components/Shared/DashboardButton";

interface HoraireProps {
  hours: string | null;
  salonId: string;
}

interface Tatoueur {
  id: string;
  name: string;
}

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

export default function Horaire({ hours, salonId }: HoraireProps) {
  const [tatoueurs, setTatoueurs] = useState<Tatoueur[]>([]);
  const [isBlockedSlotsVisible, setIsBlockedSlotsVisible] = useState(false);

  // Récupérer les tatoueurs
  useEffect(() => {
    const fetchTatoueurs = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/user/${salonId}`
        );
        if (response.ok) {
          const data = await response.json();
          setTatoueurs(data || []);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des tatoueurs:", error);
      }
    };

    if (salonId) {
      fetchTatoueurs();
    }
  }, [salonId]);

  let salonHoursState: SalonHours | null = null;
  try {
    salonHoursState = hours ? JSON.parse(hours) : null;
  } catch {
    // Keep configuration available when the saved schedule is invalid.
  }
  const hasHours = !!salonHoursState && Object.keys(salonHoursState).length > 0;

  const openDays = daysOfWeek.filter(({ key }) => {
    const day = salonHoursState?.[key as keyof SalonHours];
    return day?.start && day?.end;
  }).length;

  return (
    <div className="space-y-5 font-one">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-tertiary-400/10 text-tertiary-400"><Clock3 size={20} aria-hidden="true" /></span>
          <div>
            <h3 className="text-base font-semibold text-white">Votre semaine type</h3>
            <p className="mt-1 text-sm text-white/60">{hasHours ? `${openDays} jour${openDays > 1 ? "s" : ""} d’ouverture par semaine` : "Définissez vos horaires pour informer vos clients."}</p>
          </div>
        </div>
        <DashboardButton href="/mon-compte/horaires" variant="secondary">
          <Pencil size={15} aria-hidden="true" />{hasHours ? "Modifier les horaires" : "Configurer les horaires"}
        </DashboardButton>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {daysOfWeek.map(day => {
          const dayHours = salonHoursState?.[day.key as keyof SalonHours];
          const isOpen = Boolean(dayHours?.start && dayHours?.end);
          return (
            <div key={day.key} className={`flex items-center justify-between gap-3 rounded-2xl border p-4 sm:flex-col sm:items-stretch ${isOpen ? "border-white/12 bg-white/[0.04]" : "border-white/8 bg-black/10"}`}>
              <div>
                <p className="text-sm font-semibold text-white">{day.label}</p>
                <p className={`mt-2 flex items-center gap-1.5 text-xs ${isOpen ? "text-emerald-300" : "text-white/50"}`}>
                  <span aria-hidden="true" className={`size-1.5 rounded-full ${isOpen ? "bg-emerald-400" : "bg-white/25"}`} />
                  {isOpen ? "Ouvert" : hasHours ? "Fermé" : "À renseigner"}
                </p>
              </div>
              <div className="text-right sm:mt-2 sm:border-t sm:border-white/8 sm:pt-4 sm:text-left">
                {isOpen ? <p className="whitespace-nowrap text-base tabular-nums text-white">{dayHours!.start}<span className="mx-1 text-white/35">–</span>{dayHours!.end}</p> : <p className="text-sm text-white/40">{hasHours ? "Pas d’ouverture" : "Non configuré"}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <button type="button" aria-expanded={isBlockedSlotsVisible} aria-controls="account-blocked-slots" onClick={() => setIsBlockedSlotsVisible(!isBlockedSlotsVisible)} className="flex w-full cursor-pointer items-center gap-3 p-4 text-left transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-tertiary-400 sm:p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/65"><CalendarOff size={20} aria-hidden="true" /></span>
          <span className="flex-1"><span className="block text-base font-semibold text-white">Absences & créneaux bloqués</span><span className="mt-1 block text-sm text-white/55">Gérez les congés et les indisponibilités du salon ou des artistes.</span></span>
          <ChevronDown size={19} aria-hidden="true" className={`shrink-0 text-white/60 transition-transform ${isBlockedSlotsVisible ? "rotate-180" : ""}`} />
        </button>
        <div id="account-blocked-slots" hidden={!isBlockedSlotsVisible}>
          {isBlockedSlotsVisible && <div className="border-t border-white/10 p-4 sm:p-5"><BlockedSlots userId={salonId} tatoueurs={tatoueurs} /></div>}
        </div>
      </div>
    </div>
  );
}
