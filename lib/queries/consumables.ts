"use server";
import { getAuthHeaders } from "../session";
import { AppointmentConsumable, CreateConsumablePayload, UpdateConsumablePayload } from "../type";

const BASE = process.env.NEXT_PUBLIC_BACK_URL;

type SearchAppointmentConsumablesParams = {
  page?: number;
  limit?: number;
  lotNumber?: string;
  reference?: string;
  expirationDateFrom?: string;
  expirationDateTo?: string;
};

type SearchAppointmentConsumablesResult = {
  ok: boolean;
  data?: {
    consumables: (AppointmentConsumable & {
      appointment?: {
        id: string;
        prestation: string;
        start: string;
        end: string;
      };
    })[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
};

//! ----------------------------------------------------------------------------
//! LISTER LES CONSOMMABLES D'UN RENDEZ-VOUS
//! ----------------------------------------------------------------------------
export const getAppointmentConsumablesAction = async (
  appointmentId: string,
): Promise<{ ok: boolean; data?: AppointmentConsumable[]; message?: string }> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/appointments/${appointmentId}/consumables`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) {
      return { ok: false, message: data?.message || "Erreur lors du chargement des consommables." };
    }
    return { ok: true, data: data.consumables ?? [] };
  } catch {
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
};

//! ----------------------------------------------------------------------------
//! AJOUTER UN CONSOMMABLE A UN RENDEZ-VOUS
//! ----------------------------------------------------------------------------
export const addAppointmentConsumableAction = async (
  appointmentId: string,
  payload: CreateConsumablePayload,
): Promise<{ ok: boolean; data?: AppointmentConsumable; message?: string }> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE}/appointments/${appointmentId}/consumables`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) {
      return { ok: false, message: data?.message || "Erreur lors de l'ajout du consommable." };
    }
    return { ok: true, data: data.consumable };
  } catch {
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
};

//! ----------------------------------------------------------------------------
//! MODIFIER UN CONSOMMABLE
//! ----------------------------------------------------------------------------
export const updateAppointmentConsumableAction = async (
  appointmentId: string,
  consumableId: string,
  payload: UpdateConsumablePayload,
): Promise<{ ok: boolean; data?: AppointmentConsumable; message?: string }> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${BASE}/appointments/${appointmentId}/consumables/${consumableId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) {
      return { ok: false, message: data?.message || "Erreur lors de la mise à jour." };
    }
    return { ok: true, data: data.consumable };
  } catch {
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
};

//! ----------------------------------------------------------------------------
//! SUPPRIMER UN CONSOMMABLE
//! ----------------------------------------------------------------------------
export const deleteAppointmentConsumableAction = async (
  appointmentId: string,
  consumableId: string,
): Promise<{ ok: boolean; message?: string }> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${BASE}/appointments/${appointmentId}/consumables/${consumableId}`,
      {
        method: "DELETE",
        headers,
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) {
      return { ok: false, message: data?.message || "Erreur lors de la suppression." };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
};

//! ----------------------------------------------------------------------------
//! RECHERCHER LES CONSOMMABLES (TRACABILITE)
//! ----------------------------------------------------------------------------
export const searchAppointmentConsumablesAction = async (
  params: SearchAppointmentConsumablesParams,
): Promise<SearchAppointmentConsumablesResult> => {
  try {
    const headers = await getAuthHeaders();
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.lotNumber?.trim()) searchParams.set("lotNumber", params.lotNumber.trim());
    if (params.reference?.trim()) searchParams.set("reference", params.reference.trim());
    if (params.expirationDateFrom) searchParams.set("expirationDateFrom", params.expirationDateFrom);
    if (params.expirationDateTo) searchParams.set("expirationDateTo", params.expirationDateTo);

    const query = searchParams.toString();
    const res = await fetch(
      `${BASE}/appointments/consumables/search${query ? `?${query}` : ""}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) {
      return {
        ok: false,
        message:
          data?.message ||
          "Erreur lors de la recherche des consommables.",
      };
    }

    return {
      ok: true,
      data: {
        consumables: data?.consumables ?? [],
        pagination: data?.pagination,
      },
    };
  } catch {
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
};
