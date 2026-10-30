import Image from "next/image";
import type { Metadata } from "next";
import { ArrowDown, ArrowUpRight, Fingerprint, Lightbulb, MessagesSquare, MoveUpRight } from "lucide-react";
import Header from "@/components/Shared/Header";
import DashboardButton from "@/components/Shared/DashboardButton";
import { Closing } from "@/components/Marketing/MarketingShared";
import s from "@/components/About/About.module.css";

export const metadata: Metadata = {
  title: "À Propos de INKERA Studio | Innovation pour Salons de Tatouage",
  description:
    "Découvrez INKERA Studio : notre mission de révolutionner la gestion des salons de tatouage avec des outils innovants. Créé par des passionnés pour les artistes tatoueurs professionnels.",
  keywords: [
    "à propos INKERA Studio",
    "mission tatouage",
    "équipe INKERA",
    "histoire plateforme tatouage",
    "innovation tatoueurs",
    "startup tatouage",
    "technologie salon tattoo",
    "vision INKERA",
  ],
  authors: [{ name: "INKERA Studio" }],
  creator: "INKERA Studio",
  publisher: "InTheGleam",
  metadataBase: new URL("https://inkera-studio.com"),
  alternates: {
    canonical: "/a-propos-de-inkera",
  },
  openGraph: {
    title: "À Propos de INKERA Studio | Innovation pour Studios de Tatouage",
    description:
      "Notre mission : révolutionner la gestion des salons de tatouage avec des outils innovants créés par et pour les professionnels du tatouage.",
    url: "https://inkera-studio.com/a-propos-de-inkera",
    siteName: "INKERA Studio",
    images: [
      {
        url: "https://inkera-studio.com/images/og-about.jpg",
        width: 1200,
        height: 630,
        alt: "Équipe INKERA Studio - Innovation pour salons de tatouage",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "À Propos de INKERA Studio",
    description:
      "Innovation et passion au service des studios de tatouage. Découvrez notre mission et notre équipe.",
    images: ["https://inkera-studio.com/images/twitter-about.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const heroMosaicPhotos = [
  "/photo/aakaaaaaa.jpg",
  "/photo/AI Art.jpg",
  "/photo/Instagram.jpg",
  "/photo/Luka Sabbat.jpg",
  "/photo/téléchargement (3).jpg",
  "/photo/téléchargement (4).jpg",
  "/photo/téléchargement (5).jpg",
  "/photo/téléchargement (10).jpg",
  "/photo/téléchargement (12).jpg",
];

const principles = [
  { number: "01", title: "Respecter votre singularité", text: "Un style ne se standardise pas. Nous défendons un espace qui met en valeur votre univers et s’adapte à votre façon de travailler.", Icon: Fingerprint },
  { number: "02", title: "Faire simple, faire utile", text: "Chaque outil doit trouver sa place dans une vraie journée de studio. Notre priorité : une expérience claire, qui facilite les gestes du quotidien.", Icon: Lightbulb },
  { number: "03", title: "Avancer avec vous", text: "Vos questions, vos idées et vos retours nourrissent l’évolution d’INKERA. L’écoute guide la manière dont nous faisons grandir la plateforme.", Icon: MessagesSquare },
];

export default function AproposPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "À propos d’INKERA Studio",
    description: "Notre vision : simplifier le quotidien des tatoueurs et des salons pour laisser plus de place à leur art.",
    url: "https://inkera-studio.com/a-propos-de-inkera",
    mainEntity: { "@type": "Organization", name: "INKERA Studio", url: "https://inkera-studio.com", logo: "https://inkera-studio.com/images/Logo13.png" },
  };
  return <div className={s.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="fixed left-0 top-0 z-50 w-full"><Header /></div>
    <main>
      <section className={s.hero} aria-labelledby="about-title">
        <div className={s.mosaic} aria-hidden="true">{heroMosaicPhotos.map((photo, index) => <div className={s.mosaicTile} key={photo}><Image src={photo} alt="" fill className="object-cover" sizes="33vw" priority={index < 3} /></div>)}</div>
        <div className={s.heroVeil} />
        <div className={`${s.wrap} ${s.heroContent}`}>
          <span className={s.heroLabel}>À propos d’INKERA Studio</span>
          <h1 id="about-title">Une culture.<br />Des artistes.<br /><span className={s.gradient}>Un même élan.</span></h1>
          <p>Le tatouage est un art de la rencontre. Nous créons l’espace qui aide celles et ceux qui le font vivre à se consacrer à l’essentiel.</p>
          <DashboardButton href="#notre-vision" variant="secondary" className="px-5 py-3">Ce qui nous anime <ArrowDown size={16} aria-hidden="true" /></DashboardButton>
        </div>
        <div className={`${s.wrap} ${s.heroBottom}`}><span>L’art au centre. L’humain toujours.</span><span>INKERA / NOTRE VISION</span></div>
      </section>

      <section id="notre-vision" className={`${s.wrap} ${s.section}`} aria-labelledby="vision-title">
        <div className={s.intro}><span className={s.eyebrow}>Notre conviction</span><div><h2 id="vision-title">Derrière chaque tatouage,<br />il y a bien plus <span className={s.gradient}>qu’un dessin.</span></h2><p>Il y a un échange, une intention, des heures de travail. Et tout un quotidien à organiser autour. INKERA Studio existe pour faire le lien entre cette passion et la réalité du studio.</p></div></div>
        <div className={s.manifesto}><span aria-hidden="true">“</span><p>Votre énergie doit nourrir votre art.<br /><span>Votre organisation doit vous y aider.</span></p></div>
      </section>

      <section className={`${s.wrap} ${s.mission}`} aria-labelledby="mission-title">
        <div><span className={s.eyebrow}>Notre mission</span><h2 id="mission-title">Moins de dispersion.<br /><span className={s.gradient}>Plus de création.</span></h2><p>Rendre les outils professionnels accessibles aux tatoueurs indépendants comme aux salons. Réunir ce qui fait votre quotidien dans une expérience cohérente, sans perdre ce qui fait votre identité.</p><div className={s.actions}><DashboardButton href="/solutions" variant="secondary">Voir notre vision en action <ArrowUpRight size={16} /></DashboardButton></div></div>
        <div className={s.missionWords}><span>Organiser.<small>Pour libérer l’esprit.</small></span><span>Connecter.<small>Pour cultiver la relation.</small></span><span className={s.gradient}>Créer.<small>Pour laisser votre empreinte.</small></span></div>
      </section>

      <section className={`${s.wrap} ${s.section}`} aria-labelledby="principles-title">
        <div className={s.sectionHeading}><div><span className={s.eyebrow}>Notre ligne de conduite</span><h2 id="principles-title">Ce qui compte.<br /><span className={s.gradient}>Ce qui nous guide.</span></h2></div><p>Des convictions qui orientent notre manière de concevoir INKERA et d’échanger avec vous.</p></div>
        <div className={s.principles}>{principles.map(({ number, title, text, Icon }) => <article key={number} className={s.principle}><span className={s.number}>{number}</span><div className={s.principleTitle}><Icon size={24} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3></div><p>{text}</p></article>)}</div>
      </section>

      <section className={`${s.wrap} ${s.section}`} aria-labelledby="future-title">
        <div className={s.future}><div><span className={s.eyebrow}>Une plateforme en mouvement</span><h2 id="future-title">La suite se construit.<br /><span className={s.gradient}>Avec vous.</span></h2><p>INKERA n’a pas vocation à figer votre manière de travailler. Notre ambition est de faire évoluer vos outils avec les usages et les besoins du studio.</p><DashboardButton href="/contactez-nous" variant="secondary">Partagez-nous vos idées <ArrowUpRight size={16} /></DashboardButton></div><div className={s.futureList}><article><span className={s.soon}>En préparation</span><h3>Un même fil pour vos échanges.</h3><p>La centralisation d’Instagram, WhatsApp, Facebook et des e-mails, en complément de la messagerie INKERA.</p></article><article><span className={s.soon}>En préparation</span><h3>De nouveaux liens, sur mobile.</h3><p>Deux applications dédiées : une pour les artistes, une pour les clients. Pour accompagner chaque côté de la rencontre.</p></article></div></div>
      </section>

      <section className={`${s.wrap} ${s.conversation}`}><div><span className={s.eyebrow}>Un projet inTheGleam</span><h2>Le prochain échange<br />commence avec vous.</h2></div><DashboardButton href="/contactez-nous" variant="secondary">Parlons de votre studio <MoveUpRight size={16} /></DashboardButton></section>
      <Closing />
    </main>
  </div>;
}
