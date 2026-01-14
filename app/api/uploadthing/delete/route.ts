import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(request: NextRequest) {
  try {
    const { fileKeys } = await request.json();

    if (!fileKeys || !Array.isArray(fileKeys) || fileKeys.length === 0) {
      return NextResponse.json(
        { success: false, error: "Clés de fichiers manquantes" },
        { status: 400 }
      );
    }

    console.log("🗑️ Suppression UploadThing - Clés:", fileKeys);

    // Supprimer les fichiers
    const result = await utapi.deleteFiles(fileKeys);

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
