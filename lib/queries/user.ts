/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------

//! CHANGER DE MOT DE PASSE

//! ----------------------------------------------------------------------------
export const changePasswordAction = async (payload: any) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/auth/change-password`,
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
    console.error("Erreur lors du changement de mot de passe :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! RECUPERER LES PHOTOS DU SALON

//! ----------------------------------------------------------------------------
export const fetchSalonPhotosAction = async (salonId: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/${salonId}/photos`,
      {
        method: "GET",
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
    console.error(
      "Erreur lors de la récupération des photos du salon :",
      error
    );
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! RECUPERER LE PARAMETRE DE CONFIRMATION D'UN RDV CLIENT

//! ----------------------------------------------------------------------------
export const fetchAppointmentConfirmationAction = async () => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/confirmation-setting`,
      {
        method: "GET",
        headers,
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
    console.error(
      "Erreur lors de la récupération du paramètre de confirmation :",
      error
    );
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! MODIFIER LA CONFIRMATION D'UN RDV CLIENT

//! ----------------------------------------------------------------------------
export const updateAppointmentConfirmationAction = async (value: boolean) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/confirmation-setting`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ addConfirmationEnabled: value }),
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
    console.error(
      "Erreur lors de la mise à jour du paramètre de confirmation :",
      error
    );
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! RECUPERER LE PARAMETRE DE CONFIRMATION D'UN RDV CLIENT

//! ----------------------------------------------------------------------------
export const fetchAppointmentParamAction = async () => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/appointment-setting`,
      {
        method: "GET",
        headers,
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
    console.error(
      "Erreur lors de la récupération du paramètre de confirmation :",
      error
    );
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! MODIFIER LA CONFIRMATION D'UN RDV CLIENT

//! ----------------------------------------------------------------------------
export const updateAppointmentParamAction = async (value: boolean) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/appointment-setting`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ appointmentBookingEnabled: value }),
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
    console.error(
      "Erreur lors de la mise à jour du paramètre de prise de rendez-vous :",
      error
    );
    throw error;
  }
};
