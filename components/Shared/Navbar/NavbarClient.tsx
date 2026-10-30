"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowUpRight, CircleUserRound, UserRound } from "lucide-react";
import { useState } from "react";
import { FaInstagram, FaTiktok } from "react-icons/fa6";
import DashboardButton from "@/components/Shared/DashboardButton";
import { ROUTES } from "@/lib/routes";
import { useNavbarScrolled } from "./useNavbarScrolled";

interface NavbarClientProps {
  links: Array<{ href: string; label: string; highlight?: boolean }>;
}

export function NavbarClient({ links }: NavbarClientProps) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user && !session?.error;
  const profileImage = session?.user?.profileImage || session?.user?.image;
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const pathname = usePathname();
  const isScrolled = useNavbarScrolled();

  return (
    <nav aria-label="Navigation principale" className={`border-b px-10 py-3 font-one text-white transition-colors duration-300 xl:px-20 ${isScrolled ? "border-white/10 bg-noir-800/95 backdrop-blur-xl" : "border-transparent bg-transparent"}`}>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
        <Link href={ROUTES.home} className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-tertiary-400">
          <Image src="/logo/logo_inline_white.png" alt="INKERA Studio · Accueil" width={150} height={50} className="h-auto w-28 xl:w-36" />
        </Link>
        <div className="flex items-center gap-3 xl:gap-6">
        <ul className="flex items-center gap-0.5 xl:gap-1">
          {links.map(link => <li key={link.href}>{link.highlight ? (
            <DashboardButton href={link.href} target="_blank" rel="noopener noreferrer" variant="secondary" className="min-w-0 whitespace-nowrap !px-2.5 !text-[11px] !shadow-none xl:!px-3 xl:!text-[13px]">
              {link.label}<ArrowUpRight size={14} aria-hidden="true" />
            </DashboardButton>
          ) : (
            <Link href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={`block whitespace-nowrap rounded-xl px-2 py-2.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-tertiary-400 xl:px-3 xl:text-[13px] ${pathname === link.href ? "bg-white/5 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>{link.label}</Link>
          )}</li>)}
        </ul>
        <div className="flex items-center gap-3 border-l border-white/10 pl-3 xl:pl-4">
          <div className="flex items-center gap-2" role="group" aria-label="Suivre INKERA">
            {[
              { label: "Instagram", href: "https://www.instagram.com/the.inkera", Icon: FaInstagram },
              { label: "TikTok", href: "https://www.tiktok.com/@inkera2", Icon: FaTiktok },
            ].map(({ label, href, Icon }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label} aria-label={`INKERA sur ${label} (nouvel onglet)`} className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-noir-800 text-white/65 transition-colors hover:border-tertiary-400/40 hover:bg-tertiary-400/5 hover:text-tertiary-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-400"><Icon size={15} aria-hidden="true" /></a>)}
          </div>
          <Link href={isLoggedIn ? ROUTES.dashboard : ROUTES.connexion} aria-label={isLoggedIn ? "Accéder à mon espace" : "Se connecter"} title={isLoggedIn ? "Mon espace" : "Connexion"} className={`relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-tertiary-400/30 text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-400 ${isLoggedIn ? "bg-noir-800 hover:border-tertiary-400" : "bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600"}`}>
            {isLoggedIn ? profileImage && profileImage !== failedImage ? <Image key={profileImage} src={profileImage} alt="" fill sizes="40px" unoptimized className="object-cover" onError={() => setFailedImage(profileImage)} /> : <UserRound size={18} aria-hidden="true" /> : <CircleUserRound size={21} strokeWidth={1.6} aria-hidden="true" />}
          </Link>
        </div>
        </div>
      </div>
    </nav>
  );
}
