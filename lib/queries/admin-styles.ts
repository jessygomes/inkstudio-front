"use server";

import { getAuthHeaders } from "../session";

export interface AdminStyle {
  id: string;
  name: string;
  key: string;
  photoCount: number;
}

async function request<T>(
  path: string,
  method: string,
  name?: string,
): Promise<{ ok: boolean; message: string; data?: T }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/admin/styles${path}`,
      {
        method,
        headers,
        cache: "no-store",
        body: name !== undefined ? JSON.stringify({ name }) : undefined,
      },
    );
    const payload = await res.json();
    if (!res.ok || payload.error)
      return {
        ok: false,
        message: Array.isArray(payload.message)
          ? payload.message.join(", ")
          : payload.message || "L’opération a échoué.",
      };
    const data =
      method === "GET"
        ? Array.isArray(payload)
          ? payload
          : payload.styles
        : payload.style;
    if (method === "GET" && !Array.isArray(data))
      return { ok: false, message: "La liste des styles reçue est invalide." };
    return {
      ok: true,
      message: payload.message || "Opération effectuée",
      data: data as T,
    };
  } catch {
    return {
      ok: false,
      message:
        "Impossible de joindre le serveur. Réessayez dans quelques instants.",
    };
  }
}

export async function getAdminStyles() {
  return request<AdminStyle[]>("", "GET");
}
export async function createAdminStyle(name: string) {
  return request<AdminStyle>("", "POST", name);
}
export async function updateAdminStyle(id: string, name: string) {
  return request<AdminStyle>(`/${encodeURIComponent(id)}`, "PATCH", name);
}
export async function deleteAdminStyle(id: string) {
  return request<unknown>(`/${encodeURIComponent(id)}`, "DELETE");
}
