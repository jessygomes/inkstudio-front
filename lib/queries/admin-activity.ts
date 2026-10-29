"use server";

import { auth } from "@/auth";
import { getAuthHeaders } from "../session";
import type { ActivityFilters, ActivityMetric, ActivityChartData } from "../admin-activity";

export async function getAdminActivityChart(metric: ActivityMetric, filters: ActivityFilters): Promise<ActivityChartData> {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("Accès refusé.");
  const params = new URLSearchParams({ metric });
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/admin/activity-chart?${params}`, {
    headers: await getAuthHeaders(), cache: "no-store",
  });
  if (!response.ok) throw new Error("Statistiques indisponibles.");
  return response.json();
}
