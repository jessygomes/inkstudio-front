"use server";
import { auth } from "@/auth";

/**
 * Récupère les headers d'authentification avec le token NextAuth
 * Utilisé pour les appels API vers le backend
 */
export const getAuthHeaders = async () => {
  const session = await auth();

  if (!session || !session.accessToken) {
    console.warn("⚠️  Pas de session NextAuth ou token manquant");
    return {
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.accessToken}`,
  };
};
