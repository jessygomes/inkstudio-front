import { ChartNoAxesCombined } from "lucide-react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader";
import DashboardStats from "@/components/Admin/DashboardStats";
import EvolutionCharts from "@/components/Admin/EvolutionCharts";
import TopSalonsContainer from "@/components/Admin/TopSalonsContainer";

export default function StatsPage() {
  return <div className="admin-page admin-stats-page">
    <AdminPageHeader icon={<ChartNoAxesCombined size={16} />} title="Statistiques" description="Une vue lisible des comptes, des inscriptions et de l’activité de la plateforme." />
    <DashboardStats />
    <div className="mt-7 min-w-0 space-y-6">
      <EvolutionCharts />
      <section className="admin-panel min-w-0"><h2 className="mb-1 text-lg font-medium text-white font-two">Profils les plus consultés</h2><p className="admin-muted mb-6">Visites des profils professionnels sur les trente derniers jours ; ce classement ne mesure pas leur activité dans l’application.</p><TopSalonsContainer /></section>
    </div>
  </div>;
}
