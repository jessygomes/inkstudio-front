// Source unique des tarifs d'abonnement AFFICHÉS (page tarifs, inscription, paramètres, SEO, balisage schema.org).
// Attention : le montant réellement facturé est celui du prix Stripe (STRIPE_PRICE_PRO / STRIPE_PRICE_BUSINESS côté backend).
// Pour changer un tarif : créer le nouveau prix dans Stripe, mettre son identifiant dans la variable du backend, puis
// mettre le même montant ici et dans `utils/data.ts` du backend (proPlan / businessPlan).
export const PLAN_PRICES = {
  PRO: 35.99,
  BUSINESS: 95.99,
} as const;

export type PaidPlan = keyof typeof PLAN_PRICES;

/** Montant à la française, sans symbole : "35,99". */
export const priceFr = (plan: PaidPlan): string => PLAN_PRICES[plan].toFixed(2).replace(".", ",");

/** Montant au format des données structurées (schema.org) : "35.99". */
export const priceDot = (plan: PaidPlan): string => PLAN_PRICES[plan].toFixed(2);
