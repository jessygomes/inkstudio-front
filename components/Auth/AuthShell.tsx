import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, Layers3, UsersRound } from "lucide-react";
import styles from "./AuthForms.module.css";

export default function AuthShell({ children, mode }: { children: ReactNode; mode: "login" | "register" }) {
  return (
    <main className={styles.shell}>
      <aside className={styles.story}>
        <Link href="/" className={styles.brand} aria-label="Inkera Studio — Accueil">
          <Image src="/images/logo_white_color.png" alt="Inkera Studio" width={130} height={60} className={styles.logo} priority />
        </Link>
        <div className={styles.storyContent}>
          <span className={styles.eyebrow}><span />L’espace des professionnels du tatouage</span>
          <h2>Votre art.<br />Votre studio.<br /><span>Tout simplement.</span></h2>
          <div className={styles.features}>
            <span><CalendarDays size={17} />Un planning qui vous ressemble</span>
            <span><UsersRound size={17} />Vos clients, au même endroit</span>
            <span><Layers3 size={17} />Votre travail mis en lumière</span>
          </div>
        </div>
        <div className={styles.storyFooter}><span>INKERA STUDIO</span><Link href="/solutions">Découvrir Inkera <ArrowUpRight size={14} /></Link></div>
      </aside>
      <section className={styles.workspace} aria-label={mode === "login" ? "Connexion à Inkera" : "Inscription à Inkera"}>
        <Link href="/" className={styles.back}><ArrowLeft size={14} />Retour à l’accueil</Link>
        <div className={styles.formArea}>
          <Link href="/" className={styles.mobileBrand} aria-label="Inkera Studio — Accueil">
            <Image src="/images/logo_white_color.png" alt="Inkera Studio" width={112} height={52} className={styles.logo} priority />
          </Link>
          {children}
        </div>
        <footer className={styles.legal}><Link href="/cgu-cgv">Conditions d’utilisation</Link><span>·</span><Link href="/politique-de-confidentialite">Confidentialité</Link></footer>
      </section>
    </main>
  );
}
