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
    <span onClick={onClick} className="rounded-full cursor-pointer">
      {children}
    </span>
  );
};
