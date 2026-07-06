/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

export interface FlashPaginationDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FlashItemDto {
  id: string;
  userId?: string;
  tatoueurId?: string | null;
  title: string;
  dimension: string | null;
  appointmentDurationMinutes?: number;
  imageUrl: string;
  description: string | null;
  style?: string[];
  price: number;
  isAvailable: boolean;
  tatoueur?: {
    id: string;
    name: string;
    salonName?: string;
    role?: string;
  } | null;
}

export interface FlashsResponseDto {
  flashs: FlashItemDto[];
  pagination: FlashPaginationDto;
}

export const getAvailableFlashsByUserAction = async (
  userId: string,
  page: number = 1,
  isAvailable?: boolean,
) => {
  try {
    const base = process.env.NEXT_PUBLIC_BACK_URL!;
    const url = new URL(`${base}/flash/${userId}/all`);
    url.searchParams.set("page", String(page));
    if (typeof isAvailable === "boolean") {
      url.searchParams.set("isAvailable", String(isAvailable));
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || (data && data.error)) {
      const message =
        data?.message || `Erreur lors de l'opération (${res.status})`;
      return { ok: false, error: true, status: res.status, message, data };
    }

    return {
      ok: true,
      error: false,
      status: res.status,
      data: Array.isArray(data)
        ? ({
            flashs: data as FlashItemDto[],
            pagination: {
              page: 1,
              pageSize: (data as FlashItemDto[]).length,
              total: (data as FlashItemDto[]).length,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          } as FlashsResponseDto)
        : ({
            flashs: Array.isArray(data?.flashs)
              ? (data.flashs as FlashItemDto[])
              : [],
            pagination: {
              page: data?.pagination?.page ?? 1,
              pageSize: data?.pagination?.pageSize ?? 10,
              total: data?.pagination?.total ?? 0,
              totalPages: data?.pagination?.totalPages ?? 1,
              hasNextPage: Boolean(data?.pagination?.hasNextPage),
              hasPreviousPage: Boolean(data?.pagination?.hasPreviousPage),
            },
          } as FlashsResponseDto),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des flashs :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! CREER / UPDATE FLASH

//! ----------------------------------------------------------------------------
export const createOrUpdateFlashAction = async (
  payload: any,
  method: "POST" | "PATCH",
  url: string,
) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || (data && data.error)) {
      const message =
        data?.message || `Erreur lors de l'opération (${res.status})`;
      return { ok: false, error: true, status: res.status, message, data };
    }

    return { ok: true, error: false, status: res.status, data };
  } catch (error) {
    console.error("Erreur lors de la création/mise à jour du flash:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! SUPPRIMER UN FLASH

//! ----------------------------------------------------------------------------
export const deleteFlashAction = async (flashId: string) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/flash/${flashId}`,
      {
        method: "DELETE",
        headers,
      },
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || (data && data.error)) {
      throw new Error(data?.message || "Erreur lors de la suppression");
    }

    return { ok: true, error: false, status: res.status };
  } catch (error) {
    console.error("Erreur lors de la suppression du flash:", error);
    throw error;
  }
};
