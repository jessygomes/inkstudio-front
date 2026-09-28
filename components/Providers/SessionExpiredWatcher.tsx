"use client";

import { logoutAction } from "@/lib/auth.actions";
import { clearClientSession } from "@/lib/client-session";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

/**
 * Surveille l'expiration du backend access token.
 * Si la session contient l'erreur "AccessTokenExpired", déconnecte
 * automatiquement l'utilisateur et le redirige vers la page de connexion.
 */
export function SessionExpiredWatcher() {
  const { data: session } = useSession();
  // Empêche les déclenchements multiples (refetch toutes les 60s) pendant la déconnexion
  const isHandlingRef = useRef(false);

  useEffect(() => {
    if (session?.error !== "AccessTokenExpired" || isHandlingRef.current) {
      return;
    }

    isHandlingRef.current = true;
    console.warn("🔒 Session expirée - déconnexion automatique");

    const handleExpiredSession = async () => {
      try {
        await logoutAction();
      } catch (error) {
        console.error("Erreur lors de la déconnexion automatique:", error);
      } finally {
        // Nettoyage + navigation unique : une seule redirection dure évite
        // toute course entre plusieurs mécanismes de navigation concurrents.
        clearClientSession();
        window.location.replace("/connexion?reason=session_expired");
      }
    };

    void handleExpiredSession();
  }, [session?.error]);

  return null;
}
