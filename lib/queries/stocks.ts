/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------

//! CREER / UPDATE UN ITEM

//! ----------------------------------------------------------------------------
export const createOrUpdateItem = async (
  payload: any,
  method: string,
  url: string
) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(url, {
      method: method,
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
    console.error("Error creating/updating item:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! VOIR TOUS LE STOCK D'UN SALON

//! ----------------------------------------------------------------------------
export const getSalonStockAction = async (page: number, search: string) => {
  const ITEMS_PER_PAGE = 10;

  try {
    const headers = await getAuthHeaders();

    const url = `${
      process.env.NEXT_PUBLIC_BACK_URL
    }/stocks/salon?page=${page}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(
      search
    )}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.log("❌ Erreur détaillée:", data);

      // Si c'est une 404, c'est que la route n'existe pas côté backend
      if (response.status === 404) {
        return {
          error: true,
          status: 404,
          message:
            "La route /stocks/salon n'existe pas sur le serveur. Vérifiez le StocksModule et redémarrez le serveur backend.",
          stockItems: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalClients: 0,
            limit: 10,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      throw new Error(
        `Erreur ${response.status}: ${response.statusText} - ${
          data?.message || "Aucun message"
        }`
      );
    }

    return data;
  } catch (error) {
    console.error("Error fetching salon stock:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Erreur lors du chargement du stock",
    };
  }
};

//! ----------------------------------------------------------------------------

//! RECUPERER LES CATEGORIES D'ITEMS

//! ----------------------------------------------------------------------------
export const getStockCategoriesAction = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/stocks/categories`,
      {
        method: "GET",
        headers,
      }
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    return data || [];
  } catch (error) {
    console.error("Error fetching stock categories:", error);
    return [];
  }
};

//! ----------------------------------------------------------------------------

//! MODIFIER UNIQUEMENT LA QUANTITÉ D'UN ITEM

//! ----------------------------------------------------------------------------
export const updateStockQuantityAction = async (
  itemId: string,
  quantity: number
) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/stocks/updateQuantity/${itemId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ quantity }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return { ok: true, error: false, data };
  } catch (error) {
    console.error("Error updating stock quantity:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Erreur lors de la mise à jour de la quantité",
    };
  }
};

//! SUPPRIMER UN ITEM DU STOCK
export const deleteStockItemAction = async (itemId: string) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/stocks/delete/${itemId}`,
      {
        method: "DELETE",
        headers,
      }
    );
    const data = await res.json().catch(() => ({}));

    if (!res.ok || (data && data.error)) {
      const message = data?.message || "Erreur lors de la suppression";
      return { ok: false, error: true, status: res.status, message };
    }
    return { ok: true, error: false, status: res.status };
  } catch (error) {
    console.error("Error deleting stock item:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Erreur lors de la suppression de l'item",
    };
  }
};
