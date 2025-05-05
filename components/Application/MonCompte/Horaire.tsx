/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from "react";

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
  salonId,
}: HoraireProps) {
  const [showModal, setShowModal] = useState(false);

  const initialHours: SalonHours = hours
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

  const [editingHours, setEditingHours] = useState<SalonHours>(initialHours);
  const [salonHoursState, setSalonHoursState] = useState<SalonHours | null>(
    initialHours
  );

  const hasHours = salonHoursState && Object.keys(salonHoursState).length > 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/${salonId}/hours`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingHours),
      }
    );

    if (res.ok) {
      setSalonHoursState(editingHours); // Met à jour dynamiquement l'affichage
      setShowModal(false);
    } else {
      console.error("Erreur lors de la mise à jour des horaires");
    }
  };

  return (
    <>
      <article className="p-2 rounded-[20px]">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsHoursVisible(!isHoursVisible)}
            className="flex items-center gap-2 cursor-pointer text-white font-bold font-one"
          >
            {hasHours
              ? "Mes horaires d'ouverture"
              : "Indiquez vos horaires d'ouverture"}
            <span
              className={`transform transition-transform ${
                isHoursVisible ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </button>
          <button
            onClick={() => {
              setEditingHours(salonHoursState || initialHours);
              setShowModal(true);
            }}
            className="text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[400px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
          >
            {hasHours
              ? "Modifier les horaires"
              : "Ajouter les horaires du salon"}
          </button>
        </div>

        {isHoursVisible && (
          <ul className="text-white mt-2 font-two overflow-hidden">
            {daysOfWeek.map((day) => {
              const hours = salonHoursState?.[day.key as keyof SalonHours];
              return (
                <li key={day.key} className="flex gap-2">
                  <span className="w-1/6">{day.label} :</span>
                  <span>
                    {hours ? `${hours.start} - ${hours.end}` : "Fermé"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </article>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-primary-500 rounded-lg p-6 w-[90%] max-w-[500px] space-y-4 text-white"
          >
            <h2 className="text-lg font-bold text-center font-two">
              Modifier les horaires
            </h2>
            {daysOfWeek.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-2"
              >
                <label className="w-1/4">{label}</label>
                {editingHours[key as keyof SalonHours] ? (
                  <>
                    <input
                      type="time"
                      value={editingHours[key as keyof SalonHours]?.start ?? ""}
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
                    />
                    <input
                      type="time"
                      value={editingHours[key as keyof SalonHours]?.end ?? ""}
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
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingHours((prev) => ({
                          ...prev,
                          [key]: null,
                        }))
                      }
                      className="cursor-pointer text-xs p-1 rounded-[20px] bg-red-900 text-white"
                    >
                      Fermer le salon
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingHours((prev) => ({
                        ...prev,
                        [key]: { start: "", end: "" },
                      }))
                    }
                    className="cursor-pointer text-xs p-1 rounded-[20px] bg-green-900 text-white"
                  >
                    Ouvrir le salon
                  </button>
                )}
              </div>
            ))}

            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cursor-pointer text-xs p-2 rounded-[20px] bg-red-900 text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[400px] text-center text-white py-2 px-4 rounded-[20px] hover:scale-105 transition"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
