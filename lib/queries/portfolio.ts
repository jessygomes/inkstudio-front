/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

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
