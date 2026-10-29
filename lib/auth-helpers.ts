import { auth } from "@/auth";
import { hasUsableSession } from "./auth-security";

/**
 * Récupère l'utilisateur authentifié via NextAuth
 * À utiliser dans les Server Components et Server Actions
 */
export const getCurrentUser = async () => {
  const session = await auth();
  return hasUsableSession(session) ? session.user : undefined;
};

/**
 * Récupère la session complète avec le token d'accès
 * À utiliser quand vous avez besoin du token pour les appels API
 */
export const getSession = async () => {
  const session = await auth();
  return hasUsableSession(session) ? session : null;
};

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = async () => {
  const session = await auth();
  return hasUsableSession(session);
};

/**
 * Récupère le token d'accès pour les appels API backend
 */
export const getAccessToken = async () => {
  const session = await auth();
  return hasUsableSession(session) ? session.accessToken : undefined;
};

/**
 * Récupère les headers d'authentification pour les appels API
 */
export const getAuthHeaders = async () => {
  const token = await getAccessToken();

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
