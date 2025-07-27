import { UserProvider } from "@/components/Auth/Context/UserContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pour les pages d'authentification, on passe un utilisateur null
  const user = {
    id: null,
    salonName: null,
    role: null,
    email: null,
  };

  return <UserProvider user={user}>{children}</UserProvider>;
}
