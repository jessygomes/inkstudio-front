"use server";
import { cookies } from "next/headers";
import { getAuthenticatedUserSchema } from "./zod/validator.schema";

export const getAuthenticatedUser = async () => {
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get("access_token")?.value;

  if (!accessToken) {
    throw new Error(
      "Aucun token d'accès trouvé. L'utilisateur n'est pas authentifié."
    );
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/auth`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // ✅ Utilise le token du backend
      },
    });

    // ✅ Gestion spécifique des tokens expirés (401 Unauthorized)
    if (response.status === 401) {
      console.warn("🔑 Token expiré ou invalide - Suppression des cookies");

      // Supprimer les cookies expirés côté serveur
      const cookieStore = await cookies();
      cookieStore.delete("access_token");
      cookieStore.delete("userId");

      throw new Error("TOKEN_EXPIRED");
    }

    if (!response.ok) {
      console.error(
        `❌ Erreur API auth: ${response.status} - ${response.statusText}`
      );
      throw new Error("Échec de la récupération de l'utilisateur authentifié.");
    }

    const data = await response.json();
    // console.log("✅ Utilisateur récupéré (auth.server.ts) :", data);

    return getAuthenticatedUserSchema.parse(data);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);

    // ✅ Si c'est un token expiré, on propage l'erreur spécifique
    if (error instanceof Error && error.message === "TOKEN_EXPIRED") {
      throw error;
    }

    throw new Error("Erreur lors de la récupération de l'utilisateur.");
  }
};

export const currentUser = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const userId = cookieStore.get("userId")?.value;

  if (!accessToken || !userId) return null;

  // ✅ Retourne les informations utilisateur depuis les cookies
  // Le token est validé côté backend quand nécessaire
  return { userId };
};
