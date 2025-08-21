"use server";
// import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function createSession(infos: {
  userId: string;
  access_token: string;
}) {
  const cookieStore = await cookies();

  // ✅ Stockez directement le token du backend (celui qui fonctionne avec votre JwtStrategy)
  cookieStore.set("access_token", infos.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // ✅ Stockez aussi l'userId pour un accès rapide
  cookieStore.set("userId", infos.userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  console.log("✅ Token backend stocké :", infos.access_token);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("userId");
}

// Fonction utilitaire pour récupérer le token côté serveur
// ✅ Fonction pour récupérer les headers d'authentification
export const getAuthHeaders = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  return {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };
};
