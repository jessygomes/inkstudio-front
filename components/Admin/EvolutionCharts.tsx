"use client";
import { useEffect, useId, useState } from "react";
import { getMonthlyEvolution } from "@/lib/queries/admin";

type Row = { month: string; period?: string; salons: number; appointments: number; departures?: number | null; departuresTrackingSince?: string | null };
type Metric = "salons" | "appointments" | "departures";
const metrics: { key: Metric; title: string; note: string; color: string }[] = [
  { key: "salons", title: "Inscriptions professionnelles", note: "Nouveaux comptes encore présents sur la plateforme", color: "#d6b185" },
  { key: "appointments", title: "Rendez-vous créés", note: "Date de création, tous statuts confondus", color: "#82baba" },
  { key: "departures", title: "Comptes professionnels supprimés", note: "Suppressions enregistrées depuis la mise en place du suivi", color: "#cf9baf" },
];
const number = (value: number) => value.toLocaleString("fr-FR");

export default function EvolutionCharts() {
  const id = useId();
  const [months, setMonths] = useState(12);
  const [grouping, setGrouping] = useState("month");
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError("");
      try {
        const result = await getMonthlyEvolution(months);
        if (!active) return;
        if (!result.ok || !Array.isArray(result.data)) throw new Error();
        setData(result.data);
      } catch { if (active) setError("Impossible de charger les évolutions."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [months, attempt]);
  const displayed = grouping === "year" && data.every(row => row.period)
    ? Object.values(data.reduce<Record<string, Row>>((years, row) => {
        const year = row.period!.slice(0, 4);
        const entry = years[year] ?? { month: year, period: year, salons: 0, appointments: 0, departures: null };
        entry.salons += row.salons; entry.appointments += row.appointments;
        if (typeof row.departures === "number") entry.departures = (entry.departures ?? 0) + row.departures;
        years[year] = entry; return years;
      }, {})) : data;
  return <section className="space-y-5" aria-busy={loading}>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h2 className="text-lg font-medium text-white">Évolution de la plateforme</h2><p className="mt-1 text-xs text-white/50">Mois en cours incomplet. Le regroupement annuel porte uniquement sur la période affichée.</p></div>
      <div className="flex flex-wrap gap-3">
        <label className="text-xs text-white/60" htmlFor={`${id}-period`}>Période<select id={`${id}-period`} className="mt-1 block" value={months} onChange={e => setMonths(Number(e.target.value))}><option value={6}>6 derniers mois</option><option value={12}>12 derniers mois</option><option value={24}>24 derniers mois</option></select></label>
        <label className="text-xs text-white/60" htmlFor={`${id}-group`}>Regrouper par<select id={`${id}-group`} className="mt-1 block" value={grouping} onChange={e => setGrouping(e.target.value)}><option value="month">Mois</option><option value="year">Année</option></select></label>
      </div>
    </div>
    {error ? <div role="alert" className="admin-error">{error}<button className="admin-button ml-3" onClick={() => setAttempt(v => v + 1)}>Réessayer</button></div>
    : loading ? <div role="status" className="admin-panel animate-pulse py-16 text-center text-white/50">Chargement des graphiques…</div>
    : data.length === 0 ? <p className="admin-empty">Aucune donnée disponible pour cette période.</p>
    : <div className="grid min-w-0 gap-4 lg:grid-cols-2">{metrics.map(metric => {
        const available = displayed.some(row => typeof row[metric.key] === "number");
        const total = displayed.reduce((sum, row) => sum + (row[metric.key] ?? 0), 0);
        const peak = Math.max(1, ...displayed.map(row => row[metric.key] ?? 0));
        const ceiling = Math.max(4, Math.ceil(peak / 4) * 4);
        const width = Math.max(440, displayed.length * 36 + 64), top = 28, bottom = 190, left = 48, plot = width - left - 15;
        return <article key={metric.key} className="admin-chart-card">
          <div className="mb-5 flex items-start justify-between gap-4"><div><h3 className="text-sm font-medium text-white">{metric.title}</h3><p className="mt-1 text-xs leading-relaxed text-white/50">{metric.note}</p></div><div className="shrink-0 text-right"><p className="text-2xl font-medium text-white">{available ? number(total) : "—"}</p><p className="text-[11px] text-white/40">sur la période</p></div></div>
          {!available ? <p className="admin-empty">Disponible après la mise à jour du backend. L’historique des comptes déjà supprimés n’est pas récupérable.</p> : <>
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={`${metric.title} : graphique défilant`}>
              <svg viewBox={`0 0 ${width} 240`} style={{ minWidth: width }} className="w-full" role="img" aria-label={`${metric.title} : ${number(total)} sur la période. Détails dans le tableau.`}>
                {[0, 1, 2, 3, 4].map(tick => { const y = bottom - tick * (bottom - top) / 4; return <g key={tick}><line x1={left} x2={width - 10} y1={y} y2={y} stroke="#ffffff12" strokeDasharray={tick ? "3 5" : undefined} /><text x={left - 8} y={y + 4} textAnchor="end" fill="#8c9b9f" fontSize="11">{number(ceiling * tick / 4)}</text></g>; })}
                {displayed.map((row, index) => {
                  const step = plot / displayed.length, value = row[metric.key] ?? 0, barHeight = value / ceiling * (bottom - top), x = left + index * step + step * .23;
                  const label = row.period?.length === 7 ? `${row.month} ${row.period.slice(2, 4)}` : row.month;
                  const formatted = typeof row[metric.key] === "number" ? number(value) : "—";
                  return <g key={row.period || index}><title>{label} : {formatted}</title><rect x={x} y={bottom - barHeight} width={step * .54} height={barHeight} rx="3" fill={metric.color} /><text x={x + step * .27} y={bottom - barHeight - 8} textAnchor="middle" fill="#e2e7e9" fontSize="11">{formatted}</text><text x={x + step * .27} y={bottom + 22} textAnchor="middle" fill="#9aa7ab" fontSize="11">{row.month}</text>{row.period?.length === 7 && <text x={x + step * .27} y={bottom + 36} textAnchor="middle" fill="#718086" fontSize="10">{row.period.slice(0, 4)}</text>}</g>;
                })}
              </svg>
            </div>
            <p className={`mb-2 text-[11px] text-white/45 ${displayed.length > 12 ? "" : "lg:hidden"}`}>Faites défiler le graphique horizontalement si nécessaire.</p>
            {total === 0 && <p className="text-xs text-white/45">Aucun événement enregistré sur cette période.</p>}
            {metric.key === "departures" && <p className="mt-2 text-xs leading-relaxed text-white/45">{data.find(row => row.departuresTrackingSince)?.departuresTrackingSince ? `Suivi depuis le ${new Date(data.find(row => row.departuresTrackingSince)!.departuresTrackingSince!).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })}. ` : ""}Les tirets signalent une période non suivie ; la première période suivie peut être partielle.</p>}
          </>}
        </article>;
      })}
      <aside className="admin-chart-card flex flex-col justify-center"><h3 className="text-sm font-medium text-white">Lire ces indicateurs</h3><p className="mt-3 text-sm leading-relaxed text-white/55">Les inscriptions portent sur les comptes encore présents. Les suppressions administratives sont comptabilisées séparément : elles ne prouvent pas une résiliation volontaire.</p><p className="mt-3 text-sm leading-relaxed text-white/55">Le revenu récurrent et les paiements encaissés nécessitent un historique de facturation. L’ancienne estimation des revenus a été retirée pour éviter de la confondre avec un chiffre d’affaires réel.</p></aside>
    </div>}
    {!loading && !error && data.length > 0 && <details className="admin-panel"><summary className="cursor-pointer text-sm text-white/75">Consulter les valeurs exactes</summary><div className="mt-4 overflow-x-auto"><table className="admin-table"><caption className="sr-only">Valeurs par période affichée</caption><thead><tr><th>Période</th><th>Inscriptions pro</th><th>RDV créés</th><th>Comptes pro supprimés</th></tr></thead><tbody>{displayed.map((row, index) => <tr key={row.period || index}><td>{row.period || row.month}</td><td>{number(row.salons)}</td><td>{number(row.appointments)}</td><td>{typeof row.departures === "number" ? number(row.departures) : "Non suivi"}</td></tr>)}</tbody></table></div></details>}
  </section>;
}
