import { ArrowUpRight, Boxes, ChartNoAxesCombined, MessageSquare, UserRound, UsersRound, Smartphone, Sparkles, Check } from "lucide-react";
import { FaInstagram, FaWhatsapp, FaFacebookF } from "react-icons/fa";
import DashboardButton from "@/components/Shared/DashboardButton";
import { Closing } from "@/components/Marketing/MarketingShared";
import HomeDayJourney from "./HomeDayJourney";
import s from "./Home.module.css";

const faqs = [
  ["À qui s’adresse INKERA Studio ?", "INKERA accompagne les tatoueurs indépendants et les salons. La formule Pro s’adresse aux indépendants ; Business permet aux salons de gérer plusieurs artistes."],
  ["Est-ce que je peux commencer gratuitement ?", "Oui. La formule Free vous permet de présenter votre activité avec un profil public, un portfolio et vos flashs. Les fonctionnalités de gestion sont disponibles dans les formules Pro et Business."],
  ["Puis-je utiliser INKERA sur mobile ?", "Vous pouvez accéder à votre espace depuis votre navigateur. Deux applications mobiles dédiées, pour les artistes et pour les clients, sont également en préparation."],
  ["Les messageries des réseaux sociaux sont-elles déjà connectées ?", "La messagerie INKERA est disponible. La centralisation des messages Instagram, WhatsApp, Facebook et des e-mails est une fonctionnalité à venir."],
];

export default function HomeSections() {
  return <>
    <div className={s.ribbon}><div className={s.wrap}><span>Votre quotidien, réuni.</span><span>Rendez-vous</span><i aria-hidden="true" /><span>Clients</span><i aria-hidden="true" /><span>Portfolio</span><i aria-hidden="true" /><span>Stock</span><i aria-hidden="true" /><span>Équipe</span></div></div>
    <HomeDayJourney />
    <section className={`${s.wrap} ${s.operations}`} aria-labelledby="operations-title">
      <div><span className={s.eyebrow}>Et tout ce qui fait tourner le studio</span><h2 id="operations-title">Les détails comptent.<br />Gardez-les à portée de main.</h2></div>
      <div className={s.operationList}>{[{ Icon: Boxes, title: "Stocks & traçabilité", text: "Suivez vos produits et retrouvez leur traçabilité par rendez-vous." }, { Icon: MessageSquare, title: "Messagerie INKERA", text: "Gardez le contact avec vos clients et le fil de leurs projets." }, { Icon: ChartNoAxesCombined, title: "Statistiques d’activité", text: "Prenez du recul sur votre activité pour préparer la suite." }].map(({ Icon, title, text }) => <article key={title}><Icon size={22} aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    </section>
    <section className={`${s.wrap} ${s.section}`}>
      <div className={s.sectionHeading}><div><span className={s.eyebrow}>Votre façon de travailler</span><h2>Un artiste.<br /><span className={s.gradient}>Ou tout un collectif.</span></h2></div><p>Votre organisation vous ressemble. Votre espace de travail aussi.</p></div>
      <div className={s.audienceGrid}>
        <article className={s.audience}><UserRound size={28} aria-hidden="true" /><span className={s.eyebrow}>Tatoueur indépendant</span><h3>Votre style.<br />Votre rythme.</h3><p>Un espace pour votre visibilité, vos rendez-vous et vos clients. Vous gardez la main sur votre activité.</p><ul className={s.checks}><li><Check size={16} />Votre portfolio en ligne</li><li><Check size={16} />Vos outils de gestion avec Pro</li></ul><DashboardButton href="/tarification" variant="secondary">Découvrir les formules <ArrowUpRight size={16} /></DashboardButton></article>
        <article className={`${s.audience} ${s.collective}`}><UsersRound size={28} aria-hidden="true" /><span className={s.eyebrow}>Salon & équipe</span><h3>Plusieurs talents.<br />Un même horizon.</h3><p>Réunissez les artistes autour d’un espace commun et coordonnez la vie du salon avec la formule Business.</p><ul className={s.checks}><li><Check size={16} />4 tatoueurs ou plus avec Business</li><li><Check size={16} />Une gestion d’équipe centralisée</li></ul><DashboardButton href="/tarification" variant="secondary">Découvrir Business <ArrowUpRight size={16} /></DashboardButton></article>
      </div>
    </section>
    <section className={`${s.wrap} ${s.section}`} aria-labelledby="future-title">
      <div className={s.futureHeading}><span className={s.soon}><Sparkles size={14} /> La suite se dessine</span><h2 id="future-title">INKERA évolue.<br /><span className={s.gradient}>Votre quotidien aussi.</span></h2><p>De nouvelles façons de rester connecté à vos clients et à votre studio sont en préparation.</p></div>
      <div className={s.futureGrid}>
        <article className={s.futureCard}><span className={s.soon}>Bientôt · Messagerie centralisée</span><div className={s.socials} aria-hidden="true"><FaInstagram /><FaWhatsapp /><FaFacebookF /><span>@</span><span className={s.socialConnector}>→</span><MessageSquare /></div><h3>Vos échanges, au même endroit.</h3><p>Instagram, WhatsApp, Facebook et e-mails : bientôt réunis dans l’app, en plus de la messagerie INKERA actuelle.</p></article>
        <article className={s.futureCard}><span className={s.soon}>Bientôt · Applications mobiles</span><div className={s.mobileIllustration} aria-hidden="true"><Smartphone size={54} strokeWidth={1} /><div><span>INKERA STUDIO</span><span>Artistes & clients</span></div></div><h3>Le studio vous accompagne.</h3><p>Deux applications dédiées se préparent : une pour les artistes tatoueurs, une pour les clients. Chacun son espace, toujours le même lien.</p></article>
      </div>
    </section>
    <section className={`${s.wrap} ${s.section} ${s.faqGrid}`}>
      <div><span className={s.eyebrow}>Avant de vous lancer</span><h2>On fait<br /><span className={s.gradient}>le point ?</span></h2><p className={s.muted}>Quelques réponses pour imaginer votre quotidien avec INKERA.</p><div className={s.actions}><DashboardButton href="/contactez-nous" variant="secondary">Parlons de votre projet <ArrowUpRight size={15} /></DashboardButton></div></div>
      <div className={s.faq}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
    </section>
    <Closing />
  </>;
}
