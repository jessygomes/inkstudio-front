import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Endpoint qui retourne le token JWT depuis les cookies HttpOnly
 * Utilisé côté client pour initialiser la connexion Socket.IO
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Erreur lors de la récupération du token:", error);
    return NextResponse.json(
      { error: "Failed to retrieve token" },
      { status: 500 }
    );
  }
}
