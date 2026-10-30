import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import s from "./Home.module.css";

export default function HeroSection() {
  return <section className={s.hero} aria-labelledby="home-title">
    <div className={s.heroInner}>
      <div className={s.heroCopy}>
        <span className={`${s.eyebrow} ${s.heroRevealRest}`}>INKERA Studio · Pour les tatoueurs & les salons</span>
        <h1 id="home-title"><span className={s.heroRevealFirst}>Votre art en tête.</span><br /><span className={`${s.gradient} ${s.heroRevealSecond}`}>Le studio en main.</span></h1>
        <p className={s.heroRevealRest}>Moins de dispersion. Plus de création. Réunissez vos rendez-vous, vos clients et votre univers dans un espace pensé pour le tatouage.</p>
        <div className={`${s.actions} ${s.heroRevealActions}`}>
          <DashboardButton href="/inscription">Créer mon compte gratuitement <ArrowUpRight size={17} /></DashboardButton>
          <DashboardButton href="#decouvrir" variant="secondary">Découvrir INKERA <ArrowDown size={16} /></DashboardButton>
        </div>
        <div className={`${s.heroNotes} ${s.heroRevealRest}`}><span><Check size={14} /> Une formule gratuite</span><span><Check size={14} /> En solo ou en équipe</span></div>
      </div>
    </div>
  </section>;
}
