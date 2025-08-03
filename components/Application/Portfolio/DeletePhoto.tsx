/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { PortfolioProps } from "@/lib/type";
import React, { useState } from "react";
import { toast } from "sonner";

export default function DeletePhoto({
  photo,
  onDelete,
  setIsOpen = () => {},
}: {
  photo?: PortfolioProps;
  onDelete: () => void;
  setIsOpen?: (isOpen: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState("");

  if (!photo) {
    return (
      <div className="text-red-500">
        Aucun photo sélectionnée pour la suppression.
      </div>
    );
  }

  // Extraire la clé UploadThing de l'URL
  const extractUploadThingKey = (url: string): string | null => {
    try {
      // Format UploadThing: https://utfs.io/f/[key]
      const match = url.match(/\/f\/([^\/\?]+)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error(
        "Erreur lors de l'extraction de la clé UploadThing:",
        error
      );
      return null;
    }
  };

  const deleteFromUploadThing = async (fileKey: string): Promise<boolean> => {
    try {
      // Utiliser l'endpoint correct pour la suppression UploadThing
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
    if (!photo.id) return;

    setLoading(true);
    setError("");

    try {
      // 1. Supprimer de la base de données
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/portfolio/${photo.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la suppression");
      }

      // 2. Supprimer de UploadThing si l'URL provient d'UploadThing
      if (photo.imageUrl && photo.imageUrl.includes("utfs.io")) {
        const fileKey = extractUploadThingKey(photo.imageUrl);
        if (fileKey) {
          const uploadThingDeleted = await deleteFromUploadThing(fileKey);
          if (!uploadThingDeleted) {
            console.warn(
              "La photo a été supprimée de la base de données mais pas d'UploadThing"
            );
            toast.warning("Photo supprimée mais fichier distant non supprimé");
          }
        }
      }

      setSuccess("Photo supprimée avec succès");
      toast.success("Photo supprimée avec succès");
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
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-noir-500 rounded-lg p-6 w-full max-w-md shadow-lg relative">
          <h2 className="text-lg font-semibold font-one text-white tracking-widest mb-4 border-b border-white/10 pb-2">
            {`Confirmer la suppression : ${photo.title}`}
          </h2>

          <p className="text-sm text-white font-one mb-4">
            Es-tu sûr de vouloir supprimer cette photo ? Cette action est
            irréversible.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
              <p className="text-green-300 text-xs">{success}</p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={handleDelete}
              disabled={loading}
              className="cursor-pointer px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs flex items-center gap-2"
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
