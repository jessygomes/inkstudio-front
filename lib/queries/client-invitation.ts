"use server";

// Invitation d'un client (fiche du salon) à rejoindre Inkera People.
import { getAuthHeaders } from "../session";

export type ClientInvitationState = {
  createdAt: string;
  expiresAt: string;
  emailSentAt: string | null;
  acceptedAt: string | null;
  status: "ACTIVE" | "EXPIRED" | "REVOKED" | "ACCEPTED";
};

export type ClientInvitationStatus = { linked: boolean; invitation: ClientInvitationState | null };

export type ClientInvitationCreated = { url: string; emailSent: boolean; invitation: ClientInvitationState | null };

type Result<T> = { ok: true; data: T } | { ok: false; code?: string; message: string };

async function call<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}${path}`, { ...init, headers: await getAuthHeaders(), cache: "no-store" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        code: typeof body?.code === "string" ? body.code : undefined,
        message: typeof body?.message === "string" ? body.message : "Une erreur est survenue. Réessayez plus tard.",
      };
    }
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, message: "Le serveur ne répond pas. Réessayez plus tard." };
  }
}

export async function getClientInvitationStatusAction(clientId: string) {
  return call<ClientInvitationStatus>(`/clients/${encodeURIComponent(clientId)}/invitation`);
}

/** Crée un lien d'invitation ; `sendEmail` l'envoie aussi au client. Le lien n'est renvoyé qu'ici. */
export async function createClientInvitationAction(clientId: string, sendEmail: boolean) {
  return call<ClientInvitationCreated>(`/clients/${encodeURIComponent(clientId)}/invitation`, {
    method: "POST",
    body: JSON.stringify({ sendEmail }),
  });
}
