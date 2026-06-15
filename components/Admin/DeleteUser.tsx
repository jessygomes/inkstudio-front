"use client";

import { deleteAdminUserAction } from "@/lib/queries/admin";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

interface DeleteUserProps {
  userId: string;
  userLabel?: string;
  redirectTo?: string;
}

export default function DeleteUser({
  userId,
  userLabel = "cet utilisateur",
  redirectTo = "/admin/users",
}: DeleteUserProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const result = await deleteAdminUserAction(userId);

      if (!result.ok) {
        toast.error(result.message || "Suppression impossible");
        return;
      }

      toast.success(result.message || "Utilisateur supprimé");
      setIsOpen(false);
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer w-full whitespace-nowrap rounded-2xl border border-red-500/35 bg-red-500/12 px-3 py-1.5 text-xs text-red-200 transition-colors hover:bg-red-500/20 font-one"
      >
        Supprimer utilisateur
      </button>

      {mounted &&
        isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-noir-500 p-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-white font-one">
              Confirmer la suppression
            </h3>
            <p className="mt-2 text-xs text-white/75 font-one leading-relaxed">
              Voulez-vous vraiment supprimer {userLabel} ? Cette action est
              irréversible et supprimera aussi ses données associées.
            </p>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="cursor-pointer whitespace-nowrap rounded-xl border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white/85 transition-colors hover:bg-white/12 font-one disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="cursor-pointer whitespace-nowrap rounded-xl border border-red-500/35 bg-red-500/20 px-3 py-1.5 text-xs text-red-100 transition-colors hover:bg-red-500/30 font-one disabled:opacity-50"
              >
                {loading ? "Suppression..." : "Confirmer"}
              </button>
            </div>
          </div>
          </div>,
          document.body
        )}
    </>
  );
}
