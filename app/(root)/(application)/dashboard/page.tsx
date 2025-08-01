"use client";

import CancelFillRate from "@/components/Application/Dashboard/CancelFillRate";
import NewClientsCount from "@/components/Application/Dashboard/NewClientsCount";
import RendezVousToday from "@/components/Application/Dashboard/RendezVousToday";
import TotalPayed from "@/components/Application/Dashboard/TotalPayed";
import WeeklyFillRate from "@/components/Application/Dashboard/WeeklyFillRate";
import { useUser } from "@/components/Auth/Context/UserContext";

export default function DashboardPage() {
  const user = useUser();

  return (
    <div className="min-h-screen w-full bg-noir-700 pt-20">
      <div className="px-20 mx-auto py-8">
        {/* Header */}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Column - Appointments Today (Takes 4 columns) */}
          <div className="col-span-12 lg:col-span-3">
            <div className="h-full">
              <RendezVousToday userId={user.id ?? ""} />
            </div>
          </div>

          {/* Right Column - Stats Cards (Takes 8 columns) */}
          <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
            {/* Top Row - 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="min-h-[200px]">
                <WeeklyFillRate userId={user.id ?? ""} />
              </div>

              <div className="min-h-[200px]">
                <CancelFillRate userId={user.id ?? ""} />
              </div>

              <div className="min-h-[200px]">
                <NewClientsCount userId={user.id ?? ""} />
              </div>

              <div className="min-h-[200px]">
                <TotalPayed userId={user.id ?? ""} />
              </div>
            </div>

            {/* Bottom Row - Additional Content Space */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Placeholder for future widgets */}
              <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl flex items-center justify-center">
                <div className="text-center text-white/50">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8"
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
                  <p className="font-one text-sm">Widget disponible</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl flex items-center justify-center">
                <div className="text-center text-white/50">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2z"
                      />
                    </svg>
                  </div>
                  <p className="font-one text-sm">Statistiques avancées</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
