"use client";
import { weeklyFillRateAction } from "@/lib/queries/appointment";
import React, { useState, useEffect } from "react";

interface WeeklyFillRateData {
  error: boolean;
  userId: string;
  startDate: string;
  endDate: string;
  totalSlots: number;
  filledSlots: number;
  fillRate: number;
}

interface WeeklyFillRateProps {
  userId: string;
}

export default function WeeklyFillRate({}: WeeklyFillRateProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WeeklyFillRateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lundi
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  });

  const getWeekDates = (weekStart: Date) => {
    const startOfWeek = new Date(weekStart);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      start: startOfWeek.toISOString(),
      end: endOfWeek.toISOString(),
    };
  };

  const fetchWeeklyFillRate = async (weekStart: Date) => {
    try {
      setLoading(true);
      setError(null);

      const { start, end } = getWeekDates(weekStart);

      const data = await weeklyFillRateAction(start, end);

      if (data.error) {
        throw new Error(data.message);
      }

      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyFillRate(selectedWeekStart);
  }, [selectedWeekStart]);

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeekStart = new Date(selectedWeekStart);
    if (direction === "prev") {
      newWeekStart.setDate(selectedWeekStart.getDate() - 7);
    } else {
      newWeekStart.setDate(selectedWeekStart.getDate() + 7);
    }
    setSelectedWeekStart(newWeekStart);
  };

  const isCurrentWeek = () => {
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1);
    currentWeekStart.setHours(0, 0, 0, 0);

    return selectedWeekStart.getTime() === currentWeekStart.getTime();
  };

  const getWeekLabel = () => {
    const endOfWeek = new Date(selectedWeekStart);
    endOfWeek.setDate(selectedWeekStart.getDate() + 6);

    return `${selectedWeekStart.getDate().toString().padStart(2, "0")}/${
      selectedWeekStart.getMonth() + 1
    }-${endOfWeek.getDate().toString().padStart(2, "0")}/${
      endOfWeek.getMonth() + 1
    }`;
  };

  const getFillRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-400";
    if (rate >= 60) return "text-yellow-400";
    if (rate >= 40) return "text-orange-400";
    return "text-red-400";
  };

  // const getFillRateGradient = (rate: number) => {
  //   if (rate >= 80) return "from-green-600 to-green-400";
  //   if (rate >= 60) return "from-yellow-600 to-yellow-400";
  //   if (rate >= 40) return "from-orange-600 to-orange-400";
  //   return "from-red-600 to-red-400";
  // };

  if (loading) {
    return (
      <div className="h-full bg-noir-700 rounded-xl border border-white/20 p-3 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-white font-one">
            Taux de remplissage
          </h3>
          <div className="w-4 h-4 border-2 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-slate-300/10 rounded"></div>
          <div className="h-6 bg-slate-300/10 rounded"></div>
          <div className="h-2 bg-slate-300/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-noir-700 rounded-xl border border-white/20 p-3 shadow-2xl">
        <h3 className="text-xs font-bold text-white font-one mb-3">
          Taux de remplissage
        </h3>
        <div className="text-center py-4">
          <div className="w-8 h-8 bg-red-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
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
            onClick={() => fetchWeeklyFillRate(selectedWeekStart)}
            className="cursor-pointer px-3 py-1 bg-tertiary-500 text-white rounded-lg hover:bg-tertiary-600 transition-colors text-xs font-one font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const fillRate = data?.fillRate || 0;

  return (
    <div className="h-full bg-noir-700 rounded-xl border border-white/20 p-3 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-white font-one">
          Taux de remplissage
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateWeek("prev")}
            className="cursor-pointer w-6 h-6 rounded-lg bg-tertiary-500/20 border border-tertiary-500/50 flex items-center justify-center hover:bg-tertiary-500/30 transition-colors"
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
          <div className="px-2 py-0.5 bg-tertiary-500/20 text-tertiary-400 rounded-lg text-xs font-one font-medium border border-tertiary-500/50 min-w-[70px] text-center">
            {getWeekLabel()}
          </div>
          <button
            onClick={() => navigateWeek("next")}
            disabled={isCurrentWeek()}
            className="cursor-pointer w-6 h-6 rounded-lg bg-tertiary-500/20 border border-tertiary-500/50 flex items-center justify-center hover:bg-tertiary-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="text-center mb-3">
        <div
          className={`text-2xl font-bold font-one mb-0.5 ${getFillRateColor(
            fillRate
          )}`}
        >
          {fillRate.toFixed(1)}%
        </div>
        <p className="text-gray-400 text-xs font-one">créneaux occupés</p>
      </div>

      {/* Barre de progression circulaire compacte */}
      <div className="relative w-16 h-16 mx-auto mb-3">
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgb(51, 65, 85)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={`url(#gradient-${Math.round(fillRate)})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - fillRate / 100)}`}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient
              id={`gradient-${Math.round(fillRate)}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                stopColor={
                  fillRate >= 80
                    ? "#16a34a"
                    : fillRate >= 60
                    ? "#eab308"
                    : fillRate >= 40
                    ? "#ea580c"
                    : "#dc2626"
                }
              />
              <stop
                offset="100%"
                stopColor={
                  fillRate >= 80
                    ? "#22c55e"
                    : fillRate >= 60
                    ? "#fbbf24"
                    : fillRate >= 40
                    ? "#fb923c"
                    : "#ef4444"
                }
              />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Statistiques compactes */}
      <div className="space-y-1 text-xs font-one">
        <div className="flex justify-between items-center text-gray-400">
          <span>Créneaux:</span>
          <span className="text-gray-300">
            {data?.filledSlots || 0}/{data?.totalSlots || 0}
          </span>
        </div>

        <div className="flex justify-between items-center text-gray-400">
          <span>Période:</span>
          <span className="text-gray-300">
            {new Date(data?.startDate || "").toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
            })}
            -
            {new Date(data?.endDate || "").toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
        </div>

        {/* <div className="pt-1 border-t border-tertiary-500/30">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-gray-400 text-xs font-one">
              Objectif: 75%
            </span>
          </div>
        </div> */}
      </div>
    </div>
  );
}
