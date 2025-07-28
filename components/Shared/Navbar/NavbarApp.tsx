"use client";
import { useUser } from "@/components/Auth/Context/UserContext";
import { LogoutBtn } from "@/components/Auth/LogoutBtn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CgProfile } from "react-icons/cg";

export default function NavbarApp() {
  const user = useUser();
  const pathname = usePathname();

  const navRef = useRef<HTMLUListElement>(null);

  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Debug temporaire pour voir l'état du menu
  useEffect(() => {
    console.log("Menu navbar ouvert:", showMenu);
  }, [showMenu]);

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/mes-rendez-vous", label: "Rendez-vous" },
    { href: "/clients", label: "Clients" },
    { href: "/mon-portfolio", label: "Portfolio" },
    { href: "/mes-produits", label: "Produits" },
    { href: "/mon-compte", label: "Mon Compte" },
  ];

  return (
    <nav className="flex justify-between items-center py-4 px-20 bg-noir-700 pb-6">
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-tertiary-500 to-tertiary-400"></div>{" "}
      <Link
        href={"/"}
        className="font-two uppercase font-bold text-xl text-white"
      >
        {user?.salonName || "InkStudio"}
      </Link>
      <ul ref={navRef} className="flex justify-center items-center gap-8">
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
        <li className="relative">
          <button
            onClick={toggleMenu}
            className="cursor-pointer items-center text-white hover:text-white/70 transition duration-300"
          >
            <CgProfile size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-4 p-2 w-[300px] bg-noir-700 text-white rounded shadow-lg z-50 flex flex-col gap-2">
              <Link
                href="/mon-compte"
                className="px-4 py-2 text-xs hover:bg-noir-500 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                Paramètres du compte
              </Link>
              <Link
                href="/mon-compte"
                className="px-4 py-2 text-xs hover:bg-noir-500 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                Mes
              </Link>
              <div onClick={() => setShowMenu(false)}>
                <LogoutBtn>
                  <span className="block text-xs w-full text-left transition-colors">
                    Déconnexion
                  </span>
                </LogoutBtn>
              </div>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
