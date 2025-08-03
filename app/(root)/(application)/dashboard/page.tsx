"use client";

import CancelFillRate from "@/components/Application/Dashboard/CancelFillRate";
import NewClientsCount from "@/components/Application/Dashboard/NewClientsCount";
import NotAnswerClient from "@/components/Application/Dashboard/NotAnswerClient";
import RendezVousToday from "@/components/Application/Dashboard/RendezVousToday";
import TotalPayed from "@/components/Application/Dashboard/TotalPayed";
import WeeklyFillRate from "@/components/Application/Dashboard/WeeklyFillRate";
import { useUser } from "@/components/Auth/Context/UserContext";

export default function DashboardPage() {
  const user = useUser();

  return (
    <div className="min-h-screen w-full bg-noir-700 pt-20">
      <div className="px-6 lg:px-20 mx-auto py-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-one tracking-wide text-center">
            Dashboard
          </h1>
          <p className="text-white/70 text-sm font-one text-center mt-2">
            Vue d&apos;ensemble de votre activité
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Top Row - Stats Cards */}
          <div className="col-span-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <WeeklyFillRate userId={user.id ?? ""} />
              <CancelFillRate userId={user.id ?? ""} />
              <NewClientsCount userId={user.id ?? ""} />
              <TotalPayed userId={user.id ?? ""} />
            </div>
          </div>

          {/* Middle Row - Main Content */}
          <div className="col-span-12 lg:col-span-6">
            <RendezVousToday userId={user.id ?? ""} />
          </div>

          <div className="col-span-12 lg:col-span-6">
            <NotAnswerClient userId={user.id ?? ""} />
          </div>

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
