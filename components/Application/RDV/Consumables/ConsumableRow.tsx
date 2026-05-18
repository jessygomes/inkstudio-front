import React from "react";
import { AppointmentConsumable, CONSUMABLE_CATEGORY_LABELS } from "@/lib/type";

interface ConsumableRowProps {
  consumable: AppointmentConsumable;
  onEdit: (consumable: AppointmentConsumable) => void;
  onDelete: (consumableId: string) => void;
  isDeleting: boolean;
}

export default function ConsumableRow({
  consumable,
  onEdit,
  onDelete,
  isDeleting,
}: ConsumableRowProps) {
  const categoryLabel = consumable.category
    ? CONSUMABLE_CATEGORY_LABELS[consumable.category]
    : null;

  const expDate = consumable.expirationDate
    ? new Date(consumable.expirationDate).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  const isExpired =
    consumable.expirationDate && new Date(consumable.expirationDate) < new Date();

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/8 bg-white/4 px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0">
          <span className="inline-flex items-center rounded-lg border border-indigo-400/20 bg-indigo-500/12 px-2 py-0.5 text-[10px] font-medium font-one text-indigo-300">
            {categoryLabel ?? "—"}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-xs text-white font-one">
            {consumable.productName ?? (
              <span className="text-white/35 italic font-normal">Sans nom</span>
            )}
            {consumable.brand && (
              <span className="ml-1.5 text-[10px] font-normal text-white/45 font-one">
                · {consumable.brand}
              </span>
            )}
          </p>

          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {consumable.quantity != null && (
              <span className="text-[10px] text-white/55 font-one">
                {consumable.quantity}{consumable.unit ? ` ${consumable.unit}` : ""}
              </span>
            )}
            {consumable.reference && (
              <span className="text-[10px] text-white/45 font-one">
                Réf: {consumable.reference}
              </span>
            )}
            {consumable.lotNumber && (
              <span className="text-[10px] text-white/45 font-one">
                Lot: {consumable.lotNumber}
              </span>
            )}
            {expDate && (
              <span
                className={`text-[10px] font-one ${
                  isExpired ? "text-red-400" : "text-white/45"
                }`}
              >
                Exp. {expDate}
                {isExpired && " ⚠"}
              </span>
            )}
          </div>

          {consumable.notes && (
            <p className="text-[10px] text-white/40 font-one italic leading-relaxed">
              {consumable.notes}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(consumable)}
            className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            title="Modifier"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(consumable.id)}
            disabled={isDeleting}
            className="cursor-pointer rounded-lg border border-red-400/20 bg-red-500/10 p-1.5 text-red-400/70 transition-colors hover:bg-red-500/20 hover:text-red-300 disabled:opacity-40"
            title="Supprimer"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
