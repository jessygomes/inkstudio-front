"use server";
import { auth } from "@/auth";
import { hasUsableSession } from "./auth-security";

/**
 * Récupère les headers d'authentification avec le token NextAuth
 * Utilisé pour les appels API vers le backend
 * Retourne toujours un Record<string, string> valide
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const session = await auth();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (hasUsableSession(session)) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return headers;
};
