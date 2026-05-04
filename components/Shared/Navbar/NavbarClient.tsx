"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

interface NavbarClientProps {
  links: Array<{ href: string; label: string; highlight?: boolean }>;
}

export function NavbarClient({ links }: NavbarClientProps) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const pathname = usePathname();
  const navRef = useRef<HTMLUListElement>(null);

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
    <nav
      className={`flex justify-between items-center py-4 px-20  ${
        isScrolled ? "backdrop-blur-md" : "backdrop-blur-none"
      }`}
    >
      <Link href={"/"} className="flex items-center gap-2">
        <Image
          src="/images/logo_inline_studio_white.png"
          alt="Logo"
          width={150}
          height={50}
        />
      </Link>
      <ul ref={navRef} className="flex gap-8">
        {links.map((link, index) => {
          const isActive = pathname === link.href;

          if (link.highlight) {
            return (
              <li key={index}>
                <Link
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-tertiary-400/40 bg-tertiary-400/10 px-4 py-1.5 text-xs font-two font-medium text-tertiary-500 tracking-widest transition-all duration-300 hover:bg-tertiary-400/20 hover:text-white hover:border-tertiary-400/70"
                >
                  {link.label}
                </Link>
              </li>
            );
          }

          return (
            <li
              key={index}
              className={`${
                isActive ? "active font-two text-white font-bold" : "font-thin"
              } pb-1 text-white text-sm font-two pt-1 px-2 tracking-widest hover:text-white/70 transition-all duration-300`}
            >
              <Link
                href={link.href}
                {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
        <Link href={isLoggedIn ? "/dashboard" : "/connexion"}>
          <div className="cursor-pointer px-8 py-1.5 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-2xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-two text-xs">
            {isLoggedIn ? "Dashboard" : "Connexion"}
          </div>
        </Link>
      </ul>
    </nav>
  );
}
