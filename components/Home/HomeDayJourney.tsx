import { ArrowUpRight, Check } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import s from "./Home.module.css";

const moments = [
  {
    number: "01",
    label: "Avant la séance · Préparer",
    title: <>Le projet en tête.<br />Les infos à portée de main.</>,
    text: "Vous ouvrez le studio. Avant d’accueillir votre client, retrouvez sa fiche et l’historique de ses rendez-vous. Les détails sont là, vous pouvez vous concentrer sur la rencontre.",
    points: ["Retrouver les informations du client", "Préparer la séance et le consentement"],
  },
  {
    number: "02",
    label: "Au studio · Créer",
    title: <>Une journée qui s’organise.<br /><span className={s.gradient}>Une place pour créer.</span></>,
    text: "La journée prend son rythme. Gardez une vue claire sur les séances et les disponibilités de chacun, que vous travailliez seul ou avec les artistes du salon.",
    points: ["Visualiser les rendez-vous de la journée", "Suivre le planning du studio et des artistes"],
  },
  {
    number: "03",
    label: "Après la séance · Accompagner",
    title: <>La séance se termine.<br />Le lien continue.</>,
    text: "Un tatouage ne s’arrête pas à la sortie du studio. Poursuivez les échanges dans la messagerie INKERA et gardez l’historique du client pour préparer les prochaines rencontres.",
    points: ["Rester disponible pour les questions", "Garder le fil d’une séance à l’autre"],
  },
];

export default function HomeDayJourney() {
  return <section id="decouvrir" className={`${s.wrap} ${s.section}`} aria-labelledby="day-title">
    <div className={`${s.sectionHeading} ${s.journeyIntro}`}>
      <div><span className={s.eyebrow}>Dans les coulisses de votre studio</span><h2 id="day-title">Une journée<br /><span className={s.gradient}>avec INKERA.</span></h2></div>
      <p>Chaque séance a un avant et un après. Entre les deux, votre art. INKERA vous accompagne tout au long du chemin.</p>
    </div>
    <ol className={s.journey}>
      {moments.map(moment => <li className={s.journeyStep} key={moment.number}>
        <span className={s.journeyNumber} aria-hidden="true">{moment.number}</span>
        <div className={s.journeyHeading}>
          <span className={s.eyebrow}>{moment.label}</span>
          <h3>{moment.title}</h3>
        </div>
        <div className={s.journeyCopy}>
          <p>{moment.text}</p>
          <ul className={s.checks}>{moment.points.map(point => <li key={point}><Check size={16} aria-hidden="true" />{point}</li>)}</ul>
        </div>
      </li>)}
    </ol>
    <div className={s.journeyEnd}><p>Votre journée change. Votre espace garde le fil.</p><DashboardButton href="/solutions" variant="secondary">Découvrir les solutions INKERA <ArrowUpRight size={16} /></DashboardButton></div>
  </section>;
}
