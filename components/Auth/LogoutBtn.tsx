"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AiOutlineLogout } from "react-icons/ai";
import { signOut } from "next-auth/react";

interface LogoutBtnProps {
  children?: React.ReactNode;
}

export const LogoutBtn = ({ children }: LogoutBtnProps) => {
  const router = useRouter();

  const onClick = async () => {
    try {
      // ✅ Utiliser NextAuth pour la déconnexion
      await signOut({
        redirect: false,
      });

      toast.success("Déconnexion réussie");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
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
