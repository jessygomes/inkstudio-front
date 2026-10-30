"use client";

import DashboardButton from "@/components/Shared/DashboardButton";
import { useSession } from "next-auth/react";
import { ArrowUpRight, Building2, Check, Gift, Globe, PenTool, Users, CreditCard } from "lucide-react";
import s from "./PricingCards.module.css";

const plans = [
  { id: "FREE", name: "Free", audience: "Votre présence en ligne", badge: "Pour démarrer", price: "0", description: "Faites découvrir votre univers et donnez à votre activité sa place en ligne.", trial: "Gratuit, tout simplement.", seats: "Votre vitrine professionnelle", inheritance: "L’essentiel pour être visible", Icon: Globe, features: ["Profil public professionnel", "Portfolio d’images", "Flashs", "Produits & services", "Lien direct de contact"], cta: "Commencer gratuitement" },
  { id: "PRO", name: "Pro", audience: "Tatoueur indépendant", badge: "Le choix des indépendants", price: "29,99", description: "Un espace pour organiser vos journées et accompagner chacun de vos clients.", trial: "3 mois offerts à l’inscription", seats: "1 tatoueur", inheritance: "Tout Free, et vos outils de gestion", Icon: PenTool, features: ["Réservation en ligne", "Gestion clients illimitée", "Gestion du stock", "Traçabilité produit par rendez-vous", "Statistiques de performance"], cta: "Choisir Pro" },
  { id: "BUSINESS", name: "Business", audience: "Salon & collectif d’artistes", badge: "La force du collectif", price: "59,99", description: "Réunissez vos artistes et coordonnez la vie du salon dans un même espace.", trial: "60 jours offerts à l’inscription", seats: "4 tatoueurs ou plus", inheritance: "Tout Pro, et la gestion du collectif", Icon: Building2, features: ["Gestion d’équipe", "Statistiques détaillées", "Support prioritaire", "Formations incluses"], cta: "Choisir Business" },
] as const;

export default function Tarifs() {
  const { status, data: session } = useSession();
  return <section id="formules" className={s.wrap} aria-label="Formules d’abonnement">
    <div className={s.plans}>{plans.map(plan => {
      const isFree = plan.id === "FREE";
      const allowed = isFree || status !== "authenticated" || (plan.id === "BUSINESS" ? session?.user?.role === "user_salon" : session?.user?.role === "user_tatoueur");
      const href = status === "authenticated" ? (isFree ? "/dashboard" : "/parametres#facturation") : isFree ? "/inscription" : "/inscription?callbackUrl=" + encodeURIComponent("/tarification?checkout=" + plan.id);
      const variant = plan.id === "PRO" ? "primary" : "secondary";
      const [whole, decimals] = plan.price.split(",");
      const Icon = plan.Icon;
      return <article key={plan.id} className={`${s.plan} ${plan.id === "PRO" ? s.pro : plan.id === "BUSINESS" ? s.business : s.free}`}>
        <div className={s.topline}><span className={s.planIcon}><Icon size={21} strokeWidth={1.5} aria-hidden="true" /></span><span className={s.badge}>{plan.badge}</span></div>
        <header className={s.heading}><span>{plan.audience}</span><h2>{plan.name}</h2><p>{plan.description}</p></header>
        <div className={s.priceBlock}><p className={s.price} aria-label={`${plan.price} euros par mois`}><strong>{whole}</strong>{decimals && <span className={s.decimals}>,{decimals}</span>}<span className={s.currency}>€</span><span className={s.period}>/ mois</span></p><p className={s.priceCaption}>{isFree ? "Pour présenter votre activité" : "Après la période offerte"}</p></div>
        <div className={s.trial}><Gift size={16} aria-hidden="true" /><span>{plan.trial}</span></div>
        <div className={s.cta}>{allowed ? <DashboardButton href={href} variant={variant} className="w-full py-3">{status === "authenticated" ? "Gérer mon abonnement" : plan.cta}<ArrowUpRight size={16} aria-hidden="true" /></DashboardButton> : <DashboardButton disabled variant={variant} className="w-full py-3">{plan.id === "BUSINESS" ? "Réservé aux comptes salon" : "Réservé aux indépendants"}</DashboardButton>}</div>
        <p className={s.paymentNote}>{isFree ? "Sans abonnement payant" : <><CreditCard size={12} aria-hidden="true" />Sans carte bancaire pour démarrer</>}</p>
        <div className={s.includes}><p className={s.seats}><Users size={16} aria-hidden="true" />{plan.seats}</p><h3>{plan.inheritance}</h3><ul>{plan.features.map(feature => <li key={feature}><Check size={15} aria-hidden="true" /><span>{feature}</span></li>)}</ul></div>
      </article>;
    })}</div>
    <p className={s.billingNote}>Abonnements mensuels · Sans engagement · Support inclus</p>
  </section>;
}
