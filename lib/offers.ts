export type SignupPlan = "FREE" | "PRO" | "BUSINESS";
export type SignupRole = "user_salon" | "user_tatoueur";

export function isOfferActive(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

export function isTatoueurProOfferEligible(
  role: SignupRole,
  plan: SignupPlan,
  offerActive: boolean,
): boolean {
  return offerActive && role === "user_tatoueur" && plan === "PRO";
}