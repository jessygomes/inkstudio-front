"use client";

import type { ComponentProps, ReactNode } from "react";
import { Mail, Phone, X } from "lucide-react";
import ClientAvatar from "../Clients/ClientAvatar";
import RdvStatusBadge from "./RdvStatusBadge";
import { formatPhoneNumber } from "@/lib/utils/formatPhoneNumber";

export default function RdvDetailsHeader({ client, status, onClose, children, error, actions }: {
  client: ComponentProps<typeof ClientAvatar>["client"];
  status?: string;
  title?: string;
  onClose?: () => void;
  children?: ReactNode;
  error?: string | null;
  /** Rangée d'actions affichée sous l'identité du client. */
  actions?: ReactNode;
}) {
  const phone = formatPhoneNumber((client as { phone?: string | null }).phone);
  const fullName = `${client.firstName} ${client.lastName}`;
  return <header className="relative shrink-0 overflow-hidden font-one">
    <div className="relative px-3.5 pb-3 pt-3">
      <div className="flex items-center gap-3">
        <ClientAvatar client={client} className="size-10 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5"><h2 className="truncate text-sm font-semibold leading-tight text-white" title={fullName}>{fullName}</h2>{children}</div>
          {(client.email || phone) && <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-white/45">{client.email && <span className="flex min-w-0 items-center gap-1"><Mail size={10} className="shrink-0 text-white/30" /><span className="truncate">{client.email}</span></span>}{phone && <span className="flex shrink-0 items-center gap-1"><Phone size={10} className="text-white/30" />{phone}</span>}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <RdvStatusBadge status={status} />
          {onClose && <button type="button" onClick={onClose} aria-label="Fermer le rendez-vous" className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg bg-white/[0.06] text-white/55 transition hover:bg-white/12 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400"><X size={15} /></button>}
        </div>
      </div>
      {error && <p className="mt-2 rounded-lg bg-red-400/10 px-2.5 py-1.5 text-[11px] text-red-300">{error}</p>}
      {actions && <div className="mt-3 border-t border-white/[0.07] pt-3">{actions}</div>}
    </div>
  </header>;
}
