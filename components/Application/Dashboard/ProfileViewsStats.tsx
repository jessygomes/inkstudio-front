"use client";

import {
  getSalonComparativeStatsAction,
  getSalonRealtimeStatsAction,
  getSalonStatsAction,
  SalonAnalyticsComparativeDto,
  SalonAnalyticsRealtimeDto,
  SalonAnalyticsStatsDto,
} from "@/lib/queries/salon-analytics.actions";
import { useCallback, useEffect, useMemo, useState } from "react";

type DaysFilter = 7 | 30 | 90;

interface ProfileViewsStatsProps {
  userId: string;
}

const DAY_FILTERS: DaysFilter[] = [7, 30, 90];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value);

const isUnknownValue = (value: string) => {
  const normalized = value.trim().toLowerCase();
  return !normalized || normalized === "unknown" || normalized === "unknow";
};

const getTopEntries = (input: Record<string, number> | undefined, limit = 4) => {
  if (!input) return [];

  return Object.entries(input)
    .filter(([label]) => !isUnknownValue(label))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
};

const getTrendMeta = (comparative: SalonAnalyticsComparativeDto | null) => {
  if (!comparative) {
    return {
      label: "N/A",
      className: "text-white/60",
      icon: "-",
    };
  }

  if (comparative.trend === "UP") {
    return {
      label: "Hausse",
      className: "text-emerald-400",
      icon: "↑",
    };
  }

  if (comparative.trend === "DOWN") {
    return {
      label: "Baisse",
      className: "text-rose-400",
      icon: "↓",
    };
  }

  return {
    label: "Stable",
    className: "text-white/70",
    icon: "→",
  };
};

export default function ProfileViewsStats({ userId }: ProfileViewsStatsProps) {
  const [days, setDays] = useState<DaysFilter>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalTotalViews, setGlobalTotalViews] = useState<number | null>(null);

  const [stats, setStats] = useState<SalonAnalyticsStatsDto | null>(null);
  const [realtime, setRealtime] = useState<SalonAnalyticsRealtimeDto | null>(null);
  const [comparative, setComparative] =
    useState<SalonAnalyticsComparativeDto | null>(null);

  const topDevices = useMemo(
    () => getTopEntries(stats?.viewsByDeviceType, 3),
    [stats?.viewsByDeviceType],
  );
  const topReferrers = useMemo(
    () => getTopEntries(stats?.viewsByReferrer, 4),
    [stats?.viewsByReferrer],
  );
  const trend = useMemo(() => getTrendMeta(comparative), [comparative]);

  const fetchAnalytics = useCallback(async (nextDays: DaysFilter) => {
    if (!userId) {
      setError("Utilisateur introuvable pour charger les statistiques.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [statsRes, realtimeRes, comparativeRes] = await Promise.all([
        getSalonStatsAction(userId, nextDays),
        getSalonRealtimeStatsAction(userId),
        getSalonComparativeStatsAction(userId),
      ]);

      if (!statsRes.ok || !statsRes.data) {
        throw new Error(statsRes.message || "Impossible de charger les stats.");
      }

      setStats(statsRes.data);
      setRealtime(realtimeRes.ok && realtimeRes.data ? realtimeRes.data : null);
      setComparative(
        comparativeRes.ok && comparativeRes.data ? comparativeRes.data : null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchGlobalTotalViews = useCallback(async () => {
    if (!userId) {
      setGlobalTotalViews(null);
      return;
    }

    const allTimeDays = 36500;
    const globalRes = await getSalonStatsAction(userId, allTimeDays);

    if (globalRes.ok && globalRes.data) {
      setGlobalTotalViews(globalRes.data.totalViews ?? 0);
      return;
    }

    setGlobalTotalViews(null);
  }, [userId]);

  useEffect(() => {
    fetchAnalytics(days);
  }, [days, fetchAnalytics]);

  useEffect(() => {
    fetchGlobalTotalViews();
  }, [fetchGlobalTotalViews]);

  if (loading) {
    return (
      <div className="dashboard-panel bg-noir-500 p-4 lg:p-5">
        <div className="dashboard-panel-content">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-white font-one text-sm font-semibold">
              Visites du profil public
            </h3>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-tertiary-500/50 border-t-tertiary-400" />
          </div>
          <div className="space-y-2.5 animate-pulse">
            <div className="h-16 rounded-xl bg-white/5" />
            <div className="h-16 rounded-xl bg-white/5" />
            <div className="h-16 rounded-xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-panel bg-noir-500 p-4 lg:p-5">
        <div className="dashboard-panel-content">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-white font-one text-sm font-semibold">
              Visites du profil public
            </h3>
          </div>

          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
            <p className="text-sm text-rose-300 font-one">{error}</p>
            <button
              onClick={() => fetchAnalytics(days)}
              className="mt-3 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/20 font-one"
            >
              Reessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-noir-500 p-4 lg:p-5">
      <div className="dashboard-panel-content space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-white font-one text-sm font-semibold">
            Visites du profil public
          </h3>

          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {DAY_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setDays(filter)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-one transition-colors ${
                  days === filter
                    ? "bg-tertiary-500/30 text-white"
                    : "text-white/65 hover:text-white"
                }`}
              >
                {filter}j
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
          <div className="rounded-xl border border-tertiary-500/20 bg-gradient-to-br from-tertiary-500/10 to-transparent p-3">
            <p className="text-[11px] text-white/55 font-one">Total vues</p>
            <p className="mt-1 text-2xl text-white font-semibold font-one">
              {formatNumber(stats?.totalViews ?? 0)}
            </p>
            <p className="mt-1 text-[10px] text-white/45 font-one">
              sur {days} jours
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] text-white/55 font-one">Visiteurs uniques</p>
            <p className="mt-1 text-2xl text-white font-semibold font-one">
              {formatNumber(stats?.uniqueVisitors ?? 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] text-white/55 font-one">Dernieres 24h</p>
            <p className="mt-1 text-2xl text-white font-semibold font-one">
              {formatNumber(realtime?.views24h ?? 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] text-white/55 font-one">Total global</p>
            <p className="mt-1 text-2xl text-white font-semibold font-one">
              {globalTotalViews === null ? "-" : formatNumber(globalTotalViews)}
            </p>
            <p className="mt-1 text-[10px] text-white/45 font-one">
              depuis le debut
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] text-white/55 font-one">Tendance 30j</p>
            <p className={`mt-1 text-lg font-semibold font-one ${trend.className}`}>
              <span className="mr-1">{trend.icon}</span>
              {trend.label}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="mb-2 text-xs text-white/70 font-one">Appareils</p>
            {topDevices.length === 0 ? (
              <p className="text-[11px] text-white/50 font-one">Aucune donnee exploitable</p>
            ) : (
              <div className="space-y-2">
                {topDevices.map(([label, count]) => {
                  const knownDevicesTotal = topDevices.reduce(
                    (sum, [, value]) => sum + value,
                    0,
                  );
                  const percent = knownDevicesTotal
                    ? Math.round((count / knownDevicesTotal) * 100)
                    : 0;
                  return (
                    <div key={label}>
                      <div className="mb-1 flex items-center justify-between text-[11px] text-white/70 font-one">
                        <span className="truncate capitalize">{label}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-tertiary-500 to-tertiary-400"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-noir-500 p-3">
            <p className="mb-2 text-xs text-white/70 font-one">Top sources de trafic</p>
            {topReferrers.length === 0 ? (
              <p className="text-[11px] text-white/50 font-one">Aucune donnee exploitable</p>
            ) : (
              <div className="space-y-1.5">
                {topReferrers.map(([label, count]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-lg bg-white/[0.04] px-2.5 py-1.5"
                  >
                    <p className="max-w-[72%] truncate text-[11px] text-white/75 font-one">
                      {label}
                    </p>
                    <p className="text-[11px] text-white/60 font-one">
                      {formatNumber(count)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
