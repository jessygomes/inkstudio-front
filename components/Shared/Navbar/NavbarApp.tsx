"use client";
import { useUser } from "@/components/Auth/Context/UserContext";
import { LogoutBtn } from "@/components/Auth/LogoutBtn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMessagingContext } from "@/components/Providers/MessagingProvider";
import { getUnreadMessagesCountAction } from "@/lib/queries/conversation.action";

import { CgProfile } from "react-icons/cg";
import { CiSettings } from "react-icons/ci";

export default function NavbarApp() {
  const user = useUser();
  const pathname = usePathname();

  // Utiliser le contexte global pour le unreadCount
  const { unreadCount, setUnreadCount } = useMessagingContext();

  const navRef = useRef<HTMLUListElement>(null);

  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  // Initialiser le compteur au montage depuis le serveur
  useEffect(() => {
    const initializeUnreadCount = async () => {
      try {
        const count = await getUnreadMessagesCountAction();
        setUnreadCount(count);
      } catch (error) {
        console.error("Erreur initialisation compteur:", error);
      }
    };

    initializeUnreadCount();
  }, [setUnreadCount]);

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

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/mes-rendez-vous", label: "Rendez-vous" },
    { href: "/clients", label: "Clients" },
    { href: "/messagerie", label: "Messagerie" },
    { href: "/stocks", label: "Stocks" },
    { href: "/mon-portfolio", label: "Portfolio" },
    { href: "/mes-produits", label: "Produits" },
    { href: "/review", label: "Avis" },
    { href: "/factures", label: "Factures" },
    // { href: "/mon-compte", label: "Mon Compte" },
  ];

  return (
    <nav className="flex justify-between items-center py-4 pb-6 shadow-lg mx-20">
      <div className="absolute bottom-0 left-0 right-0 h-1 animate-pulse bg-gradient-to-r from-tertiary-500 to-tertiary-400 rounded-2xl"></div>{" "}
      <Link
        href={"/"}
        className="font-two uppercase font-bold text-xl text-white"
      >
        {user?.salonName || "INKERA"}
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
              } pb-1 text-white text-sm font-three pt-1 px-2 tracking-widest hover:text-white/70 transition-all duration-300 relative`}
            >
              <Link href={link.href}>{link.label}</Link>
              {link.label === "Messagerie" && unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </li>
          );
        })}
        <li className="relative z-[9999]">
          <button
            onClick={toggleMenu}
            className="cursor-pointer items-center text-white hover:text-white/70 transition duration-300"
          >
            <CgProfile size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-4 p-2 w-[400px] bg-noir-700 text-white rounded shadow-lg z-50 flex flex-col gap-2">
              <Link
                href="/mon-compte"
                className="flex items-center h-12 text-sm font-one w-full text-left hover:bg-noir-500 transition-colors rounded-xl px-4"
                onClick={() => setShowMenu(false)}
              >
                <CgProfile size={20} className="inline-block mr-3" />
                Profil
              </Link>

              <Link
                href="/parametres"
                className="flex items-center px-4 h-12 text-sm font-one hover:bg-noir-500 transition-colors rounded-xl"
                onClick={() => setShowMenu(false)}
              >
                <CiSettings size={20} className="inline-block mr-3" />
                Paramètres du compte
              </Link>

              <div
                className="flex items-center h-12 text-sm font-one w-full text-left hover:bg-noir-500 transition-colors rounded-xl"
                onClick={() => setShowMenu(false)}
              >
                <LogoutBtn>
                  <span>Se déconnecter</span>
                </LogoutBtn>
              </div>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
