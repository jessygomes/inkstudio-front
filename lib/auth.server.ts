"use server";
import { cookies } from "next/headers";
import { getAuthenticatedUserSchema } from "./zod/validator.schema";
import { deleteSession } from "./session";

export const getAuthenticatedUser = async () => {
  const cookieStore = cookies();
  const sessionToken = (await cookieStore).get("session")?.value;

  if (!sessionToken) {
    throw new Error(
      "Aucune session trouvée. L'utilisateur n'est pas authentifié."
    );
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/auth`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Échec de la récupération de l'utilisateur authentifié.");
    }

    const data = await response.json();
    console.log("✅ Utilisateur récupéré :", data);

    return getAuthenticatedUserSchema.parse(data);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    await deleteSession(); // Supprimez la session si une erreur se produit
    throw new Error("Erreur lors de la récupération de l'utilisateur.");
  }
};
