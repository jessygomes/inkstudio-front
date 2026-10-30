import type { Metadata } from "next";
import { ArrowUpRight, Mail, LifeBuoy, Handshake, Settings, Clock } from "lucide-react";
import Header from "@/components/Shared/Header";
import Footer from "@/components/Shared/Footer/Footer";
import DashboardButton from "@/components/Shared/DashboardButton";
import s from "@/components/Marketing/Marketing.module.css";

export const metadata: Metadata = {
  title: "Contact et accompagnement",
  description: "Une question sur INKERA Studio, votre abonnement ou un projet de partenariat ? Échangez avec notre équipe à contact@inkera-studio.com.",
  alternates: { canonical: "/contactez-nous" },
  openGraph: { title: "Parlons de votre studio | INKERA Studio", description: "Support, offres et partenariats : l’équipe INKERA vous accompagne.", url: "https://inkera-studio.com/contactez-nous", locale: "fr_FR", type: "website" },
};

export default function ContactezNous() {
  return <div className={s.page}>
    <div className="fixed top-0 left-0 z-50 w-full"><Header /></div>
    <main>
      <section className={s.hero}>
        <div className={`${s.wrap} ${s.heroGrid}`}>
          <div><span className={s.eyebrow}>Contact & accompagnement</span><h1>Parlons de<br /><em>votre studio.</em></h1><p className={s.intro}>Une question, un projet, un coup de main ? Derrière INKERA, une équipe à votre écoute pour avancer avec vous.</p></div>
          <div className={s.contactCard}>
            <Mail size={30} className="text-tertiary-400" aria-hidden="true" />
            <span className={s.eyebrow}>Une adresse, le bon interlocuteur</span>
            <h2>On commence<br />par un échange ?</h2>
            <a className={s.email} href="mailto:contact@inkera-studio.com">contact@inkera-studio.com</a>
            <p>Expliquez-nous votre besoin et indiquez l’adresse associée à votre compte si votre demande le concerne.</p>
            <DashboardButton href="mailto:contact@inkera-studio.com">Écrire à l’équipe <ArrowUpRight size={16} /></DashboardButton>
          </div>
        </div>
      </section>
      <section className={`${s.wrap} ${s.section}`}>
        <span className={s.eyebrow}>À chaque besoin, un échange</span><h2>Comment peut-on<br /><em>vous accompagner ?</em></h2>
        <div className={s.tools}>
          {[{ Icon: LifeBuoy, title: "Un coup de main", description: "Connexion, configuration ou fonctionnalité : décrivez ce qui vous bloque pour que nous puissions vous aider.", subject: "Support INKERA Studio" }, { Icon: Settings, title: "Votre compte & vos offres", description: "Une question sur une formule, votre abonnement ou votre facturation ? Faisons le point ensemble.", subject: "Mon compte INKERA Studio" }, { Icon: Handshake, title: "Un projet à partager", description: "Collaboration, partenariat ou nouvelle idée : racontez-nous ce que vous aimeriez construire avec INKERA.", subject: "Partenariat INKERA Studio" }].map(({ Icon, title, description, subject }) => <article className={s.tool} key={title}><Icon size={28} aria-hidden="true" /><h3>{title}</h3><p>{description}</p><div className={s.actions}><DashboardButton variant="secondary" href={`mailto:contact@inkera-studio.com?subject=${encodeURIComponent(subject)}`}>Nous écrire <ArrowUpRight size={15} /></DashboardButton></div></article>)}
        </div>
      </section>
      <section className={`${s.wrap} ${s.section} ${s.faqGrid}`}>
        <div><span className={s.eyebrow}>Restons en contact</span><h2>Les bonnes infos<br />pour nous joindre.</h2><p className={s.sectionLead}>Pour une question technique, précisez la page concernée, les étapes suivies et le message affiché. Cela nous aide à comprendre votre demande.</p></div>
        <div className={s.contactHours}><Clock size={24} className="text-cuatro-500" aria-hidden="true" /><h3>Disponibilité du support général</h3><dl><div><dt>Lundi — Vendredi</dt><dd>9h00 — 18h00</dd></div><div><dt>Samedi</dt><dd>10h00 — 16h00</dd></div><div><dt>Dimanche</dt><dd>Fermé</dd></div></dl><p>Vous pouvez nous écrire à tout moment par e-mail.</p></div>
      </section>
      <section className={`${s.wrap} ${s.closing}`}><div className={s.closingInner}><span className={s.eyebrow}>Vous explorez encore ?</span><h2>Faites connaissance<br />avec <em>votre futur espace.</em></h2><div className={s.actions}><DashboardButton href="/solutions">Découvrir les solutions <ArrowUpRight size={16} /></DashboardButton><DashboardButton href="/tarification" variant="secondary">Comparer les formules</DashboardButton></div></div></section>
    </main>
    <Footer />
  </div>;
}
