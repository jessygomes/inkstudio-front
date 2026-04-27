"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import BlockedSlots from "./BlockedSlots";

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

  const salonHoursState: SalonHours | null = hours
    ? JSON.parse(hours)
    : {
        monday: { start: "", end: "" },
        tuesday: { start: "", end: "" },
        wednesday: { start: "", end: "" },
        thursday: { start: "", end: "" },
        friday: { start: "", end: "" },
        saturday: { start: "", end: "" },
        sunday: null,
      };

  const hasHours = salonHoursState && Object.keys(salonHoursState).length > 0;

  return (
    <div className="space-y-4">
      {/* Horaires */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">Planning hebdomadaire</p>
          <Link
            href="/mon-compte/horaires"
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-[14px] transition-all duration-300 font-medium font-one text-xs"
          >
            {hasHours ? "Modifier" : "Configurer"}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
          {daysOfWeek.map((day) => {
            const dayHours = salonHoursState?.[day.key as keyof SalonHours];
            const isOpen = !!dayHours && dayHours.start && dayHours.end;
            return (
              <div
                key={day.key}
                className={`rounded-xl px-3 py-2 border flex flex-col gap-0.5 ${
                  isOpen
                    ? "bg-green-500/8 border-green-500/20"
                    : "bg-white/4 border-white/8"
                }`}
              >
                <span className="text-white/60 font-one text-[10px] uppercase tracking-wider">
                  {day.label.slice(0, 3)}
                </span>
                {isOpen ? (
                  <span className="text-white font-one text-xs">
                    {dayHours!.start} – {dayHours!.end}
                  </span>
                ) : (
                  <span className="text-white/30 font-one text-xs">Fermé</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-px w-full bg-white/8" />

      {/* Créneaux bloqués */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 font-one text-[12px] uppercase tracking-wider">Créneaux bloqués</p>
            <p className="text-white/40 font-two text-[11px] mt-0.5">Indisponibilités et congés</p>
          </div>
          <button
            onClick={() => setIsBlockedSlotsVisible(!isBlockedSlotsVisible)}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-white/8 hover:bg-white/12 text-white/70 hover:text-white border border-white/12 rounded-[14px] transition-colors font-one text-xs"
          >
            {isBlockedSlotsVisible ? "Masquer" : "Afficher"}
            <span className={`transition-transform duration-200 ${isBlockedSlotsVisible ? "rotate-180" : ""}`}>▾</span>
          </button>
        </div>

        {isBlockedSlotsVisible && (
          <BlockedSlots userId={salonId} tatoueurs={tatoueurs} />
        )}
      </div>
    </div>
  );
}
