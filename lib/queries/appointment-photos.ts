"use server";
import { getAuthHeaders } from "../session";

export interface AppointmentPhoto {
  id: string;
  appointmentId: string;
  url: string;
  caption?: string | null;
  createdAt: string;
  portfolios: { id: string; userId: string }[];
  appointment?: { id: string; title: string; start: string; prestation: string };
}

async function request(path: string, method = "GET", body?: unknown) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/${path}`, {
    method, headers: await getAuthHeaders(), cache: "no-store",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.error) throw new Error(data?.message || "Impossible de charger les photos.");
  return data;
}

export async function getAppointmentPhotos(id: string): Promise<AppointmentPhoto[]> {
  return request(`appointments/${encodeURIComponent(id)}/photos`);
}
export async function getClientPhotos(id: string): Promise<AppointmentPhoto[]> {
  return request(`clients/${encodeURIComponent(id)}/photos`);
}
export async function addAppointmentPhotos(id: string, photos: { url: string }[]): Promise<AppointmentPhoto[]> {
  return request(`appointments/${encodeURIComponent(id)}/photos`, "POST", { photos });
}

export async function deleteAppointmentPhoto(appointmentId: string, photoId: string): Promise<void> {
  await request(`appointments/${encodeURIComponent(appointmentId)}/photos/${encodeURIComponent(photoId)}`, "DELETE");
}
