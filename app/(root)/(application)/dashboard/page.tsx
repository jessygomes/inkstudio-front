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
import { LuLayoutDashboard } from "react-icons/lu";
import LastMessage from "@/components/Application/Dashboard/LastMessage";
import ProfileViewsStats from "@/components/Application/Dashboard/ProfileViewsStats";
import { auth } from "@/auth";
import PageHeader from "@/components/Shared/PageHeader";
import DashboardButton from "@/components/Shared/DashboardButton";
import LockedFeatureCard from "@/components/Shared/LockedFeatureCard";

export default async function DashboardPage() {
  const session = await auth();

  // Vérifier si l'utilisateur a un plan Free
  const isFreeAccount = session?.user?.saasPlan === "FREE";

  return (
    <div className="relative overflow-hidden min-h-screen bg-noir-700 px-3 pb-24 lg:px-10 lg:pb-14">
      <div className="relative mt-4 flex w-full flex-col gap-4">
        <PageHeader
          icon={<LuLayoutDashboard className="h-5 w-5 text-tertiary-400 lg:h-4 lg:w-4" />}
          title="Dashboard"
        >
            {!isFreeAccount && (
              <div className="flex gap-2">
                <DashboardButton href="/mes-rendez-vous/creer">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouveau RDV
                </DashboardButton>

                <DashboardButton href="/clients/creer" variant="secondary">
                  <svg className="h-4 w-4 text-tertiary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V10H2v10h5m10 0v-2a4 4 0 00-4-4H11a4 4 0 00-4 4v2m10 0H7m5-10a3 3 0 110-6 3 3 0 010 6z" />
                  </svg>
                  Nouveau client
                </DashboardButton>
              </div>
            )}
        </PageHeader>

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

              <div className="col-span-12">
                <ProfileViewsStats userId={session?.user?.id ?? ""} />
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
