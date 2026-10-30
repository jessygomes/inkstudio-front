"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import { ROUTES } from "@/lib/routes";
import { useNavbarScrolled } from "./useNavbarScrolled";

interface NavMobileClientProps {
  initialAuthStatus: boolean;
  links: Array<{ href: string; label: string; icon?: string }>;
}

export function NavMobileClient({ initialAuthStatus, links }: NavMobileClientProps) {
  const pathname = usePathname();
  const isScrolled = useNavbarScrolled();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "loading" ? initialAuthStatus : status === "authenticated" && !!session?.user && !session?.error;
  const [isOpen, setIsOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const close = () => { setIsOpen(false); trigger.current?.focus(); };

  useEffect(() => {
    if (!isOpen) return;
    closeButton.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setIsOpen(false); trigger.current?.focus(); }
      if (event.key === "Tab") {
        const controls = document.querySelectorAll<HTMLElement>('#mobile-navigation button, #mobile-navigation a');
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); };
  }, [isOpen]);

  return <nav aria-label="Navigation mobile">
    <div className={`flex items-center justify-between rounded-xl border p-3 text-white transition-colors duration-300 ${isScrolled ? "border-white/10 bg-noir-800/95 backdrop-blur-xl" : "border-transparent bg-transparent"}`}>
      <Link href={ROUTES.home}><Image src="/logo/logo_inline_studio_white_2.png" alt="INKERA Studio · Accueil" width={120} height={40} className="h-auto w-[120px]" /></Link>
      <button ref={trigger} type="button" onClick={() => setIsOpen(true)} aria-label="Ouvrir le menu" aria-expanded={isOpen} aria-controls="mobile-navigation" className="rounded-lg p-2 hover:bg-white/10"><Menu size={26} /></button>
    </div>
    {isOpen && <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={close} aria-hidden="true" />
      <div id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Menu de navigation" className="fixed inset-y-0 right-0 z-50 flex h-dvh w-[min(360px,100vw)] flex-col overflow-y-auto border-l border-white/10 bg-noir-800 text-white">
        <div className="flex items-center justify-between border-b border-white/10 p-6"><span className="font-two text-sm tracking-widest">INKERA STUDIO</span><button ref={closeButton} type="button" onClick={close} aria-label="Fermer le menu" className="rounded-lg p-2 hover:bg-white/10"><X /></button></div>
        <ul className="flex-1 space-y-3 p-6">{links.map(link => <li key={link.href} onClick={close}>{link.href.startsWith('https://') ? <DashboardButton href={link.href} variant="secondary" target="_blank" rel="noopener noreferrer" className="w-full border-cuatro-500/40 bg-cuatro-500/10">{link.label}<ArrowUpRight size={16} /></DashboardButton> : <Link href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={`block rounded-xl px-4 py-3 font-two text-sm ${pathname === link.href ? "bg-tertiary-400/10 text-tertiary-400" : "text-white/75 hover:bg-white/5"}`}>{link.label}</Link>}</li>)}</ul>
        <div className="border-t border-white/10 p-6" onClick={close}><DashboardButton href={isLoggedIn ? ROUTES.dashboard : ROUTES.connexion} className="w-full">{isLoggedIn ? "Dashboard" : "Connexion"}</DashboardButton></div>
      </div>
    </>}
  </nav>;
}
