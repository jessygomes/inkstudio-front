"use server";

import { getAuthHeaders } from "@/lib/session";
import type { ReminderSettings, ReminderSettingsResponse } from "@/lib/reminder-settings";

async function request(method: "GET" | "PATCH", settings?: ReminderSettings): Promise<ReminderSettingsResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/follow-up/settings`, {
    method, headers: { ...headers, "Content-Type": "application/json" }, cache: "no-store",
    ...(settings ? { body: JSON.stringify(settings) } : {}),
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(Array.isArray(data.message) ? data.message.join(" ") : data.message || "Impossible de récupérer les réglages des rappels.");
  return data;
}

export async function getReminderSettingsAction() { return request("GET"); }
export async function updateReminderSettingsAction(settings: ReminderSettings) { return request("PATCH", settings); }
