import Link from "next/link";
import {
  FiChevronLeft,
  FiBarChart2,
  FiTrendingUp,
  FiAward,
  FiGrid,
  FiActivity,
} from "react-icons/fi";
import EvolutionCharts from "@/components/Admin/EvolutionCharts";
import TopSalonsContainer from "@/components/Admin/TopSalonsContainer";

export default function StatsPage() {
  return (
    <div className="wrapper-global pb-12">
      <section className="relative w-full overflow-hidden p-4 sm:p-6 lg:p-8">
        

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70 font-one">
                <FiActivity size={13} className="text-tertiary-400" />
                Admin Analytics
              </div>

              <div className="space-y-1.5">
                <h1 className="flex items-center gap-3 text-lg uppercase tracking-[0.14em] text-white font-one sm:text-xl lg:text-2xl">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-tertiary-400/35 bg-tertiary-500/15">
                    <FiBarChart2 size={18} className="text-tertiary-400" />
                  </span>
                  Statistiques globales
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/12 px-3 py-1.5 text-[11px] text-emerald-300 font-one whitespace-nowrap">
                <FiTrendingUp size={13} />
                Tendances en temps réel
              </span>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/15 font-one whitespace-nowrap"
              >
                <FiChevronLeft size={14} /> Retour admin
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-one">Bloc</p>
              <p className="mt-1.5 text-sm text-white font-one">Top salons</p>
              <p className="mt-1 text-[11px] text-white/65 font-two">Classement sur 30 jours</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-one">Bloc</p>
              <p className="mt-1.5 text-sm text-white font-one">Évolution</p>
              <p className="mt-1 text-[11px] text-white/65 font-two">Suivi sur 6 mois</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-one">Indicateur</p>
              <p className="mt-1.5 text-sm text-white font-one">Activité commerciale</p>
              <p className="mt-1 text-[11px] text-white/65 font-two">RDV + revenus combinés</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-one">Objectif</p>
              <p className="mt-1.5 text-sm text-white font-one">Lecture rapide</p>
              <p className="mt-1 text-[11px] text-white/65 font-two">Décisions admin plus simples</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid w-full gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.5fr)]">
        <div className="rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[0.045] to-white/[0.02] p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-tertiary-400/30 bg-tertiary-500/12 text-tertiary-400">
              <FiAward size={16} />
            </span>
            <div>
              <h2 className="text-sm uppercase tracking-[0.16em] font-one">Top salons</h2>
              <p className="text-[11px] text-white/60 font-two">Classement des performances récentes</p>
            </div>
          </div>

          <TopSalonsContainer />
        </div>

        <div className="rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[0.045] to-white/[0.02] p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary-500/30 bg-primary-500/12 text-primary-400">
              <FiGrid size={16} />
            </span>
            <h2 className="text-sm uppercase tracking-[0.16em] font-one">Lecture</h2>
          </div>

          <ul className="space-y-2 text-[11px] leading-relaxed text-white/75 font-two">
            <li className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
              Les cartes d&apos;évolution comparent la tendance entre le premier et le dernier mois affiché.
            </li>
            <li className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
              Le Top salons met en avant les meilleurs volumes récents pour repérer rapidement les leaders.
            </li>
            <li className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
              Utilisez cette page comme synthèse avant vos actions de modération ou d&apos;accompagnement.
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-4 w-full rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[0.045] to-white/[0.02] p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cuatro-500/30 bg-cuatro-500/12 text-cuatro-500">
            <FiTrendingUp size={16} />
          </span>
          <div>
            <h2 className="text-sm uppercase tracking-[0.16em] font-one">Évolution des indicateurs</h2>
            <p className="text-[11px] text-white/60 font-two">Inscriptions, rendez-vous et chiffre d&apos;affaires</p>
          </div>
        </div>

        <EvolutionCharts />
      </section>
    </div>
  );
}

