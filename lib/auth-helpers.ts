import { auth } from "@/auth";

/**
 * Récupère l'utilisateur authentifié via NextAuth
 * À utiliser dans les Server Components et Server Actions
 */
export const getCurrentUser = async () => {
  const session = await auth();
  return session?.user;
};

/**
 * Récupère la session complète avec le token d'accès
 * À utiliser quand vous avez besoin du token pour les appels API
 */
export const getSession = async () => {
  return await auth();
};

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = async () => {
  const session = await auth();
  return !!session?.user;
};

/**
 * Récupère le token d'accès pour les appels API backend
 */
export const getAccessToken = async () => {
  const session = await auth();
  return session?.accessToken;
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
