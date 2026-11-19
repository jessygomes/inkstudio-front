"use server";
import { httpErrorMessage } from "@/lib/user-error";
import { getAuthHeaders } from "../session";
import type { AppointmentDetailsBundle } from "../types/appointment-details";

//! ----------------------------------------------------------------------------

//! FICHE D'UN RDV EN UNE REQUETE (GET /appointments/:id/details)
//! rendez-vous (avec client et conversation), photos, état du suivi de dessin

//! ----------------------------------------------------------------------------
export async function getAppointmentDetailsAction(
  appointmentId: string,
): Promise<{ ok: true; details: AppointmentDetailsBundle } | { ok: false; message: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/${encodeURIComponent(appointmentId)}/details`,
      { method: "GET", headers, cache: "no-store" },
    );
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || typeof payload !== "object") {
      const message = Array.isArray(payload?.message) ? payload.message.join(" ") : payload?.message;
      return { ok: false, message: message || httpErrorMessage(response.status) };
    }
    return { ok: true, details: payload as AppointmentDetailsBundle };
  } catch (error) {
    console.error("Erreur lors du chargement de la fiche du rendez-vous :", error);
    return { ok: false, message: "Impossible de charger le rendez-vous." };
  }
}
