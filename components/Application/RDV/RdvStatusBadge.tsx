"use client";

const STATUSES: Record<string, { label: string; style: string }> = {
  PENDING: { label: "En attente", style: "bg-amber-400/15 text-amber-300" },
  CONFIRMED: { label: "Confirmé", style: "bg-emerald-400/15 text-emerald-300" },
  COMPLETED: { label: "Terminé", style: "bg-teal-400/15 text-teal-300" },
  NO_SHOW: { label: "Absent", style: "bg-orange-400/15 text-orange-300" },
  CANCELED: { label: "Annulé", style: "bg-red-400/15 text-red-300" },
  CANCELLED: { label: "Annulé", style: "bg-red-400/15 text-red-300" },
  RESCHEDULING: { label: "À replanifier", style: "bg-blue-400/15 text-blue-300" },
  DECLINED: { label: "Refusé", style: "bg-white/10 text-white/60" },
};

/** Badge de statut d'un rendez-vous : même design dans l'en-tête du détail et dans les cartes de la liste. */
export default function RdvStatusBadge({ status, className = "" }: { status?: string; className?: string }) {
  const badge = STATUSES[status || ""] || { label: status || "Non précisé", style: "bg-white/10 text-white/60" };
  return <span className={`inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 font-one text-[10px] font-semibold ${badge.style} ${className}`}><span className="size-1.5 rounded-full bg-current" />{badge.label}</span>;
}
