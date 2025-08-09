"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import BlockedSlots from "./BlockedSlots";

interface HoraireProps {
  isHoursVisible: boolean;
  hours: string | null;
  setIsHoursVisible: React.Dispatch<React.SetStateAction<boolean>>;
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

export default function Horaire({
  isHoursVisible,
  hours,
  setIsHoursVisible,
  salonId,
}: HoraireProps) {
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
    <div className="space-y-6">
      {/* Section horaires existante */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setIsHoursVisible(!isHoursVisible)}
          className="group flex items-center gap-3 cursor-pointer text-white hover:text-tertiary-300 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="text-sm font-one tracking-widest">
                {hasHours ? "Horaires configurés" : "Configurer les horaires"}
              </p>
              <p className="text-xs text-white/60 font-one">
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
          className="cursor-pointer w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
        >
          {hasHours ? "Modifier les horaires" : "Configurer les horaires"}
        </Link>
      </div>

      {isHoursVisible && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📋</span>
            <h4 className="text-white font-one text-sm">Horaires semaine</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-white font-one">
              <tbody>
                {daysOfWeek.map((day) => {
                  const dayHours =
                    salonHoursState?.[day.key as keyof SalonHours];
                  const isOpen = !!dayHours && dayHours.start && dayHours.end;
                  return (
                    <tr key={day.key} className="border-b border-white/10">
                      <td className="py-2 pr-2">{day.label}</td>
                      <td className="py-2 pl-2 text-right min-w-[90px]">
                        {isOpen ? `${dayHours!.start} - ${dayHours!.end}` : ""}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {isOpen ? (
                          <span className="px-6 py-1 rounded bg-green-500/20 text-green-300 border border-green-500/30">
                            Ouvert
                          </span>
                        ) : (
                          <span className="px-6 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                            Fermé
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="h-[0.5px] w-full bg-white/10"></div>

      {/* Nouvelle section créneaux bloqués */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsBlockedSlotsVisible(!isBlockedSlotsVisible)}
            className="group flex items-center gap-3 cursor-pointer text-white hover:text-tertiary-300 transition-colors duration-200"
          >
            <div className="text-left">
              <p className="text-sm font-semibold font-one tracking-widest">
                Créneaux bloqués
              </p>
              <p className="text-xs text-white/60 font-two">
                Gérer les indisponibilités et congés
              </p>
            </div>
            <div
              className={`transform transition-transform duration-300 ${
                isBlockedSlotsVisible ? "rotate-180" : "rotate-0"
              }`}
            >
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs">▼</span>
              </div>
            </div>
          </button>
        </div>

        {isBlockedSlotsVisible && (
          <BlockedSlots userId={salonId} tatoueurs={tatoueurs} />
        )}
      </div>
    </div>
  );
}
