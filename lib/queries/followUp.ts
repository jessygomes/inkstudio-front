/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------

//! RECUPERER LES SUIVIS PAS ENCORE REPONDU PAR LE SALON (DASHBOARD)

//! ----------------------------------------------------------------------------
export const getUnansweredFollowUpsAction = async () => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/follow-up/unanswered`,
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
    console.error("Erreur lors de la récupération des suivis :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! RECUPERER TOUS LES SUIVIS

//! ----------------------------------------------------------------------------
export const getFollowUpAction = async (
  page: any,
  limit: any,
  status: any,
  tatoueurId: string,
  q: any
) => {
  try {
    const headers = await getAuthHeaders();
    const base = process.env.NEXT_PUBLIC_BACK_URL!;

    const url = new URL(`${base}/follow-up/all`);

    url.searchParams.set("page", String(page));

    url.searchParams.set("limit", String(limit));

    if (status && status !== "all") url.searchParams.set("status", status);

    if (tatoueurId && tatoueurId !== "all")
      url.searchParams.set("tatoueurId", tatoueurId);

    if (q && q.trim() !== "") url.searchParams.set("q", q.trim());

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message || `Erreur lors de l'opération (${response.status})`;
      return { ok: false, error: true, status: response.status, message, data };
    }

    return { ok: true, error: false, status: response.status, data };
  } catch (error) {
    console.error("Erreur lors de la récupération des suivis :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! REPONDRE A UN SUIVI

//! ----------------------------------------------------------------------------
export const replySuiviAction = async (suiviId: string, reply: string) => {
  try {
    const headers = await getAuthHeaders();

    console.log("REPLY: ", reply);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/follow-up/reply/${suiviId}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ reply }),
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
    console.error("Erreur lors de la réponse au suivi :", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! SUPPRIMER UN SUIVI

//! ----------------------------------------------------------------------------
export const deleteSuiviAction = async (suiviId: string) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/follow-up/delete/${suiviId}`,
      {
        method: "POST",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok || (data && data.error)) {
      const message =
        data?.message || `Erreur lors de l'opération (${response.status})`;
      return { ok: false, error: true, status: response.status, message };
    }

    return { ok: true, error: false, status: response.status };
  } catch (error) {
    console.error("Erreur lors de la suppression du suivi :", error);
    throw error;
  }
};
