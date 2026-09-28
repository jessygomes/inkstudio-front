"use client";
import { useState } from "react";
import { toast } from "sonner";
import { AiOutlineLogout } from "react-icons/ai";
import { logoutAction } from "@/lib/auth.actions";
import { clearClientSession } from "@/lib/client-session";

interface LogoutBtnProps {
  children?: React.ReactNode;
}

export const LogoutBtn = ({ children }: LogoutBtnProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onClick = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logoutAction();
      clearClientSession();
      window.dispatchEvent(new Event("logout"));
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    } finally {
      // Rechargement complet (et non un simple router.push) pour garantir
      // que le cache client/bfcache ne réaffiche pas une page authentifiée.
      window.location.href = "/";
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoggingOut}
      className="cursor-pointer px-4 py-2 text-sm w-full flex items-center gap-2 rounded-xl hover:bg-noir-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <AiOutlineLogout size={20} className="inline-block mr-2" />
      {isLoggingOut ? "Déconnexion..." : children}
    </button>
  );
};
