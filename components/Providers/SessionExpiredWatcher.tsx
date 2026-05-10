"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

/**
 * Surveille l'expiration du backend access token.
 * Si la session contient l'erreur "AccessTokenExpired", déconnecte
 * automatiquement l'utilisateur et le redirige vers la page de connexion.
 */
export function SessionExpiredWatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "AccessTokenExpired") {
      console.warn("🔒 Session expirée - déconnexion automatique");
      signOut({ callbackUrl: "/connexion" });
    }
  }, [session?.error]);

  return null;
}
