"use server";
import { getAuthHeaders } from "../session";

export type ChangePlanResult =
  | {
      updated: true;
      plan: string;
      alreadyOnTargetPlan?: boolean;
      message: string;
    }
  | { updated: false; plan: string; url: string; message: string };

export const changePlanAction = async (
  plan: string,
): Promise<ChangePlanResult> => {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/stripe/change-plan`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ plan }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.message || `Erreur lors du changement de plan (${response.status})`;
    throw new Error(message);
  }

  return data as ChangePlanResult;
};
