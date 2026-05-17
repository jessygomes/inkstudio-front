"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

/**
 * Surveille l'expiration du backend access token.
 * Si la session contient l'erreur "AccessTokenExpired", déconnecte
 * automatiquement l'utilisateur et le redirige vers la page d'accueil.
 */
export function SessionExpiredWatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "AccessTokenExpired") {
      console.warn("🔒 Session expirée - déconnexion automatique");
      signOut({ callbackUrl: "/" });
    }
  }, [session?.error]);

  return null;
}
