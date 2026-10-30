import { Building2, Check, CreditCard, Gift, Sparkles, UserRound } from "lucide-react";
import { isInkeraTrialEligible, type SignupPlan, type SignupRole } from "@/lib/offers";
import styles from "./AuthForms.module.css";

const plans = {
  FREE: {
    name: "Free", price: "0 €", audience: "Pour commencer", icon: Sparkles,
    description: "Votre vitrine professionnelle pour présenter votre travail et être contacté.",
    features: ["Profil public professionnel", "Portfolio d’images", "Produits et services", "Profil tatoueur principal", "Lien direct de contact"],
  },
  PRO: {
    name: "Pro", price: "29,99 €", audience: "Réservé aux indépendants", icon: UserRound,
    description: "Votre activité en solo, des premiers échanges à la prise de rendez-vous.",
    features: ["Un espace pour 1 tatoueur", "Gestion de clients illimitée", "Réservation en ligne", "Profil public professionnel", "Assistance par e-mail"],
  },
  BUSINESS: {
    name: "Business", price: "59,99 €", audience: "Réservé aux salons", icon: Building2,
    description: "Un espace commun pour organiser votre salon et accompagner toute votre équipe.",
    features: ["Toutes les fonctionnalités Pro", "4 tatoueurs ou plus", "Gestion du stock", "Statistiques détaillées", "Assistance prioritaire", "Formations incluses"],
  },
} as const;

export default function SignupPlanDetails({ plan, role }: { plan: SignupPlan; role: SignupRole }) {
  const details = plans[plan];
  const Icon = details.icon;
  const trial = isInkeraTrialEligible(role, plan);
  const duration = plan === "BUSINESS" ? "2 mois" : "3 mois";

  return <div className={styles.planDetails}>
    <section className={styles.planCard} aria-labelledby="selected-plan-title">
      <header className={styles.planHeader}>
        <span className={styles.planIcon}><Icon size={20} aria-hidden="true" /></span>
        <div><p className={styles.planAudience}>{details.audience}</p><h2 id="selected-plan-title">{details.name}</h2></div>
        <div className={styles.planPrice}><strong>{details.price}</strong><span>/ mois{trial ? ", après l’essai" : ""}</span></div>
      </header>
      <p className={styles.planDescription}>{details.description}</p>
      <ul className={styles.planFeatures}>{details.features.map(feature => <li key={feature}><Check size={13} aria-hidden="true" /><span>{feature}</span></li>)}</ul>
    </section>
    {trial && <section className={styles.trialCard} aria-labelledby="trial-title">
      <header className={styles.trialHeader}><span className={styles.planIcon}><Gift size={18} aria-hidden="true" /></span><div><p className={styles.planAudience}>Votre période offerte</p><h3 id="trial-title">{duration} pour découvrir {details.name}</h3></div></header>
      <div className={styles.trialBadge}><CreditCard size={13} aria-hidden="true" />Sans carte bancaire · Aucun paiement à l’inscription</div>
      <ol className={styles.trialSteps}>
        <li><span aria-hidden="true">1</span><p><strong>À l’inscription</strong>Profitez de {details.name} pendant {duration}, gratuitement.</p></li>
        <li><span aria-hidden="true">2</span><p><strong>Avant la fin de l’essai</strong>Vous recevrez des rappels pour choisir de poursuivre avec {details.name} à {details.price} par mois.</p></li>
        <li><span aria-hidden="true">3</span><p><strong>Si vous ne souscrivez pas</strong>Votre compte repassera sur l’offre Free à la fin de la période offerte.</p></li>
      </ol>
    </section>}
  </div>;
}
