"use client";

import { deleteSession } from "@/lib/session";
// import { logout } from "@/lib/authAction/auth.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
      className="cursor-pointer text-white font-one tracking-wide text-xs font-bold bg-gradient-to-l from-tertiary-400 to-tertiary-500 px-4 py-2 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
    >
      {children}
    </span>
  );
};
