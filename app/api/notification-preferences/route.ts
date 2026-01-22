import { getAuthHeaders } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 300; // Cache 5 minutes

export async function GET() {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/notification-preferences`,
      {
        method: "GET",
        headers,
        cache: "force-cache",
      }
    );

    if (!res.ok) {
      throw new Error(
        `Erreur lors de la récupération des préférences de notification`
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Erreur API notification-preferences:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const headers = await getAuthHeaders();
    const body = await request.json();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/notification-preferences`,
      {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      throw new Error(
        `Erreur lors de la mise à jour des préférences de notification`
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erreur API notification-preferences PUT:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
