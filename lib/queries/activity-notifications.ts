"use server";
import { actionError } from "@/lib/action-error";

import { auth } from "@/auth";
import { getAuthHeaders } from "../session";

export type ActivityKind = "appointments" | "followUps" | "reviews";
export interface ActivityItem { id: string; createdAt: string }

//! ----------------------------------------------------------------------------

//! PASTILLES « NOUVEAU » : RDV pris par un client, suivis et avis arrivés depuis `since`
//! Une seule requête légère (GET /activity/recent : id et date de création seulement, 30 jours maximum),
//! au lieu de relire tout l'historique page par page.

//! ----------------------------------------------------------------------------
export async function getRecentActivity(since: number): Promise<Record<ActivityKind, ActivityItem[]>> {
  const session = await auth();
  if (!session?.user?.id || session.error) throw actionError("Session expirée");
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/activity/recent?since=${encodeURIComponent(String(since))}`, {
    method: "GET",
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) throw actionError("Chargement des nouveautés impossible");
  const list = (value: unknown): ActivityItem[] =>
    Array.isArray(value) ? value.map((item: ActivityItem) => ({ id: item.id, createdAt: item.createdAt })) : [];
  return { appointments: list(payload.appointments), followUps: list(payload.followUps), reviews: list(payload.reviews) };
}
