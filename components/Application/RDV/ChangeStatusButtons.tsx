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
    status: "COMPLETED" | "NO_SHOW",
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
          }`,
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du statut");
    }
  };

  // Définir les tailles selon le prop size
  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const buttonSizeClass = sizeClasses[size];

  return (
    <div className={`flex gap-1.5 ${className}`}>
      {/* Bouton Terminé - Affiché si le statut n'est pas COMPLETED */}
      {currentStatus !== "COMPLETED" && (
        <button
          onClick={() => handleAppointmentStatusChange("COMPLETED")}
          className={`cursor-pointer ${buttonSizeClass} bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 text-emerald-300 rounded-md border border-emerald-500/40 hover:border-emerald-500/60 transition-all duration-200 font-one font-medium flex items-center gap-1.5 whitespace-nowrap shadow-sm hover:shadow-md`}
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
          onClick={() => handleAppointmentStatusChange("NO_SHOW")}
          className={`cursor-pointer ${buttonSizeClass} bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 rounded-md border border-amber-500/40 hover:border-amber-500/60 transition-all duration-200 font-one font-medium flex items-center gap-1.5 whitespace-nowrap shadow-sm hover:shadow-md`}
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
