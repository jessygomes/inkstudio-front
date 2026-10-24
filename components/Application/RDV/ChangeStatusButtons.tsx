"use client";
import { changeAppointmentStatusAction } from "@/lib/queries/appointment";
import { toast } from "sonner";
import { useState } from "react";

interface ChangeStatusButtonsProps {
  rdvId: string;
  currentStatus?: "COMPLETED" | "NO_SHOW" | string;
  onStatusChange?: (rdvId: string, status: "COMPLETED" | "NO_SHOW") => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ChangeStatusButtons({
  rdvId,
  currentStatus,
  onStatusChange,
  size = "sm",
  className = "",
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

  // Définir les tailles selon le prop size
  const sizeClasses = {
    sm: "py-2.5 text-xs",
    md: "py-2.5 text-sm",
    lg: "py-2.5 text-base",
  };

  const buttonSizeClass = sizeClasses[size];

  if (currentStatus === "COMPLETED" || currentStatus === "NO_SHOW" || currentStatus === "CANCELED" || currentStatus === "CANCELLED") return null;

  return (
    <div className={`grid w-full grid-cols-2 gap-2 ${className}`} aria-busy={saving}>
      {/* Bouton Terminé - Affiché si le statut n'est pas COMPLETED */}
      {currentStatus !== "COMPLETED" && (
        <button
          type="button"
          disabled={saving}
          onClick={() => handleAppointmentStatusChange("COMPLETED")}
          className={`min-h-10 cursor-pointer rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-3 ${buttonSizeClass} text-emerald-300 hover:bg-emerald-400/10 transition font-one font-medium flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed disabled:opacity-50`}
          title="Marquer comme terminé"
        >
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          Terminé
        </button>
      )}

      {/* Bouton Absent - Affiché si le statut n'est pas NO_SHOW */}
      {currentStatus !== "NO_SHOW" && (
        <button
          type="button"
          disabled={saving}
          onClick={() => handleAppointmentStatusChange("NO_SHOW")}
          className={`min-h-10 cursor-pointer rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 ${buttonSizeClass} text-amber-300 hover:bg-amber-400/10 transition font-one font-medium flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed disabled:opacity-50`}
          title="Marquer comme absent"
        >
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
          Absent
        </button>
      )}
    </div>
  );
}
