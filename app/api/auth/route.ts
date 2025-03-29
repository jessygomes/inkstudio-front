/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/auth/route.ts
import { NextRequest } from "next/server";
// import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/auth.server";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur." }),
      { status: 500 }
    );
  }
}
