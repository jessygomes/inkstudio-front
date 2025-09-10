"use client";
import { clearClientSession } from "../client-session";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface AuthError {
  status?: number;
  message?: string;
}

/**
 * Gère les erreurs d'authentification côté client
 * @param error - L'erreur retournée par l'API
 * @param router - Le router Next.js pour la redirection
 */
export const handleAuthError = (
  error: AuthError | Error | unknown,
  router?: AppRouterInstance
) => {
  // Vérifier si c'est une erreur 401 (Unauthorized)
  const isUnauthorized =
    (error as AuthError)?.status === 401 ||
    (error as Error)?.message?.includes("401") ||
    (error as Error)?.message?.includes("TOKEN_EXPIRED");

  if (isUnauthorized) {
    console.warn("🔑 Token expiré détecté côté client - Nettoyage des cookies");

    // Nettoyer les cookies côté client
    clearClientSession();

    // Rediriger vers la page de connexion avec le paramètre d'expiration
    if (router) {
      router.push("/connexion?reason=expired");
    } else {
      // Fallback si pas de router disponible
      window.location.href = "/connexion?reason=expired";
    }

    return true; // Indique que l'erreur a été gérée
  }

  return false; // L'erreur n'est pas liée à l'authentification
};

/**
 * Intercepteur pour les requêtes fetch avec gestion automatique des tokens expirés
 * @param url - L'URL de la requête
 * @param options - Les options de la requête
 * @returns Promise<Response>
 */
export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const response = await fetch(url, options);

  // Si la réponse est 401, nettoyer les cookies et rediriger
  if (response.status === 401) {
    console.warn("🔑 Token expiré lors de la requête - Nettoyage automatique");
    clearClientSession();
    window.location.href = "/connexion?reason=expired";
  }

  return response;
};

/**
 * Hook pour gérer les erreurs d'authentification dans les composants React
 */
export const useAuthErrorHandler = () => {
  const handleError = (error: AuthError | Error | unknown) => {
    return handleAuthError(error);
  };

  return { handleError };
};
