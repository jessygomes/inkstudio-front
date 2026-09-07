"use client";

import { Search, X } from "lucide-react";
import ApplicationToolbar from "@/components/Shared/ApplicationToolbar";
import DashboardButton from "@/components/Shared/DashboardButton";
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
}

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
}: DrawingBoardFiltersProps) {
  const hasActiveFilters = Boolean(search || status || artist || from || to);
  const selectClassName =
    "h-8 shrink-0 cursor-pointer rounded-xl border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white outline-none transition-colors focus:border-tertiary-400";

  return (
    <ApplicationToolbar>
      <div className="flex w-full flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hidden">
      <label className="relative min-w-[190px] flex-1">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/35"
          size={13}
        />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Client ou projet…"
          className="h-8 w-full rounded-xl border border-white/20 bg-white/10 py-1 pl-8 pr-2.5 text-xs text-white outline-none transition-colors placeholder:text-white/35 focus:border-tertiary-400"
        />
      </label>

      <select
        aria-label="Filtrer par statut"
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as DrawingCardStatus | "")
        }
        className={`${selectClassName} min-w-[112px]`}
      >
        <option value="" className="bg-noir-500">
          Statut
        </option>
        {DRAWING_CARD_STATUSES.map((drawingStatus) => (
          <option
            className="bg-noir-500"
            key={drawingStatus}
            value={drawingStatus}
          >
            {statusLabels[drawingStatus]}
          </option>
        ))}
      </select>

      <select
        aria-label="Filtrer par tatoueur"
        value={artist}
        onChange={(event) => onArtistChange(event.target.value)}
        className={`${selectClassName} min-w-[125px]`}
      >
        <option value="" className="bg-noir-500">
          Tatoueur
        </option>
        {artists.map(([id, name]) => (
          <option className="bg-noir-500" key={id} value={id}>
            {name}
          </option>
        ))}
      </select>

      <div className="flex h-8 shrink-0 items-center overflow-hidden rounded-xl border border-white/20 bg-white/10">
        <span className="pl-2 text-[10px] text-white/35">Du</span>
        <input
          type="date"
          aria-label="Date de début"
          value={from}
          onChange={(event) => onFromChange(event.target.value)}
          className="h-full w-[118px] cursor-pointer bg-transparent px-2 text-[11px] text-white outline-none"
        />
        <span className="border-l border-white/10 pl-2 text-[10px] text-white/35">
          au
        </span>
        <input
          type="date"
          aria-label="Date de fin"
          value={to}
          onChange={(event) => onToChange(event.target.value)}
          className="h-full w-[118px] cursor-pointer bg-transparent px-2 text-[11px] text-white outline-none"
        />
      </div>

      {hasActiveFilters && (
        <DashboardButton
          type="button"
          onClick={onClear}
          variant="secondary"
          className="!h-10 !min-w-0 shrink-0 !border-red-400/25 !text-red-300"
        >
          <X size={12} />
          Effacer
        </DashboardButton>
      )}
      </div>
    </ApplicationToolbar>
  );
}
