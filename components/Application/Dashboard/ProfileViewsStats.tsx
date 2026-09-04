"use client";

import {
  getSalonComparativeStatsAction,
  getSalonRealtimeStatsAction,
  getSalonStatsAction,
  SalonAnalyticsComparativeDto,
  SalonAnalyticsRealtimeDto,
  SalonAnalyticsStatsDto,
} from "@/lib/queries/salon-analytics.actions";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Eye,
  Globe2,
  MonitorSmartphone,
  Users,
  type LucideIcon,
} from "lucide-react";
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

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  featured = false,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  featured?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-3.5 ${
        featured
          ? "border-tertiary-400/30 bg-gradient-to-br from-tertiary-500/30 via-tertiary-500/15 to-transparent"
          : "border-white/8 bg-white/[0.035]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/45 font-one">
          {label}
        </p>
        <Icon
          size={15}
          className={featured ? "text-tertiary-400" : "text-white/35"}
        />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white font-one">
        {value}
      </p>
      {detail && <p className="mt-1 text-[10px] text-white/40 font-one">{detail}</p>}
    </div>
  );
}

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
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="dashboard-card-kicker">Audience</span>
              <h3 className="dashboard-card-title mt-3">Visites du profil public</h3>
            </div>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-tertiary-500/50 border-t-tertiary-400" />
          </div>
          <div className="grid animate-pulse grid-cols-2 gap-2.5 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-24 rounded-2xl bg-white/5" />
            ))}
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
              <div>
                <span className="dashboard-card-kicker">Audience</span>
                <h3 className="dashboard-card-title mt-3">Visites du profil public</h3>
              </div>
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
    <div className="dashboard-panel bg-noir-500 p-4 lg:p-5">
      <div className="dashboard-panel-content space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="dashboard-card-kicker">Audience</span>
            <h3 className="dashboard-card-title mt-3">Visites du profil public</h3>
            <p className="dashboard-card-subtitle">
              Comprenez comment les clients découvrent votre studio.
            </p>
          </div>

          <div className="flex w-fit items-center gap-1 rounded-3xl border border-white/10 bg-black/15 p-1">
            {DAY_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setDays(filter)}
                aria-pressed={days === filter}
                className={`rounded-2xl px-3 py-1.5 text-[11px] font-medium font-one transition-all cursor-pointer ${
                  days === filter
                    ? "bg-linear-to-b from-tertiary-400 to-tertiary-500 text-[#211817] shadow-lg shadow-tertiary-500/15"
                    : "text-white/50 hover:bg-white/8 hover:text-white"
                }`}
              >
                {filter}j
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
          <MetricCard
            label="Total vues"
            value={formatNumber(stats?.totalViews ?? 0)}
            detail={`sur ${days} jours`}
            icon={Eye}
            featured
          />
          <MetricCard
            label="Visiteurs uniques"
            value={formatNumber(stats?.uniqueVisitors ?? 0)}
            icon={Users}
          />
          <MetricCard
            label="Dernières 24h"
            value={formatNumber(realtime?.views24h ?? 0)}
            detail="activité récente"
            icon={Clock3}
          />
          <MetricCard
            label="Total global"
            value={globalTotalViews === null ? "-" : formatNumber(globalTotalViews)}
            detail="depuis le début"
            icon={Globe2}
          />
          <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.035] p-3.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/45 font-one">
                Tendance 30j
              </p>
              {trend.icon === "↑" ? (
                <ArrowUpRight size={15} className={trend.className} />
              ) : trend.icon === "↓" ? (
                <ArrowDownRight size={15} className={trend.className} />
              ) : (
                <Activity size={15} className={trend.className} />
              )}
            </div>
            <p className={`mt-3 text-xl font-semibold font-one ${trend.className}`}>
              {trend.label}
            </p>
            <p className="mt-1 text-[10px] text-white/40 font-one">vs. période précédente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
            <div className="mb-4 flex items-center gap-2">
              <MonitorSmartphone size={15} className="text-tertiary-400" />
              <p className="text-xs font-semibold text-white font-one">Appareils</p>
            </div>
            {topDevices.length === 0 ? (
              <p className="text-[11px] text-white/50 font-one">Aucune donnée exploitable</p>
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

          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Globe2 size={15} className="text-tertiary-400" />
              <p className="text-xs font-semibold text-white font-one">Top sources de trafic</p>
            </div>
            {topReferrers.length === 0 ? (
              <p className="text-[11px] text-white/50 font-one">Aucune donnée exploitable</p>
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
