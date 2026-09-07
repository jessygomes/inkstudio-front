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
import LastMessage from "@/components/Application/Dashboard/LastMessage";
import ProfileViewsStats from "@/components/Application/Dashboard/ProfileViewsStats";
import DrawingFollowUpSummary from "@/components/Application/Dashboard/DrawingFollowUpSummary";
import { auth } from "@/auth";
import LockedFeatureCard from "@/components/Shared/LockedFeatureCard";
import DashboardButton from "@/components/Shared/DashboardButton";
import {
  ArrowUpRight,
  CalendarPlus,
  LayoutDashboard,
  Sparkles,
  UserPlus,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  // Vérifier si l'utilisateur a un plan Free
  const isFreeAccount = session?.user?.saasPlan === "FREE";

  return (
    <div className="bg-noir-700 relative min-h-screen overflow-hidden px-3 pb-24 lg:px-8 lg:pb-14 xl:px-12">
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-5 pt-5 lg:gap-6 lg:pt-8">
        {!isFreeAccount && (
          <header className="dashboard-welcome flex flex-col gap-5 rounded-[28px] border border-white/10 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between lg:p-7">
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-tertiary-400 font-one">
                <LayoutDashboard size={14} />
                Vue d&apos;ensemble
              </div>
              {/* <h1 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-white font-one sm:text-4xl">
                Bonjour{session?.user?.name ? ` ${session.user.name}` : ""}.
              </h1> */}
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/55 font-one">
                Retrouvez l&apos;activité de votre studio et les prochaines actions importantes au même endroit.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <DashboardButton
                href="/mes-rendez-vous/creer"
              >
                <CalendarPlus size={16} />
                Nouveau RDV
                <ArrowUpRight size={14} className="ml-1 opacity-60" />
              </DashboardButton>
              <DashboardButton
                href="/clients/creer"
                variant="secondary"
              >
                <UserPlus size={16} />
                Nouveau client
              </DashboardButton>
            </div>
          </header>
        )}

        {!isFreeAccount && (
          <>
            <div className="dashboard-section-label">
              <div>
                <span className="text-tertiary-400">Opérations</span>
                <h2>Votre journée en un coup d&apos;œil</h2>
              </div>
              <div className="dashboard-live-indicator"><span /> Données en direct</div>
            </div>
            <div className="grid grid-cols-12 items-stretch gap-4 lg:gap-5">
              <div className="col-span-12 xl:col-span-6">
                {/* <RendezVousToday userId={session?.user?.id ?? ""} /> */}
                <RendezVousTodayModern userId={session?.user?.id ?? ""} />
              </div>

              <div className="col-span-12 md:col-span-6 xl:col-span-3">
                {/* <WaitingRdv userId={session?.user?.id ?? ""} /> */}
                <WaitingRdvModern userId={session?.user?.id ?? ""} />
              </div>

              <div className="col-span-12 md:col-span-6 xl:col-span-3">
                <LastMessage />
              </div>

              <div className="col-span-12 xl:col-span-7">
                <NotAnswerClient userId={session?.user?.id ?? ""} />
              </div>

              <div className="col-span-12 xl:col-span-5">
                <DrawingFollowUpSummary />
              </div>

              <div className="col-span-12">
                <div className="dashboard-section-label mt-2 mb-5">
                  <div>
                    <span>Performance</span>
                    <h2>Les chiffres qui comptent</h2>
                  </div>
                  <Sparkles size={17} className="text-tertiary-300/70" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <WeeklyFillRate userId={session?.user?.id ?? ""} />
                  <CancelFillRate userId={session?.user?.id ?? ""} />
                  <NewClientsCount userId={session?.user?.id ?? ""} />
                  <TotalPayed userId={session?.user?.id ?? ""} />
                </div>
              </div>

              <div className="col-span-12">
                <ProfileViewsStats userId={session?.user?.id ?? ""} />
              </div>

              <div className="col-span-12">
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
            <LockedFeatureCard
              className="dashboard-panel p-6 lg:p-8"
              icon={
                <svg
                  className="h-6 w-6"
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
              }
              title="Découvrez INKERA PRO"
              description="Avec un abonnement, vous débloquez les outils métier pour piloter votre activité au quotidien : organisation, suivi client, communication et performance."
              features={[
                "📅 Gestion avancée des rendez-vous",
                "👥 Gestion des clients et historique",
                "💬 Messagerie intégrée",
                "📦 Gestion des stocks et produits",
                "📈 Statistiques détaillées (remplissage, revenus, annulations)",
                "🧾 Traçabilité",
              ]}
            />
          )}
        </div>
    </div>
  );
}
