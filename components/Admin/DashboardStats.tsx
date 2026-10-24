"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCheck,
  Clock3,
  Layers,
  TrendingUp,
  Users,
  UsersRound,
} from "lucide-react";
import { getAdminDashboardStats } from "@/lib/queries/admin";

interface Stats {
  totalSalons?: number;
  totalClients?: number;
  salonsWithPendingDocuments?: number;
  salonsVerified?: number;
  newSalonsThisMonth?: number;
  newClientsThisMonth?: number;
  totalTatoueurs?: number;
  totalAppointments?: number;
  salonsBySaasPlan?: { FREE?: number; PRO?: number; BUSINESS?: number };
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminDashboardStats();
      if (!result.ok || !result.stats) throw new Error(result.message);
      setStats(result.stats);
    } catch {
      setError("Les indicateurs sont momentanément indisponibles.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  if (error)
    return (
      <div className="admin-error" role="alert">
        {error}
        <button onClick={() => void load()} className="admin-button ml-3">
          Réessayer
        </button>
      </div>
    );
  const cards = [
    {
      label: "Comptes professionnels",
      value: stats?.totalSalons,
      note: "Salons et indépendants inscrits",
      icon: UsersRound,
    },
    {
      label: "Comptes clients",
      value: stats?.totalClients,
      note: "Utilisateurs de la plateforme",
      icon: Users,
    },
    {
      label: "Dossiers à traiter",
      value: stats?.salonsWithPendingDocuments,
      note: "Au moins une pièce en attente",
      icon: Clock3,
      href: "/admin/verification",
    },
    {
      label: "Comptes vérifiés",
      value: stats?.salonsVerified,
      note: "Vérification professionnelle validée",
      icon: CheckCheck,
    },
    {
      label: "Nouveaux professionnels",
      value: stats?.newSalonsThisMonth,
      note: "Depuis le début du mois",
      icon: TrendingUp,
    },
    {
      label: "Nouveaux clients",
      value: stats?.newClientsThisMonth,
      note: "Depuis le début du mois",
      icon: TrendingUp,
    },
    {
      label: "Profils tatoueurs",
      value: stats?.totalTatoueurs,
      note: "Profils rattachés aux comptes",
      icon: Layers,
    },
    {
      label: "Rendez-vous",
      value: stats?.totalAppointments,
      note: "Enregistrés sur la plateforme",
      icon: CalendarDays,
    },
  ];
  return (
    <div aria-busy={loading}>
      <div className="admin-grid admin-metrics-grid">
        {cards.map(({ label, value, note, icon: Icon, href }) => {
          const content = (
            <>
              <p className="admin-stat-label">
                {label}
                <Icon size={16} className="text-[#c8a275]" />
              </p>
              <p
                className={`admin-stat-number ${loading ? "animate-pulse" : ""}`}
              >
                {loading ? "—" : (value ?? 0).toLocaleString("fr-FR")}
              </p>
              <p className="admin-stat-note">{note}</p>
            </>
          );
          return href ? (
            <Link href={href} key={label} className="admin-stat">
              {content}
            </Link>
          ) : (
            <div key={label} className="admin-stat">
              {content}
            </div>
          );
        })}
      </div>
      {!loading && stats?.salonsBySaasPlan && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3">
          <span className="mr-1 text-xs text-white/45">
            Répartition des formules
          </span>
          {(["FREE", "PRO", "BUSINESS"] as const).map((plan) => (
            <span key={plan} className="admin-badge">
              {plan === "FREE" ? "Free" : plan === "PRO" ? "Pro" : "Business"}
              <strong className="ml-2 text-white">
                {stats.salonsBySaasPlan?.[plan] ?? 0}
              </strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
