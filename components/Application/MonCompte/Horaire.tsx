"use client";
import React from "react";
import Link from "next/link";

interface HoraireProps {
  isHoursVisible: boolean;
  hours: string | null;
  setIsHoursVisible: React.Dispatch<React.SetStateAction<boolean>>;
  salonId?: string;
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

export default function Horaire({
  isHoursVisible,
  hours,
  setIsHoursVisible,
}: HoraireProps) {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setIsHoursVisible(!isHoursVisible)}
          className="group flex items-center gap-3 cursor-pointer text-white hover:text-tertiary-300 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            {/* <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-sm">{hasHours ? "📅" : "⏰"}</span>
            </div> */}
            <div className="text-left">
              <p className="text-sm font-semibold font-one tracking-widest">
                {hasHours ? "Horaires configurés" : "Configurer les horaires"}
              </p>
              <p className="text-xs text-white/60 font-two">
                {hasHours
                  ? "Cliquez pour voir le planning"
                  : "Définir les heures d'ouverture"}
              </p>
            </div>
          </div>
          <div
            className={`transform transition-transform duration-300 ${
              isHoursVisible ? "rotate-180" : "rotate-0"
            }`}
          >
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xs">▼</span>
            </div>
          </div>
        </button>

        <Link
          href="/mon-compte/horaires"
          className="px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs"
        >
          {hasHours ? "Modifier" : "Configurer"}
        </Link>
      </div>

      {isHoursVisible && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📋</span>
            <h4 className="text-white font-semibold font-one text-sm">
              Planning de la semaine
            </h4>
          </div>

          <div className="grid gap-2">
            {daysOfWeek.map((day) => {
              const dayHours = salonHoursState?.[day.key as keyof SalonHours];
              const isOpen = !!dayHours;

              return (
                <div
                  key={day.key}
                  className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isOpen ? "bg-green-400" : "bg-red-400"
                      }`}
                    />
                    <span className="w-20 text-white font-medium font-one text-xs">
                      {day.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-white font-two text-xs min-w-[100px] text-right">
                      {dayHours
                        ? `${dayHours.start} - ${dayHours.end}`
                        : "Fermé"}
                    </span>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        isOpen
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      }`}
                    >
                      {isOpen ? "Ouvert" : "Fermé"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
