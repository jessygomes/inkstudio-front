import Link from "next/link";
import { FiChevronLeft, FiBarChart2 } from "react-icons/fi";
import EvolutionCharts from "@/components/Admin/EvolutionCharts";
import PageHeader from "@/components/Shared/PageHeader";
import TopSalonsContainer from "@/components/Admin/TopSalonsContainer";

export default function StatsPage() {
  return (
    <div className="wrapper-global pb-10">
      <section className="w-full space-y-3 pt-4">
        <PageHeader
          icon={<FiBarChart2 size={20} className="text-tertiary-400" />}
          title="Statistiques & Analytics"
        >
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/15 font-one"
          >
            <FiChevronLeft size={14} /> Retour
          </Link>
        </PageHeader>

        <div className="space-y-3">
          {/* Top Salons */}
          <TopSalonsContainer />

          {/* Graphiques d'évolution */}
          <EvolutionCharts />

          {/* Taux de conversion */}
          {/* <ConversionRates /> */}
        </div>
      </section>
    </div>
  );
}

