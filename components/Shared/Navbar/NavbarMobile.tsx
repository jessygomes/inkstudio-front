"use client";
import { useUser } from "@/components/Auth/Context/UserContext";
import { LogoutBtn } from "@/components/Auth/LogoutBtn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MdMenu, MdClose } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { CiSettings } from "react-icons/ci";
import {
  MdDashboard,
  MdEvent,
  MdPeople,
  MdPhotoLibrary,
  MdShoppingBag,
  MdAccountCircle,
} from "react-icons/md";

export default function NavbarMobile() {
  const user = useUser();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (navRef.current && !navRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setShowProfileMenu(false);
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
      href: "/mon-compte",
      label: "Mon Compte",
      icon: <MdAccountCircle size={20} />,
    },
  ];

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="flex justify-between items-center py-4 pb-6 shadow-lg backdrop-blur-md px-4">
      <div className="absolute bottom-0 left-0 right-0 h-1 animate-pulse bg-gradient-to-r from-tertiary-500 to-tertiary-400 rounded-2xl"></div>

      {/* Logo */}
      <Link
        href={"/dashboard"}
        className="font-two uppercase font-bold text-lg text-white"
      >
        {user?.salonName || "InkStudio"}
      </Link>

      {/* Menu Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleProfileMenu}
          className="cursor-pointer text-white hover:text-white/70 transition duration-300"
        >
          <CgProfile size={20} />
        </button>

        <button onClick={handleOpen} className="text-white">
          <MdMenu size={24} />
        </button>
      </div>

      {/* Profile Dropdown */}
      {showProfileMenu && (
        <div
          ref={profileRef}
          className="absolute top-16 right-4 w-64 bg-noir-700 text-white rounded-lg shadow-lg z-50 flex flex-col gap-2 p-2"
        >
          <Link
            href="/parametres"
            className="flex items-center px-4 h-12 text-sm font-one hover:bg-noir-500 transition-colors rounded-lg"
            onClick={() => setShowProfileMenu(false)}
          >
            <CiSettings size={20} className="inline-block mr-3" />
            Paramètres du compte
          </Link>

          <div
            className="flex items-center h-12 text-sm font-one w-full text-left hover:bg-noir-500 transition-colors rounded-lg"
            onClick={() => setShowProfileMenu(false)}
          >
            <LogoutBtn>
              <span>Se déconnecter</span>
            </LogoutBtn>
          </div>
        </div>
      )}

      {/* Mobile Navigation Menu - Fond complètement opaque */}
      <div
        ref={navRef}
        className={`fixed top-0 right-0 z-50 w-80 h-screen bg-noir-700 text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
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

              <div className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 hover:text-red-400 rounded-lg transition-all duration-300">
                <LogoutBtn>
                  <span className="font-one text-sm">Se déconnecter</span>
                </LogoutBtn>
              </div>
            </div>
          </div>

          {/* Footer - Fixé en bas */}
          <div className="p-4 text-center border-t border-white/20 bg-noir-600">
            <p className="text-white/50 text-xs font-one">
              Version mobile • InkStudio
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
