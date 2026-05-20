import { getAuthStatus } from "./AuthStatus";
import { NavMobileClient } from "./NavMobileClient";

export default async function NavMobile() {
  const links = [
    { href: "/", label: "Accueil", icon: "🏠" },
    { href: "/solutions", label: "Solutions", icon: "⚡" },
    { href: "/tarification", label: "Tarification", icon: "💰" },
    { href: "https://www.theinkera.com/", label: "Je veux me faire tatouer" },
    { href: "/a-propos-de-inkera", label: "A propos de InkEra" },
  ];

  // Vérifier l'état d'authentification côté server
  const isAuthenticated = await getAuthStatus();

  return <NavMobileClient links={links} initialAuthStatus={isAuthenticated} />;
}
