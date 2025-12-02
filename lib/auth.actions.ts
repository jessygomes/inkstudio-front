"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server Action pour gérer la déconnexion et le nettoyage des cookies
 * Ne peut être appelée que depuis des composants client ou des formulaires
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies();

    // Supprimer les cookies de session
    cookieStore.delete("access_token");
    cookieStore.delete("userId");

    // console.log("🧹 Cookies de session supprimés via server action");

    // Rediriger vers la page de connexion
    redirect("/connexion?reason=token_expired");
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
    const cookieStore = await cookies();

    // Supprimer les cookies de session
    cookieStore.delete("access_token");
    cookieStore.delete("userId");

    // console.log("🧹 Cookies expirés supprimés");
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage des cookies expirés:", error);
  }
}
