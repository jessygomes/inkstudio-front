"use client";

import { useSession } from "next-auth/react";
import { LogoutBtn } from "@/components/Auth/LogoutBtn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMessagingContext } from "@/components/Providers/MessagingProvider";
import { getUnreadMessagesCountAction } from "@/lib/queries/conversation.action";
import {
  MdAccountCircle,
  MdDashboard,
  MdEvent,
  MdOutlineMessage,
  MdPeople,
  MdPhotoLibrary,
  MdShoppingBag,
  MdMenuOpen,
  MdMenu,
} from "react-icons/md";
import { FaDatabase, FaBolt } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { CiSettings } from "react-icons/ci";
import Image from "next/image";

interface NavbarAppProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function NavbarApp({ collapsed, onToggle }: NavbarAppProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const avatarSrc = session?.user?.profileImage || session?.user?.image || null;
  const isFreePlan =
    String(session?.user?.saasPlan || "")
      .trim()
      .toUpperCase() === "FREE";
  const { unreadCount, setUnreadCount } = useMessagingContext();
  const navRef = useRef<HTMLElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const initializeUnreadCount = async () => {
      if (!session?.user?.id) return;

      try {
        const count = await getUnreadMessagesCountAction();
        setUnreadCount(count);
      } catch (error) {
        console.error("Erreur initialisation compteur:", error);
        setUnreadCount(0);
      }
    };

    initializeUnreadCount();
  }, [setUnreadCount, session]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: MdDashboard },
    { href: "/mes-rendez-vous", label: "Rendez-vous", icon: MdEvent },
    { href: "/suiviDessin", label: "Suivi dessin", icon: MdPhotoLibrary },
    { href: "/clients", label: "Clients", icon: MdPeople },
    { href: "/messagerie", label: "Messagerie", icon: MdOutlineMessage },
    { href: "/stocks", label: "Stocks", icon: FaDatabase },
    { href: "/mon-portfolio", label: "Portfolio", icon: MdPhotoLibrary },
    { href: "/mes-flashs", label: "Flashs", icon: FaBolt },
    { href: "/mes-produits", label: "Produits", icon: MdShoppingBag },
    { href: "/review", label: "Avis", icon: MdAccountCircle },
    { href: "/mon-compte", label: "Mon profil", icon: CgProfile },
  ];

  const filteredLinks = (isFreePlan
    ? links.filter(
        (link) =>
          ![
            "/mes-rendez-vous",
            "/suiviDessin",
            "/clients",
            "/messagerie",
            "/stocks",
          ].includes(link.href),
      )
    : links
  ).filter((link) => !(collapsed && link.href === "/mon-compte"));

  return (
    <nav
      ref={navRef}
      aria-label="Navigation principale"
      className="relative flex h-full min-h-0 w-full flex-col border-r border-white/10 bg-noir-700 px-3 py-4"
    >
      <div
        className={`mb-4 flex shrink-0 items-center ${
          collapsed ? "flex-col gap-3" : "justify-between gap-3 px-2"
        }`}
      >
        <Link href="/" aria-label="Inkera - Accueil" className="shrink-0">
          <Image
            src="/images/LogoProfil.png"
            alt="Inkera"
            width={32}
            height={32}
            className="h-9 w-9 object-contain"
          />
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Développer la barre latérale" : "Rétracter la barre latérale"}
          title={collapsed ? "Développer" : "Rétracter"}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400"
        >
          {collapsed ? <MdMenu size={22} /> : <MdMenuOpen size={22} />}
        </button>
      </div>

      <ul className="scrollbar-hidden flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {filteredLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                title={collapsed ? link.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex min-h-11 items-center rounded-xl text-sm transition ${
                  collapsed ? "justify-center px-2" : "gap-3 px-3"
                } ${
                  isActive
                    ? "bg-tertiary-400/15 text-white shadow-sm shadow-tertiary-500/10"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={20} className="shrink-0" aria-hidden="true" />
                {!collapsed && (
                  <span className="min-w-0 flex-1 truncate font-one">
                    {link.label}
                  </span>
                )}
                {link.label === "Messagerie" && unreadCount > 0 && (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-400 to-tertiary-500 px-1 text-[10px] font-bold text-white ${
                      collapsed ? "absolute right-0 top-0" : ""
                    }`}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="relative mt-3 shrink-0 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={() => setShowMenu((previous) => !previous)}
          aria-expanded={showMenu}
          aria-label="Menu du compte"
          title={collapsed ? session?.user?.salonName ?? "Mon compte" : undefined}
          className={`flex min-h-11 w-full cursor-pointer items-center rounded-xl text-white/70 transition hover:bg-white/5 hover:text-white ${
            collapsed ? "justify-center px-2" : "gap-3 px-3"
          }`}
        >
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full border border-tertiary-400/60 object-cover"
            />
          ) : (
            <CgProfile size={22} className="shrink-0" />
          )}
          {!collapsed && (
            <span className="truncate text-left text-xs font-one">
              {session?.user?.salonName || "Mon compte"}
            </span>
          )}
        </button>

        {showMenu && (
          <div
            className={`absolute bottom-0 z-50 flex w-56 flex-col gap-1 rounded-xl border border-white/10 bg-noir-500 p-2 text-white shadow-xl ${
              collapsed ? "left-full ml-3" : "left-0"
            }`}
          >
            <Link
              href="/mon-compte"
              className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition hover:bg-white/5"
              onClick={() => setShowMenu(false)}
            >
              <CgProfile size={18} />
              Profil
            </Link>
            <Link
              href="/parametres"
              className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition hover:bg-white/5"
              onClick={() => setShowMenu(false)}
            >
              <CiSettings size={18} />
              Paramètres du compte
            </Link>
            <div className="flex h-10 items-center rounded-lg px-3 text-sm transition hover:bg-white/5">
              <LogoutBtn>
                <span>Se déconnecter</span>
              </LogoutBtn>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
