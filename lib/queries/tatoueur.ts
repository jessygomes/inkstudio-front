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

//! ----------------------------------------------------------------------------

//! RECUPERER LES TATOUEURS D'UN SALON (CREES + RELIES)

//! ----------------------------------------------------------------------------
export const getTatoueursByUserIdAction = async (userId: string) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/user/${userId}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ([]));

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message || `Erreur lors de l'opération (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }

    return {
      ok: true,
      error: false,
      status: response.status,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des tatoueurs du salon:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Impossible de récupérer les tatoueurs du salon.",
      data: [],
    };
  }
};

//! ----------------------------------------------------------------------------

//! RETIRER UN TATOUEUR USER RELIE DE L'EQUIPE

//! ----------------------------------------------------------------------------
export const unlinkLinkedTatoueurAction = async (tatoueurUserId: string) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/team-requests/linked/${tatoueurUserId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.error) {
      const message =
        data?.message || `Erreur lors de l'opération (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }

    return {
      ok: true,
      error: false,
      status: response.status,
      message: data?.message,
      data,
    };
  } catch (error) {
    console.error("Erreur lors du retrait du tatoueur lié:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Impossible de retirer ce tatoueur de l'équipe.",
      data: null,
    };
  }
};

//! ----------------------------------------------------------------------------

//! ACTIVER / DESACTIVER LA PRISE DE RDV D'UN TATOUEUR LIE

//! ----------------------------------------------------------------------------
export const updateLinkedTatoueurAppointmentBookingAction = async (
  tatoueurUserId: string,
  appointmentBookingEnabled: boolean
) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/team-requests/linked/${tatoueurUserId}/appointment-booking`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ appointmentBookingEnabled }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.error) {
      const message =
        data?.message || `Erreur lors de l'opération (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }

    return {
      ok: true,
      error: false,
      status: response.status,
      message: data?.message,
      data,
    };
  } catch (error) {
    console.error("Erreur lors de la mise a jour RDV du tatoueur lie:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Impossible de mettre a jour la prise de RDV pour ce tatoueur.",
      data: null,
    };
  }
};
