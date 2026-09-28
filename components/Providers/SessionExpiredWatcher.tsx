"use client";

import { logoutAction } from "@/lib/auth.actions";
import { clearClientSession } from "@/lib/client-session";
import { PROTECTED_PATHS } from "@/lib/routes";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

/**
 * Surveille l'expiration du backend access token.
 * Ne force une déconnexion + redirection vers la page de connexion que
 * si l'utilisateur se trouve sur une page sécurisée. Sur les pages publiques
 * (accueil, connexion, landing...), on nettoie juste la session côté client
 * sans navigation forcée, pour ne pas interrompre la navigation ni boucler.
 */
export function SessionExpiredWatcher() {
  const { data: session } = useSession();
  const pathname = usePathname();
  // Empêche les déclenchements multiples (refetch toutes les 60s) pendant la déconnexion
  const isHandlingRef = useRef(false);

  useEffect(() => {
    if (session?.error !== "AccessTokenExpired" || isHandlingRef.current) {
      return;
    }

    // Jamais de logout forcé/redirection depuis la page de connexion elle-même
    if (pathname?.startsWith("/connexion")) {
      return;
    }

    isHandlingRef.current = true;
    console.warn("🔒 Session expirée - nettoyage de la session");

    const isOnProtectedPath = PROTECTED_PATHS.some((path) =>
      pathname?.startsWith(path)
    );

    const handleExpiredSession = async () => {
      try {
        await logoutAction();
      } catch (error) {
        console.error("Erreur lors de la déconnexion automatique:", error);
      } finally {
        clearClientSession();
        // Seule une page sécurisée doit forcer le retour vers la connexion
        if (isOnProtectedPath) {
          window.location.replace("/connexion?reason=session_expired");
        } else {
          isHandlingRef.current = false;
        }
      }
    };

    void handleExpiredSession();
  }, [session?.error, pathname]);

  return null;
}
