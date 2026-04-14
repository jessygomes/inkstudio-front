/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { deleteFlashAction } from "@/lib/queries/flash";
import { FlashProps } from "@/lib/type";
import { extractUploadThingKey } from "@/lib/utils/uploadImg/extractUploadThingKey";

export default function DeleteFlash({
  flash,
  onDelete,
  setIsOpen = () => {},
}: {
  flash?: FlashProps;
  onDelete: () => void;
  setIsOpen?: (isOpen: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!flash) {
    return (
      <div className="text-red-500">
        Aucun flash sélectionné pour suppression.
      </div>
    );
  }

  const deleteFromUploadThing = async (fileKey: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKeys: [fileKey] }),
      });

      if (!response.ok) return false;
      await response.json();
      return true;
    } catch (uploadError) {
      console.error("Erreur suppression UploadThing:", uploadError);
      return false;
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      await deleteFlashAction(flash.id);

      if (flash.imageUrl && flash.imageUrl.includes("utfs.io")) {
        const key = extractUploadThingKey(flash.imageUrl);
        if (key) {
          await deleteFromUploadThing(key);
        }
      }

      toast.success("Flash supprimé avec succès");
      setIsOpen(false);
      onDelete();
    } catch (deleteError: any) {
      setError(deleteError?.message || "Une erreur est survenue");
      toast.error(deleteError?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-modal
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center overflow-hidden"
      style={{ height: "100dvh", width: "100vw" }}
    >
      <div className="bg-noir-500 rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <h2 className="text-lg font-semibold font-one text-white mb-4 border-b border-white/10 pb-2">
          Confirmer la suppression : {flash.title}
        </h2>

        <p className="text-sm text-white font-one mb-4">
          Cette action est irréversible.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-xs">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setIsOpen(false)}
            disabled={loading}
            className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 font-one text-xs disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="cursor-pointer px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-one text-xs disabled:opacity-50"
          >
            {loading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}
