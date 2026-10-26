"use client";
import { BACK_OFFICE_PATH } from "@/lib/back-office";

import { deleteAdminUserAction } from "@/lib/queries/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import AdminConfirmDialog from "./AdminConfirmDialog";
import { toast } from "sonner";

interface DeleteUserProps {
  userId: string;
  userLabel?: string;
  redirectTo?: string;
  className?: string;
}

export default function DeleteUser({
  userId,
  userLabel = "cet utilisateur",
  redirectTo = `${BACK_OFFICE_PATH}/users`,
  className,
}: DeleteUserProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return <>
    <button type="button" onClick={() => setIsOpen(true)} className={className || "admin-button admin-button-danger"}><Trash2 size={13} aria-hidden="true" />Supprimer utilisateur</button>
    <AdminConfirmDialog open={isOpen} title="Supprimer ce compte ?" busy={loading} onCancel={() => setIsOpen(false)} onConfirm={() => void handleDelete()}>
      <p>La suppression de <strong>{userLabel}</strong> est irréversible et supprime aussi les données associées au compte.</p>
    </AdminConfirmDialog>
  </>;
}
