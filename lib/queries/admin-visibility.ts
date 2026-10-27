"use server";
import { getAuthHeaders } from "../session";
export type PublicVisibility = "VISIBLE" | "SEARCH_HIDDEN" | "HIDDEN";
export async function updateAdminPublicVisibility(userId: string, publicVisibility: PublicVisibility) {
  const headers = await getAuthHeaders();
  const response = await fetch(process.env.NEXT_PUBLIC_BACK_URL + "/admin/users/" + encodeURIComponent(userId) + "/public-visibility", {
    method: "PATCH", headers, body: JSON.stringify({ publicVisibility }), cache: "no-store",
  });
  if (!response.ok) return { ok: false, message: "Impossible de modifier la visibilité du compte." };
  const data = await response.json();
  return { ok: !data.error, message: data.message || "Visibilité enregistrée." };
}
