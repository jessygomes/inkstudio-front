import CancelFillRate from "@/components/Application/Dashboard/CancelFillRate";
// import DemandeRdvClient from "@/components/Application/Dashboard/DemandeRdvClient";
import NewClientsCount from "@/components/Application/Dashboard/NewClientsCount";
import NotAnswerClient from "@/components/Application/Dashboard/NotAnswerClient";
// import RendezVousToday from "@/components/Application/Dashboard/RendezVousToday";
import RendezVousTodayModern from "@/components/Application/Dashboard/RendezVousTodayModern";
import TotalPayed from "@/components/Application/Dashboard/TotalPayed";
// import WaitingRdv from "@/components/Application/Dashboard/WaitingRdv";
import WaitingRdvModern from "@/components/Application/Dashboard/WaitingRdvModern";
import WeeklyFillRate from "@/components/Application/Dashboard/WeeklyFillRate";
import RecentReviews from "@/components/Application/Dashboard/RecentReviews";
import Link from "next/link";
import { LuLayoutDashboard } from "react-icons/lu";
import LastMessage from "@/components/Application/Dashboard/LastMessage";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  // Vérifier si l'utilisateur a un plan Free
  const isFreeAccount = session?.user?.saasPlan === "FREE";

  return (
    <div className="relative overflow-hidden bg-noir-700 px-3 pb-24 lg:px-10 lg:pb-14">
      <div className="relative mt-4 flex w-full flex-col gap-4">
        <div className="dashboard-hero px-4 py-4 lg:px-6 lg:py-2">

          <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center lg:h-12 lg:w-12">
                  <LuLayoutDashboard className="h-5.5 w-5.5 text-tertiary-400 lg:h-6 lg:w-6" />
                </div>
                <h1 className="text-xl font-bold uppercase tracking-[0.14em] text-white font-one sm:text-2xl">
                  Dashboard
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row xl:justify-end">
              <Link
                href="/mes-rendez-vous/creer"
                className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-2xl border border-tertiary-400/30 bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-4 py-2.5 text-xs font-medium text-white shadow-xl shadow-tertiary-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-tertiary-500 hover:to-tertiary-600 font-one"
              >
                <svg
                  className="h-4 w-4"
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
                Nouveau RDV
              </Link>

              <Link
                href="/clients"
                className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-4 py-2.5 text-xs font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/8 font-one"
              >
                <svg
                  className="h-4 w-4 text-tertiary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5V10H2v10h5m10 0v-2a4 4 0 00-4-4H11a4 4 0 00-4 4v2m10 0H7m5-10a3 3 0 110-6 3 3 0 010 6z"
                  />
                </svg>
                Nouveau client
              </Link>
            </div>
          </div>
        </div>

        {!isFreeAccount && (
          <>
            <div className="grid min-h-screen grid-cols-12 gap-5">
              <div className="col-span-12 xl:col-span-5">
                {/* <RendezVousToday userId={session?.user?.id ?? ""} /> */}
                <RendezVousTodayModern userId={session?.user?.id ?? ""} />
              </div>

              <div className="col-span-12 md:col-span-6 xl:col-span-4">
                {/* <WaitingRdv userId={session?.user?.id ?? ""} /> */}
                <WaitingRdvModern userId={session?.user?.id ?? ""} />
              </div>

              <div className="col-span-12 md:col-span-6 xl:col-span-3">
                <LastMessage />
              </div>

              <div className="col-span-12">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <WeeklyFillRate userId={session?.user?.id ?? ""} />
                  <CancelFillRate userId={session?.user?.id ?? ""} />
                  <NewClientsCount userId={session?.user?.id ?? ""} />
                  <TotalPayed userId={session?.user?.id ?? ""} />
                </div>
              </div>

              <div className="col-span-12 xl:col-span-7">
                <NotAnswerClient userId={session?.user?.id ?? ""} />
              </div>

              <div className="col-span-12 xl:col-span-5">
                <RecentReviews />
              </div>
            </div>
          </>
        )}

          {/* <div className="col-span-12 lg:col-span-4">
            <DemandeRdvClient userId={user.id ?? ""} />
          </div> */}

          {/* {!isFreeAccount && (
            <div className="col-span-12 lg:col-span-6">
              <NotAnswerClient userId={user.id ?? ""} />
            </div>
          )} */}

          {/* Message pour les comptes Free */}
          {isFreeAccount && (
            <div className="dashboard-panel p-6 lg:p-8">
              <div className="dashboard-panel-content bg-gradient-to-r from-orange-500/4 to-tertiary-500/4 rounded-[24px]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/12">
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
                    <h2 className="mb-2 text-white font-semibold font-one">
                      Statistiques avancées disponibles avec un abonnement
                    </h2>

                    <p className="mb-4 text-sm text-white/70 font-one">
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

                    <div className="mt-4 flex gap-3">
                      <Link
                        href="/parametres"
                        className="cursor-pointer rounded-xl bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-tertiary-500 hover:to-tertiary-600 font-one"
                      >
                        Passer à PRO
                      </Link>

                      <Link
                        href="/parametres"
                        className="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 font-one"
                      >
                        Voir les plans
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
