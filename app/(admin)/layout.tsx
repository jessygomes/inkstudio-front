import { UserProvider } from "@/components/Auth/Context/UserContext";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await auth();

    // ✅ Si pas de session, redirection (normalement géré par le middleware)
    if (!session || !session.user) {
      redirect("/connexion");
    }

    // ✅ Création de l'objet user pour le UserProvider
    const user = {
      id: session.user.id,
      salonName: session.user.salonName,
      role: session.user.role,
      email: session.user.email,
      saasPlan: session.user.saasPlan,
      phone: session.user.phone || "",
      address: session.user.address || "",
      verifiedSalon: session.user.verifiedSalon || false,
    };

    return <UserProvider user={user}>{children}</UserProvider>;
  } catch (error) {
    console.error("Erreur d'authentification admin:", error);
    redirect("/connexion");
  }
}
