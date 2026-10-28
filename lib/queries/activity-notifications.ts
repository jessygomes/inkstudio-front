"use server";

import { auth } from "@/auth";
import { fetchAllAppointments } from "./appointment";
import { getFollowUpAction } from "./followUp";
import { getAllReviewsBySalon } from "./review";

export type ActivityKind = "appointments" | "followUps" | "reviews";
export interface ActivityItem { id: string; createdAt: string }

// Read every page: appointments are sorted by appointment date, not creation date.
export async function getActivityNotifications(kind: ActivityKind): Promise<ActivityItem[]> {
  const session = await auth();
  if (!session?.user?.id || session.error) throw new Error("Session expirée");
  if (kind !== "reviews" && session.user.saasPlan === "FREE") return [];
  const items: ActivityItem[] = [];
  let pages = 1;
  for (let page = 1; page <= pages; page++) {
    if (kind === "appointments") {
      const result = await fetchAllAppointments(session.user.id, page, 100);
      if (result.error) throw new Error("Chargement des rendez-vous impossible");
      items.push(...(result.appointments || []).filter((item: ActivityItem & { clientUserId?: string; status: string }) =>
        item.clientUserId && ["PENDING", "CONFIRMED"].includes(item.status)));
      pages = result.pagination?.totalPages || 1;
    } else if (kind === "followUps") {
      const result = await getFollowUpAction(page, 100, "all", "all", "");
      if (!result.ok) throw new Error("Chargement des suivis impossible");
      items.push(...(result.data?.followUps || []));
      pages = result.data?.pagination?.totalPages || 1;
    } else {
      const result = await getAllReviewsBySalon(session.user.id, { page, limit: 100 });
      if (!result.ok) throw new Error("Chargement des avis impossible");
      const data = result.data;
      items.push(...(Array.isArray(data) ? data : data.reviews || data.items || data.data || []));
      pages = data.pagination?.totalPages || data.totalPages || 1;
    }
  }
  return items.map(({ id, createdAt }) => ({ id, createdAt }));
}
