"use server";

import { signOut as authSignOut } from "@/auth";
import { cookies } from "next/headers";

const SESSION_COOKIE_PREFIXES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
  "access_token",
  "userId",
] as const;

async function clearSessionCookies() {
  const cookieStore = await cookies();

  for (const cookie of cookieStore.getAll()) {
    if (
      SESSION_COOKIE_PREFIXES.some(
        (prefix) => cookie.name === prefix || cookie.name.startsWith(`${prefix}.`),
      )
    ) {
      cookieStore.delete(cookie.name);
    }
  }
}

/**
 * Server Action pour gérer la déconnexion et le nettoyage des cookies
 * Ne peut être appelée que depuis des composants client ou des formulaires
 */
export async function logoutAction() {
  try {
    await authSignOut({
      redirect: false,
      redirectTo: "/",
    });

    await clearSessionCookies();

    return { url: "/" };
  } catch (error) {
    console.error("❌ Erreur lors de la déconnexion:", error);
    throw error;
  }
}

/**
 * Server Action pour vérifier si un token est valide
 * Utilisée par le middleware pour éviter les appels API répétés
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/user/me`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du token:", error);
    return false;
  }
}

/**
 * Server Action pour nettoyer les cookies expirés
 * Utilisée quand on détecte un token invalide/expiré
 */
export async function clearExpiredSession() {
  try {
    await clearSessionCookies();

    // console.log("🧹 Cookies expirés supprimés");
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage des cookies expirés:", error);
  }
}
