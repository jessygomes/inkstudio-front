"use client";
import { ActivityBadge, activityKindForHref } from "@/components/Providers/ActivityNotificationsProvider";
import NavbarAccountMenu from "./NavbarAccountMenu";
import NotificationBadge from "@/components/Shared/NotificationBadge";

import { useSession } from "next-auth/react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useMessagingContext } from "@/components/Providers/MessagingProvider";
import { getUnreadMessagesCountAction } from "@/lib/queries/conversation.action";
import { MdAccountCircle, MdDashboard, MdEvent, MdOutlineMessage, MdPeople, MdPhotoLibrary, MdShoppingBag, MdMenuOpen, MdMenu, MdPublic, MdAdminPanelSettings } from "react-icons/md";
import { FaDatabase, FaBolt } from "react-icons/fa";


import Image from "next/image";

interface NavbarAppProps {
  backOfficeHref?: string | null;
  collapsed: boolean;
  onToggle: () => void;
}

export default function NavbarApp({ collapsed, onToggle, backOfficeHref }: NavbarAppProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isFreePlan =
    String(session?.user?.saasPlan || "")
      .trim()
      .toUpperCase() === "FREE";
  const { unreadCount, setUnreadCount } = useMessagingContext();



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

    void initializeUnreadCount();
    // Garde le badge cohérent même si un message arrive depuis un autre appareil.
    const timer = window.setInterval(() => void initializeUnreadCount(), 10000);
    return () => window.clearInterval(timer);
  }, [setUnreadCount, session]);



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
    ...(backOfficeHref && session?.user?.role === "admin" && session.error !== "AccessTokenExpired" ? [{ href: backOfficeHref, label: "BO", icon: MdAdminPanelSettings }] : []),
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
  );

  return (
    <nav
      aria-label="Navigation principale"
      className="relative flex h-full min-h-0 w-full flex-col border-r border-white/10 bg-noir-700 px-3 py-4"
    >
      <div
        className={`relative mb-4 shrink-0 overflow-hidden transition-[height] duration-300 ease-in-out ${
          collapsed ? "h-[88px]" : "h-9"
        }`}
      >
        <Link
          href="/"
          aria-label="Inkera - Accueil"
          className="absolute left-[7px] top-0 shrink-0"
        >
          <Image
            src="/images/LogoProfil.png"
            alt="Inkera"
            width={32}
            height={32}
            className="app-sidebar-logo-dark h-9 w-9 object-contain"
          />
          <Image
            src="/images/Logo15.png"
            alt="Inkera"
            width={32}
            height={32}
            className="app-sidebar-logo-light h-9 w-9 object-contain"
          />
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Développer la barre latérale" : "Rétracter la barre latérale"}
          title={collapsed ? "Développer" : "Rétracter"}
          className={`absolute flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-white/60 transition-all duration-300 ease-in-out hover:bg-tertiary-400/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 ${
            collapsed ? "left-[7px] top-[52px]" : "left-[calc(100%-36px)] top-0"
          }`}
        >
          {collapsed ? <MdMenu size={22} /> : <MdMenuOpen size={22} />}
        </button>
      </div>

      <ul className={`scrollbar-hidden flex min-h-0 flex-1 flex-col ${collapsed ? "gap-0.5" : "gap-1"} overflow-y-auto overflow-x-hidden`}>
        {filteredLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          const activityKind = activityKindForHref(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                title={collapsed ? link.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex ${collapsed ? "min-h-9" : "min-h-11"} items-center gap-3 overflow-hidden rounded-xl px-[15px] text-sm transition-colors duration-300 ${
                  isActive
                    ? "bg-tertiary-400/15 text-white shadow-sm shadow-tertiary-500/10"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={collapsed ? 18 : 20} className="shrink-0" aria-hidden="true" />
                <span
                  className={`min-w-0 flex-1 truncate whitespace-nowrap font-one transition-opacity duration-300 ${
                    collapsed ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {link.label}
                </span>
                {activityKind && <span className={collapsed ? "absolute right-0.5 top-0.5" : ""}><ActivityBadge kind={activityKind} /></span>}
                {link.label === "Messagerie" && unreadCount > 0 && (
                  <NotificationBadge count={unreadCount} label="messages non lus" className={collapsed ? "absolute right-0.5 top-0.5" : ""} />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {!isFreePlan && (() => {
        const isActive = pathname === "/explorer" || pathname.startsWith("/explorer/");
        return (
          <div className="mt-3 shrink-0 border-t border-white/10 pt-3">
            <Link
              href="/explorer"
              title={collapsed ? "Explorer" : undefined}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex ${collapsed ? "min-h-9" : "min-h-11"} items-center gap-3 overflow-hidden rounded-xl px-[15px] text-sm transition-colors duration-300 ${
                isActive
                  ? "bg-tertiary-400/15 text-white shadow-sm shadow-tertiary-500/10"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <MdPublic size={collapsed ? 18 : 20} className="shrink-0" aria-hidden="true" />
              <span className={`min-w-0 flex-1 truncate whitespace-nowrap font-one transition-opacity duration-300 ${collapsed ? "opacity-0" : "opacity-100"}`}>
                Explorer
              </span>
            </Link>
          </div>
        );
      })()}

      <div className="mt-3 shrink-0 border-t border-white/10 pt-3"><NavbarAccountMenu collapsed={collapsed} /></div>
    </nav>
  );
}
