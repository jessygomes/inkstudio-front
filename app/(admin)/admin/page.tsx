"use client";

import { useUser } from "@/components/Auth/Context/UserContext";
import Link from "next/link";
import { FiUsers, FiShield, FiSettings, FiBarChart2 } from "react-icons/fi";
import { LuShieldCheck } from "react-icons/lu";
import DashboardStats from "@/components/Admin/DashboardStats";

export default function AdminPage() {
  const user = useUser();

  return (
    <div className="min-h-screen bg-noir-700 flex flex-col gap-4 px-3 lg:px-20 pb-10">
      <div className="flex flex-col relative gap-6 w-full mt-2 lg:mt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row sm:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="w-12 h-12 bg-tertiary-500/30 rounded-full flex items-center justify-center">
              <LuShieldCheck
                size={28}
                className="text-tertiary-400 animate-pulse"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-one tracking-wide uppercase">
                Panneau d&apos;Administration
              </h1>
              <p className="text-white/70 text-xs font-one mt-1">
                Bienvenue, {user.salonName || user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStats />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actions rapides */}
          <div className="lg:col-span-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white font-one uppercase tracking-wide">
              Actions rapides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/admin/users">
                <button className="cursor-pointer w-full text-left px-4 py-3 rounded-lg bg-gradient-to-r from-tertiary-500/20 to-tertiary-400/10 hover:from-tertiary-500/30 hover:to-tertiary-400/20 border border-tertiary-400/30 hover:border-tertiary-400/50 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <FiUsers className="w-5 h-5 text-tertiary-400" />
                    <div>
                      <p className="font-medium text-white font-one">
                        Gérer les utilisateurs
                      </p>
                      <p className="text-xs text-white/60">
                        Voir et modifier les comptes salons
                      </p>
                    </div>
                  </div>
                </button>
              </Link>

              <Link href="/admin/verification">
                <button className="cursor-pointer w-full text-left px-4 py-3 rounded-lg bg-gradient-to-r from-primary-500/20 to-primary-400/10 hover:from-primary-500/30 hover:to-primary-400/20 border border-primary-400/30 hover:border-primary-400/50 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <FiShield className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="font-medium text-white font-one">
                        Vérifier les documents
                      </p>
                      <p className="text-xs text-white/60">
                        Approuver ou rejeter les documents de vérification
                      </p>
                    </div>
                  </div>
                </button>
              </Link>

              <Link href="/admin/stats">
                <button className="cursor-pointer w-full text-left px-4 py-3 rounded-lg bg-gradient-to-r from-cuatro-500/20 to-cuatro-500/10 hover:from-cuatro-500/30 hover:to-cuatro-500/20 border border-cuatro-500/30 hover:border-cuatro-500/50 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <FiBarChart2 className="w-5 h-5 text-cuatro-500" />
                    <div>
                      <p className="font-medium text-white font-one">
                        Voir les statistiques
                      </p>
                      <p className="text-xs text-white/60">
                        Analyser l&apos;utilisation de la plateforme
                      </p>
                    </div>
                  </div>
                </button>
              </Link>

              <button className="w-full text-left px-4 py-3 rounded-lg bg-gradient-to-r from-secondary-500/20 to-secondary-600/10 hover:from-secondary-500/30 hover:to-secondary-600/20 border border-secondary-500/30 hover:border-secondary-500/50 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <FiSettings className="w-5 h-5 text-secondary-400" />
                  <div>
                    <p className="font-medium text-white font-one">
                      Paramètres système
                    </p>
                    <p className="text-xs text-white/60">
                      Configurer les paramètres de la plateforme
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white font-one uppercase tracking-wide">
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="text-center py-8 text-white/50">
                <p className="text-sm font-one">
                  Aucune notification pour le moment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
