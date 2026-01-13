"use server";
import { auth } from "@/auth";

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

  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return headers;
};
