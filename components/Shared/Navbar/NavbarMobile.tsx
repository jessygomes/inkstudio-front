"use client";
import { useUser } from "@/components/Auth/Context/UserContext";
import { LogoutBtn } from "@/components/Auth/LogoutBtn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MdMenu, MdClose } from "react-icons/md";
// import { CgProfile } from "react-icons/cg";
import { CiSettings } from "react-icons/ci";
import { FaDatabase } from "react-icons/fa";
import {
  MdDashboard,
  MdEvent,
  MdPeople,
  MdPhotoLibrary,
  MdShoppingBag,
  MdAccountCircle,
} from "react-icons/md";
import { PiInvoiceDuotone } from "react-icons/pi";

export default function NavbarMobile() {
  const user = useUser();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  // const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  // const profileRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    // setShowProfileMenu(false);
  };

  // const toggleProfileMenu = () => {
  //   // setShowProfileMenu((prev) => !prev);
  // };

  const handleClickOutside = (event: MouseEvent) => {
    if (navRef.current && !navRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      // setShowProfileMenu(false);
    }
  };

  const links = [
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
      href: "/clients",
      label: "Clients",
      icon: <MdPeople size={20} />,
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
      href: "/mes-produits",
      label: "Produits",
      icon: <MdShoppingBag size={20} />,
    },
    {
      href: "/review",
      label: "Avis",
      icon: <MdAccountCircle size={20} />,
    },
    {
      href: "/factures",
      label: "Factures",
      icon: <PiInvoiceDuotone size={20} />,
    },
    {
      href: "/mon-compte",
      label: "Mon Compte",
      icon: <MdAccountCircle size={20} />,
    },
  ];

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Empêcher le scroll du body quand la navbar est ouverte
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      // Restaurer le scroll du body
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50); // Activer le blur après 50px de scroll
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      )}

      {/* Mobile Navigation Menu */}
      <div
        ref={navRef}
        className={`fixed top-0 right-0 w-80 h-screen bg-noir-700 text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 z-50" : "translate-x-full -z-10"
        }`}
        style={{
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 bg-noir-600">
          <div className="text-lg font-bold font-two">
            {user?.salonName || "InkStudio"}
          </div>
          <button
            onClick={handleClose}
            className="text-2xl hover:text-white/70 transition-colors"
          >
            <MdClose />
          </button>
        </div>

        {/* Navigation Links - Prend l'espace restant */}
        <div className="flex flex-col h-full pb-16 bg-noir-700">
          <div className="flex-1 overflow-y-auto p-4">
            <ul className="flex flex-col space-y-2">
              {links.map((link, index) => {
                const isActive = pathname === link.href;

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
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Separator */}
            <div className="h-px bg-white/20 my-6"></div>

            {/* Profile Section */}
            <div className="space-y-2">
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
          <div className="p-4 text-center border-t border-white/20 bg-noir-600">
            <p className="text-white/50 text-xs font-one">
              Version mobile • Inkera Studio
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar - Style App Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-noir-700/95 backdrop-blur-md border-t border-white/20">
        <div className="flex items-center justify-around py-2 px-4">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
              pathname === "/dashboard"
                ? "text-tertiary-400"
                : "text-white/70 hover:text-white active:scale-95"
            }`}
          >
            <MdDashboard size={20} />
            <span className="text-xs font-one mt-1">Dashboard</span>
          </Link>

          {/* RDV */}
          <Link
            href="/mes-rendez-vous"
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
              pathname === "/mes-rendez-vous"
                ? "text-tertiary-400"
                : "text-white/70 hover:text-white active:scale-95"
            }`}
          >
            <MdEvent size={20} />
            <span className="text-xs font-one mt-1">RDV</span>
          </Link>

          {/* Clients */}
          <Link
            href="/clients"
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
              pathname === "/clients"
                ? "text-tertiary-400"
                : "text-white/70 hover:text-white active:scale-95"
            }`}
          >
            <MdPeople size={20} />
            <span className="text-xs font-one mt-1">Clients</span>
          </Link>

          {/* Portfolio */}
          <Link
            href="/stocks"
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
              pathname === "/mon-portfolio"
                ? "text-tertiary-400"
                : "text-white/70 hover:text-white active:scale-95"
            }`}
          >
            <FaDatabase size={20} />
            <span className="text-xs font-one mt-1">Stocks</span>
          </Link>

          {/* Menu Plus */}
          <button
            onClick={handleOpen}
            className="flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 text-white/70 hover:text-white active:scale-95"
          >
            <MdMenu size={20} />
            <span className="text-xs font-one mt-1">Plus</span>
          </button>
        </div>

        {/* Indicateur de page active */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-tertiary-500 to-tertiary-400"></div>
      </div>
    </>
  );
}
