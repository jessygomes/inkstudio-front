"use client";

import CancelFillRate from "@/components/Application/Dashboard/CancelFillRate";
import DemandeRdvClient from "@/components/Application/Dashboard/DemandeRdvClient";
import NewClientsCount from "@/components/Application/Dashboard/NewClientsCount";
import NotAnswerClient from "@/components/Application/Dashboard/NotAnswerClient";
import RendezVousToday from "@/components/Application/Dashboard/RendezVousToday";
import TotalPayed from "@/components/Application/Dashboard/TotalPayed";
import WaitingRdv from "@/components/Application/Dashboard/WaitingRdv";
import WeeklyFillRate from "@/components/Application/Dashboard/WeeklyFillRate";
import { useUser } from "@/components/Auth/Context/UserContext";
import Link from "next/link";
import { LuLayoutDashboard } from "react-icons/lu";

export default function DashboardPage() {
  const user = useUser();

  // Vérifier si l'utilisateur a un plan Free
  const isFreeAccount = user?.saasPlan === "FREE";

  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4 px-20">
      <div className="flex flex-col relative gap-6 w-full mt-23">
        {/* Header */}
        <div className="">
          <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center ">
                <LuLayoutDashboard
                  size={28}
                  className="text-tertiary-400 animate-pulse"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-one tracking-wide uppercase">
                  Dashboard
                </h1>
                <p className="text-white/70 text-xs font-one mt-1">
                  Vue d&apos;ensemble de votre activité
                </p>
              </div>
            </div>

            {/* Bouton création RDV */}
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/mes-rendez-vous/creer"
                className="cursor-pointer w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Nouveau RDV</span>
              </Link>

              <Link
                href="/clients"
                className="cursor-pointer w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Nouveau client</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Top Row - Stats Cards - Seulement pour les comptes payants */}
          {!isFreeAccount && (
            <div className="col-span-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <WeeklyFillRate userId={user.id ?? ""} />
                <CancelFillRate userId={user.id ?? ""} />
                <NewClientsCount userId={user.id ?? ""} />
                <TotalPayed userId={user.id ?? ""} />
              </div>
            </div>
          )}

          {/* Middle Row - Main Content */}
          <div className="col-span-12 lg:col-span-4">
            <RendezVousToday userId={user.id ?? ""} />
          </div>

          <div className="col-span-12 lg:col-span-4">
            <DemandeRdvClient userId={user.id ?? ""} />
          </div>

          {!isFreeAccount && (
            <div className="col-span-12 lg:col-span-4">
              <NotAnswerClient userId={user.id ?? ""} />
            </div>
          )}

          <div className="col-span-12 lg:col-span-4">
            <WaitingRdv userId={user.id ?? ""} />
          </div>

          {!isFreeAccount && (
            <div className="col-span-12 lg:col-span-6">
              <NotAnswerClient userId={user.id ?? ""} />
            </div>
          )}

          {/* Message pour les comptes Free */}
          {isFreeAccount && (
            <div className="col-span-12">
              <div className="bg-gradient-to-r from-orange-500/10 to-tertiary-500/10 border border-orange-500/30 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-white font-semibold font-one mb-2">
                      📊 Statistiques avancées disponibles avec un abonnement
                    </h2>

                    <p className="text-white/70 text-sm font-one mb-4">
                      Débloquez des statistiques détaillées sur votre activité :
                      taux de remplissage, revenus, analyse des annulations et
                      bien plus.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <div className="bg-white/10 rounded-lg px-3 py-1">
                        <span className="text-white/80 text-xs font-one">
                          📈 Taux de remplissage hebdomadaire
                        </span>
                      </div>
                      <div className="bg-white/10 rounded-lg px-3 py-1">
                        <span className="text-white/80 text-xs font-one">
                          💰 Revenus totaux
                        </span>
                      </div>
                      <div className="bg-white/10 rounded-lg px-3 py-1">
                        <span className="text-white/80 text-xs font-one">
                          👥 Nouveaux clients
                        </span>
                      </div>
                      <div className="bg-white/10 rounded-lg px-3 py-1">
                        <span className="text-white/80 text-xs font-one">
                          📉 Taux d&apos;annulation
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => (window.location.href = "/parametres")}
                        className="cursor-pointer px-4 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg text-sm font-one font-medium transition-all duration-300"
                      >
                        🚀 Passer à PRO
                      </button>

                      <button
                        onClick={() => (window.location.href = "/parametres")}
                        className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 text-sm font-one font-medium transition-colors"
                      >
                        Voir les plans
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Row - Additional Space for Future Components */}
          <div className="col-span-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Placeholder pour futurs composants */}
              <div className="bg-noir-700 rounded-xl border border-white/20 p-6 shadow-2xl min-h-[300px]">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-6 h-6 text-white/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <p className="text-white/40 text-sm font-one">
                      Espace disponible
                    </p>
                    <p className="text-white/30 text-xs font-one mt-1">
                      Pour futurs graphiques
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-noir-700 rounded-xl border border-white/20 p-6 shadow-2xl min-h-[300px]">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-6 h-6 text-white/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-white/40 text-sm font-one">
                      Espace disponible
                    </p>
                    <p className="text-white/30 text-xs font-one mt-1">
                      Pour nouveaux widgets
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
