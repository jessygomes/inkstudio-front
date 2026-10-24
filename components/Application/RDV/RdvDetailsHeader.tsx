"use client";

import type { ComponentProps, ReactNode } from "react";
import { X } from "lucide-react";
import ClientAvatar from "../Clients/ClientAvatar";

const statuses: Record<string, { label: string; style: string }> = {
  PENDING: { label: "En attente", style: "border-amber-400/20 bg-amber-400/5 text-amber-300" },
  CONFIRMED: { label: "Confirmé", style: "border-emerald-400/20 bg-emerald-400/5 text-emerald-300" },
  COMPLETED: { label: "Terminé", style: "border-teal-400/20 bg-teal-400/5 text-teal-300" },
  NO_SHOW: { label: "Absent", style: "border-orange-400/20 bg-orange-400/5 text-orange-300" },
  CANCELED: { label: "Annulé", style: "border-red-400/20 bg-red-400/5 text-red-300" },
  CANCELLED: { label: "Annulé", style: "border-red-400/20 bg-red-400/5 text-red-300" },
  RESCHEDULING: { label: "À replanifier", style: "border-blue-400/20 bg-blue-400/5 text-blue-300" },
};

export default function RdvDetailsHeader({ client, status, title, onClose, children, error }: {
  client: ComponentProps<typeof ClientAvatar>["client"];
  status?: string;
  title?: string;
  onClose?: () => void;
  children?: ReactNode;
  error?: string | null;
}) {
  const badge = statuses[status || ""] || { label: status || "Non précisé", style: "border-white/10 text-white/60" };
  return <header className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-noir-600 px-3 py-3 font-one sm:gap-3 sm:px-4">
    <ClientAvatar client={client} className="size-9 rounded-xl" />
    <div className="min-w-0 flex-1"><div className="flex min-w-0 items-center gap-1.5"><h2 className="truncate text-sm font-semibold text-white" title={`${client.firstName} ${client.lastName}`}>{client.firstName} {client.lastName}</h2>{children}</div>{title && <p className="mt-1 truncate text-[11px] text-white/45">{title}</p>}{error && <p className="mt-1 text-[10px] text-red-300">{error}</p>}</div>
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2 py-1 text-[10px] font-medium ${badge.style}`}><span className="size-1.5 rounded-full bg-current" />{badge.label}</span>
    {onClose && <button type="button" onClick={onClose} aria-label="Fermer le rendez-vous" className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-white/45 transition hover:bg-tertiary-400/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400"><X size={17} /></button>}
  </header>;
}
