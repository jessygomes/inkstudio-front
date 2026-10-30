import DashboardButton from "@/components/Shared/DashboardButton";
import Image from "next/image";
import { ArrowUpRight, Check, MessageCircle } from "lucide-react";
import s from "./Marketing.module.css";
export function ProductVisual({ src, alt, caption, priority = false }: { src: string; alt: string; caption: string; priority?: boolean }) {
  return <figure className={s.visual}>
    <div className={s.windowBar} aria-hidden="true">
      <span className={s.windowDots}><span /><span /><span /></span>
      <span className={s.windowBrand}>INKERA <span>STUDIO</span></span>
      <span className={s.windowIndicator} />
    </div>
    <div className={s.visualScreen}>
      <Image src={src} alt={alt} width={1100} height={760} sizes="(max-width: 900px) 100vw, 550px" priority={priority} />
    </div>
    <figcaption className={s.caption}><span aria-hidden="true" />{caption}</figcaption>
  </figure>;
}
export function Closing() {
  return <section className={`${s.wrap} ${s.closing}`} aria-label="Rejoindre INKERA Studio">
    <div className={s.closingStage}>
      <div className={s.closingOrbit} aria-hidden="true" />
      <div className={s.closingContent}>
        <span className={s.closingBadge}><span aria-hidden="true" />À vous de jouer</span>
        <h2>Votre prochain chapitre.<br /><span className={s.closingGradient}>Plus de place pour l’art.</span></h2>
        <p>Votre talent fait le reste. Réunissez votre quotidien dans un espace qui vous ressemble, et donnez vie à la suite.</p>
        <div className={s.closingActions}>
          <DashboardButton variant="primary" href="/inscription" className="px-6 py-3">Créer mon compte gratuitement <ArrowUpRight size={17} aria-hidden="true" /></DashboardButton>
          <DashboardButton variant="secondary" href="/contactez-nous" className="px-6 py-3"><MessageCircle size={16} aria-hidden="true" />Parlons de votre studio</DashboardButton>
        </div>
        <ul className={s.closingNotes}>
          <li><Check size={14} aria-hidden="true" />Une formule gratuite</li>
          <li><Check size={14} aria-hidden="true" />En solo ou en équipe</li>
          <li><Check size={14} aria-hidden="true" />Un espace pour évoluer</li>
        </ul>
      </div>
      <div className={s.closingSignature} aria-hidden="true"><span>INKERA STUDIO</span><span>Votre art. Votre rythme. Votre espace.</span></div>
    </div>
  </section>;
}
