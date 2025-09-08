"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

export default function Navbar() {
  const pathname = usePathname();

  const navRef = useRef<HTMLUListElement>(null);

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/solutions", label: "Solutions" },
    { href: "/tarification", label: "Tarification" },
    { href: "/a-propos-de-inkstudio", label: "A propos de InkStudio" },
  ];

  return (
    <nav className="flex justify-between items-center py-4 mx-20">
      {" "}
      <Link
        href={"/"}
        className="font-two uppercase font-bold text-xl text-white"
      >
        InkStudio
      </Link>
      <ul ref={navRef} className="flex gap-8">
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
        <Link href={"/connexion"}>
          <div className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs">
            Connexion
          </div>
        </Link>
      </ul>
    </nav>
  );
}
