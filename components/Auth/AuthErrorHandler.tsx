"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearClientSession } from "@/lib/client-session";

/**
 * Composant pour gérer les erreurs d'authentification côté client
 * À utiliser dans les layouts ou pages protégées
 */
export function AuthErrorHandler({ error }: { error?: Error }) {
  const router = useRouter();

  useEffect(() => {
    if (error?.message === "TOKEN_EXPIRED") {
      console.log(
        "🔑 Token expiré détecté côté client - Nettoyage et redirection"
      );

      // Nettoyer les cookies côté client
      clearClientSession();

      // Rediriger vers la page de connexion
      router.replace("/connexion?reason=token_expired");
    }
  }, [error, router]);

  // Si c'est une erreur de token expiré, afficher un message de redirection
  if (error?.message === "TOKEN_EXPIRED") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            Session expirée, redirection en cours...
          </p>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Hook pour gérer les erreurs d'authentification
 * À utiliser dans les composants qui font des appels API
 */
export function useAuthErrorHandler() {
  const router = useRouter();

  const handleAuthError = (
    error: Error | { message?: string; status?: number }
  ) => {
    if (
      error?.message === "TOKEN_EXPIRED" ||
      (typeof error === "object" && "status" in error && error?.status === 401)
    ) {
      console.log(
        "🔑 Erreur d'authentification détectée - Nettoyage et redirection"
      );
      clearClientSession();
      router.replace("/connexion?reason=token_expired");
    }
  };

  return { handleAuthError };
}
