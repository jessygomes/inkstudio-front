"use client";
import { useSession } from "next-auth/react";
import { LogoutBtn } from "@/components/Auth/LogoutBtn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMessagingContext } from "@/components/Providers/MessagingProvider";
import { getUnreadMessagesCountAction } from "@/lib/queries/conversation.action";

import { CgProfile } from "react-icons/cg";
import { CiSettings } from "react-icons/ci";
import Image from "next/image";

export default function NavbarApp() {
  const { data: session } = useSession();
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
      // Ne pas essayer de récupérer les messages si la session n'est pas complète
      if (!session || !session.user?.id) {
        console.log("Session incomplète, skip messages count");
        return;
      }

      try {
        const count = await getUnreadMessagesCountAction();
        setUnreadCount(count);
      } catch (error) {
        console.error("Erreur initialisation compteur:", error);
        // En cas d'erreur, mettre le count à 0 au lieu de planter
        setUnreadCount(0);
      }
    };

    initializeUnreadCount();
  }, [setUnreadCount, session]);

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
    <nav className="flex justify-end items-center py-4 pb-4 shadow-lg mx-10">
      <div className="absolute bottom-0 left-0 right-0 h-1 animate-pulse bg-gradient-to-r from-tertiary-500 to-tertiary-400 rounded-2xl"></div>{" "}
      {/* <Link
        href={"/"}
        className="font-two uppercase font-bold text-lg text-white"
      >
        {user?.salonName || "INKERA"}
      </Link> */}
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
              } pb-1 text-white text-xs font-three pt-1 px-2 tracking-widest hover:text-white/70 transition-all duration-300 relative`}
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
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt="Salon"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border-2 border-tertiary-400"
              />
            ) : (
              <CgProfile size={20} />
            )}
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
