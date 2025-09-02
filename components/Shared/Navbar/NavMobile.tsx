"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MdMenu, MdClose } from "react-icons/md";

export default function NavMobile() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleClickOutside = (event: MouseEvent) => {
    if (navRef.current && !navRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const links = [
    { href: "/", label: "Accueil", icon: "🏠" },
    { href: "/solutions", label: "Solutions", icon: "⚡" },
    { href: "/tarification", label: "Tarification", icon: "💰" },
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
    <nav>
      <div className="flex items-center justify-between text-white">
        <button
          onClick={handleOpen}
          className="text-2xl p-2 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
        >
          <MdMenu size={32} className="text-white" />
        </button>
      </div>

      {/* Overlay avec blur */}
      {isOpen && (
        <div className="fixed inset-0 bg-noir-700/60 backdrop-blur-sm z-40 transition-opacity duration-300" />
      )}

      <div
        ref={navRef}
        className={`fixed top-0 right-0 z-50 w-80 h-full bg-gradient-to-br from-noir-600/95 to-noir-800/95 backdrop-blur-xl text-white transform transition-all duration-500 ease-out ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        } border-l border-white/10 shadow-2xl`}
      >
        {/* Header moderne */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-two">InkStudio</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-2xl p-2 rounded-xl hover:bg-white/10 transition-all duration-300"
          >
            <MdClose />
          </button>
        </div>

        {/* Navigation links modernisés */}
        <div className="flex-1 px-6 py-8">
          <ul className="space-y-2">
            {links.map((link, index) => {
              const isActive =
                pathname === link.href ||
                (link.href === "#cestquoi" && pathname === "/");

              return (
                <li key={index}>
                  <Link
                    href={
                      link.href === "#cestquoi" && pathname !== "/"
                        ? `/#cestquoi`
                        : link.href
                    }
                    onClick={handleClose}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                      isActive
                        ? "bg-gradient-to-r from-tertiary-400/20 to-tertiary-500/20 border border-tertiary-400/30 text-white"
                        : "hover:bg-white/5 text-white/80 hover:text-white"
                    }`}
                  >
                    {/* <span className="text-2xl">{link.icon}</span> */}
                    <div className="flex-1">
                      <span className="text-lg font-medium font-one tracking-wide">
                        {link.label}
                      </span>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-tertiary-400"
                          : "bg-transparent group-hover:bg-white/30"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer avec bouton connexion modernisé */}
        <div className="p-6 border-t border-white/10">
          <Link
            href={"/connexion"}
            onClick={handleClose}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 px-6 py-4 rounded-2xl transition-all duration-300 font-one font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Connexion
          </Link>
        </div>
      </div>
    </nav>
  );
}
