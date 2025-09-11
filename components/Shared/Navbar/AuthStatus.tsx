"use server";
import { cookies } from "next/headers";

/**
 * Composant server pour vérifier l'état d'authentification
 */
export async function getAuthStatus(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get("access_token")?.value;
    const userId = (await cookieStore).get("userId")?.value;
    
    return !!(accessToken && userId);
  } catch (error) {
    console.error("Erreur lors de la vérification des cookies:", error);
    return false;
  }
}
