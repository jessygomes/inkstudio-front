import { StockItemProps } from "@/lib/type";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import React from "react";

interface StockTableProps {
  items: StockItemProps[];
  onEdit: (item: StockItemProps) => void;
  onDelete: (item: StockItemProps) => void;
  onUpdateQuantity: (item: StockItemProps, increment: number) => void;
  sortByType: null | 'asc' | 'desc';
  setSortByType: React.Dispatch<React.SetStateAction<null | 'asc' | 'desc'>>;
}

const HEAD = "px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.12em] text-white/45";

const StockTable: React.FC<StockTableProps> = ({
  items,
  onEdit,
  onDelete,
  onUpdateQuantity,
  sortByType,
  setSortByType,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse font-one">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.03]">
              <th className={HEAD}>Article</th>
              <th
                className={`${HEAD} cursor-pointer select-none hover:text-white/70`}
                onClick={() => setSortByType((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              >
                Catégorie / Type
                <span className="ml-1 inline-block align-middle">
                  {sortByType === 'asc' && <svg className="inline h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>}
                  {sortByType === 'desc' && <svg className="inline h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>}
                  {!sortByType && <svg className="inline h-3 w-3 opacity-30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5 5 5M7 13l5 5 5-5" /></svg>}
                </span>
              </th>
              <th className={HEAD}>Détails</th>
              <th className={HEAD}>Quantité</th>
              <th className={`${HEAD} text-right`}>Prix</th>
              <th className={`${HEAD} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const unit = item.unit || "pièce(s)";
              const isOutOfStock = item.quantity === 0;
              const isLowStock = Boolean(item.minQuantity) && item.quantity <= (item.minQuantity || 0) && !isOutOfStock;
              const qtyTone = isOutOfStock
                ? "border-red-400/25 bg-red-500/10 text-red-200"
                : isLowStock
                  ? "border-amber-400/25 bg-amber-500/10 text-amber-200"
                  : "border-white/10 bg-white/[0.04] text-white";
              return (
                <tr key={item.id} className="border-b border-white/6 transition-colors last:border-b-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 align-middle">
                    <p className="max-w-[240px] truncate text-sm font-semibold text-white">{item.name}</p>
                    <p className="mt-0.5 max-w-[240px] truncate text-[11px] text-white/45">
                      {[item.brand, item.reference].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] text-white/80">
                        {item.category || "Sans catégorie"}
                      </span>
                      {item.type && (
                        <span className="rounded-full border border-tertiary-400/25 bg-tertiary-500/10 px-2.5 py-0.5 text-[11px] text-tertiary-400">
                          {item.type}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-[11px] text-white/55">
                    <p>Lot : <span className="text-white/80">{item.lotNumber || "—"}</span></p>
                    <p className="mt-0.5">Pigment : <span className="text-white/80">{item.pigment || "—"}</span></p>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onUpdateQuantity(item, -1)}
                        disabled={item.quantity <= 0}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-35"
                        title="Diminuer"
                      >
                        −
                      </button>
                      <span className={`min-w-[84px] rounded-xl border px-2 py-1.5 text-center text-xs font-medium ${qtyTone}`}>
                        {item.quantity} {unit}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item, 1)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white transition-colors hover:bg-emerald-500/15"
                        title="Augmenter"
                      >
                        +
                      </button>
                    </div>
                    <p className="mt-1 text-[10px] text-white/40">
                      {isOutOfStock ? "Rupture" : isLowStock ? "Stock bas" : "En stock"}
                      {item.minQuantity ? ` · seuil ${item.minQuantity}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    <p className="text-sm font-semibold text-tertiary-400">
                      {item.totalPrice ? `${item.totalPrice.toFixed(2)} €` : "0,00 €"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/45">
                      {item.pricePerUnit ? `${item.pricePerUnit.toFixed(2)} € / u.` : "PU non renseigné"}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white transition-colors hover:border-tertiary-400/40 hover:bg-white/10"
                        onClick={() => onEdit(item)}
                        title="Modifier l'article"
                        aria-label="Modifier l'article"
                      >
                        <AiOutlineEdit size={15} />
                      </button>
                      <button
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white transition-colors hover:border-red-400/40 hover:bg-red-500/12"
                        onClick={() => onDelete(item)}
                        title="Supprimer l'article"
                        aria-label="Supprimer l'article"
                      >
                        <AiOutlineDelete size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTable;
