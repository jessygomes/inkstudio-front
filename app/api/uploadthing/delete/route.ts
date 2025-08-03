import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(request: NextRequest) {
  try {
    const { fileKeys } = await request.json();

    if (!fileKeys || !Array.isArray(fileKeys)) {
      return NextResponse.json(
        { error: "Le tableau fileKeys est requis" },
        { status: 400 }
      );
    }

    // Supprimer les fichiers d'UploadThing
    const result = await utapi.deleteFiles(fileKeys);

    return NextResponse.json({
      success: true,
      result,
      message: `${fileKeys.length} fichier(s) supprimé(s)`,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression UploadThing:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression des fichiers" },
      { status: 500 }
    );
  }
}
