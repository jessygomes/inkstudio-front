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
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-noir-500 rounded-lg p-6 w-full max-w-md shadow-lg relative">
          <h2 className="text-lg font-semibold font-one text-white tracking-widest mb-4 border-b border-white/10 pb-2">
            {`Confirmer la suppression : ${item.name}`}
          </h2>

          <p className="text-sm text-white font-one mb-4">
            Es-tu sûr de vouloir supprimer cet article ? Cette action est
            irréversible.
          </p>

          <FormError message={error} />
          <FormSuccess message={success} />

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsOpen(false)}
              className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={handleDelete}
              disabled={loading}
              className="cursor-pointer px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
            >
              {loading ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
