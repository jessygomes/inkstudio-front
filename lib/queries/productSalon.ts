/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------

//! INTERFACES

//! ----------------------------------------------------------------------------

export interface ProductPaginationDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductItemDto {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface ProductsResponseDto {
  products: ProductItemDto[];
  pagination: ProductPaginationDto;
}

//! ----------------------------------------------------------------------------

//! RÉCUPÉRER TOUS LES PRODUITS (PAGINÉ)

//! ----------------------------------------------------------------------------
export const getProductsAction = async (
  userId: string,
  page: number = 1,
) => {
  try {
    const base = process.env.NEXT_PUBLIC_BACK_URL!;
    const url = new URL(`${base}/product-salon/${userId}`);
    url.searchParams.set("page", String(page));

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
            products: data as ProductItemDto[],
            pagination: {
              page: 1,
              pageSize: (data as ProductItemDto[]).length,
              total: (data as ProductItemDto[]).length,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          } as ProductsResponseDto)
        : ({
            products: Array.isArray(data?.products)
              ? (data.products as ProductItemDto[])
              : [],
            pagination: {
              page: data?.pagination?.page ?? 1,
              pageSize: data?.pagination?.pageSize ?? 10,
              total: data?.pagination?.total ?? 0,
              totalPages: data?.pagination?.totalPages ?? 1,
              hasNextPage: Boolean(data?.pagination?.hasNextPage),
              hasPreviousPage: Boolean(data?.pagination?.hasPreviousPage),
            },
          } as ProductsResponseDto),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! CREER / UPDATE PRODUCT

//! ----------------------------------------------------------------------------
export const createOrUpdateProductAction = async (
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
    console.error("Erreur lors de la création/mise à jour du produit:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! SUPPRIMER UNE IMAGE DU PORTFOLIO

//! ----------------------------------------------------------------------------
export const deleteProductAction = async (productId: string) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/product-salon/${productId}`,
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
