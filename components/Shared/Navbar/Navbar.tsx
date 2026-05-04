import { NavbarClient } from "./NavbarClient";

export default async function Navbar() {
  const links = [
    { href: "/", label: "Accueil" },
    { href: "/solutions", label: "Solutions" },
    { href: "/tarification", label: "Tarification" },
    { href: "/a-propos-de-inkera", label: "A propos de INKERA" },
    { href: "https://www.theinkera.com/", label: "Je veux me faire tatouer", highlight: true },
  ];

  return <NavbarClient links={links} />;
}
