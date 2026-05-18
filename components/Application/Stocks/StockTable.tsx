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

const StockTable: React.FC<StockTableProps> = ({
  items,
  onEdit,
  onDelete,
  onUpdateQuantity,
  sortByType,
  setSortByType,
}) => {
  return (
    <div className="rounded-2xl overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-[1240px] w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase tracking-[0.12em] text-white/45 font-one">
              <th className="px-3 py-2 text-left font-medium">Article</th>
              <th className="px-3 py-2 text-left font-medium">Catégorie</th>
              <th className="px-3 py-2 text-left font-medium cursor-pointer select-none" onClick={() => setSortByType((prev) => prev === 'asc' ? 'desc' : 'asc')}>
                Type
                <span className="ml-1 align-middle inline-block">
                  {sortByType === 'asc' && <svg className="inline w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>}
                  {sortByType === 'desc' && <svg className="inline w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>}
                  {!sortByType && <svg className="inline w-3 h-3 opacity-30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5 5 5M7 13l5 5 5-5" /></svg>}
                </span>
              </th>
              <th className="px-3 py-2 text-left font-medium">Marque</th>
              <th className="px-3 py-2 text-left font-medium">Référence</th>
              <th className="px-3 py-2 text-left font-medium">N° lot</th>
              <th className="px-3 py-2 text-left font-medium">Pigment</th>
              <th className="px-3 py-2 text-left font-medium">Quantité</th>
              <th className="px-3 py-2 text-left font-medium">Seuil min.</th>
              <th className="px-3 py-2 text-left font-medium">PU</th>
              <th className="px-3 py-2 text-left font-medium">Valeur</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isOutOfStock = item.quantity === 0;
              const isLowStock = Boolean(item.minQuantity) && item.quantity <= (item.minQuantity || 0) && !isOutOfStock;
              return (
                <tr key={item.id} className="border-b border-white/7 text-xs text-white/80 font-one hover:bg-white/[0.03] transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="min-w-0 flex items-center gap-1.5">
                      <span className="max-w-[220px] truncate font-semibold text-white">{item.name}</span>
                      {isOutOfStock && <span className="shrink-0 rounded-full border border-red-400/25 bg-red-500/12 px-2 py-0.5 text-[10px] text-red-200">Rupture</span>}
                      {isLowStock && <span className="shrink-0 rounded-full border border-amber-400/25 bg-amber-500/12 px-2 py-0.5 text-[10px] text-amber-200">Stock bas</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-white/70">{item.category || "Non renseignée"}</td>
                  <td className="px-3 py-2.5 text-white/70">{item.type || "—"}</td>
                  <td className="px-3 py-2.5 text-white/70">{item.brand || "Non renseignée"}</td>
                  <td className="px-3 py-2.5 text-white/70">{item.reference || "—"}</td>
                  <td className="px-3 py-2.5 text-white/70">{item.lotNumber || "—"}</td>
                  <td className="px-3 py-2.5 text-white/70">{item.pigment || "—"}</td>
                  <td className="px-3 py-2.5">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onUpdateQuantity(item, -1)}
                        disabled={item.quantity <= 0}
                        className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/6 text-white transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-35"
                        title="Diminuer"
                      >
                        −
                      </button>
                      <span className="min-w-[80px] rounded-lg border border-white/10 bg-white/6 px-2 py-1 text-center text-[11px] text-white">
                        {item.quantity} {item.unit || "pièce(s)"}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item, 1)}
                        className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/6 text-white transition-colors hover:bg-emerald-500/15"
                        title="Augmenter"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-white/70">
                    {item.minQuantity ? `${item.minQuantity} ${item.unit || "pièce(s)"}` : "Non défini"}
                  </td>
                  <td className="px-3 py-2.5 text-white/70">
                    {item.pricePerUnit ? `${item.pricePerUnit.toFixed(2)} €` : "Non renseigné"}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-tertiary-100">
                    {item.totalPrice ? `${item.totalPrice.toFixed(2)} €` : "0,00 €"}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/6 px-2 py-1 text-[11px] text-white transition-colors hover:border-tertiary-400/40 hover:bg-white/10"
                        onClick={() => onEdit(item)}
                        title="Modifier l'article"
                      >
                        <AiOutlineEdit size={13} /> Modifier
                      </button>
                      <button
                        className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/6 px-2 py-1 text-[11px] text-white transition-colors hover:border-red-400/40 hover:bg-red-500/12"
                        onClick={() => onDelete(item)}
                        title="Supprimer l'article"
                      >
                        <AiOutlineDelete size={13} /> Supprimer
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
