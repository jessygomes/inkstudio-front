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

    if (!response.ok) {
      throw new Error("Échec de la récupération de l'utilisateur authentifié.");
    }

    const data = await response.json();
    console.log("✅ Utilisateur récupéré (auth.server.ts) :", data);

    return getAuthenticatedUserSchema.parse(data);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
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
