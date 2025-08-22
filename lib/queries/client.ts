/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------

//! CREER / UPDATE UN CLIENT

//! ----------------------------------------------------------------------------
export const createOrUpdateClient = async (
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
    console.error("Error creating/updating client:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! VOIR TOUS LES CLIENTS D'UN SALON

//! ----------------------------------------------------------------------------
export const getSalonClientsAction = async (page: number, search: string) => {
  const ITEMS_PER_PAGE = 10;

  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BACK_URL
      }/clients/salon?page=${page}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(
        search
      )}`,
      {
        method: "GET",
        headers,
      }
    );

    console.log("Response:", response);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching salon clients:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Erreur lors du chargement des clients",
    };
  }
};

//! ----------------------------------------------------------------------------

//! SUPPRIMER UN CLIENT

//! ----------------------------------------------------------------------------
export const deleteClient = async (clientId: string) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/clients/delete/${clientId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Erreur lors de la suppression");
    }

    return { ok: true, error: false, status: response.status };
  } catch (error) {
    console.error("Error deleting client:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Erreur lors de la suppression du client",
    };
  }
};
