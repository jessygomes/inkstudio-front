"use client";

import { useState, useEffect } from "react";
import { getMonthlyEvolution } from "@/lib/queries/admin";
import {
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiDollarSign,
} from "react-icons/fi";

interface MonthData {
  month: string;
  salons: number;
  appointments: number;
  revenue: number;
}

export default function EvolutionCharts() {
  const [monthsData, setMonthsData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvolution = async () => {
      try {
        setLoading(true);
        const result = await getMonthlyEvolution(6);
        console.log("Evolution data received:", result);
        if (result.ok && result.data) {
          console.log("Setting months data:", result.data);
          setMonthsData(result.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvolution();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6 animate-pulse">
          <div className="h-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6 animate-pulse">
            <div className="h-48" />
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6 animate-pulse">
            <div className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (monthsData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
        <p className="text-white/60 text-center font-one">
          Aucune donnée d&apos;évolution disponible
        </p>
      </div>
    );
  }

  const maxSalons = Math.max(...monthsData.map((d) => d.salons), 1);
  const maxAppointments = Math.max(...monthsData.map((d) => d.appointments), 1);
  const maxRevenue = Math.max(...monthsData.map((d) => d.revenue), 1);

  console.log("Max values:", { maxSalons, maxAppointments, maxRevenue });
  console.log("Months data:", monthsData);

  // Calculer les taux de croissance
  const calculateGrowth = (current: number, initial: number) => {
    if (initial === 0 && current === 0) return 0;
    if (initial === 0) return 100;
    return Math.round(((current - initial) / initial) * 100);
  };

  const salonGrowth =
    monthsData.length >= 2
      ? calculateGrowth(
          monthsData[monthsData.length - 1].salons,
          monthsData[0].salons
        )
      : 0;
  const appointmentsGrowth =
    monthsData.length >= 2
      ? calculateGrowth(
          monthsData[monthsData.length - 1].appointments,
          monthsData[0].appointments
        )
      : 0;
  const revenueGrowth =
    monthsData.length >= 2
      ? calculateGrowth(
          monthsData[monthsData.length - 1].revenue,
          monthsData[0].revenue
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Nouveaux inscrits */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tertiary-500/20 rounded-lg flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-tertiary-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-one">
                Nouveaux salons inscrits
              </h3>
              <p className="text-xs text-white/60">Évolution mensuelle</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <FiTrendingUp size={16} />
            <span className="text-sm font-one font-medium">
              {salonGrowth > 0 ? `+${salonGrowth}%` : `${salonGrowth}%`}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 h-48">
          {monthsData.map((data, index) => {
            const maxHeight = 192; // h-48 = 192px
            const heightPx = (data.salons / maxSalons) * maxHeight;
            const barHeight = data.salons > 0 ? Math.max(heightPx, 40) : 0;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="relative w-full flex items-end justify-center h-full">
                  {data.salons > 0 ? (
                    <div
                      className="w-full bg-gradient-to-t from-tertiary-500 to-tertiary-400 rounded-t-lg transition-all duration-500 hover:from-tertiary-400 hover:to-tertiary-300"
                      style={{ height: `${barHeight}px` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white font-one">
                        {data.salons}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-2 bg-white/5 rounded">
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white/40 font-one">
                        0
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-white/60 font-one">
                  {data.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendez-vous */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-one">
                  Rendez-vous
                </h3>
                <p className="text-xs text-white/60">Par mois</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <FiTrendingUp size={16} />
              <span className="text-sm font-one font-medium">
                {appointmentsGrowth > 0
                  ? `+${appointmentsGrowth}%`
                  : `${appointmentsGrowth}%`}
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-32">
            {monthsData.map((data, index) => {
              const maxHeight = 128; // h-32 = 128px
              const heightPx =
                (data.appointments / maxAppointments) * maxHeight;
              const barHeight =
                data.appointments > 0 ? Math.max(heightPx, 25) : 0;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="relative w-full flex items-end justify-center h-full">
                    {data.appointments > 0 ? (
                      <div
                        className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-500 hover:from-primary-400 hover:to-primary-300"
                        style={{ height: `${barHeight}px` }}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white font-one">
                          {data.appointments}
                        </span>
                      </div>
                    ) : (
                      <div className="w-full h-1.5 bg-white/5 rounded">
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/40 font-one">
                          0
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-white/60 font-one">
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenus */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cuatro-500/20 rounded-lg flex items-center justify-center">
                <FiDollarSign className="w-5 h-5 text-cuatro-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-one">
                  Revenus
                </h3>
                <p className="text-xs text-white/60">En euros</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <FiTrendingUp size={16} />
              <span className="text-sm font-one font-medium">
                {revenueGrowth > 0 ? `+${revenueGrowth}%` : `${revenueGrowth}%`}
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-32">
            {monthsData.map((data, index) => {
              const maxHeight = 128; // h-32 = 128px
              const heightPx = (data.revenue / maxRevenue) * maxHeight;
              const barHeight = data.revenue > 0 ? Math.max(heightPx, 25) : 0;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="relative w-full flex items-end justify-center h-full">
                    {data.revenue > 0 ? (
                      <div
                        className="w-full bg-gradient-to-t from-cuatro-500 to-cuatro-400 rounded-t-lg transition-all duration-500 hover:from-cuatro-400 hover:to-cuatro-300"
                        style={{ height: `${barHeight}px` }}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white font-one whitespace-nowrap">
                          {data.revenue}€
                        </span>
                      </div>
                    ) : (
                      <div className="w-full h-1.5 bg-white/5 rounded">
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/40 font-one whitespace-nowrap">
                          0€
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-white/60 font-one">
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
