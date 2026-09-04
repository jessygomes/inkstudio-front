/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

export type ClientSearchResult = {
  error?: boolean;
  message?: string;
  clients?: any[];
  userClients?: any[];
};

//! ----------------------------------------------------------------------------

//! RECHERCHER UN CLIENT PAR NOM OU EMAIL

//! ----------------------------------------------------------------------------
export const searchClientsAction = async (
  query: string,
): Promise<ClientSearchResult> => {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return { clients: [], userClients: [] };
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/clients/search?query=${encodeURIComponent(normalizedQuery)}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );
    const data = (await response
      .json()
      .catch(() => ({}))) as ClientSearchResult;

    if (!response.ok || data.error) {
      return {
        error: true,
        message:
          data.message || `Erreur lors de la recherche (${response.status})`,
        clients: [],
        userClients: [],
      };
    }

    return {
      clients: data.clients || [],
      userClients: data.userClients || [],
    };
  } catch (error) {
    console.error("Erreur lors de la recherche de clients :", error);
    return {
      error: true,
      message: "Impossible de rechercher les clients.",
      clients: [],
      userClients: [],
    };
  }
};

//! ----------------------------------------------------------------------------

//! CREER / UPDATE UN CLIENT

//! ----------------------------------------------------------------------------
export const createOrUpdateClient = async (
  payload: any,
  method: string,
  url: string,
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
        search,
      )}`,
      {
        method: "GET",
        headers,
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

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
      },
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

//! ----------------------------------------------------------------------------

//! METTRE À JOUR LE CONSENTEMENT D'UN CLIENT

//! ----------------------------------------------------------------------------
export const updateClientConsent = async (
  clientId: string,
  consentFileUrl: string,
  consentSignedAt: string,
) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/clients/${clientId}/consent`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          consentSigned: true,
          consentSignedAt,
          consentFileUrl,
        }),
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        error: true,
        status: response.status,
        message:
          data?.message || "Erreur lors de la mise à jour du consentement",
      };
    }

    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Error updating client consent:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Erreur lors de la mise à jour du consentement",
    };
  }
};
