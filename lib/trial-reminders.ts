export type TrialNotice = { daysLeft: number; endDate: string; plan: "PRO" | "BUSINESS" };

export function getTrialNotice(data: {
  planStatus?: string;
  trialEndDate?: string | null;
  currentPlan?: string;
  hasStripeSubscription?: boolean;
}, now = Date.now()): TrialNotice | null {
  if (data.planStatus?.toUpperCase() !== "TRIAL" || data.hasStripeSubscription ||
      !data.trialEndDate || (data.currentPlan !== "PRO" && data.currentPlan !== "BUSINESS")) return null;
  const remaining = Date.parse(data.trialEndDate) - now;
  if (!Number.isFinite(remaining) || remaining <= 0 || remaining > 7 * 86_400_000) return null;
  return { daysLeft: Math.ceil(remaining / 86_400_000), endDate: data.trialEndDate, plan: data.currentPlan };
}
