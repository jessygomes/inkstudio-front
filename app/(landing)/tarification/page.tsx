import DashboardButton from "@/components/Shared/DashboardButton";
import type { Metadata } from "next";
import { Check, CalendarDays, LifeBuoy, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Shared/Header";
import Tarifs from "@/components/TarifPage/Tarifs";
import { Closing } from "@/components/Marketing/MarketingShared";
import s from "@/components/Marketing/Marketing.module.css";
export const metadata: Metadata = {
  title: "Tarifs et abonnements | INKERA Studio",
  description: "Choisissez votre formule INKERA Studio : Free à 0 €, Pro à 29,99 €/mois ou Business à 59,99 €/mois. Des outils adaptés à votre activité, sans engagement.",
  alternates: { canonical: "/tarification" },
  openGraph: {
    title: "Votre activité. Votre formule. | INKERA Studio",
    description: "Free à 0 €, Pro à 29,99 €/mois et Business à 59,99 €/mois. Comparez les formules sans engagement.",
    url: "https://inkera-studio.com/tarification",
    locale: "fr_FR",
    type: "website",
  },
};
const rows = [
  ["Profil public, portfolio et flashs", "Inclus", "Inclus", "Inclus"],
  ["Réservation en ligne", "—", "Inclus", "Inclus"],
  ["Gestion clients", "—", "Illimitée", "Illimitée"],
  ["Stock & traçabilité par rendez-vous", "—", "Inclus", "Inclus"],
  ["Nombre de tatoueurs", "—", "1", "4 ou plus"],
  ["Gestion d’équipe", "—", "—", "Inclus"],
  ["Statistiques", "—", "Performance", "Détaillées"],
  ["Support", "Inclus", "Inclus", "Prioritaire"],
  ["Formations", "—", "—", "Incluses"],
];
const faqs = [
  ["Quelle formule choisir pour mon activité ?", "Free convient pour présenter votre activité en ligne. Pro s’adresse aux tatoueurs indépendants qui souhaitent gérer leurs rendez-vous, leurs clients et leur stock. Business est réservé aux salons qui souhaitent coordonner plusieurs artistes."],
  ["Comment fonctionnent les périodes offertes ?", "Le plan Pro propose 3 mois offerts à l’inscription pour les tatoueurs indépendants. Le plan Business propose 60 jours offerts aux salons. Ces périodes démarrent sans carte bancaire."],
  ["Puis-je changer de formule ?", "Vous pouvez gérer votre abonnement depuis les paramètres de votre compte, dans la rubrique facturation. Les formules disponibles dépendent de votre type de compte : indépendant ou salon."],
  ["Y a-t-il un engagement ?", "Les abonnements sont sans engagement. Vous pouvez demander leur annulation depuis votre espace client."],
  ["Le support est-il compris ?", "Oui, le support est inclus dans toutes les formules. Business comprend un support prioritaire et des formations."],
];
export default function TarificationPage() {
  return <div className={s.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "INKERA Studio", applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: [{ name: "Free", price: "0" }, { name: "Pro", price: "29.99" }, { name: "Business", price: "59.99" }].map(offer => ({ "@type": "Offer", ...offer, priceCurrency: "EUR" })) }) }} />
    <div className="fixed top-0 left-0 w-full z-50">
      <Header />
    </div>
    <main>
      <section className={`${s.hero} ${s.pricingHero} ${s.center}`}>
        <div className={s.wrap}>
          <span className={s.eyebrow}>Un espace pour chaque ambition</span>
          <h1>Votre activité.<br />
            <em>Votre formule.</em>
          </h1>
          <p className={s.intro}>Du premier portfolio au studio multi-artistes, choisissez les outils qui accompagnent votre quotidien.</p>
          <nav className={`${s.actions} justify-center`} aria-label="Explorer les tarifs">
            <DashboardButton href="#comparatif" variant="secondary">Comparer les fonctionnalités ↓</DashboardButton>
          </nav>
        </div>
      </section>
      <Tarifs />
      <div className={s.wrap}>
        <div className={`${s.strip} mt-12`}>
          <span>
            <CalendarDays /> Sans engagement</span>
          <span>
            <SlidersHorizontal /> Une formule adaptée à votre activité</span>
          <span>
            <LifeBuoy /> Support dans toutes les offres</span>
        </div>
      </div>
      <section id="comparatif" className={`${s.wrap} ${s.section}`}>
        <span className={s.eyebrow}>Les détails font la différence</span>
        <h2>Tout voir.<br />
          <em>Choisir simplement.</em>
        </h2>
        <p className={s.sectionLead}>Retrouvez les fonctionnalités de chaque formule en un coup d’œil.</p>
        <div className={s.tableScroll} tabIndex={0} role="region" aria-label="Tableau comparatif des abonnements, défilement horizontal sur mobile">
          <table className={s.table}>
            <caption className="sr-only">Comparaison des fonctionnalités Free, Pro et Business</caption>
            <thead>
              <tr>
                <th scope="col">Les fonctionnalités</th>
                <th scope="col">Free</th>
                <th scope="col">Pro</th>
                <th scope="col">Business</th>
              </tr>
            </thead>
            <tbody>{rows.map(([label, ...values]) => <tr key={label}>
              <th scope="row">{label}</th>{values.map((value, index) => <td key={index}>{value === "Inclus" ? <>
                <Check size={17} className="inline text-orange-300" aria-hidden="true" />
                <span className="sr-only">Inclus</span>
              </> : value === "—" ? <>
                <span aria-hidden="true">—</span>
                <span className="sr-only">Non inclus</span>
              </> : value}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className={`${s.wrap} ${s.section} ${s.faqGrid}`}>
        <div>
          <span className={s.eyebrow}>On vous répond</span>
          <h2>Encore une<br />question ?</h2>
          <p className={s.sectionLead}>Choisir un outil pour votre activité mérite des réponses claires.</p>
          <div className={s.actions}>
            <DashboardButton variant="secondary" href="/contactez-nous">Contacter l’équipe ↗</DashboardButton>
          </div>
        </div>
        <div className={s.faq}>{faqs.map(([question, answer]) => <details key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>)}</div>
      </section>
      <Closing />
    </main>
  </div>;
}
