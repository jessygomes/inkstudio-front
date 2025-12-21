import { UserProvider } from "@/components/Auth/Context/UserContext";
import { getAuthenticatedUser } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const user = await getAuthenticatedUser();

    // Vérifier si l'utilisateur a le rôle admin
    if (user.role !== "admin") {
      redirect("/"); // Rediriger vers la page d'accueil si pas admin
    }

    return <UserProvider user={user}>{children}</UserProvider>;
  } catch (error) {
    console.error("Erreur d'authentification admin:", error);
    redirect("/connexion");
  }
}
