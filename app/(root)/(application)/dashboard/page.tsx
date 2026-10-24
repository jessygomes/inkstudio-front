import { auth } from "@/auth";
import DashboardButton from "@/components/Shared/DashboardButton";
import { CalendarPlus, UserPlus } from "lucide-react";
import DashboardOperations from "@/components/Application/Dashboard/DashboardOperations";
import NotAnswerClient from "@/components/Application/Dashboard/NotAnswerClient";
import DrawingFollowUpSummary from "@/components/Application/Dashboard/DrawingFollowUpSummary";
import WeeklyFillRate from "@/components/Application/Dashboard/WeeklyFillRate";
import CancelFillRate from "@/components/Application/Dashboard/CancelFillRate";
import NewClientsCount from "@/components/Application/Dashboard/NewClientsCount";
import TotalPayed from "@/components/Application/Dashboard/TotalPayed";
import ProfileViewsStats from "@/components/Application/Dashboard/ProfileViewsStats";
import RecentReviews from "@/components/Application/Dashboard/RecentReviews";
import UpgradePromo from "@/components/Application/Dashboard/UpgradePromo";
import "./dashboard.css";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id || "";
  const free = session?.user?.saasPlan === "FREE";
  return <main className="studio-dashboard min-h-screen min-w-0 bg-noir-700 px-3 pb-24 pt-5 font-one lg:px-6 lg:pb-12 lg:pt-7 xl:px-8">
    {free ? <UpgradePromo isSalon={session?.user?.role === "user_salon" || session?.user?.role === "user"} /> : <div className="mx-auto flex min-w-0 max-w-[1800px] flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-tertiary-400">Votre studio</p><h1 className="mt-1.5 text-xl font-semibold tracking-tight text-white">Tableau de bord</h1><p className="mt-1.5 text-xs text-white/45">L’essentiel de votre activité, au même endroit.</p></div><div className="flex flex-wrap gap-2"><DashboardButton href="/clients/creer" variant="secondary"><UserPlus size={14} />Nouveau client</DashboardButton><DashboardButton href="/mes-rendez-vous/creer"><CalendarPlus size={14} />Nouveau RDV</DashboardButton></div></header>
      <DashboardOperations userId={userId} />
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 xl:grid-cols-2"><NotAnswerClient userId={userId} /><DrawingFollowUpSummary userId={userId} /></div>
      <section aria-labelledby="dashboard-performance"><div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><h2 id="dashboard-performance" className="text-sm font-semibold text-white/85">Performance du studio</h2><p className="mt-1 text-[11px] text-white/40">Planning, clientèle et montants encaissés.</p></div><span className="text-[10px] text-white/30">Données de votre activité</span></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><WeeklyFillRate userId={userId} /><CancelFillRate userId={userId} /><NewClientsCount userId={userId} /><TotalPayed userId={userId} /></div></section>
      <ProfileViewsStats userId={userId} />
      <RecentReviews userId={userId} />
    </div>}
  </main>;
}
