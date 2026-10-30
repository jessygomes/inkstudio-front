import DashboardButton from "@/components/Shared/DashboardButton";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Check, Users, Globe, Boxes, MessageSquare, ChartNoAxesCombined, Compass, Search, Send } from "lucide-react";
import Header from "@/components/Shared/Header";
import { Closing, ProductVisual } from "@/components/Marketing/MarketingShared";
import s from "@/components/Marketing/Marketing.module.css";
export const metadata: Metadata = {
  title: "Solutions pour tatoueurs et studios | INKERA Studio",
  description: "Réservations, clients, portfolio et gestion du studio : découvrez les outils INKERA pour les tatoueurs indépendants et les salons.",
  alternates: { canonical: "/solutions" },
  openGraph: {
    title: "Plus de place pour votre art | INKERA Studio",
    description: "Rendez-vous, clients, portfolio et équipe : tout votre studio dans un même espace.",
    url: "https://inkera-studio.com/solutions",
    locale: "fr_FR",
    type: "website",
  },
};
const features = [
  { id: "planning", number: "01 / ORGANISER", title: "Un planning clair. L’esprit libre.", description: "Du premier contact à la prochaine séance, retrouvez vos rendez-vous au même endroit. Organisez vos journées et celles de votre studio avec un agenda commun ou par artiste.", points: ["Prise de rendez-vous en ligne", "Agenda du salon et planning par tatoueur", "Disponibilités et créneaux centralisés"], image: "/images/rdv.png", alt: "Interface de gestion des rendez-vous INKERA Studio", caption: "Le planning · Une vue d’ensemble sur vos séances" },
  { id: "clients", number: "02 / ACCOMPAGNER", title: "Chaque projet commence par une relation.", description: "Gardez le fil de chaque histoire. Rassemblez les informations de vos clients et leur historique pour préparer les séances et assurer un suivi attentif.", points: ["Fiches clients et historique des rendez-vous", "Informations utiles à la préparation des séances", "Génération des fiches de consentement"], image: "/images/client.png", alt: "Interface des fiches clients INKERA Studio", caption: "Les clients · Les bonnes informations, au bon endroit" },
  { id: "vitrine", number: "03 / RAYONNER", title: "Votre univers, au premier regard.", description: "Faites découvrir votre style avant même le premier échange. Votre profil public réunit votre portfolio, vos flashs et les informations de votre activité.", points: ["Profil public professionnel", "Portfolio, flashs, produits et services", "Un lien direct pour vous contacter"], image: "/images/public.png", alt: "Profil public et portfolio sur INKERA Studio", caption: "La vitrine · Un espace pour faire découvrir votre travail" },
];
export default function SolutionsPage() {
  return <div className={s.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "INKERA Studio", applicationCategory: "BusinessApplication", operatingSystem: "Web", url: "https://inkera-studio.com/solutions", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", description: "Formule Free" }, featureList: ["Gestion des rendez-vous", "Gestion clients", "Portfolio en ligne", "Gestion du stock"] }) }} />
    <div className="fixed top-0 left-0 w-full z-50">
      <Header />
    </div>
    <main>
      <section className={s.hero}>
        <div className={`${s.wrap} ${s.heroCentered}`}>
          <div>
            <span className={s.eyebrow}>La solution INKERA Studio</span>
            <h1>Plus de place<br />pour <em>votre art.</em>
            </h1>
            <p className={s.intro}>Rendez-vous, clients, portfolio, équipe. Tout votre studio dans un même espace, pour vous concentrer sur ce qui vous anime.</p>
            <div className={s.actions}>
              <DashboardButton href="/inscription" variant="primary">Commencer avec INKERA <ArrowUpRight size={18} />
              </DashboardButton>
              <DashboardButton href="#fonctionnalites" variant="secondary">Explorer les outils ↓</DashboardButton>
            </div>
          </div>
        </div>
      </section>
      <div className={s.wrap}>
        <div className={s.strip}>
          <span>
            <CalendarDays /> Un quotidien mieux organisé</span>
          <span>
            <Users /> En solo ou en équipe</span>
          <span>
            <Globe /> Une vitrine pour votre univers</span>
        </div>
      </div>
      <section id="fonctionnalites" className={`${s.wrap} ${s.section}`}>
        <span className={s.eyebrow}>Du premier contact au prochain projet</span>
        <h2>Tout se connecte.<br />
          <em>Votre quotidien se simplifie.</em>
        </h2>
        <p className={s.sectionLead}>Des outils pensés pour les réalités du tatouage, réunis autour de votre façon de travailler.</p>
        <nav aria-label="Découvrir les fonctionnalités" className={s.jump}>
          <Link href="#planning">01 · Rendez-vous</Link>
          <Link href="#clients">02 · Clients</Link>
          <Link href="#vitrine">03 · Vitrine</Link>
          <Link href="#explorer">04 · Explorer</Link>
        </nav>
      </section>
      <div className={s.wrap}>{features.map(f => <section id={f.id} key={f.id} className={s.feature}>
        <div className={s.featureCopy}>
          <span className={s.number}>{f.number}</span>
          <h2>{f.title}</h2>
          <p className={s.sectionLead}>{f.description}</p>
          <ul className={s.list}>{f.points.map(point => <li key={point}>
            <Check />{point}</li>)}</ul>
        </div>
        <ProductVisual src={f.image} alt={f.alt} caption={f.caption} />
      </section>)}</div>
      <section id="explorer" className={`${s.wrap} ${s.section} ${s.explorerSection}`} aria-labelledby="explorer-title">
        <div className={s.explorerHeading}>
          <div>
            <span className={s.number}>04 / RENCONTRER</span>
            <h2 id="explorer-title">Des projets qui attendent<br /><em>votre signature.</em></h2>
          </div>
          <div>
            <span className={s.explorerLabel}><Compass size={16} aria-hidden="true" />Explorer les projets clients</span>
            <p className={s.sectionLead}>Des clients partagent leurs idées de tatouage et cherchent un professionnel pour les réaliser. Découvrez leurs envies, trouvez les projets qui vous correspondent et proposez votre approche.</p>
          </div>
        </div>
        <ol className={s.explorerSteps}>
          {[
            { Icon: Search, title: "Trouvez votre prochain projet", text: "Affinez votre recherche par ville, style ou catégorie. Consultez le brief et les inspirations pour comprendre les envies du client." },
            { Icon: Send, title: "Proposez votre regard", text: "Envoyez une proposition personnalisée pour présenter votre approche. Suivez la réponse du client dans « Mes propositions »." },
            { Icon: MessageSquare, title: "Faites connaissance", text: "Si le client accepte votre proposition, la messagerie devient accessible. Échangez pour préciser le projet et préparer la suite ensemble." },
          ].map(({ Icon, title, text }, index) => <li key={title} className={s.explorerStep}>
            <div className={s.explorerStepTop}><span className={s.explorerStepIcon}><Icon size={21} aria-hidden="true" /></span><span className={s.explorerStepNumber} aria-hidden="true">0{index + 1}</span></div>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>)}
        </ol>
        <div className={s.actions}>
          <DashboardButton href="/explorer" variant="secondary">Découvrir les projets clients <ArrowUpRight size={17} aria-hidden="true" /></DashboardButton>
        </div>
      </section>
      <section className={`${s.wrap} ${s.section}`}>
        <span className={s.eyebrow}>Et derrière les séances</span>
        <h2>Le studio tourne.<br />Vous gardez le cap.</h2>
        <div className={s.tools}>{[{ Icon: Boxes, title: "Stocks & traçabilité", text: "Suivez vos produits et associez leur traçabilité aux rendez-vous pour garder un historique organisé." }, { Icon: MessageSquare, title: "Des échanges centralisés", text: "Retrouvez vos conversations et les informations des projets dans votre espace de travail." }, { Icon: ChartNoAxesCombined, title: "Une activité plus lisible", text: "Consultez vos statistiques pour suivre votre activité et mieux préparer la suite." }].map(({ Icon, title, text }) => <article className={s.tool} key={title}>
          <Icon size={28} />
          <h3>{title}</h3>
          <p>{text}</p>
        </article>)}</div>
        <div className={s.actions}>
          <DashboardButton href="/tarification" variant="secondary">Comparer les formules <ArrowUpRight size={17} />
          </DashboardButton>
        </div>
      </section>
      <section className={`${s.wrap} ${s.section}`} aria-labelledby="messaging-coming-title">
        <div className={s.comingSoon}>
          <div>
            <span className={s.comingBadge}>Bientôt dans INKERA</span>
            <h2 id="messaging-coming-title">Tous vos échanges.<br /><em>Un seul point de rencontre.</em></h2>
            <p className={s.sectionLead}>Vos clients vous écrivent partout. Bientôt, retrouvez vos messages Instagram, WhatsApp, Facebook et vos e-mails au sein de l’app, en plus de votre messagerie INKERA.</p>
            <p className={s.comingNote}>Centralisation à venir · La messagerie INKERA est déjà disponible.</p>
          </div>
          <div className={s.channels} aria-label="Canaux de la future messagerie centralisée">
            {["Instagram", "WhatsApp", "Facebook", "E-mail"].map(channel => <div className={s.channel} key={channel}><MessageSquare size={19} aria-hidden="true" /><span>{channel}</span><span className={s.channelStatus}>Bientôt</span></div>)}
            <div className={`${s.channel} ${s.channelInkera}`}><MessageSquare size={19} aria-hidden="true" /><span>Messagerie INKERA</span><span className={s.channelStatus}>Disponible</span></div>
          </div>
        </div>
      </section>
      <Closing />
    </main>
  </div>;
}
