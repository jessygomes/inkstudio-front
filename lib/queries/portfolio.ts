/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

export interface PortfolioTatoueurDto {
  id: string;
  name: string;
  salonName?: string;
  role?: string;
  isLinkedUser?: boolean;
  linkedUserId?: string;
}

export interface PortfolioPhotoDto {
  id: string;
  userId?: string;
  title: string;
  description: string | null;
  imageUrl: string;
  style?: string[];
  pieceSize?: "SMALL" | "MEDIUM" | "LARGE" | null;
  categories?: { id: string; slug: string; name: string }[];
  hashtags?: string[];
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

export interface PortfolioFilters {
  style?: string;
  hashtag?: string;
  category?: string;
  pieceSize?: string;
}

export const getPortfolioPhotosAction = async (
  userId: string,
  tatoueurId?: string,
  page: number = 1,
  filters: PortfolioFilters = {},
) => {
  try {
    const base = process.env.NEXT_PUBLIC_BACK_URL!;
    const url = new URL(`${base}/portfolio/${userId}`);

    if (tatoueurId && tatoueurId !== "all") {
      url.searchParams.set("tatoueurId", tatoueurId);
    }
    (Object.keys(filters) as (keyof PortfolioFilters)[]).forEach((key) => {
      const value = filters[key]?.trim();
      if (value) url.searchParams.set(key, value);
    });
    url.searchParams.set("page", String(page));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: await getAuthHeaders(),
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

export interface PortfolioStyleDto {
  id?: string;
  name: string;
  count?: number;
}

export interface PortfolioStyleSuggestions {
  suggestions: PortfolioStyleDto[];
  canCreate: boolean;
  exactMatch: boolean;
  didYouMean: string | null;
}

const toStyleDto = (item: unknown): PortfolioStyleDto | null => {
  if (typeof item === "string") return item ? { name: item } : null;
  if (!item || typeof item !== "object") return null;
  const raw = item as Record<string, unknown>;
  const name = raw.name ?? raw.label ?? raw.style;
  if (typeof name !== "string" || !name) return null;
  const count = raw.count ?? raw.photoCount ?? raw.photosCount ?? raw._count;
  return {
    id: typeof raw.id === "string" ? raw.id : undefined,
    name,
    count: typeof count === "number" ? count : undefined,
  };
};

const toStyleList = (data: unknown): PortfolioStyleDto[] => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray((data as { styles?: unknown })?.styles)
      ? (data as { styles: unknown[] }).styles
      : [];
  return list
    .map(toStyleDto)
    .filter((style): style is PortfolioStyleDto => style !== null);
};

export const getPortfolioStylesAction = async (
  userId?: string,
  tatoueurId?: string,
): Promise<PortfolioStyleDto[]> => {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_BACK_URL}/portfolio/styles`);
    if (userId) url.searchParams.set("userId", userId);
    if (userId && tatoueurId && tatoueurId !== "all") {
      url.searchParams.set("tatoueurId", tatoueurId);
    }
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    const data = await res.json().catch(() => []);
    return res.ok ? toStyleList(data) : [];
  } catch (error) {
    console.error("Erreur lors de la récupération des styles:", error);
    return [];
  }
};

export const suggestPortfolioStylesAction = async (
  q: string,
): Promise<PortfolioStyleSuggestions> => {
  const empty: PortfolioStyleSuggestions = {
    suggestions: [],
    canCreate: false,
    exactMatch: false,
    didYouMean: null,
  };
  try {
    const headers = await getAuthHeaders();
    const url = new URL(
      `${process.env.NEXT_PUBLIC_BACK_URL}/portfolio/styles/suggest`,
    );
    url.searchParams.set("q", q);
    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) return empty;

    const rawList = Array.isArray(data)
      ? data
      : (data.suggestions ?? data.styles ?? data.items ?? []);
    const didYouMean = data.didYouMean;

    return {
      suggestions: toStyleList(rawList),
      canCreate: Boolean(data.canCreate),
      exactMatch: Boolean(data.exactMatch),
      didYouMean:
        typeof didYouMean === "string"
          ? didYouMean
          : (toStyleDto(didYouMean)?.name ?? null),
    };
  } catch (error) {
    console.error("Erreur lors de la suggestion de styles:", error);
    return empty;
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

export interface PortfolioCategoryDto {
  id: string;
  slug: string;
  name: string;
}

export const getPortfolioCategoriesAction = async (): Promise<
  PortfolioCategoryDto[]
> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/portfolio/categories`,
      { method: "GET", headers, cache: "no-store" }
    );
    const data = await res.json().catch(() => []);
    if (!res.ok || !Array.isArray(data)) return [];
    return data as PortfolioCategoryDto[];
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return [];
  }
};

//! ----------------------------------------------------------------------------

//! CREER PLUSIEURS IMAGES PORTFOLIO (PAR LOT)

//! ----------------------------------------------------------------------------
export const createPortfolioBatchAction = async (payload: {
  pieceSize: "SMALL" | "MEDIUM" | "LARGE";
  categoryIds?: string[];
  style: string[];
  hashtags?: string[];
  tatoueurId?: string;
  photos: { imageUrl: string; title?: string; description?: string }[];
}) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/portfolio/batch`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || (data && data.error)) {
      const message =
        data?.message || `Erreur lors de l'opération (${res.status})`;
      return { ok: false, error: true, status: res.status, message, data };
    }

    return { ok: true, error: false, status: res.status, data };
  } catch (error) {
    console.error("Erreur lors de la création par lot:", error);
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
