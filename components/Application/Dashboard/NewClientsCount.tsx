"use client";
import React, { useState, useEffect } from "react";

interface NewClientsData {
  error: boolean;
  month: number;
  year: number;
  newClientsCount: number;
  message?: string;
}

interface NewClientsCountProps {
  userId: string;
}

export default function NewClientsCount({ userId }: NewClientsCountProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<NewClientsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.getMonth() + 1;
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date();
    return now.getFullYear();
  });

  const getCurrentMonthYear = () => {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
  };

  const fetchNewClientsCount = async (month: number, year: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/clients/new-clients-count/${userId}?month=${month}&year=${year}`
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération du nombre de nouveaux clients"
        );
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.message);
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewClientsCount(selectedMonth, selectedYear);
  }, [userId, selectedMonth, selectedYear]);

  const navigateMonth = (direction: "prev" | "next") => {
    let newMonth = selectedMonth;
    let newYear = selectedYear;

    if (direction === "prev") {
      newMonth -= 1;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
    } else {
      newMonth += 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const isCurrentMonth = () => {
    const { month, year } = getCurrentMonthYear();
    return selectedMonth === month && selectedYear === year;
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    return months[monthNumber - 1] || "";
  };

  if (loading) {
    return (
      <div className="h-full bg-noir-700 rounded-xl border border-white/20 p-3 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-white font-one">
            Nouveaux clients
          </h3>
          <div className="w-4 h-4 border-2 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-slate-300/10 rounded"></div>
          <div className="h-3 bg-slate-300/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-noir-700 rounded-xl border border-white/20 p-3 shadow-2xl">
        <h3 className="text-xs font-bold text-white font-one mb-3">
          Nouveaux clients
        </h3>
        <div className="text-center py-4">
          <div className="w-8 h-8 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg
              className="w-4 h-4 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-400 mb-2 text-xs font-one font-medium">
            {error}
          </p>
          <button
            onClick={() => fetchNewClientsCount(selectedMonth, selectedYear)}
            className="px-3 py-1 bg-tertiary-500 text-white rounded-lg hover:bg-tertiary-600 transition-colors text-xs font-one font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const newClientsCount = data?.newClientsCount || 0;

  return (
    <div className="h-full bg-noir-700 rounded-xl border border-white/20 p-3 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-white font-one">
          Nouveaux clients
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateMonth("prev")}
            className="cursor-pointer w-6 h-6 rounded-full bg-tertiary-500/20 border border-tertiary-500/50 flex items-center justify-center hover:bg-tertiary-500/30 transition-colors"
          >
            <svg
              className="w-3 h-3 text-tertiary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="px-2 py-0.5 bg-tertiary-500/20 text-tertiary-400 rounded-full text-xs font-one font-medium border border-tertiary-500/50 min-w-[60px] text-center">
            {getMonthName(selectedMonth)}
          </div>
          <button
            onClick={() => navigateMonth("next")}
            disabled={isCurrentMonth()}
            className="cursor-pointer w-6 h-6 rounded-full bg-tertiary-500/20 border border-tertiary-500/50 flex items-center justify-center hover:bg-tertiary-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-3 h-3 text-tertiary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Nombre principal */}
      <div className="text-center mb-3">
        <div className="text-2xl font-bold font-one mb-0.5 text-tertiary-400">
          {newClientsCount}
        </div>
        <p className="text-gray-400 text-xs font-one">
          {newClientsCount <= 1 ? "nouveau client" : "nouveaux clients"}
        </p>
      </div>

      {/* Icône et statistiques */}
      <div className="flex items-center justify-center mb-3">
        <div className="w-12 h-12 bg-tertiary-500/20 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-tertiary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a.5.5 0 01.5.5v.5"
            />
          </svg>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="space-y-1 text-xs font-one">
        <div className="flex justify-between items-center text-gray-400">
          <span>Période:</span>
          <span className="text-gray-300">
            {getMonthName(selectedMonth)} {selectedYear}
          </span>
        </div>

        <div className="pt-1 border-t border-tertiary-500/30">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-tertiary-500"></div>
            <span className="text-gray-400 text-xs font-one">
              {newClientsCount >= 10
                ? "Excellent mois!"
                : newClientsCount >= 5
                ? "Bon mois"
                : "À développer"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
