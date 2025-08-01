import { getAuthenticatedUser } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import HeaderApp from "@/components/Shared/HeaderApp";
import { UserProvider } from "@/components/Auth/Context/UserContext";
import Footer from "@/components/Shared/Footer/FooterApp";
import Providers from "@/components/Providers/ReactQueryProvider";

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
  };

  console.log("user", user);

  try {
    const userData = await getAuthenticatedUser(); // fonctionne car côté server

    user = {
      id: userData.id,
      salonName: userData.salonName,
      role: userData.role,
      email: userData.email,
    };
    console.log("user", user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    redirect("/connexion"); // Redirigez vers la page de connexion si l'utilisateur n'est pas authentifié
  }

  return (
    <UserProvider user={user}>
      <Providers>
        <div className="absolute top-0 left-0 w-full">
          <HeaderApp />
        </div>
        {/* <header>
        {user ? (
          <p>
            Connecté en tant que : {user.name} ({user.role})
          </p>
        ) : (
          <p>Chargement...</p>
        )}
        <LogoutBtn>Logout</LogoutBtn>
      </header> */}
        {children}
        <Footer />
      </Providers>
    </UserProvider>
  );
}
