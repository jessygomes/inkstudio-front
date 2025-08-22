/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------

//! CREER / UPDATE UN TATOUEUR

//! ----------------------------------------------------------------------------
export const createOrUpdateTatoueur = async (
  payload: any,
  method: string,
  url: string
) => {
  try {
    console.log(
      "Creating/updating tatoueur with payload:",
      payload,
      method,
      url
    );
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
    console.error("Error creating/updating tatoueur:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! SUPPRIMER UN TATOUEUR

//! ----------------------------------------------------------------------------
export const deleteTatoueurAction = async (tatoueurId: string) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/delete/${tatoueurId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression du tatoueur");
    }

    return response;
  } catch (error) {
    console.error("Error deleting tatoueur:", error);
    throw error;
  }
};
