import { getAuthenticatedUser } from "@/lib/auth.server";
import { LogoutBtn } from "@/components/Auth/LogoutBtn";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;

  try {
    user = await getAuthenticatedUser(); // fonctionne car côté server
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    redirect("/connexion"); // Redirigez vers la page de connexion si l'utilisateur n'est pas authentifié
  }

  return (
    <div>
      <header>
        {user ? (
          <p>
            Connecté en tant que : {user.name} ({user.role})
          </p>
        ) : (
          <p>Chargement...</p>
        )}
        <LogoutBtn>Logout</LogoutBtn>
      </header>
      {children}
    </div>
  );
}
