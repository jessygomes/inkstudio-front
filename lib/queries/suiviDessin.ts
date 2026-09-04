"use server";

import { getAuthHeaders } from "../session";
import type {
  AppointmentCardStatus,
  DrawingCard,
  DrawingCardFilters,
  DrawingCardNoteType,
  DrawingCardStatus,
} from "../types/suiviDessin";

const baseUrl = () => `${process.env.NEXT_PUBLIC_BACK_URL}/suiviDessin`;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: { ...headers, ...init?.headers },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(payload?.message)
      ? payload.message.join(" ")
      : payload?.message;
    throw new Error(message || `Erreur Suivi dessin (${response.status})`);
  }
  return payload as T;
}

export async function getDrawingCards(filters: DrawingCardFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.size ? `?${params.toString()}` : "";
  return api<DrawingCard[]>(`/cards${query}`);
}

export async function getAppointmentDrawingCardStatus(appointmentId: string) {
  return api<AppointmentCardStatus>(
    `/appointments/${appointmentId}/card-status`,
  );
}

export async function createDrawingCard(payload: {
  sourceAppointmentId: string;
  title?: string;
  description?: string;
  additionalInfo?: string;
}) {
  return api<DrawingCard>("/cards", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDrawingCard(
  id: string,
  payload: Partial<
    Pick<DrawingCard, "title" | "description" | "additionalInfo">
  > & {
    status?: DrawingCardStatus;
  },
) {
  return api<DrawingCard>(`/cards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteDrawingCard(id: string) {
  return api<{ message: string }>(`/cards/${id}`, { method: "DELETE" });
}

export async function addDrawingCardNote(
  id: string,
  payload: { content: string; type?: DrawingCardNoteType },
) {
  return api(`/cards/${id}/notes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function addDrawingCardImage(
  id: string,
  payload: { url: string; caption?: string },
) {
  return api(`/cards/${id}/images`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDrawingCardImage(
  id: string,
  imageId: string,
  caption?: string,
) {
  return api(`/cards/${id}/images/${imageId}`, {
    method: "PATCH",
    body: JSON.stringify({ caption }),
  });
}

export async function approveDrawingCardImage(id: string, imageId: string) {
  return api(`/cards/${id}/images/${imageId}/approve`, { method: "PATCH" });
}

export async function deleteDrawingCardImage(id: string, imageId: string) {
  return api(`/cards/${id}/images/${imageId}`, { method: "DELETE" });
}

export async function linkDrawingCardToTattooAppointment(
  cardId: string,
  appointmentId: string,
) {
  return api<DrawingCard>(
    `/cards/${cardId}/tattoo-appointment/${appointmentId}`,
    { method: "POST" },
  );
}
