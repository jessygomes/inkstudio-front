"use client";
import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { DashboardState } from "./DashboardPrimitives";
export function useDashboardMonth() {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const current = month.getFullYear() === new Date().getFullYear() && month.getMonth() === new Date().getMonth();
  const move = (offset: number) => setMonth(value => new Date(value.getFullYear(), value.getMonth() + offset, 1));
  return { month: month.getMonth() + 1, year: month.getFullYear(), label: month.toLocaleDateString("fr-FR", { month: "short", year: "numeric" }), current, move, reset: () => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1)) };
}
export default function DashboardStatCard({ title, icon: Icon, value, description, loading, error, retry, progress, tone = "neutral", children, footer }: { title: string; icon: LucideIcon; value: string; description: string; loading: boolean; error?: Error | null; retry: () => unknown; progress?: number; tone?: "neutral" | "red" | "green"; children?: ReactNode; footer?: ReactNode }) {
  return <section className="dashboard-stat-card flex h-full min-w-0 flex-col p-4 font-one"><header className="flex items-center justify-between gap-2"><h3 className="text-xs font-medium text-white/65">{title}</h3><span className="dashboard-stat-icon grid size-8 place-items-center rounded-lg border border-tertiary-400/20 bg-tertiary-400/10 text-tertiary-400"><Icon size={15} /></span></header><div className="flex flex-1 flex-col py-4">{loading || error ? <DashboardState loading={loading} error={error?.message} retry={() => { void retry(); }} /> : <><p className="break-words text-3xl font-semibold tracking-tight tabular-nums text-white/90">{value}</p><p className="mt-1.5 text-[11px] leading-5 text-white/40">{description}</p>{progress !== undefined && <div role="progressbar" aria-label={title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0, Math.min(100, progress))} className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5"><div className={"h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none " + (tone === "red" ? "bg-red-300/65" : tone === "green" ? "bg-emerald-300/65" : "bg-tertiary-400/65")} style={{ width: Math.max(0, Math.min(100, progress)) + "%" }} /></div>}{children && <div className="mt-4 border-t border-white/[0.07] pt-3">{children}</div>}</>}</div>{footer}</section>;
}
