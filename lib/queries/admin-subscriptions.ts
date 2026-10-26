"use server";
import { auth } from "@/auth";
import { getAuthHeaders } from "@/lib/session";

export type StripeGiftPreview = {
  currentPlan: "PRO" | "BUSINESS";
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  interval: string;
  intervalCount: number;
  confirmation: string;
  requestId: string;
};
async function request(
  userId: string,
  duration: number,
  unit: "MONTHS" | "DAYS",
  preview: boolean,
  confirmation?: string,
  requestId?: string,
) {
  const session = await auth();
  if (session?.user?.role !== "admin" || session.error === "AccessTokenExpired")
    return {
      ok: false,
      message: "Accès réservé aux administrateurs connectés.",
    };
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/admin/users/${encodeURIComponent(userId)}/subscription${preview ? "/preview" : ""}`,
      {
        method: preview ? "POST" : "PATCH",
        headers: await getAuthHeaders(),
        cache: "no-store",
        body: JSON.stringify({ duration, unit, confirmation, requestId }),
      },
    );
    const data = await response.json();
    if (!response.ok)
      return {
        ok: false,
        message: Array.isArray(data.message)
          ? data.message.join(" ")
          : data.message || "Impossible de modifier l’abonnement.",
      };
    return preview
      ? { ok: true, preview: data as StripeGiftPreview }
      : {
          ok: true,
          autoResume: !!data.autoResume,
          subscription: {
            currentPlan: data.subscription.currentPlan as string,
            startDate: data.subscription.startDate as string,
            endDate: (data.subscription.endDate ||
              data.subscription.trialEndDate) as string,
          },
        };
  } catch {
    return {
      ok: false,
      message:
        "La demande n’a pas pu être confirmée. Rechargez la fiche pour vérifier son état avant de réessayer.",
    };
  }
}
export async function previewAdminSubscription(
  userId: string,
  duration: number,
  unit: "MONTHS" | "DAYS",
) {
  return request(userId, duration, unit, true);
}
export async function grantAdminSubscription(
  userId: string,
  duration: number,
  unit: "MONTHS" | "DAYS",
  confirmation?: string,
  requestId?: string,
) {
  return request(userId, duration, unit, false, confirmation, requestId);
}
