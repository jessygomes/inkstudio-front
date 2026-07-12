"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AiOutlineLogout } from "react-icons/ai";
import { logoutAction } from "@/lib/auth.actions";
import { clearClientSession } from "@/lib/client-session";

interface LogoutBtnProps {
  children?: React.ReactNode;
}

export const LogoutBtn = ({ children }: LogoutBtnProps) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onClick = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const result = await logoutAction();

      clearClientSession();
      window.dispatchEvent(new Event("logout"));

      toast.success("Déconnexion réussie");

      const nextUrl = result?.url || "/";

      // Met à jour l'état Next.js immédiatement
      router.replace(nextUrl);
      router.refresh();

      // Sécurise le logout en vidant le cache de navigation client
      window.location.replace(nextUrl);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
      setIsLoggingOut(false);
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
