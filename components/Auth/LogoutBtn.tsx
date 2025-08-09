"use client";

import { deleteSession } from "@/lib/session";
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
    await deleteSession();

    // if (result?.error) {
    //   console.error("Erreur lors de la déconnexion:", result.error);
    //   toast.error(result.error);
    //   return;
    // }

    toast.success("Déconnexion réussie");
    router.push("/");
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
