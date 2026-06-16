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
  const avatarSrc = session?.user?.profileImage || session?.user?.image || null;
  const isFreePlan =
    String(session?.user?.saasPlan || "")
      .trim()
      .toUpperCase() === "FREE";

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
    { href: "/mes-flashs", label: "Flashs" },
    { href: "/mes-produits", label: "Produits" },
    { href: "/review", label: "Avis" },
    { href: "/mon-compte", label: "Mon profil" },
    // { href: "/factures", label: "Factures" },
  ];

  const filteredLinks = isFreePlan
    ? links.filter(
        (link) =>
          ![
            "/mes-rendez-vous",
            "/clients",
            "/messagerie",
            "/stocks",
          ].includes(link.href)
      )
    : links;

  return (
    <nav className="relative flex items-center py-3 pb-3 shadow-lg mx-10">
      <div className="absolute bottom-0 left-0 right-0 h-0.5 animate-pulse bg-gradient-to-r from-transparent via-tertiary-400 to-transparent rounded-full"></div>

      {/* Logo à gauche */}
      <Link href="/" className="flex-shrink-0">
        <Image
          src="/images/LogoProfil.png"
          alt="Inkera"
          width={32}
          height={32}
          className="h-9 w-9 object-contain opacity-90 hover:opacity-100 transition-opacity duration-200"
        />
      </Link>

      {/* Links centrés */}
      <ul className="absolute left-1/2 -translate-x-1/2 flex flex-nowrap items-center gap-2 whitespace-nowrap">
        {filteredLinks.map((link, index) => {
          const isActive = pathname === link.href;
          return (
            <li key={index}>
              <Link
                href={link.href}
                className={`relative flex items-center px-3 py-1.5 text-xs font-three tracking-widest transition-all duration-300 rounded-2xl ${
                  isActive
                    ? "bg-tertiary-400/15 border border-tertiary-400/30 text-white font-semibold shadow-sm shadow-tertiary-500/10"
                    : "text-white/60 hover:text-white border border-transparent hover:bg-white/5"
                }`}
              >
                {link.label}
                {link.label === "Messagerie" && unreadCount > 0 && (
                  <span className="ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-400 to-tertiary-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Profil à droite */}
      <ul ref={navRef} className="ml-auto flex items-center">
        <li className="relative z-[9999]">
          <button
            onClick={toggleMenu}
            className="cursor-pointer items-center text-white hover:text-white/70 transition duration-300"
          >
            {avatarSrc ? (
              <Image
                src={avatarSrc}
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
            <div className="absolute right-0 mt-4 p-2 w-[400px] bg-noir-700 text-white rounded-2xl shadow-lg z-50 flex flex-col gap-2">
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
