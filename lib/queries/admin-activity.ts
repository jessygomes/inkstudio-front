"use server";

import { auth } from "@/auth";
import { getAuthHeaders } from "../session";
import type { ActivityFilters, ActivityStats } from "../admin-activity";

export async function getAdminActivityStats(filters: ActivityFilters): Promise<ActivityStats> {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("Accès refusé.");
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/admin/activity-stats?${params}`, {
    headers: await getAuthHeaders(), cache: "no-store",
  });
  if (!response.ok) throw new Error("Statistiques indisponibles.");
  return response.json();
}
