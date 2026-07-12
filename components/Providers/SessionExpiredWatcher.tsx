"use client";

import { logoutAction } from "@/lib/auth.actions";
import { clearClientSession } from "@/lib/client-session";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

/**
 * Surveille l'expiration du backend access token.
 * Si la session contient l'erreur "AccessTokenExpired", déconnecte
 * automatiquement l'utilisateur et le redirige vers la page d'accueil.
 */
export function SessionExpiredWatcher() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const handleExpiredSession = async () => {
      console.warn("🔒 Session expirée - déconnexion automatique");

      try {
        const result = await logoutAction();

        clearClientSession();
        window.dispatchEvent(new Event("logout"));

        const nextUrl = result?.url || "/";

        router.replace(nextUrl);
        router.refresh();
        window.location.replace(nextUrl);
      } catch (error) {
        console.error("Erreur lors de la déconnexion automatique:", error);
        clearClientSession();
        window.location.replace("/");
      }
    };

    if (session?.error === "AccessTokenExpired") {
      void handleExpiredSession();
    }
  }, [router, session?.error]);

  return null;
}
