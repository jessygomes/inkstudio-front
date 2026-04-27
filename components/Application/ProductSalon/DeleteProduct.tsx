/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { deleteProductAction } from "@/lib/queries/productSalon";
import { ProductSalonProps } from "@/lib/type";
import { extractUploadThingKey } from "@/lib/utils/uploadImg/extractUploadThingKey";
import React, { useState } from "react";
import { toast } from "sonner";

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

  const deleteFromUploadThing = async (fileKey: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileKeys: [fileKey],
        }),
      });

      if (!response.ok) {
        console.error(
          "Erreur lors de la suppression UploadThing:",
          response.statusText
        );
        return false;
      }

      const result = await response.json();
      console.log("Suppression UploadThing réussie:", result);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression UploadThing:", error);
      return false;
    }
  };

  const handleDelete = async () => {
    if (!product.id) return;

    setLoading(true);
    setError("");

    try {
      // 1. Supprimer de la base de données
      await deleteProductAction(product.id);

      // 2. Supprimer de UploadThing si l'URL provient d'UploadThing
      if (product.imageUrl && product.imageUrl.includes("utfs.io")) {
        const fileKey = extractUploadThingKey(product.imageUrl);
        if (fileKey) {
          const uploadThingDeleted = await deleteFromUploadThing(fileKey);
          if (!uploadThingDeleted) {
            console.warn(
              "Le produit a été supprimé de la base de données mais pas d'UploadThing"
            );
            toast.warning("Produit supprimé mais fichier distant non supprimé");
          }
        }
      }

      setSuccess("Produit supprimé avec succès");
      toast.success("Produit supprimé avec succès");
      setIsOpen(false);
      onDelete(); // pour refresh
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      toast.error(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        data-modal
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center overflow-hidden p-3"
        style={{ height: "100dvh", width: "100vw" }}
      >
        <div className="dashboard-embedded-panel w-full max-w-md overflow-hidden">
          <div className="dashboard-embedded-header px-4 py-3.5 rounded-t-[28px]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold font-one text-white tracking-wide">
                Supprimer le produit
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
                Produit concerne
              </p>
              <p className="mt-2 text-base font-semibold text-white font-one">
                {product.name}
              </p>
              <p className="mt-2 text-sm text-white/72 font-one">
                Cette action est irreversible et supprimera definitivement ce produit de votre boutique.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-green-300 text-xs">{success}</p>
              </div>
            )}
          </div>

          <div className="dashboard-embedded-footer px-4 py-3 flex justify-end gap-3 rounded-b-[28px]">
            <button
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-[14px] border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={handleDelete}
              disabled={loading}
              className="cursor-pointer px-6 py-2 bg-gradient-to-r from-red-500/90 to-red-600 hover:from-red-500 hover:to-red-700 text-white rounded-[14px] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Suppression...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Supprimer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
