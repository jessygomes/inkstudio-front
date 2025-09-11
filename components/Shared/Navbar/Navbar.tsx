import { getAuthStatus } from "./AuthStatus";
import { NavbarClient } from "./NavbarClient";

export default async function Navbar() {
  const links = [
    { href: "/", label: "Accueil" },
    { href: "/solutions", label: "Solutions" },
    { href: "/tarification", label: "Tarification" },
    { href: "/a-propos-de-inkstudio", label: "A propos de InkStudio" },
  ];

  // Vérifier l'état d'authentification côté server
  const isAuthenticated = await getAuthStatus();

  return (
    <NavbarClient 
      links={links} 
      initialAuthStatus={isAuthenticated} 
    />
  );
}
