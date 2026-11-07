"use client";
import { ActivityBadge, activityKindForHref } from "@/components/Providers/ActivityNotificationsProvider";
import { useMessagingContext } from "@/components/Providers/MessagingProvider";
import { useSession } from "next-auth/react";
import NavbarAccountMenu from "./NavbarAccountMenu";
import NotificationBadge from "@/components/Shared/NotificationBadge";
import NotificationBell from "@/components/Shared/NotificationCenter/NotificationBell";
import { useUser } from "@/components/Auth/Context/UserContext";
import { LogoutBtn } from "@/components/Auth/LogoutBtn";
import { makeSlug } from "@/lib/utils/makeLink";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdMenu, MdClose } from "react-icons/md";
import { QRCodeSVG } from "qrcode.react";
import styles from "./NavbarMobile.module.css";
// import { CgProfile } from "react-icons/cg";
import { CiSettings } from "react-icons/ci";
import { FaDatabase } from "react-icons/fa";
import { MdDashboard, MdEvent, MdPeople, MdPhotoLibrary, MdShoppingBag, MdAccountCircle, MdOutlineMessage, MdQrCode, MdAdminPanelSettings } from "react-icons/md";


export default function NavbarMobile({ backOfficeHref }: { backOfficeHref?: string | null }) {
  const { data: session } = useSession();
  const user = useUser();
  const { unreadCount } = useMessagingContext();
  const pathname = usePathname();
  const isFreePlan =
    String(user?.saasPlan || "")
      .trim()
      .toUpperCase() === "FREE";
  const [isOpen, setIsOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [origin, setOrigin] = useState("");
  // const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  // const profileRef = useRef<HTMLDivElement>(null);

  const frontendPublicUrl = process.env.NEXT_PUBLIC_FRONTENDPUBLIC_URL?.replace(
    /\/$/,
    ""
  );
  const qrProfilePath = user?.salonName
    ? `/salon/${makeSlug(user.salonName)}`
    : "";
  const qrPublicHref = qrProfilePath
    ? frontendPublicUrl
      ? `${frontendPublicUrl}${qrProfilePath}`
      : origin
      ? `${origin}${qrProfilePath}`
      : qrProfilePath
    : "";

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    // setShowProfileMenu(false);
  };
  const openQrModal = () => {
    setIsOpen(false);
    setIsQrModalOpen(true);
  };
  const closeQrModal = () => setIsQrModalOpen(false);

  // const toggleProfileMenu = () => {
  //   // setShowProfileMenu((prev) => !prev);
  // };

  const handleClickOutside = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest("[data-account-menu]")) return;
    if (navRef.current && !navRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      // setShowProfileMenu(false);
    }
  };

  const links = [
    { href: "/explorer", label: "Explorer", icon: <MdPhotoLibrary size={20} /> },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <MdDashboard size={20} />,
    },
    {
      href: "/mes-rendez-vous",
      label: "Rendez-vous",
      icon: <MdEvent size={20} />,
    },
    {
      href: "/suiviDessin",
      label: "Suivi dessin",
      icon: <MdPhotoLibrary size={20} />,
    },
    {
      href: "/clients",
      label: "Clients",
      icon: <MdPeople size={20} />,
    },
    {
      href: "/messagerie",
      label: "Messagerie",
      icon: <MdOutlineMessage size={20} />,
    },
    {
      href: "/stocks",
      label: "Stocks",
      icon: <FaDatabase size={20} />,
    },
    {
      href: "/mon-portfolio",
      label: "Portfolio",
      icon: <MdPhotoLibrary size={20} />,
    },
    {
      href: "/mes-flashs",
      label: "Flashs",
      icon: <MdPhotoLibrary size={20} />,
    },
    {
      href: "/mes-produits",
      label: "Produits",
      icon: <MdShoppingBag size={20} />,
    },
    {
      href: "/review",
      label: "Avis",
      icon: <MdAccountCircle size={20} />,
    },
    ...(backOfficeHref && session?.user?.role === "admin" && session.error !== "AccessTokenExpired" ? [{ href: backOfficeHref, label: "BO", icon: <MdAdminPanelSettings size={20} /> }] : []),
    // {
    //   href: "/factures",
    //   label: "Factures",
    //   icon: <PiInvoiceDuotone size={20} />,
    // },
  ];

  const filteredLinks = isFreePlan
    ? links.filter(
        (link) =>
          ![
            "/mes-rendez-vous",
            "/suiviDessin",
            "/clients",
            "/messagerie",
            "/explorer",
            "/stocks",
          ].includes(link.href)
      )
    : links;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    if (isOpen || isQrModalOpen) document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isQrModalOpen]);

  useEffect(() => {
    setIsClient(true);
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!isQrModalOpen && !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeQrModal();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isQrModalOpen, isOpen]);

  const bottomLinks = [
    { href: "/dashboard", label: "Dashboard", Icon: MdDashboard },
    ...(!isFreePlan ? [
      { href: "/mes-rendez-vous", label: "RDV", Icon: MdEvent },
      { href: "/clients", label: "Clients", Icon: MdPeople },
      { href: "/messagerie", label: "Messages", Icon: MdOutlineMessage },
      { href: "/stocks", label: "Stocks", Icon: FaDatabase, visibility: styles.fromSmall },
    ] : []),
    { href: "/mon-portfolio", label: "Portfolio", Icon: MdPhotoLibrary, visibility: styles.fromMedium },
    { href: "/mes-produits", label: "Produits", Icon: MdShoppingBag, visibility: styles.fromLarge },
    { href: "/review", label: "Avis", Icon: MdAccountCircle, visibility: styles.fromLarge },
  ];
  const isRouteActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isMoreActive = isOpen || isRouteActive("/parametres") || isRouteActive("/mon-compte") ||
    filteredLinks.some(link => isRouteActive(link.href) && !bottomLinks.some(bottom => bottom.href === link.href));

  return (
    <>
      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      )}

      {/* Mobile Navigation Menu */}
      <div
        ref={navRef}
        id="app-mobile-menu"
        aria-label="Tous les accès du studio"
        inert={!isOpen}
        className={`${styles.drawer} transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 z-50" : "translate-x-full -z-10"
        }`}
        style={{
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className="min-w-0 flex-1"><NavbarAccountMenu placement="below" salonName={user?.salonName} onNavigate={handleClose} /></div>
          <button
            onClick={handleClose}
            type="button" aria-label="Fermer le menu" className={styles.closeButton}
          >
            <MdClose />
          </button>
        </div>

        {/* Navigation Links - Prend l'espace restant */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <ul className="flex flex-col space-y-2">
              {filteredLinks.map((link, index) => {
                const isActive = isRouteActive(link.href);

                return (
                  <li key={index}>
                    <Link
                      href={link.href}
                      onClick={handleClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                        isActive
                          ? "bg-tertiary-500/20 text-tertiary-400 border border-tertiary-500/30"
                          : "text-white hover:bg-white/5 hover:text-tertiary-400"
                      }`}
                    >
                      {link.icon}
                      <span className="font-one text-sm">{link.label}</span>
                      {activityKindForHref(link.href) && <ActivityBadge kind={activityKindForHref(link.href)!} />}
                      {link.href === "/messagerie" && <NotificationBadge count={unreadCount} label="messages non lus" />}
                    </Link>
                  </li>
                );
              })}
              <li><NotificationBell className="min-h-12 text-white hover:text-tertiary-400" onOpen={handleClose} /></li>
            </ul>

            {/* Separator */}
            <div className="h-px bg-white/20 my-6"></div>

            {/* Profile Section */}
            <div className="space-y-2">
              <button
                onClick={openQrModal}
                className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 hover:text-tertiary-400 rounded-lg transition-all duration-300"
              >
                <MdQrCode size={20} />
                <span className="font-one text-sm">QR code</span>
              </button>

              <Link
                href="/parametres"
                onClick={handleClose}
                className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 hover:text-tertiary-400 rounded-lg transition-all duration-300"
              >
                <CiSettings size={20} />
                <span className="font-one text-sm">Paramètres</span>
              </Link>

              <div className="flex items-center gap-3 py-3 text-white hover:bg-white/5 hover:text-red-400 rounded-lg transition-all duration-300">
                <LogoutBtn>
                  <span className="font-one text-sm">Se déconnecter</span>
                </LogoutBtn>
              </div>
            </div>
          </div>

          {/* Footer - Fixé en bas */}
          <div className={styles.drawerFooter}>
            <p className="text-white/50 text-xs font-one">
              Version mobile • Inkera Studio
            </p>
          </div>
        </div>
      </div>

      <nav data-app-mobile-nav aria-label="Navigation principale mobile" className={styles.bar}>
        <div className={styles.items}>
          {bottomLinks.map(({ href, label, Icon, visibility }) => {
            const isActive = !isOpen && !isQrModalOpen && isRouteActive(href);
            const activityKind = activityKindForHref(href);
            return (
              <Link key={href} href={href} onClick={handleClose}
                aria-current={isRouteActive(href) ? "page" : undefined}
                className={[styles.item, visibility, isActive && styles.active].filter(Boolean).join(" ")}>
                <span className={styles.icon}>
                  <Icon size={21} aria-hidden="true" />
                  <span className={styles.badge}>
                    {activityKind && <ActivityBadge kind={activityKind} />}
                    {href === "/messagerie" && <NotificationBadge count={unreadCount} label="messages non lus" />}
                  </span>
                </span>
                <span className={styles.label}>{label}</span>
              </Link>
            );
          })}
          <button type="button" onClick={openQrModal} disabled={!qrPublicHref}
            aria-label="Afficher le QR code du salon" aria-haspopup="dialog"
            className={[styles.item, isQrModalOpen && styles.active].filter(Boolean).join(" ")}>
            <span className={styles.icon}><MdQrCode size={21} aria-hidden="true" /></span>
            <span className={styles.label}>QR code</span>
          </button>
          <button type="button" onClick={isOpen ? handleClose : handleOpen}
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen} aria-controls="app-mobile-menu"
            className={[styles.item, styles.more, isMoreActive && !isQrModalOpen && styles.active].filter(Boolean).join(" ")}>
            <span className={styles.icon}>{isOpen ? <MdClose size={21} aria-hidden="true" /> : <MdMenu size={21} aria-hidden="true" />}</span>
            <span className={styles.label}>Plus</span>
          </button>
        </div>
      </nav>

      {isClient &&
        isQrModalOpen &&
        qrPublicHref &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex h-[100svh] items-center justify-center bg-black/70 p-4">
            <div
              className="absolute inset-0"
              onClick={closeQrModal}
              aria-hidden="true"
            />

            <div className="relative w-full max-w-xs rounded-2xl border border-white/15 bg-noir-500 p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-white font-one">Profil public</p>
                <button
                  onClick={closeQrModal}
                  className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-white/90 font-one"
                >
                  Fermer
                </button>
              </div>

              <div className="mx-auto w-fit rounded-xl bg-[#fff] p-3">
                <QRCodeSVG
                  value={qrPublicHref}
                  size={220}
                  includeMargin
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#111111"
                />
              </div>

              <p className="mt-3 truncate text-center text-[11px] text-white/65 font-one">
                {qrPublicHref}
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
