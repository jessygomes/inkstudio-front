"use client";

import { ArrowRight, CalendarDays, ListFilter, Plus, Search, UserRound, X } from "lucide-react";
import FilterSelect from "@/components/Shared/FilterSelect";
import RdvActionButton from "@/components/Application/RDV/RdvActionButton";
import {
  DRAWING_CARD_STATUSES,
  type DrawingCardStatus,
} from "@/lib/types/suiviDessin";

type ArtistOption = [id: string, name: string];

interface DrawingBoardFiltersProps {
  search: string;
  status: DrawingCardStatus | "";
  artist: string;
  from: string;
  to: string;
  artists: ArtistOption[];
  statusLabels: Record<DrawingCardStatus, string>;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: DrawingCardStatus | "") => void;
  onArtistChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onClear: () => void;
  onCreate: () => void;
}

// Un champ de filtre : fond translucide sans contour, anneau d'accent au focus, teinté d'accent quand un filtre est actif.
const field = (active: boolean) =>
  "relative flex h-10 shrink-0 items-center rounded-xl text-xs transition focus-within:ring-2 focus-within:ring-tertiary-400/40 " +
  (active ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]");

export default function DrawingBoardFilters({
  search,
  status,
  artist,
  from,
  to,
  artists,
  statusLabels,
  onSearchChange,
  onStatusChange,
  onArtistChange,
  onFromChange,
  onToChange,
  onClear,
  onCreate,
}: DrawingBoardFiltersProps) {
  const hasActiveFilters = Boolean(search || status || artist || from || to);
  const dateClassName =
    "h-full w-[112px] cursor-pointer bg-transparent px-1.5 text-[11px] outline-none";

  return (
    <div className="relative z-10 flex w-full flex-col gap-2.5 font-one lg:flex-row lg:items-center lg:justify-end">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 lg:justify-end">
        <label className={field(Boolean(search)) + " w-full lg:w-64 lg:flex-none"}>
          <Search className="pointer-events-none absolute left-3 opacity-60" size={14} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Rechercher un client ou un projet…"
            aria-label="Rechercher un client ou un projet"
            className="h-full w-full bg-transparent pl-9 pr-3 text-xs text-inherit outline-none placeholder:text-white/40"
          />
        </label>

        <div className="w-full sm:w-44">
          <FilterSelect buttonClassName={`flex h-10 w-full min-w-0 items-center gap-2 rounded-xl px-3 text-left text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${status ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]"}`} label="Statut" placeholder="Tous les statuts" unit="statut" icon={<ListFilter size={14} aria-hidden="true" />} multiple={false} align="right"
            selected={status ? [status] : []}
            options={DRAWING_CARD_STATUSES.map((drawingStatus) => ({ value: drawingStatus, label: statusLabels[drawingStatus] }))}
            onApply={(values) => onStatusChange((values[0] || "") as DrawingCardStatus | "")} />
        </div>

        <div className="w-full sm:w-48">
          <FilterSelect buttonClassName={`flex h-10 w-full min-w-0 items-center gap-2 rounded-xl px-3 text-left text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${artist ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]"}`} label="Tatoueur" placeholder="Tous les tatoueurs" unit="tatoueur" icon={<UserRound size={14} aria-hidden="true" />} multiple={false} align="right"
            selected={artist ? [artist] : []}
            options={artists.map(([id, name]) => ({ value: id, label: name }))}
            onApply={(values) => onArtistChange(values[0] || "")} />
        </div>

        <div className={field(Boolean(from || to)) + " gap-0.5 pl-9 pr-1"}>
          <CalendarDays className="pointer-events-none absolute left-3 opacity-60" size={14} />
          <input
            type="date"
            aria-label="Date de début"
            value={from}
            onChange={(event) => onFromChange(event.target.value)}
            className={dateClassName}
          />
          <ArrowRight className="shrink-0 opacity-40" size={12} />
          <input
            type="date"
            aria-label="Date de fin"
            value={to}
            onChange={(event) => onToChange(event.target.value)}
            className={dateClassName}
          />
        </div>

        {hasActiveFilters && (
          <RdvActionButton tone="danger" icon={X} onClick={onClear} className="!w-auto shrink-0">
            Effacer
          </RdvActionButton>
        )}
      </div>

      <RdvActionButton tone="primary" icon={Plus} onClick={onCreate} className="!w-auto shrink-0 lg:ml-auto">
        Créer une card
      </RdvActionButton>
    </div>
  );
}
