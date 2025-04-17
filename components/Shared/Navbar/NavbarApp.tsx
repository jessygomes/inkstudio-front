"use client";
import { useUser } from "@/components/Auth/Context/UserContext";
import { LogoutBtn } from "@/components/Auth/LogoutBtn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

export default function NavbarApp() {
  const user = useUser();
  const pathname = usePathname();

  const navRef = useRef<HTMLUListElement>(null);

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/mes-rendez-vous", label: "Rendez-vous" },
    { href: "/clients", label: "Clients" },
    { href: "/mon-portfolio", label: "Portfolio" },
    { href: "/mes-produits", label: "Produits" },
    { href: "/mon-compte", label: "Mon Compte" },
  ];

  return (
    <nav className="flex justify-between items-center py-4 mx-20">
      {" "}
      <Link
        href={"/"}
        className="font-two uppercase font-bold text-xl text-white"
      >
        {user?.name || "InkStudio"}
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
        <LogoutBtn>Se déconnecter</LogoutBtn>
      </ul>
    </nav>
  );
}
