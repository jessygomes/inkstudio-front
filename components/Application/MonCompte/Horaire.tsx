"use client";
import React from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
    <article className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setIsHoursVisible(!isHoursVisible)}
          className="group flex items-center gap-3 cursor-pointer text-white font-bold font-one hover:text-tertiary-300 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{hasHours ? "📅" : "⏰"}</span>
            <span className="text-lg">
              {hasHours
                ? "Horaires configurés"
                : "Configurer les horaires d'ouverture"}
            </span>
          </div>
          <div
            className={`transform transition-transform duration-300 ${
              isHoursVisible ? "rotate-180" : "rotate-0"
            }`}
          >
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm">▼</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push("/mon-compte/horaires")}
          className="text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[200px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
        >
          <span className="flex items-center justify-center gap-2">
            <span>{hasHours ? "Modifier" : "Ajouter"}</span>
          </span>
        </button>
      </div>

      {isHoursVisible && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-3">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>📋</span>
            <span>Planning de la semaine</span>
          </h3>
          <div className="grid gap-3">
            {daysOfWeek.map((day) => {
              const hours = salonHoursState?.[day.key as keyof SalonHours];
              const isOpen = !!hours;

              return (
                <div
                  key={day.key}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                >
                  <span className="w-24 text-white font-medium font-one">
                    {day.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isOpen ? "bg-green-400" : "bg-red-400"
                      }`}
                    />
                    <span className="text-white font-two min-w-[120px]">
                      {hours ? `${hours.start} - ${hours.end}` : "Fermé"}
                    </span>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
    </article>
  );
}
