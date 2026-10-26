"use server";
import { auth } from "@/auth";
import { getAuthHeaders } from "@/lib/session";

export async function invitationRequest(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  id?: string,
  body?: {
    email?: string;
    role?: string;
    plan?: string;
    durationMonths?: number;
    maxUses?: number;
    validityDays?: number;
    expiresAt?: string;
  },
) {
  const session = await auth();
  if (session?.user?.role !== "admin")
    return { ok: false, message: "Accès réservé aux administrateurs." };
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/admin/invitations${id ? "/" + encodeURIComponent(id) : ""}`,
      {
        method,
        headers: await getAuthHeaders(),
        cache: "no-store",
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
    );
    const data = await response.json();
    return response.ok
      ? { ok: true, data }
      : {
          ok: false,
          message: Array.isArray(data.message)
            ? data.message.join(" ")
            : data.message || "La demande a échoué.",
        };
  } catch {
    return { ok: false, message: "Impossible de joindre le serveur." };
  }
}
