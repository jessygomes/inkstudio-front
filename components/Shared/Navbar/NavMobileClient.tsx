"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowUpRight, ArrowRight, Home, Layers3, CreditCard, Heart, Sparkles } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import { ROUTES } from "@/lib/routes";
import s from "./PublicNavbar.module.css";

const linkDetails: Record<string, { Icon: typeof Home; description: string }> = {
  "/": { Icon: Home, description: "Votre studio, autrement" },
  "/solutions": { Icon: Layers3, description: "Les outils de votre quotidien" },
  "/tarification": { Icon: CreditCard, description: "Une formule pour votre activité" },
  "/a-propos-de-inkera": { Icon: Heart, description: "L’histoire et la vision INKERA" },
};

interface NavMobileClientProps {
  initialAuthStatus: boolean;
  links: Array<{ href: string; label: string; icon?: string }>;
}

export function NavMobileClient({ initialAuthStatus, links }: NavMobileClientProps) {
  const pathname = usePathname();
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
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = () => { if (desktop.matches) setIsOpen(false); };
    desktop.addEventListener("change", onResize);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); desktop.removeEventListener("change", onResize); };
  }, [isOpen]);

  return <nav aria-label="Navigation mobile">
    <div className={s.mobileBar}>
      <Link href={ROUTES.home}><Image src="/logo/logo_inline_white.png" alt="INKERA Studio · Accueil" width={120} height={40} className="h-auto w-[120px]" /></Link>
      <button ref={trigger} type="button" onClick={() => setIsOpen(true)} aria-label="Ouvrir le menu" aria-expanded={isOpen} aria-controls="mobile-navigation" className={s.menuButton}><Menu size={21} /></button>
    </div>
    {isOpen && <>
      <div className={s.backdrop} onClick={close} aria-hidden="true" />
      <div id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Menu de navigation" className={s.panel}>
        <div className={s.panelHeader}>
          <Image src="/logo/logo_inline_white.png" alt="INKERA Studio" width={130} height={44} className="h-auto w-[130px]" />
          <button ref={closeButton} type="button" onClick={close} aria-label="Fermer le menu" className={s.menuButton}><X size={20} /></button>
        </div>
        <div className={s.panelContent}>
          <p className={s.eyebrow}>Votre univers professionnel</p>
          <ul className={s.menuLinks}>{links.filter(link => !link.href.startsWith("https://")).map(link => {
            const { Icon, description } = linkDetails[link.href] || { Icon: Layers3, description: "Découvrir INKERA Studio" };
            return <li key={link.href}>
              <Link href={link.href} onClick={close} aria-current={pathname === link.href ? "page" : undefined} className={s.menuLink}>
                <span className={s.menuIcon}><Icon size={19} aria-hidden="true" /></span>
                <span className={s.menuCopy}><span className={s.menuTitle}>{link.label}</span><span className={s.menuDescription}>{description}</span></span>
                <ArrowRight size={16} aria-hidden="true" className={s.menuArrow} />
              </Link>
            </li>;
          })}</ul>
          {links.filter(link => link.href.startsWith("https://")).map(link => <Link key={link.href} href={link.href} onClick={close} target="_blank" rel="noopener noreferrer" className={s.discovery}>
            <Sparkles size={21} aria-hidden="true" />
            <span className={s.menuCopy}><span className={s.menuTitle}>{link.label}</span><span className={s.menuDescription}>Trouvez l’artiste pour votre projet</span></span>
            <ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only"> (nouvel onglet)</span>
          </Link>)}
        </div>
        <div className={s.panelFooter}>
          <p>{isLoggedIn ? "Votre studio vous attend." : "Un espace pour votre art et votre quotidien."}</p>
          <div onClick={close}><DashboardButton href={isLoggedIn ? ROUTES.dashboard : ROUTES.connexion} className={s.footerAction}>{isLoggedIn ? "Accéder à mon espace" : "Se connecter"}<ArrowUpRight size={16} aria-hidden="true" /></DashboardButton></div>
          {!isLoggedIn && <Link href="/inscription" onClick={close} className={s.signup}>Créer mon compte gratuitement</Link>}
        </div>
      </div>
    </>}
  </nav>;
}
