"use server";

import { getAuthHeaders } from "../session";

export interface AdminTattooCategory {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { portfolios?: number; photos?: number };
  photosCount?: number;
}
export interface TattooCategoryInput {
  name?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
}

async function request<T>(
  path: string,
  method: string,
  body?: TattooCategoryInput,
): Promise<{ ok: boolean; message: string; data?: T }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/admin/tattoo-categories${path}`,
      {
        method,
        headers,
        cache: "no-store",
        body: body ? JSON.stringify(body) : undefined,
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
          : payload.categories
        : payload.category;
    if (method === "GET" && !Array.isArray(data))
      return {
        ok: false,
        message: "La liste des catégories reçue est invalide.",
      };
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

export async function getAdminTattooCategoriesAction() {
  return request<AdminTattooCategory[]>("", "GET");
}
export async function createAdminTattooCategoryAction(
  input: TattooCategoryInput,
) {
  return request<AdminTattooCategory>("", "POST", input);
}
export async function updateAdminTattooCategoryAction(
  id: string,
  input: TattooCategoryInput,
) {
  return request<AdminTattooCategory>(
    `/${encodeURIComponent(id)}`,
    "PATCH",
    input,
  );
}
export async function deleteAdminTattooCategoryAction(id: string) {
  return request<unknown>(`/${encodeURIComponent(id)}`, "DELETE");
}
