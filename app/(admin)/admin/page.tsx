"use client";

import { useUser } from "@/components/Auth/Context/UserContext";
import Link from "next/link";
import { FiUsers, FiShield, FiSettings, FiBarChart2, FiFileText } from "react-icons/fi";
import { LuShieldCheck } from "react-icons/lu";
import DashboardStats from "@/components/Admin/DashboardStats";
import PageHeader from "@/components/Shared/PageHeader";

export default function AdminPage() {
  const user = useUser();

  return (
    <div className="wrapper-global pb-10">
      <section className="w-full space-y-3 pt-4">
        <PageHeader
          icon={<LuShieldCheck size={20} className="text-tertiary-400" />}
          title="Panneau d'administration"
        >
          <span className="rounded-full border border-tertiary-400/30 bg-tertiary-500/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-tertiary-400 font-one">
            Admin
          </span>
        </PageHeader>

        <DashboardStats />

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="dashboard-embedded-panel p-3 sm:p-4 lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white font-one sm:text-base">
              Actions rapides
            </h2>
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              <Link
                href="/admin/users"
                className="dashboard-list-item block rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition-colors hover:border-tertiary-400/35 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <FiUsers className="h-5 w-5 text-tertiary-400" />
                  <div>
                    <p className="text-sm font-medium text-white font-one">Gérer les utilisateurs</p>
                    <p className="text-[11px] text-white/60 font-one">Voir et modifier les comptes salons</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/verification"
                className="dashboard-list-item block rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition-colors hover:border-primary-400/35 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <FiShield className="h-5 w-5 text-primary-400" />
                  <div>
                    <p className="text-sm font-medium text-white font-one">Vérifier les documents</p>
                    <p className="text-[11px] text-white/60 font-one">Approuver ou rejeter les dossiers</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/stats"
                className="dashboard-list-item block rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition-colors hover:border-cuatro-500/35 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <FiBarChart2 className="h-5 w-5 text-cuatro-500" />
                  <div>
                    <p className="text-sm font-medium text-white font-one">Voir les statistiques</p>
                    <p className="text-[11px] text-white/60 font-one">Analyser l&apos;utilisation de la plateforme</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/articles"
                className="dashboard-list-item block rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition-colors hover:border-tertiary-400/35 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <FiFileText className="h-5 w-5 text-tertiary-400" />
                  <div>
                    <p className="text-sm font-medium text-white font-one">Gérer les articles</p>
                    <p className="text-[11px] text-white/60 font-one">Créer, modifier et supprimer</p>
                  </div>
                </div>
              </Link>

              <button className="w-full text-left rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition-colors hover:border-secondary-500/35 hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <FiSettings className="h-5 w-5 text-secondary-400" />
                  <div>
                    <p className="text-sm font-medium text-white font-one">Paramètres système</p>
                    <p className="text-[11px] text-white/60 font-one">Configuration avancée de la plateforme</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="dashboard-embedded-panel p-3 sm:p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white font-one sm:text-base">
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="dashboard-empty-state py-8 text-center text-white/50">
                <p className="text-sm font-one">
                  Aucune notification pour le moment
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
