"use server";
import { getAuthHeaders } from "../session";
import type { DashboardSummary, DashboardSummaryParams } from "../types/dashboard";

//! ----------------------------------------------------------------------------

//! TOUTES LES DONNEES DE L'ACCUEIL EN UNE SEULE REQUETE (GET /dashboard/summary)

//! ----------------------------------------------------------------------------
export async function getDashboardSummaryAction(
  params: DashboardSummaryParams,
): Promise<{ ok: true; summary: DashboardSummary } | { ok: false; message: string }> {
  try {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams({
      date: params.date,
      fillStart: params.fillStart,
      fillEnd: params.fillEnd,
      month: String(params.month),
      year: String(params.year),
    });
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/dashboard/summary?${query.toString()}`,
      { method: "GET", headers, cache: "no-store" },
    );
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || typeof payload !== "object") {
      const message = Array.isArray(payload?.message) ? payload.message.join(" ") : payload?.message;
      return { ok: false, message: message || `Erreur lors du chargement du tableau de bord (${response.status}).` };
    }
    return { ok: true, summary: payload as DashboardSummary };
  } catch (error) {
    console.error("Erreur lors du chargement du résumé du dashboard :", error);
    return { ok: false, message: "Impossible de charger le tableau de bord." };
  }
}
