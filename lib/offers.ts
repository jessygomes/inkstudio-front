export type SignupPlan = "FREE" | "PRO" | "BUSINESS";
export type SignupRole = "user_salon" | "user_tatoueur";

export function isSignupPlanAllowed(role: SignupRole, plan: SignupPlan): boolean {
  return plan === "FREE" || (role === "user_salon" ? plan === "BUSINESS" : plan === "PRO");
}

export function isInkeraTrialEligible(role: SignupRole, plan: SignupPlan): boolean {
  return (role === "user_salon" && plan === "BUSINESS") ||
    (role === "user_tatoueur" && plan === "PRO");
}

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
