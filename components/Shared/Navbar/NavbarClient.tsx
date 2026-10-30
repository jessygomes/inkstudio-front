"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowUpRight } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import { ROUTES } from "@/lib/routes";
import { useNavbarScrolled } from "./useNavbarScrolled";

interface NavbarClientProps {
  links: Array<{ href: string; label: string; highlight?: boolean }>;
}

export function NavbarClient({ links }: NavbarClientProps) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user && !session?.error;
  const pathname = usePathname();
  const isScrolled = useNavbarScrolled();

  return (
    <nav aria-label="Navigation principale" className={`border-b px-6 py-5 text-white transition-colors duration-300 xl:px-12 ${isScrolled ? "border-white/10 bg-noir-800/95 backdrop-blur-xl" : "border-transparent bg-transparent"}`}>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5">
        <Link href={ROUTES.home} className="shrink-0">
          <Image src="/logo/logo_inline_studio_white_2.png" alt="INKERA Studio · Accueil" width={150} height={50} className="h-auto w-[120px] xl:w-[150px]" />
        </Link>
        <ul className="flex items-center gap-4 xl:gap-7">
          {links.map(link => <li key={link.href}>{link.highlight ? (
            <DashboardButton href={link.href} target="_blank" rel="noopener noreferrer" variant="secondary" className="min-w-0 border-cuatro-500/40 bg-cuatro-500/10">
              {link.label}<ArrowUpRight size={14} aria-hidden="true" />
            </DashboardButton>
          ) : (
            <Link href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={`font-two text-xs transition-colors xl:text-sm ${pathname === link.href ? "text-tertiary-400" : "text-white/70 hover:text-white"}`}>{link.label}</Link>
          )}</li>)}
          <li><DashboardButton href={isLoggedIn ? ROUTES.dashboard : ROUTES.connexion} className="min-w-0">{isLoggedIn ? "Dashboard" : "Connexion"}</DashboardButton></li>
        </ul>
      </div>
    </nav>
  );
}
