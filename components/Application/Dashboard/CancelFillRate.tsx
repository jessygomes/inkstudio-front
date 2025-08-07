/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect } from "react";

interface CancellationRateData {
  error: boolean;
  userId: string;
  totalAppointments: number;
  cancelledAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancellationRate: number;
  confirmationRate: number;
  message: string;
}

interface CancelFillRateProps {
  userId: string;
}

export default function CancelFillRate({ userId }: CancelFillRateProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CancellationRateData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCancellationRate = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/cancellation-rate/${userId}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du taux d'annulation");
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
    fetchCancellationRate();
  }, [userId]);

  const getCancellationColor = (rate: number) => {
    if (rate <= 10) return "text-green-400";
    if (rate <= 20) return "text-yellow-400";
    if (rate <= 30) return "text-orange-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="h-full bg-noir-700 rounded-xl border border-white/20 p-3 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-white font-one">
            Taux d'annulation
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
          Taux d'annulation
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
            onClick={fetchCancellationRate}
            className="px-3 py-1 bg-tertiary-500 text-white rounded-lg hover:bg-tertiary-600 transition-colors text-xs font-one font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const cancellationRate = data?.cancellationRate || 0;

  return (
    <div className="h-full bg-noir-700 rounded-xl border border-white/20 p-3 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-white font-one">
          Taux d'annulation
        </h3>
        <div className="px-2 py-0.5 bg-tertiary-500/20 text-tertiary-400 rounded-lg text-xs font-one font-medium border border-tertiary-500/50">
          Global
        </div>
      </div>

      {/* Taux principal */}
      <div className="text-center mb-3">
        <div
          className={`text-2xl font-bold font-one mb-0.5 ${getCancellationColor(
            cancellationRate
          )}`}
        >
          {cancellationRate.toFixed(1)}%
        </div>
        <p className="text-gray-400 text-xs font-one">de RDV annulés</p>
      </div>

      {/* Indicateur visuel */}
      <div className="mb-3">
        <div className="w-full bg-slate-600 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              cancellationRate <= 10
                ? "bg-green-500"
                : cancellationRate <= 20
                ? "bg-yellow-500"
                : cancellationRate <= 30
                ? "bg-orange-500"
                : "bg-red-500"
            }`}
            style={{ width: `${Math.min(cancellationRate, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="space-y-1 text-xs font-one">
        <div className="flex justify-between items-center text-gray-400">
          <span>Total RDV:</span>
          <span className="text-gray-300">{data?.totalAppointments || 0}</span>
        </div>

        <div className="flex justify-between items-center text-gray-400">
          <span>Annulés:</span>
          <span className="text-red-400">
            {data?.cancelledAppointments || 0}
          </span>
        </div>

        <div className="flex justify-between items-center text-gray-400">
          <span>Confirmés:</span>
          <span className="text-green-400">
            {data?.confirmedAppointments || 0}
          </span>
        </div>

        <div className="pt-1 border-t border-tertiary-500/30">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-gray-400 text-xs font-one">
              Objectif: &lt;15%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
