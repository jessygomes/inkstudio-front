/* eslint-disable react/no-unescaped-entities */
"use client";
import { totalPaidAppointmentsAction } from "@/lib/queries/appointment";
import React, { useState, useEffect } from "react";

interface TotalPayedData {
  error: boolean;
  totalPaid: number;
  message: string;
}

interface TotalPayedProps {
  userId: string;
}

export default function TotalPayed({ userId }: TotalPayedProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TotalPayedData | null>(null);
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

  const fetchTotalPayed = async (month: number, year: number) => {
    try {
      setLoading(true);
      setError(null);

      const data = await totalPaidAppointmentsAction(month, year);

      if (data.error) {
        throw new Error("Une erreur est survenue");
      }

      setData(data);
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalPayed(selectedMonth, selectedYear);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="h-full bg-noir-700 rounded-xl border border-white/20 p-3 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-white font-one">
            Chiffre d'affaires
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
          Chiffre d'affaires
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
            onClick={() => fetchTotalPayed(selectedMonth, selectedYear)}
            className="px-3 py-1 bg-tertiary-500 text-white rounded-lg hover:bg-tertiary-600 transition-colors text-xs font-one font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const totalPaid = data?.totalPaid || 0;

  return (
    <div className="h-full bg-noir-700 rounded-xl border border-white/20 p-3 shadow-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-white font-one">
          Chiffre d'affaires
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateMonth("prev")}
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
          <div className="px-2 py-0.5 bg-tertiary-500/20 text-tertiary-400 rounded-lg text-xs font-one font-medium border border-tertiary-500/50 min-w-[60px] text-center">
            {getMonthName(selectedMonth)}
          </div>
          <button
            onClick={() => navigateMonth("next")}
            disabled={isCurrentMonth()}
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

      {/* Montant principal */}
      <div className="text-center mb-3">
        <div className="text-2xl font-bold font-one mb-0.5 text-green-400">
          {formatCurrency(totalPaid)}
        </div>
        <p className="text-gray-400 text-xs font-one">de tatouages payés</p>
      </div>

      {/* Icône et statistiques */}
      <div className="flex items-center justify-center mb-3">
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
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

        {/* <div className="pt-1 border-t border-tertiary-500/30">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-gray-400 text-xs font-one">
              {totalPaid >= 2000
                ? "Excellent mois!"
                : totalPaid >= 1000
                ? "Bon mois"
                : "À développer"}
            </span>
          </div>
        </div> */}
      </div>
    </div>
  );
}
