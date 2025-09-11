"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";

interface NavbarClientProps {
  initialAuthStatus: boolean;
  links: Array<{ href: string; label: string }>;
}

export function NavbarClient({ initialAuthStatus, links }: NavbarClientProps) {
  const [isLoggedIn] = useState(initialAuthStatus);
  const pathname = usePathname();
  const navRef = useRef<HTMLUListElement>(null);

  // Optionnel: écouter les changements côté client
  useEffect(() => {
    // On peut surveiller les changements de localStorage ou d'autres événements
    const handleStorageChange = () => {
      // Recharger la page ou faire une nouvelle vérification
      window.location.reload();
    };

    // Écouter les événements de déconnexion
    window.addEventListener("logout", handleStorageChange);

    return () => {
      window.removeEventListener("logout", handleStorageChange);
    };
  }, []);

  return (
    <nav className="flex justify-between items-center py-4 mx-20">
      <Link
        href={"/"}
        className="font-two uppercase font-bold text-xl text-white"
      >
        InkStudio
      </Link>
      <ul ref={navRef} className="flex gap-8">
        {links.map((link, index) => {
          const isActive = pathname === link.href;

          return (
            <li
              key={index}
              className={`${
                isActive
                  ? "active font-three text-white font-bold"
                  : "font-thin"
              } pb-1 text-white text-sm font-three pt-1 px-2 tracking-widest hover:text-white/70 transition-all duration-300`}
            >
              <Link href={link.href}>{link.label}</Link>
            </li>
          );
        })}
        <Link href={isLoggedIn ? "/dashboard" : "/connexion"}>
          <div className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs">
            {isLoggedIn ? "Dashboard" : "Connexion"}
          </div>
        </Link>
      </ul>
    </nav>
  );
}
