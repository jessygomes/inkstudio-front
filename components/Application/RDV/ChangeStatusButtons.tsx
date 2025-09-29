"use client";
import { changeAppointmentStatusAction } from "@/lib/queries/appointment";
import { toast } from "sonner";

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
  //! Changer le statut du RDV (COMPLETED ou NO_SHOW)
  const handleAppointmentStatusChange = async (
    status: "COMPLETED" | "NO_SHOW"
  ) => {
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
          }`
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du statut");
    }
  };

  // Définir les tailles selon le prop size
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const buttonSizeClass = sizeClasses[size];

  return (
    <div className={`flex gap-1 ${className}`}>
      {/* Bouton Terminé - Affiché si le statut n'est pas COMPLETED */}
      {currentStatus !== "COMPLETED" && (
        <button
          onClick={() => handleAppointmentStatusChange("COMPLETED")}
          className={`cursor-pointer ${buttonSizeClass} bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-300 rounded-lg border border-green-400/30 hover:border-green-400/50 transition-all duration-200 font-one flex items-center gap-1 whitespace-nowrap`}
          title="Marquer comme terminé"
        >
          <span className="text-green-400">✓</span>
          Terminé
        </button>
      )}

      {/* Bouton Absent - Affiché si le statut n'est pas NO_SHOW */}
      {currentStatus !== "NO_SHOW" && (
        <button
          onClick={() => handleAppointmentStatusChange("NO_SHOW")}
          className={`cursor-pointer ${buttonSizeClass} bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 text-orange-300 rounded-lg border border-orange-400/30 hover:border-orange-400/50 transition-all duration-200 font-one flex items-center gap-1 whitespace-nowrap`}
          title="Marquer comme absent"
        >
          <span className="text-orange-400">X</span>
          Absent
        </button>
      )}
    </div>
  );
}
