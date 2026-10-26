"use client";
import { BACK_OFFICE_PATH } from "@/lib/back-office";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  Flag,
  LayoutDashboard,
  Newspaper,
  Palette,
  ShieldCheck,
  Shapes,
  UsersRound,
} from "lucide-react";
import styles from "./AdminShell.module.css";

export const adminNavigation = [
  { href: BACK_OFFICE_PATH, label: "Vue d’ensemble", icon: LayoutDashboard },
  { href: `${BACK_OFFICE_PATH}/users`, label: "Utilisateurs", icon: UsersRound },
  { href: `${BACK_OFFICE_PATH}/verification`, label: "Vérifications", icon: ShieldCheck },
  { href: `${BACK_OFFICE_PATH}/styles`, label: "Styles", icon: Palette },
  { href: `${BACK_OFFICE_PATH}/categories`, label: "Catégories", icon: Shapes },
  { href: `${BACK_OFFICE_PATH}/articles`, label: "Articles", icon: Newspaper },
  { href: `${BACK_OFFICE_PATH}/stats`, label: "Statistiques", icon: ChartNoAxesCombined },
  { href: `${BACK_OFFICE_PATH}/signalements`, label: "Signalements", icon: Flag },
];

export default function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string | null;
}) {
  const path = usePathname();
  const current = [...adminNavigation]
    .reverse()
    .find((item) =>
      item.href === BACK_OFFICE_PATH ? path === item.href : path.startsWith(item.href),
    );
  return (
    <div className={styles.shell}>
      <a href="#admin-content" className="sr-only focus:not-sr-only">
        Aller au contenu
      </a>
      <aside className={styles.sidebar}>
        <Link href={BACK_OFFICE_PATH} className={styles.brand}>
          <span>✳</span>
          <div>
            inkera<small>Administration</small>
          </div>
        </Link>
        <div>
          <p className={styles.navLabel}>Espace de gestion</p>
          <nav className={styles.nav} aria-label="Administration">
            {adminNavigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={current?.href === href ? "page" : undefined}
              >
                <Icon size={17} strokeWidth={1.7} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className={styles.navFooter}>
          <Link href="/dashboard" className="flex items-center gap-2 px-3">
            Retour à l’application <ArrowUpRight size={14} />
          </Link>
          <div className={styles.identity}>
            <strong>Compte administrateur</strong>
            {email}
          </div>
        </div>
      </aside>
      <div className={styles.body}>
        <header className={styles.topbar}>
          <div className={styles.crumb}>
            Administration <span>/</span>
            <strong>{current?.label || "Vue d’ensemble"}</strong>
          </div>
          <span className={styles.access}>Accès administrateur</span>
        </header>
        <main id="admin-content" className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
