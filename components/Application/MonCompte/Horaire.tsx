"use client";
import React, { useState, useEffect } from "react";
import { CalendarOff, Clock3, Pencil } from "lucide-react";
import BlockedSlotsDrawer from "./BlockedSlotsDrawer";
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
    <div className="space-y-4 font-one [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_a]:cursor-pointer [&_select]:cursor-pointer [&_button:focus-visible]:outline-none [&_button:focus-visible]:ring-2 [&_button:focus-visible]:ring-tertiary-400">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-tertiary-400"><Clock3 size={17} aria-hidden="true" /></span>
          <div>
            <h3 className="text-sm font-medium text-white">Votre semaine type</h3>
            <p className="mt-1 text-[11px] text-white/40">{hasHours ? `${openDays} jour${openDays > 1 ? "s" : ""} d’ouverture par semaine` : "Définissez vos horaires pour informer vos clients."}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" aria-haspopup="dialog" onClick={() => setIsBlockedSlotsVisible(true)} className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/70 transition hover:bg-white/10 hover:text-white"><CalendarOff size={14} aria-hidden="true" />Absences & créneaux bloqués</button>
          <DashboardButton href="/mon-compte/horaires" variant="secondary" aria-label={hasHours ? "Modifier les horaires" : "Configurer les horaires"} className="!size-9 !min-w-0 !rounded-xl !p-0">
            <Pencil size={15} aria-hidden="true" />
          </DashboardButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {daysOfWeek.map(day => {
          const dayHours = salonHoursState?.[day.key as keyof SalonHours];
          const isOpen = Boolean(dayHours?.start && dayHours?.end);
          return (
            <div key={day.key} className={`min-w-0 rounded-xl border px-3 py-3 ${isOpen ? "border-white/10 bg-noir-600" : "border-white/[0.06] bg-black/10"}`}>
              <div className="flex items-center justify-between gap-2">
                <p className={`text-xs font-medium ${isOpen ? "text-white/80" : "text-white/35"}`}>{day.label}</p>
                <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${isOpen ? "bg-emerald-400" : "bg-white/20"}`} />
              </div>
              <div className="mt-2">
                {isOpen ? <p className="whitespace-nowrap text-[11px] tabular-nums text-emerald-400">{dayHours!.start}<span className="mx-1 text-white/25">–</span>{dayHours!.end}</p> : <p className="text-[11px] text-white/30">{hasHours ? "Fermé" : "À renseigner"}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {isBlockedSlotsVisible && <BlockedSlotsDrawer userId={salonId} tatoueurs={tatoueurs} onClose={() => setIsBlockedSlotsVisible(false)} />}
    </div>
  );
}
