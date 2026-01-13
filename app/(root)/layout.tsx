import { auth } from "@/auth";
import { redirect } from "next/navigation";
import HeaderApp from "@/components/Shared/HeaderApp";
import { UserProvider } from "@/components/Auth/Context/UserContext";
import Footer from "@/components/Shared/Footer/FooterApp";
import Providers from "@/components/Providers/ReactQueryProvider";
import { ColorProvider } from "@/components/ColorContext/ColorProvider";
import VerificationNotification from "@/components/Shared/VerificationNotification";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Récupération directe de la session NextAuth
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

  return (
    <UserProvider user={user}>
      <Providers>
        <ColorProvider>
          <div className="absolute top-0 left-0 w-full z-50">
            <HeaderApp />
          </div>
          <VerificationNotification />
          {children}
          <Footer />
        </ColorProvider>
      </Providers>
    </UserProvider>
  );
}
