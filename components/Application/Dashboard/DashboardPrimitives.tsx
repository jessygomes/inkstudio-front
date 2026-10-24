import type { ReactNode } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, LoaderCircle, type LucideIcon } from "lucide-react";
import Link from "next/link";

export const dashboardControl = "dashboard-control inline-flex min-h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-tertiary-400/10 px-2.5 py-1.5 text-[11px] text-white/60 transition hover:border-white/20 hover:bg-tertiary-400/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed disabled:opacity-30";

export function DashboardHeading({ title, description, icon: Icon, count, href, action }: { title: string; description?: string; icon: LucideIcon; count?: number; href?: string; action?: ReactNode }) {
  return <header className="flex items-start gap-3"><span className="dashboard-accent-icon grid size-9 shrink-0 place-items-center rounded-xl border border-tertiary-400/20 bg-tertiary-400/10 text-tertiary-400"><Icon size={16} /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="text-sm font-semibold tracking-tight text-white/90">{title}</h3>{count !== undefined && <span className="dashboard-accent-count rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] tabular-nums text-white/50">{count}</span>}</div>{description && <p className="mt-1 text-[11px] leading-5 text-white/40">{description}</p>}</div>{action}{href && <Link href={href} aria-label={`Voir : ${title}`} title={`Voir : ${title}`} className={dashboardControl + " size-8 shrink-0 !p-0"}><ArrowUpRight size={15} /></Link>}</header>;
}

export function DashboardState({ loading, error, message = "Aucune donnée pour le moment.", retry }: { loading?: boolean; error?: string | null; message?: string; retry?: () => void }) {
  return <div role={error ? "alert" : "status"} className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 p-5 text-center"><span className={"text-[11px] leading-5 " + (error ? "text-red-300" : "text-white/40")}>{loading ? <span className="flex items-center gap-2"><LoaderCircle size={14} className="animate-spin" />Chargement…</span> : error || message}</span>{error && retry && <button type="button" onClick={retry} className={dashboardControl}>Réessayer</button>}</div>;
}

export function DashboardPeriod({ label, previous, next, current, onCurrent, nextDisabled, currentLabel = "Aujourd’hui" }: { label: string; previous: () => void; next: () => void; current?: boolean; onCurrent?: () => void; nextDisabled?: boolean; currentLabel?: string }) {
  return <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3"><div className="flex min-w-0 items-center gap-1"><button type="button" onClick={previous} aria-label="Période précédente" className={dashboardControl + " size-8 !p-0"}><ChevronLeft size={14} /></button><span className="min-w-0 px-1 text-[11px] text-white/65">{label}</span><button type="button" onClick={next} disabled={nextDisabled} aria-label="Période suivante" className={dashboardControl + " size-8 !p-0"}><ChevronRight size={14} /></button></div>{onCurrent && !current && <button type="button" onClick={onCurrent} className={dashboardControl}>{currentLabel}</button>}</div>;
}
