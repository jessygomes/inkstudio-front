import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import s from "./Footer.module.css";

const groups = [
  { title: "Le studio", links: [["Solutions", "/solutions"], ["Tarification", "/tarification"], ["À propos d’INKERA", "/a-propos-de-inkera"], ["Contact", "/contactez-nous"]] },
  { title: "Votre espace", links: [["Se connecter", "/connexion"], ["Créer un compte", "/inscription"], ["Trouver un tatoueur ↗", "https://www.theinkera.com/"]] },
  { title: "Informations", links: [["Mentions légales", "/mentions-legales"], ["Confidentialité", "/politique-de-confidentialite"], ["CGU / CGV", "/cgu-cgv"]] },
];

export default function Footer() {
  return <footer className={s.footer}>
    <div className={s.inner}>
      <div className={s.top}>
        <div><span className={s.eyebrow}>Pensé pour les artistes. Conçu pour le quotidien.</span><h2>Votre talent.<br /><span>Tout un univers.</span></h2></div>
        <DashboardButton href="/inscription">Rejoindre INKERA Studio<ArrowUpRight size={16} /></DashboardButton>
      </div>
      <div className={s.grid}>
        <div className={s.brand}><Link href="/" aria-label="INKERA Studio, accueil"><Image src="/logo/logo_inline_studio_white_2.png" alt="INKERA Studio" width={170} height={57} className="h-auto" /></Link><p>Un espace pour organiser votre activité, faire vivre votre studio et laisser parler votre art.</p><a href="mailto:contact@inkera-studio.com">Parlons de vos projets <ArrowUpRight size={14} /></a></div>
        {groups.map(group => <nav key={group.title} aria-label={group.title}><h3>{group.title}</h3><ul>{group.links.map(([label, href]) => <li key={href}><Link href={href} {...(href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{label}</Link></li>)}</ul></nav>)}
      </div>
      <div className={s.bottom}><p>© {new Date().getFullYear()} INKERA Studio. Tous droits réservés.</p><a href="https://www.inthegleam.com/" target="_blank" rel="noopener noreferrer">Un projet inTheGleam <ArrowUpRight size={13} /></a></div>
    </div>
  </footer>;
}
