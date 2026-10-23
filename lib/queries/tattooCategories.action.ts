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

interface ApiResponse<T = undefined> {
  ok: boolean;
  message: string;
  data?: T;
}

const request = async <T>(
  path: string,
  method: string,
  body?: TattooCategoryInput
): Promise<ApiResponse<T>> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/admin/tattoo-categories${path}`,
      {
        method,
        headers,
        cache: "no-store",
        body: body ? JSON.stringify(body) : undefined,
      }
    );
    const data = await res.json().catch(() => ({}));

    if (!res.ok || (data && data.error)) {
      const raw = data?.message;
      const message = Array.isArray(raw)
        ? raw.join(", ")
        : raw || `Erreur lors de l'opération (${res.status})`;
      return { ok: false, message };
    }

    return { ok: true, message: "OK", data: data as T };
  } catch (error) {
    console.error("Erreur catégories admin:", error);
    return { ok: false, message: "Erreur réseau" };
  }
};

export const getAdminTattooCategoriesAction = () =>
  request<AdminTattooCategory[]>("", "GET");

export const createAdminTattooCategoryAction = (input: TattooCategoryInput) =>
  request<AdminTattooCategory>("", "POST", input);

export const updateAdminTattooCategoryAction = (
  id: string,
  input: TattooCategoryInput
) => request<AdminTattooCategory>(`/${id}`, "PATCH", input);

export const deleteAdminTattooCategoryAction = (id: string) =>
  request<unknown>(`/${id}`, "DELETE");
