"use client";
import { ProductSalonProps } from "@/lib/type";
import React, { useState } from "react";

export default function DeleteProduct({
  product,
  onDelete,
  setIsOpen = () => {},
}: {
  product?: ProductSalonProps;
  onDelete: () => void;
  setIsOpen?: (isOpen: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState("");

  if (!product) {
    return (
      <div className="text-red-500">
        Aucun produit sélectionné pour la suppression.
      </div>
    );
  }

  const handleDelete = async () => {
    if (!product.id) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/product-salon/${product.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la suppression");
      }

      setSuccess("Produit supprimé avec succès");
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
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
          <h2 className="text-lg font-semibold font-one text-secondary-500 mb-4">
            {`Confirmer la suppression : ${product.name}`}
          </h2>

          <p className="text-sm text-noir-500 mb-4">
            Es-tu sûr de vouloir supprimer ce produit ? Cette action est
            irréversible.
          </p>

          {error && <div className="text-red-500 mb-2">{error}</div>}
          {success && <div className="text-green-500 mb-2">{success}</div>}

          <div className="flex gap-4">
            <button
              onClick={() => setIsOpen(false)}
              className="relative text-xs cursor-pointer bg-secondary-500 w-[150px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:bg-secondary-600 transition-all ease-in-out duration-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={handleDelete}
              disabled={loading}
              className="relative text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 w-full text-center text-white font-one py-2 px-4 rounded-[20px] hover:bg-tertiary-500 transition-all ease-in-out duration-300"
            >
              {loading ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
