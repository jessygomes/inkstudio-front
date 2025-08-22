/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------

//! CRÉER UN CRÉNEAU BLOQUÉ

//! ----------------------------------------------------------------------------
export const createBlockedTimeSlotAction = async (payload: any) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message || `Erreur lors de l'opération (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }

    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la création du créneau bloqué :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! SUPPRIMER UN CRÉNEAU BLOQUÉ

//! ----------------------------------------------------------------------------
export const deleteBlockedTimeSlotAction = async (id: string) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/${id}`,
      {
        method: "DELETE",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message || `Erreur lors de l'opération (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }

    console.log(response);

    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la suppression du créneau bloqué :", error);
    throw error;
  }
};
