"use client";

import { deleteSession } from "@/lib/session";
import { clearClientSession } from "@/lib/client-session";
// import { logout } from "@/lib/authAction/auth.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AiOutlineLogout } from "react-icons/ai";

interface LogoutBtnProps {
  children?: React.ReactNode;
}

export const LogoutBtn = ({ children }: LogoutBtnProps) => {
  const router = useRouter();

  const onClick = async () => {
    try {
      // ✅ Nettoyer côté serveur
      await deleteSession();

      // ✅ Nettoyer côté client aussi pour être sûr
      clearClientSession();

      toast.success("Déconnexion réussie");
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);

      // ✅ Même en cas d'erreur serveur, nettoyer côté client
      clearClientSession();
      toast.error(
        "Erreur lors de la déconnexion, mais vous avez été déconnecté localement"
      );
      router.push("/");
    }
  };

  return (
    <span
      onClick={onClick}
      className="cursor-pointer px-4 py-2 text-sm w-full flex items-center gap-2 rounded-xl hover:bg-noir-500 transition-colors"
    >
      <AiOutlineLogout size={20} className="inline-block mr-2" />
      {children}
    </span>
  );
};
