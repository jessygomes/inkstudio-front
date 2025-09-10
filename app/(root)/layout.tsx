import { getAuthenticatedUser } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import HeaderApp from "@/components/Shared/HeaderApp";
import { UserProvider } from "@/components/Auth/Context/UserContext";
import Footer from "@/components/Shared/Footer/FooterApp";
import Providers from "@/components/Providers/ReactQueryProvider";
import { AuthErrorHandler } from "@/components/Auth/AuthErrorHandler";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = {
    id: "",
    salonName: "",
    role: "",
    email: "",
    saasPlan: "",
    phone: "",
    address: "",
  };

  let authError: Error | undefined;

  try {
    const userData = await getAuthenticatedUser(); // fonctionne car côté server

    user = {
      id: userData.id,
      salonName: userData.salonName,
      role: userData.role,
      email: userData.email,
      saasPlan: userData.saasPlan,
      phone: userData.phone || "",
      address: userData.address || "",
    };
    console.log("user - layout", user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);

    // ✅ Gestion spécifique des tokens expirés - sera géré côté client
    if (error instanceof Error && error.message === "TOKEN_EXPIRED") {
      console.log("🔑 Token expiré détecté - Sera géré côté client");
      authError = error;
    } else {
      // ✅ Pour les autres erreurs, redirection simple
      redirect("/connexion");
    }
  }

  return (
    <UserProvider user={user}>
      <Providers>
        {/* Gestion des erreurs d'authentification côté client */}
        {authError && <AuthErrorHandler error={authError} />}

        {!authError && (
          <>
            <div className="absolute top-0 left-0 w-full z-50">
              <HeaderApp />
            </div>
            {children}
            <Footer />
          </>
        )}
      </Providers>
    </UserProvider>
  );
}
