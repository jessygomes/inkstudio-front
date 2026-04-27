import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import { deleteStockItemAction } from "@/lib/queries/stocks";
import { StockItemProps } from "@/lib/type";
import React, { useState } from "react";

export default function DeleteItemStock({
  item,
  onDelete,
  setIsOpen = () => {},
}: {
  item?: StockItemProps;
  onDelete: () => void;
  setIsOpen?: (isOpen: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState("");

  if (!item) {
    return (
      <div className="text-red-500">
        Aucun article sélectionné pour la suppression.
      </div>
    );
  }

  const handleDelete = async () => {
    if (!item.id) return;

    setLoading(true);
    setError("");

    try {
      await deleteStockItemAction(item.id);

      setSuccess("Article supprimé avec succès");
      setIsOpen(false);
      onDelete(); // pour refresh
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-3">
        <div className="dashboard-embedded-panel w-full max-w-md overflow-hidden">
          <div className="dashboard-embedded-header px-4 py-3.5 rounded-t-[28px]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold font-one text-white tracking-wide">
                Supprimer l'article
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer p-1.5 hover:bg-white/10 rounded-xl transition-colors text-white"
              >
                ×
              </button>
            </div>
          </div>

          <div className="px-4 py-4 space-y-4">
            <div className="dashboard-embedded-section p-4">
              <p className="text-[10px] uppercase tracking-[0.12em] text-white/35 font-one">
                Article concerné
              </p>
              <p className="mt-2 text-base font-semibold text-white font-one">
                {item.name}
              </p>
              <p className="mt-2 text-sm text-white/72 font-one">
                Cette action est irréversible et supprimera définitivement cet article du stock.
              </p>
            </div>

            <FormError message={error} />
            <FormSuccess message={success} />
          </div>

          <div className="dashboard-embedded-footer px-4 py-3 flex justify-end gap-3 rounded-b-[28px]">
            <button
              onClick={() => setIsOpen(false)}
              className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-[14px] border border-white/20 transition-colors font-medium font-one text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={handleDelete}
              disabled={loading}
              className="cursor-pointer px-6 py-2 bg-gradient-to-r from-red-500/90 to-red-600 hover:from-red-500 hover:to-red-700 text-white rounded-[14px] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
            >
              {loading ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
