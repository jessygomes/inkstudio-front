"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { CalendarDays, ChartNoAxesCombined, ChevronDown, ContactRound, Images, RotateCcw, Search, Share2 } from "lucide-react";
import { getAdminActivityChart } from "@/lib/queries/admin-activity";
import { getAllRegisteredSalons } from "@/lib/queries/admin";
import { projectStatusLabels, type ActivityFilters, type ActivityChartData } from "@/lib/admin-activity";
import styles from "./ActivityStats.module.css";

const emptyFilters: ActivityFilters = { year: "", month: "", role: "", accountId: "", status: "" };
const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const number = (value: number) => value.toLocaleString("fr-FR");
const metrics = [
  { key: "appointments", title: "Prises de rendez-vous", note: "Rendez-vous créés, tous statuts confondus", color: "#82baba", icon: CalendarDays, professional: true },
  { key: "clientRecords", title: "Fiches clients", note: "Fiches enregistrées par les professionnels", color: "#d6b185", icon: ContactRound, professional: true },
  { key: "moodboards", title: "Moodboards créés", note: "Création des moodboards clients", color: "#a9a1d5", icon: Images, professional: false },
  { key: "sharedMoodboards", title: "Moodboards partagés", note: "Première publication · filtrage par statut actuel", color: "#cf9baf", icon: Share2, professional: false },
] as const;
interface Account { id: string; salonName?: string; nickname?: string; email: string }

function AccountFilter({ filters, onChange, title }: { filters: ActivityFilters; onChange: (id: string) => void; title: string }) {
  const details = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!open) return;
    let active = true;
    const timer = setTimeout(() => {
      async function load() {
        setLoading(true); setError(false);
        try {
          const result = await getAllRegisteredSalons(1, 30, search, undefined, undefined, filters.role as "user_salon" | "user_tatoueur" || undefined);
          if (!active) return;
          if (!result.ok) throw new Error();
          setAccounts(result.salons ?? []);
        } catch { if (active) setError(true); }
        finally { if (active) setLoading(false); }
      }
      void load();
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [open, search, filters.role, attempt]);
  function choose(id: string, name = "") {
    setLabel(name); onChange(id);
    if (details.current) { details.current.open = false; details.current.querySelector("summary")?.focus(); }
  }
  return <details ref={details} className={styles.accountPicker} onToggle={(e) => setOpen(e.currentTarget.open)} onKeyDown={(e) => {
    if (e.key === "Escape" && details.current) { details.current.open = false; details.current.querySelector("summary")?.focus(); }
  }}>
    <summary title={filters.accountId ? label : "Tous les comptes"} aria-label={`${title} : ${filters.accountId ? label : "choisir un compte"}`}><span>{filters.accountId ? label : "Tous les comptes"}</span><ChevronDown size={12} /></summary>
    <div className={styles.accountMenu}>
      <label className={styles.search}><Search size={14} aria-hidden="true" /><input type="search" aria-label={`Rechercher un compte pour ${title}`} placeholder="Nom ou e-mail…" value={search} onChange={(e) => { setSearch(e.target.value); setLoading(true); }} /></label>
      <div className={styles.accountList} aria-busy={loading}>
        <button type="button" aria-pressed={!filters.accountId} onClick={() => choose("")}>Tous les comptes</button>
        {error ? <p role="alert">Recherche indisponible. <button type="button" onClick={() => setAttempt(v => v + 1)}>Réessayer</button></p>
          : loading ? <p role="status">Recherche…</p>
          : accounts.length === 0 ? <p>Aucun compte trouvé.</p>
          : accounts.map(account => {
            const name = account.salonName || account.nickname || account.email;
            return <button key={account.id} type="button" aria-pressed={filters.accountId === account.id} onClick={() => choose(account.id, name)}><span>{name}</span><small>{account.email}</small></button>;
          })}
      </div>
      <p className={styles.searchHint}>30 résultats maximum · affinez votre recherche.</p>
    </div>
  </details>;
}

function periodLabel(period: string, grouping: ActivityChartData["grouping"], long = false) {
  if (grouping === "year") return period;
  if (grouping === "month") return `${long ? months[Number(period.slice(5, 7)) - 1] : months[Number(period.slice(5, 7)) - 1].slice(0, 3)}${long ? ` ${period.slice(0, 4)}` : ""}`;
  return long ? `${Number(period.slice(8))} ${months[Number(period.slice(5, 7)) - 1].toLowerCase()} ${period.slice(0, 4)}` : String(Number(period.slice(8)));
}

function ActivityBars({ data, title, color }: { data: ActivityChartData; title: string; color: string }) {
  const id = useId();
  const [active, setActive] = useState<number | null>(null);
  const rows = data.series;
  const peak = Math.max(1, ...rows.map(row => row.count));
  const ceiling = Math.max(4, Math.ceil(peak / 4) * 4);
  const width = Math.max(480, rows.length * 24 + 60), left = 45, right = width - 14, top = 25, bottom = 185;
  const step = (right - left) / Math.max(1, rows.length);
  const hovered = active === null ? undefined : rows[active];
  const interval = Math.max(1, Math.ceil(rows.length / 12));
  return <>
    <div className={styles.chartReadout} aria-live="polite">{hovered ? <><span>{periodLabel(hovered.period, data.grouping, true)}</span><strong style={{ color }}>{number(hovered.count)}</strong></> : <span>{data.grouping === "day" ? "Évolution quotidienne" : data.grouping === "month" ? "Évolution mensuelle" : "Évolution annuelle"}</span>}</div>
    <div className={styles.chartScroll} role="region" aria-label={`${title} : graphique défilant`} tabIndex={0}>
      <svg viewBox={`0 0 ${width} 220`} style={{ minWidth: width }} className={styles.chart} role="img" aria-label={`${title}, ${number(data.selected)} dans la sélection. Valeurs exactes disponibles sous le graphique.`} onMouseLeave={() => setActive(null)}>
        <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".95" /><stop offset="100%" stopColor={color} stopOpacity=".38" /></linearGradient></defs>
        {[0, 1, 2, 3, 4].map(tick => {
          const y = bottom - tick * (bottom - top) / 4;
          return <g key={tick}><line x1={left} x2={right} y1={y} y2={y} stroke="#ffffff10" strokeDasharray={tick ? "3 5" : undefined} /><text x={left - 9} y={y + 4} textAnchor="end" fill="#81939f" fontSize="10">{number(ceiling * tick / 4)}</text></g>;
        })}
        {rows.map((row, i) => {
          const height = row.count / ceiling * (bottom - top), x = left + i * step, barWidth = Math.min(25, step * .58);
          return <g key={row.period} onMouseEnter={() => setActive(i)}>
            <title>{periodLabel(row.period, data.grouping, true)} : {number(row.count)}</title>
            <rect x={x} y={top} width={step} height={bottom - top} fill="transparent" />
            <rect x={x + (step - barWidth) / 2} y={bottom - height} width={barWidth} height={height} rx="3" fill={active === i ? color : `url(#${id})`} />
            {(i % interval === 0 || i === rows.length - 1) && <text x={x + step / 2} y={bottom + 23} textAnchor="middle" fill="#91a2ad" fontSize="10">{periodLabel(row.period, data.grouping)}</text>}
          </g>;
        })}
      </svg>
    </div>
    {data.selected === 0 && <p className={styles.empty}>Aucune activité sur cette sélection.</p>}
    <details className={styles.values}><summary>Valeurs exactes</summary><div className={styles.tableScroll}><table><caption className="sr-only">{title} par période</caption><thead><tr><th>Période</th><th>Nombre</th></tr></thead><tbody>{rows.map(row => <tr key={row.period}><td>{periodLabel(row.period, data.grouping, true)}</td><td>{number(row.count)}</td></tr>)}</tbody></table></div></details>
  </>;
}

function MetricChart({ metric, currentYear }: { metric: typeof metrics[number]; currentYear: number }) {
  const [filters, setFilters] = useState<ActivityFilters>(emptyFilters);
  const [data, setData] = useState<ActivityChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const id = useId();
  useEffect(() => {
    let active = true;
    getAdminActivityChart(metric.key, filters).then(result => {
      if (active) setData(result);
    }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [metric.key, filters, attempt]);
  function update(next: ActivityFilters) { setLoading(true); setError(false); setData(null); setFilters(next); }
  const Icon = metric.icon;
  const isFiltered = Object.values(filters).some(Boolean);
  return <article className={styles.card} aria-labelledby={`${id}-heading`} style={{ "--chart-accent": metric.color } as CSSProperties}>
    <header className={styles.cardHeader}><div className={styles.cardTitle}><span className={styles.icon}><Icon size={17} aria-hidden="true" /></span><div><h3 id={`${id}-heading`}>{metric.title}</h3><p>{metric.note}</p></div></div><button className={styles.reset} type="button" aria-label={`Réinitialiser les filtres : ${metric.title}`} title="Réinitialiser" disabled={!isFiltered} onClick={() => update(emptyFilters)}><RotateCcw size={14} /></button></header>
    <div className={styles.filters} role="group" aria-label={`Filtres : ${metric.title}`}>
      <label><span className="sr-only">Année : {metric.title}</span><select value={filters.year} onChange={e => update({ ...filters, year: e.target.value, month: e.target.value ? filters.month : "" })}><option value="">Toutes les années</option>{Array.from({ length: currentYear - 1999 + 1 }, (_, i) => currentYear + 1 - i).map(year => <option key={year} value={year}>{year}</option>)}</select></label>
      <label><span className="sr-only">Mois : {metric.title}</span><select value={filters.month} onChange={e => update({ ...filters, month: e.target.value, year: e.target.value ? filters.year || String(currentYear) : filters.year })}><option value="">Tous les mois</option>{months.map((month, i) => <option key={month} value={i + 1}>{month}</option>)}</select></label>
      {metric.professional && <><label><span className="sr-only">Type de compte : {metric.title}</span><select value={filters.role} onChange={e => update({ ...filters, role: e.target.value, accountId: "" })}><option value="">Salons et indés</option><option value="user_salon">Salons</option><option value="user_tatoueur">Indépendants</option></select></label><AccountFilter filters={filters} title={metric.title} onChange={accountId => update({ ...filters, accountId })} /></>}
      {metric.key === "sharedMoodboards" && <label><span className="sr-only">Statut : {metric.title}</span><select value={filters.status} onChange={e => update({ ...filters, status: e.target.value })}><option value="">Tous les statuts</option>{Object.entries(projectStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
    </div>
    <div className={styles.chartBody} aria-busy={loading}>
      <div className={styles.numbers}><div><strong>{loading || !data ? "—" : number(data.selected)}</strong><span>{filters.year ? `${filters.month ? months[Number(filters.month) - 1] : "Année"} ${filters.year}` : "Toutes périodes"}</span></div><p>Total plateforme<strong>{loading || !data ? "—" : number(data.total)}</strong></p></div>
      {error ? <div className={styles.error} role="alert">Graphique indisponible.<button type="button" className="admin-button" onClick={() => { setLoading(true); setError(false); setAttempt(v => v + 1); }}>Réessayer</button></div>
        : loading ? <div className={styles.skeleton} role="status"><ChartNoAxesCombined size={26} aria-hidden="true" /><span>Chargement du graphique…</span></div>
        : data && <ActivityBars key={`${JSON.stringify(filters)}-${attempt}`} data={data} title={metric.title} color={metric.color} />}
    </div>
  </article>;
}

export default function ActivityStats({ currentYear }: { currentYear: number }) {
  return <section className={styles.workspace} aria-labelledby="activity-heading">
    <header className={styles.heading}><div><span className={styles.eyebrow}>Utilisation de la plateforme</span><h2 id="activity-heading">L’activité en chiffres</h2><p>Explorez chaque indicateur avec ses propres filtres.</p></div><span className={styles.timezone}><CalendarDays size={13} aria-hidden="true" /> Heure de Paris</span></header>
    <div className={styles.grid}>{metrics.map(metric => <MetricChart key={metric.key} metric={metric} currentYear={currentYear} />)}</div>
    <p className={styles.footnote}>Éléments encore présents en base. Les partages sont comptés une seule fois, à leur première publication. La période en cours peut être incomplète.</p>
  </section>;
}
