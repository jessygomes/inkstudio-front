"use server";

import { getAuthHeaders } from "../session";

const TEAM_REQUESTS_BASE = `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/team-requests`;

export type IncomingTeamRequest = {
  id: string;
  message?: string | null;
  status: string;
  createdAt?: string;
  salon: {
    id: string;
    salonName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    image?: string | null;
  };
};

export type LinkedSalon = {
  id: string;
  salonName?: string | null;
  profileImage?: string | null;
  image?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  instagram?: string | null;
  website?: string | null;
  salonHours?: string | null;
  prestations?: string[];
  isCurrentSalon?: boolean;
  linkedAt?: string | Date | null;
};

export type SearchTatoueurUser = {
  id: string;
  email: string;
  salonName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  image?: string | null;
  phone?: string | null;
  instagram?: string | null;
  isAlreadyInTeam: boolean;
  hasPendingRequestFromThisSalon: boolean;
};

export type CreateTeamRequestPayload = {
  tatoueurUserId: string;
  message?: string;
};

export type CreateTeamRequestResult = {
  ok: boolean;
  error: boolean;
  status: number;
  message?: string;
  data?: unknown;
};

export const searchTatoueurUsersAction = async (query: string) => {
  try {
    const headers = await getAuthHeaders();
    const encodedQuery = encodeURIComponent(query.trim());

    const response = await fetch(`${TEAM_REQUESTS_BASE}/search?q=${encodedQuery}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.error) {
      const message =
        data?.message || `Erreur lors de l'opération (${response.status})`;
      return {
        ok: false,
        error: true,
        status: response.status,
        message,
        tatoueurs: [] as SearchTatoueurUser[],
      };
    }

    return {
      ok: true,
      error: false,
      status: response.status,
      tatoueurs: (data?.tatoueurs || []) as SearchTatoueurUser[],
    };
  } catch (error) {
    console.error("Erreur lors de la recherche de tatoueurs inscrits:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Impossible de rechercher des tatoueurs inscrits.",
      tatoueurs: [] as SearchTatoueurUser[],
    };
  }
};

export const createTeamRequestAction = async ({
  tatoueurUserId,
  message,
}: CreateTeamRequestPayload): Promise<CreateTeamRequestResult> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${TEAM_REQUESTS_BASE}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        tatoueurUserId,
        ...(message?.trim() ? { message: message.trim() } : {}),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.error) {
      const messageText =
        data?.message || `Erreur lors de l'opération (${response.status})`;
      return {
        ok: false,
        error: true,
        status: response.status,
        message: messageText,
        data,
      };
    }

    return {
      ok: true,
      error: false,
      status: response.status,
      message: data?.message,
      data,
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi de la demande d'équipe:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Impossible d'envoyer la demande.",
      data: null,
    };
  }
};

export const getIncomingTeamRequestsAction = async () => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${TEAM_REQUESTS_BASE}/incoming`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.error) {
      const message =
        data?.message || `Erreur lors de l'opération (${response.status})`;
      return { ok: false, error: true, status: response.status, message, requests: [] as IncomingTeamRequest[] };
    }

    return {
      ok: true,
      error: false,
      status: response.status,
      requests: (data?.requests || []) as IncomingTeamRequest[],
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes reçues:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Impossible de récupérer les demandes reçues.",
      requests: [] as IncomingTeamRequest[],
    };
  }
};

export const getLinkedSalonsAction = async () => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${TEAM_REQUESTS_BASE}/linked-salons`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.error) {
      const message =
        data?.message || `Erreur lors de l'opération (${response.status})`;
      return { ok: false, error: true, status: response.status, message, salons: [] as LinkedSalon[] };
    }

    return {
      ok: true,
      error: false,
      status: response.status,
      salons: (data?.salons || []) as LinkedSalon[],
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des salons liés:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Impossible de récupérer les salons liés.",
      salons: [] as LinkedSalon[],
    };
  }
};

export const respondToTeamRequestAction = async ({
  requestId,
  action,
}: {
  requestId: string;
  action: "accept" | "refuse";
}) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${TEAM_REQUESTS_BASE}/${requestId}/respond`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ action }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.error) {
      const message =
        data?.message || `Erreur lors de l'opération (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }

    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la réponse à la demande:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Impossible de répondre à la demande.",
      data: null,
    };
  }
};

export const leaveCurrentSalonAction = async () => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${TEAM_REQUESTS_BASE}/linked/me/leave`, {
      method: "DELETE",
      headers,
    });

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
    console.error("Erreur lors du retrait du salon actuel:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Impossible de quitter le salon actuellement lié.",
      data: null,
    };
  }
};
