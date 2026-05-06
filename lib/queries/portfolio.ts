/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

export interface PortfolioTatoueurDto {
  id: string;
  name: string;
}

export interface PortfolioPhotoDto {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  tatoueurId?: string | null;
  tatoueur?: PortfolioTatoueurDto | null;
}

export interface PortfolioPaginationDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PortfolioPhotosResponseDto {
  photos: PortfolioPhotoDto[];
  pagination: PortfolioPaginationDto;
}

export const getPortfolioPhotosAction = async (
  userId: string,
  tatoueurId?: string,
  page: number = 1,
) => {
  try {
    const base = process.env.NEXT_PUBLIC_BACK_URL!;
    const url = new URL(`${base}/portfolio/${userId}`);

    if (tatoueurId && tatoueurId !== "all") {
      url.searchParams.set("tatoueurId", tatoueurId);
    }
    url.searchParams.set("page", String(page));

    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || (data && data.error)) {
      const message =
        data?.message || `Erreur lors de l'operation (${res.status})`;
      return { ok: false, error: true, status: res.status, message, data };
    }

    return {
      ok: true,
      error: false,
      status: res.status,
      data: Array.isArray(data)
        ? ({
            photos: data as PortfolioPhotoDto[],
            pagination: {
              page: 1,
              pageSize: (data as PortfolioPhotoDto[]).length,
              total: (data as PortfolioPhotoDto[]).length,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          } as PortfolioPhotosResponseDto)
        : ({
            photos: Array.isArray(data?.photos)
              ? (data.photos as PortfolioPhotoDto[])
              : [],
            pagination: {
              page: data?.pagination?.page ?? 1,
              pageSize: data?.pagination?.pageSize ?? 10,
              total: data?.pagination?.total ?? 0,
              totalPages: data?.pagination?.totalPages ?? 1,
              hasNextPage: Boolean(data?.pagination?.hasNextPage),
              hasPreviousPage: Boolean(data?.pagination?.hasPreviousPage),
            },
          } as PortfolioPhotosResponseDto),
    };
  } catch (error) {
    console.error("Erreur lors de la recuperation des photos portfolio:", error);
    throw error;
  }
};

export const getSalonTatoueursForPortfolioAction = async (userId: string) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/user/${userId}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    const data = await res.json().catch(() => ([]));

    if (!res.ok || (data && data.error)) {
      const message =
        data?.message || `Erreur lors de l'operation (${res.status})`;
      return { ok: false, error: true, status: res.status, message, data };
    }

    return {
      ok: true,
      error: false,
      status: res.status,
      data: Array.isArray(data) ? (data as PortfolioTatoueurDto[]) : [],
    };
  } catch (error) {
    console.error("Erreur lors de la recuperation des tatoueurs du salon:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! CREER / UPDATE IMAGE PORTFOLIO

//! ----------------------------------------------------------------------------
export const createOrUpdatePortfolioAction = async (
  payload: any,
  method: string,
  url: string
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
    console.error("Erreur lors de la création/mise à jour de l'image:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! SUPPRIMER UNE IMAGE DU PORTFOLIO

//! ----------------------------------------------------------------------------
export const deletePortfolioImageAction = async (imageId: string) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/portfolio/${imageId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || (data && data.error)) {
      const data = await res.json();
      throw new Error(data.message || "Erreur lors de la suppression");
    }

    return { ok: true, error: false, status: res.status };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'image:", error);
    throw error;
  }
};
