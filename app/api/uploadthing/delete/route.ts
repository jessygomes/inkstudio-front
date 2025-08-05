import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Clé manquante" },
        { status: 400 }
      );
    }

    console.log("🗑️ Suppression UploadThing - Clé:", key);

    // Supprimer le fichier
    const result = await utapi.deleteFiles([key]);

    console.log("📋 Résultat suppression UploadThing:", result);

    return NextResponse.json({
      success: true,
      result: result,
    });
  } catch (error) {
    console.error("❌ Erreur suppression UploadThing:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
