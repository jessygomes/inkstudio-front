"use client";

import { useState, useEffect } from "react";
import { getAdminDashboardStats } from "@/lib/queries/admin";
import {
  FiUsers,
  FiShield,
  FiBarChart2,
  FiCalendar,
  FiTrendingUp,
  FiUserCheck,
} from "react-icons/fi";

interface Stats {
  totalSalons?: number;
  totalClients?: number;
  salonsWithPendingDocuments?: number;
  salonsVerified?: number;
  newSalonsThisMonth?: number;
  newClientsThisMonth?: number;
  totalTatoueurs?: number;
  totalAppointments?: number;
  salonsBySaasPlan?: {
    FREE?: number;
    PRO?: number;
    BUSINESS?: number;
  };
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const result = await getAdminDashboardStats();
        if (result.ok && result.stats) {
          setStats(result.stats);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 shadow-lg animate-pulse"
            >
              <div className="h-20" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 shadow-lg animate-pulse"
            >
              <div className="h-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Salons */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-tertiary-400/50 hover:from-white/15 transition-all duration-300 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/70 font-one">
              Total Salons
            </h3>
            <FiUsers className="w-5 h-5 text-tertiary-400" />
          </div>
          <div className="text-3xl font-bold text-white font-one">
            {stats?.totalSalons ?? 0}
          </div>
          <p className="text-xs text-white/50 mt-1">Salons inscrits</p>
        </div>

        {/* Total Clients */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-tertiary-400/50 hover:from-white/15 transition-all duration-300 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/70 font-one">
              Total Clients
            </h3>
            <FiUserCheck className="w-5 h-5 text-cuatro-500" />
          </div>
          <div className="text-3xl font-bold text-white font-one">
            {stats?.totalClients ?? 0}
          </div>
          <p className="text-xs text-white/50 mt-1">Clients enregistrés</p>
        </div>

        {/* Vérifications en attente */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-primary-400/50 hover:from-white/15 transition-all duration-300 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/70 font-one">
              En attente
            </h3>
            <FiShield className="w-5 h-5 text-primary-400" />
          </div>
          <div className="text-3xl font-bold text-white font-one">
            {stats?.salonsWithPendingDocuments ?? 0}
          </div>
          <p className="text-xs text-white/50 mt-1">Documents à vérifier</p>
        </div>

        {/* Salons vérifiés */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-green-400/50 hover:from-white/15 transition-all duration-300 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/70 font-one">
              Vérifiés
            </h3>
            <FiShield className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white font-one">
            {stats?.salonsVerified ?? 0}
          </div>
          <p className="text-xs text-white/50 mt-1">Salons validés</p>
        </div>
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nouveaux salons ce mois */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-tertiary-400/50 hover:from-white/15 transition-all duration-300 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/70 font-one">
              Nouveaux Salons
            </h3>
            <FiTrendingUp className="w-5 h-5 text-tertiary-400" />
          </div>
          <div className="text-3xl font-bold text-white font-one">
            {stats?.newSalonsThisMonth ?? 0}
          </div>
          <p className="text-xs text-white/50 mt-1">Ce mois-ci</p>
        </div>

        {/* Nouveaux clients ce mois */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-cuatro-500/50 hover:from-white/15 transition-all duration-300 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/70 font-one">
              Nouveaux Clients
            </h3>
            <FiTrendingUp className="w-5 h-5 text-cuatro-500" />
          </div>
          <div className="text-3xl font-bold text-white font-one">
            {stats?.newClientsThisMonth ?? 0}
          </div>
          <p className="text-xs text-white/50 mt-1">Ce mois-ci</p>
        </div>

        {/* Total Tatoueurs */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-secondary-400/50 hover:from-white/15 transition-all duration-300 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/70 font-one">
              Tatoueurs
            </h3>
            <FiUsers className="w-5 h-5 text-secondary-400" />
          </div>
          <div className="text-3xl font-bold text-white font-one">
            {stats?.totalTatoueurs ?? 0}
          </div>
          <p className="text-xs text-white/50 mt-1">Total actifs</p>
        </div>

        {/* Total Rendez-vous */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-primary-400/50 hover:from-white/15 transition-all duration-300 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/70 font-one">
              Rendez-vous
            </h3>
            <FiCalendar className="w-5 h-5 text-primary-400" />
          </div>
          <div className="text-3xl font-bold text-white font-one">
            {stats?.totalAppointments ?? 0}
          </div>
          <p className="text-xs text-white/50 mt-1">Total réservations</p>
        </div>
      </div>

      {/* Répartition par plan SaaS */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 shadow-lg">
        <h3 className="text-base font-bold text-white font-one mb-4 flex items-center gap-2">
          <FiBarChart2 className="w-5 h-5 text-tertiary-400" />
          Répartition par Plan SaaS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-xs text-white/60 font-one uppercase tracking-wide">
                FREE
              </p>
              <p className="text-2xl font-bold text-white font-one mt-1">
                {stats?.salonsBySaasPlan?.FREE ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-xl">🆓</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-xs text-white/60 font-one uppercase tracking-wide">
                PRO
              </p>
              <p className="text-2xl font-bold text-white font-one mt-1">
                {stats?.salonsBySaasPlan?.PRO ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-tertiary-500/20 flex items-center justify-center">
              <span className="text-xl">⭐</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-xs text-white/60 font-one uppercase tracking-wide">
                BUSINESS
              </p>
              <p className="text-2xl font-bold text-white font-one mt-1">
                {stats?.salonsBySaasPlan?.BUSINESS ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
              <span className="text-xl">💼</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
