/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

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
