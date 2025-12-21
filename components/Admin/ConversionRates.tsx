"use client";

import { useState, useEffect } from "react";
import { getAdminDashboardStats } from "@/lib/queries/admin";
import { FiTrendingUp, FiPercent } from "react-icons/fi";

interface SaasPlanStats {
  FREE?: number;
  PRO?: number;
  BUSINESS?: number;
}

export default function ConversionRates() {
  const [stats, setStats] = useState<SaasPlanStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const result = await getAdminDashboardStats();
        if (result.ok && result.stats?.salonsBySaasPlan) {
          setStats(result.stats.salonsBySaasPlan);
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
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6 animate-pulse">
        <div className="h-64" />
      </div>
    );
  }

  const total = (stats?.FREE || 0) + (stats?.PRO || 0) + (stats?.BUSINESS || 0);
  const freePercent = total > 0 ? ((stats?.FREE || 0) / total) * 100 : 0;
  const proPercent = total > 0 ? ((stats?.PRO || 0) / total) * 100 : 0;
  const businessPercent =
    total > 0 ? ((stats?.BUSINESS || 0) / total) * 100 : 0;

  // Taux de conversion vers plans payants
  const paidConversionRate =
    total > 0
      ? (((stats?.PRO || 0) + (stats?.BUSINESS || 0)) / total) * 100
      : 0;

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-tertiary-500/20 rounded-lg flex items-center justify-center">
            <FiPercent className="w-5 h-5 text-tertiary-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-one">
              Taux de conversion par plan SaaS
            </h3>
            <p className="text-xs text-white/60">Répartition actuelle</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-green-400">
          <FiTrendingUp size={16} />
          <span className="text-sm font-one font-medium">
            {paidConversionRate.toFixed(0)}% payant
          </span>
        </div>
      </div>

      {/* Barre de progression globale */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/70 font-one">
            Répartition globale
          </span>
          <span className="text-xs text-white/70 font-one">{total} salons</span>
        </div>
        <div className="h-8 bg-white/10 rounded-lg overflow-hidden flex">
          {freePercent > 0 && (
            <div
              className="bg-gradient-to-r from-white/30 to-white/20 flex items-center justify-center transition-all duration-500"
              style={{ width: `${freePercent}%` }}
            >
              <span className="text-[10px] font-bold text-white font-one">
                {freePercent.toFixed(0)}%
              </span>
            </div>
          )}
          {proPercent > 0 && (
            <div
              className="bg-gradient-to-r from-tertiary-500 to-tertiary-400 flex items-center justify-center transition-all duration-500"
              style={{ width: `${proPercent}%` }}
            >
              <span className="text-[10px] font-bold text-white font-one">
                {proPercent.toFixed(0)}%
              </span>
            </div>
          )}
          {businessPercent > 0 && (
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-400 flex items-center justify-center transition-all duration-500"
              style={{ width: `${businessPercent}%` }}
            >
              <span className="text-[10px] font-bold text-white font-one">
                {businessPercent.toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Détails par plan */}
      <div className="space-y-4">
        {/* FREE */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-sm">🆓</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white font-one">
                  Plan FREE
                </p>
                <p className="text-xs text-white/60">Gratuit</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white font-one">
                {stats?.FREE || 0}
              </p>
              <p className="text-xs text-white/60">{freePercent.toFixed(1)}%</p>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-white/30 to-white/20 transition-all duration-500"
              style={{ width: `${freePercent}%` }}
            />
          </div>
        </div>

        {/* PRO */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-tertiary-500/30 flex items-center justify-center">
                <span className="text-sm">⭐</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white font-one">
                  Plan PRO
                </p>
                <p className="text-xs text-white/60">29€/mois</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white font-one">
                {stats?.PRO || 0}
              </p>
              <p className="text-xs text-white/60">{proPercent.toFixed(1)}%</p>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-tertiary-500 to-tertiary-400 transition-all duration-500"
              style={{ width: `${proPercent}%` }}
            />
          </div>
        </div>

        {/* BUSINESS */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/30 flex items-center justify-center">
                <span className="text-sm">💼</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white font-one">
                  Plan BUSINESS
                </p>
                <p className="text-xs text-white/60">79€/mois</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white font-one">
                {stats?.BUSINESS || 0}
              </p>
              <p className="text-xs text-white/60">
                {businessPercent.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500"
              style={{ width: `${businessPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-6 p-4 bg-tertiary-500/10 border border-tertiary-400/30 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-tertiary-500/20 flex items-center justify-center flex-shrink-0">
            <FiTrendingUp className="w-4 h-4 text-tertiary-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white font-one mb-1">
              Analyse de conversion
            </p>
            <p className="text-xs text-white/70 leading-relaxed">
              {paidConversionRate.toFixed(0)}% des salons utilisent un plan
              payant.{" "}
              {paidConversionRate < 50
                ? "Il y a un potentiel d'amélioration de la conversion vers les plans PRO et BUSINESS."
                : "Excellent taux de conversion vers les plans payants !"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
