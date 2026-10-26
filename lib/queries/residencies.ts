"use server";
import { getAuthHeaders } from "../session";

export async function residencyRequest(path = "", method = "GET", body?: unknown) {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_BACK_URL + "/residencies" + path, {
      method, headers: await getAuthHeaders(), cache: "no-store",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result = await response.json();
    if (!response.ok) return { error: true, message: result.message || "Impossible de traiter cette demande." };
    return result;
  } catch {
    return { error: true, message: "Impossible de joindre le serveur. Réessayez." };
  }
}
