"use server";

import { getAuthHeaders } from "../session";
import type {
  ApiResult,
  BookingLink,
  BookingLinkListResponse,
  CreateBookingLinkRequest,
  CreateBookingLinkResponse,
  DesiredTattooPeriodFields,
  DesiredTattooPeriodInput,
} from "../types/booking-links";
import type { ProjectClientInfoFields } from "../types/project-client-info";

// Les server actions renvoient un résultat typé (et ne lèvent pas d'exception) :
// les messages et codes métier du backend restent ainsi lisibles côté client en production.
async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const base = process.env.NEXT_PUBLIC_BACK_URL;
  if (!base) return { ok: false, status: 0, message: "L’URL de l’API Inkera n’est pas configurée." };
  const headers = await getAuthHeaders();
  if (!headers.Authorization) return { ok: false, status: 401, message: "Votre session a expiré. Reconnectez-vous." };

  try {
    const response = await fetch(`${base}${path}`, { ...init, headers, cache: "no-store" });
    const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok || body?.error === true) {
      const raw = body?.message;
      const messages = Array.isArray(raw) ? raw.map(String) : undefined;
      const retry = Number(body?.retryAfterSeconds ?? response.headers.get("Retry-After"));
      return {
        ok: false,
        status: response.status,
        code: typeof body?.code === "string" ? body.code : undefined,
        message: messages ? messages.join(" · ") : typeof raw === "string" ? raw : `Erreur (${response.status})`,
        messages,
        retryAfterSeconds: Number.isFinite(retry) && retry > 0 ? Math.ceil(retry) : undefined,
      };
    }
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, status: 0, message: "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez." };
  }
}

const id = (value: string) => encodeURIComponent(value);

const CREATE_KEYS: Array<keyof CreateBookingLinkRequest> = [
  "userId", "tatoueurId", "venueSalonId", "prestation", "durationMinutes", "mode", "fixedStartTime",
  "allowedFrom", "allowedTo", "expiresAt", "clientId", "projectAppointmentId", "conversationId", "inboxThreadId",
];

export async function createBookingLinkAction(input: CreateBookingLinkRequest) {
  // N'envoie que les propriétés du DTO backend.
  const payload = Object.fromEntries(
    CREATE_KEYS.filter((key) => input[key] !== undefined && input[key] !== "").map((key) => [key, input[key]]),
  );
  return request<CreateBookingLinkResponse>("/appointments/booking-links", { method: "POST", body: JSON.stringify(payload) });
}

export async function listBookingLinksAction(page = 1, limit = 20, userId?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (userId) params.set("userId", userId);
  return request<BookingLinkListResponse>(`/appointments/booking-links?${params.toString()}`);
}

export async function getBookingLinkAction(linkId: string) {
  return request<{ link: BookingLink }>(`/appointments/booking-links/${id(linkId)}`);
}

export async function revokeBookingLinkAction(linkId: string) {
  return request<{ link: BookingLink }>(`/appointments/booking-links/revoke/${id(linkId)}`, { method: "PATCH" });
}

/** Même endpoint pour la période souhaitée et/ou budget + premier tatouage (champs omis = inchangés). */
export async function updateDesiredTattooPeriodAction(appointmentId: string, input: Partial<DesiredTattooPeriodInput> & ProjectClientInfoFields) {
  return request<{ error: false; appointment: DesiredTattooPeriodFields & ProjectClientInfoFields & { id: string } }>(
    `/appointments/desired-tattoo-period/${id(appointmentId)}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}
