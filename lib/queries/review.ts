"use server";
import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------

//! RECUPERER LES AVIS RECENTS DU SALON (10 DERNIERS JOURS --> POUR DASHBOARD)

//! ----------------------------------------------------------------------------

export async function getRecentReviewsBySalon() {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/salon-review/salon/recent`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Response not ok:", response.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const result = await response.json();

    // Vérifier si le résultat est valide
    if (Array.isArray(result)) {
      return { ok: true, data: result };
    } else if (result && typeof result === "object" && !result.error) {
      return { ok: true, data: result };
    } else {
      console.error("Invalid result format:", result);
      return {
        ok: false,
        message: result.message || "Format de données invalide",
      };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des avis récents:", error);
    return {
      ok: false,
      message: "Erreur lors de la récupération des avis récents",
    };
  }
}

//! ----------------------------------------------------------------------------

//! RÉPONDRE À UN AVIS (SALON)

//! ----------------------------------------------------------------------------

export async function respondToReviewAction(
  reviewId: string,
  response: string,
) {
  try {
    const headers = await getAuthHeaders();

    const result = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/salon-review/${reviewId}/response`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response }),
        cache: "no-store",
      },
    );

    if (!result.ok) {
      console.error("Response not ok:", result.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${result.status}: ${result.statusText}`,
      };
    }

    const data = await result.json();

    return {
      ok: true,
      data,
      message: "Votre réponse a été publiée avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la réponse à l'avis:", error);
    return {
      ok: false,
      message: "Erreur lors de la publication de votre réponse",
    };
  }
}

//! ----------------------------------------------------------------------------

//! SUPPRIMER LA RÉPONSE D'UN AVIS (SALON)

//! ----------------------------------------------------------------------------

export async function removeReviewResponseAction(reviewId: string) {
  try {
    const headers = await getAuthHeaders();

    const result = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/salon-review/${reviewId}/response`,
      {
        method: "DELETE",
        headers,
        cache: "no-store",
      },
    );

    if (!result.ok) {
      console.error("Response not ok:", result.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${result.status}: ${result.statusText}`,
      };
    }

    const data = await result.json();

    return {
      ok: true,
      data,
      message: "La réponse a été supprimée avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de la réponse:", error);
    return {
      ok: false,
      message: "Erreur lors de la suppression de la réponse",
    };
  }
}

//! ----------------------------------------------------------------------------

//! RÉCUPÉRER TOUS LES AVIS D'UN SALON AVEC PAGINATION

//! ----------------------------------------------------------------------------

export async function getAllReviewsBySalon(
  salonId: string,
  options?: {
    page?: number;
    limit?: number;
    sortBy?: "recent" | "rating" | "oldest";
    filterRating?: number;
  },
) {
  try {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams();
    params.set("page", String(options?.page ?? 1));
    params.set("limit", String(options?.limit ?? 10));
    params.set("sortBy", options?.sortBy ?? "recent");
    if (options?.filterRating !== undefined) {
      params.set("filterRating", String(options.filterRating));
    }

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BACK_URL
      }/salon-review/salon/${salonId}?${params.toString()}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Response not ok:", response.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const result = await response.json();

    if (result && typeof result === "object" && !result.error) {
      return { ok: true, data: result };
    }

    return {
      ok: false,
      message: result?.message || "Format de données invalide",
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des avis du salon:", error);
    return {
      ok: false,
      message: "Erreur lors de la récupération des avis du salon",
    };
  }
}
