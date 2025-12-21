"use server";
import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------

//! RECUPERER LE NB DE FAVORIS D'UN SALON

//! ----------------------------------------------------------------------------
export async function getFavoriteCountBySalon() {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/favorites/count`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Response not ok:", response.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log("Nombre de favoris récupéré:", data);

    return {
      ok: true,
      data,
      message: "Nombre de favoris récupéré avec succès",
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du nombre de favoris:",
      error
    );
    return {
      ok: false,
      message: "Erreur lors de la récupération du nombre de favoris",
    };
  }
}
