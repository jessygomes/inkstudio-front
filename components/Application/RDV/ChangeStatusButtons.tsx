"use client";
import { changeAppointmentStatusAction } from "@/lib/queries/appointment";
import { toast } from "sonner";
import { useState } from "react";
import { CheckCheck, UserX } from "lucide-react";
import RdvActionButton from "./RdvActionButton";

interface ChangeStatusButtonsProps {
  rdvId: string;
  currentStatus?: "COMPLETED" | "NO_SHOW" | string;
  onStatusChange?: (rdvId: string, status: "COMPLETED" | "NO_SHOW") => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  iconOnly?: boolean;
}

export default function ChangeStatusButtons({
  rdvId,
  currentStatus,
  onStatusChange,
  className = "",
  iconOnly,
}: ChangeStatusButtonsProps) {
  const [saving, setSaving] = useState(false);
  //! Changer le statut du RDV (COMPLETED ou NO_SHOW)
  const handleAppointmentStatusChange = async (
    status: "COMPLETED" | "NO_SHOW",
  ) => {
    if (saving) return;
    setSaving(true);
    try {
      await changeAppointmentStatusAction(rdvId, status);

      // Callback pour notifier le parent du changement
      if (onStatusChange) {
        onStatusChange(rdvId, status);
      } else {
        // Show toast only if no callback is provided (to avoid duplicate toasts)
        toast.success(
          `Rendez-vous marqué comme ${
            status === "COMPLETED" ? "terminé" : "non présenté"
          }`,
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du statut");
    } finally {
      setSaving(false);
    }
  };

  if (currentStatus === "COMPLETED" || currentStatus === "NO_SHOW" || currentStatus === "CANCELED" || currentStatus === "CANCELLED") return null;

  return (
    <div className={`${iconOnly ? "flex items-center gap-1.5" : "grid w-full grid-cols-2 gap-2"} ${className}`} aria-busy={saving}>
      {/* Bouton Terminé - Affiché si le statut n'est pas COMPLETED */}
      {currentStatus !== "COMPLETED" && (
        <RdvActionButton tone="success" icon={CheckCheck} iconOnly={iconOnly} loading={saving} onClick={() => handleAppointmentStatusChange("COMPLETED")} title="Marquer comme terminé">Terminé</RdvActionButton>
      )}

      {/* Bouton Absent - Affiché si le statut n'est pas NO_SHOW */}
      {currentStatus !== "NO_SHOW" && (
        <RdvActionButton tone="warning" icon={UserX} iconOnly={iconOnly} loading={saving} onClick={() => handleAppointmentStatusChange("NO_SHOW")} title="Marquer comme absent">Absent</RdvActionButton>
      )}
    </div>
  );
}
