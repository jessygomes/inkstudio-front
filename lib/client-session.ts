"use client";

/**
 * Fonction côté client pour nettoyer les cookies de session
 */
export function clearClientSession() {
  // Supprime tous les cookies liés à la session côté client
  document.cookie =
    "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  console.log("🧹 Cookies de session supprimés côté client");
}

/**
 * Vérifie si l'utilisateur a des cookies de session
 */
export function hasSessionCookies(): boolean {
  if (typeof document === "undefined") return false;

  const cookies = document.cookie.split(";");
  const hasAccessToken = cookies.some((cookie) =>
    cookie.trim().startsWith("access_token=")
  );
  const hasUserId = cookies.some((cookie) =>
    cookie.trim().startsWith("userId=")
  );

  return hasAccessToken && hasUserId;
}

/**
 * Récupère la valeur d'un cookie côté client
 */
export function getClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    return cookieValue || null;
  }

  return null;
}
