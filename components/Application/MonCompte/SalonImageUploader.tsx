"use client";

import { useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { useUploadThing } from "@/lib/utils/uploadthing";

interface SalonImageUploaderProps {
  currentImage?: string;
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: () => void;
  compact?: boolean;
  onFileSelect?: (file: File) => void;
  selectedFile?: File | null;
  previewMode?: boolean;
}

export default function SalonImageUploader({
  currentImage,
  onImageUpload,
  onImageRemove,
  compact = false,
}: // onFileSelect,
// selectedFile,
// previewMode = false,
SalonImageUploaderProps) {
  const [progress, setProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // État pour le loader de suppression

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res: { url: string; key: string }[]) => {
      if (res && res[0]) {
        onImageUpload(res[0].url);
      }
      setProgress(100);
    },
    onUploadProgress: (p: number) => setProgress(p),
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
    },
  });

  // Fonction pour extraire la clé d'une URL UploadThing
  const extractKeyFromUrl = (url: string): string | null => {
    try {
      const patterns = [
        /\/f\/([^\/\?]+)/,
        /uploadthing\.com\/([^\/\?]+)/,
        /utfs\.io\/f\/([^\/\?]+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      const urlParts = url.split("/");
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart && !lastPart.includes(".")) {
        return lastPart;
      }

      return null;
    } catch (error) {
      console.error("Erreur lors de l'extraction de la clé:", error);
      return null;
    }
  };

  // Fonction pour supprimer de UploadThing
  const deleteFromUploadThing = async (imageUrl: string): Promise<boolean> => {
    try {
      const key = extractKeyFromUrl(imageUrl);
      if (!key) {
        console.warn("⚠️ Impossible d'extraire la clé de l'URL:", imageUrl);
        return false;
      }

      const response = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      const result = await response.json();
      return response.ok && result.success;
    } catch (error) {
      console.error("❌ Erreur lors de la suppression d'UploadThing:", error);
      return false;
    }
  };

  // Fonction pour gérer la suppression de l'image
  const handleImageRemove = async () => {
    setIsDeleting(true); // Activer le loader

    try {
      if (currentImage) {
        const deleted = await deleteFromUploadThing(currentImage);
        if (deleted) {
          console.log("✅ Image supprimée d'UploadThing");
        } else {
          console.warn("⚠️ Impossible de supprimer l'image d'UploadThing");
        }
      }
      onImageRemove();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setIsDeleting(false); // Désactiver le loader
    }
  };

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const file = files[0];

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image valide");
      return;
    }

    try {
      // Supprimer l'ancienne image si elle existe
      if (currentImage) {
        await deleteFromUploadThing(currentImage);
      }

      // Compresser l'image
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
      });

      await startUpload([compressed]);
    } catch (error) {
      console.error("Erreur lors de la compression:", error);
      alert("Erreur lors du traitement de l'image");
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  return (
    <div className={`w-full space-y-${compact ? "2" : "4"}`}>
      {/* Zone d'affichage et d'upload */}
      <div className={compact ? "space-y-2" : "flex gap-4"}>
        {/* Zone d'affichage de l'image actuelle */}
        {currentImage && (
          <div
            className={`relative ${
              compact ? "w-full h-24" : "w-[250px] h-[250px]"
            } rounded-${compact ? "lg" : "3xl"} overflow-hidden bg-white/10 ${
              compact ? "" : "flex-shrink-0"
            }`}
          >
            <Image
              src={currentImage}
              alt="Image uploadée"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={handleImageRemove}
              disabled={isDeleting}
              className={`absolute top-1 right-1 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-full ${
                compact ? "w-6 h-6 text-xs" : "w-8 h-8"
              } flex items-center justify-center transition-colors z-10 disabled:cursor-not-allowed`}
            >
              {isDeleting ? (
                <div
                  className={`animate-spin rounded-full border-b-2 border-white ${
                    compact ? "w-3 h-3" : "w-4 h-4"
                  }`}
                ></div>
              ) : (
                "✕"
              )}
            </button>

            {/* Badge de statut de suppression */}
            {isDeleting && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-black/80 rounded-lg px-2 py-1">
                  <p className="text-white text-xs font-one">Suppression...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Zone d'upload */}
        <div
          className={`relative border-2 border-dashed rounded-${
            compact ? "lg" : "[20px]"
          } ${compact ? "p-3" : "p-6"} text-center transition-colors ${
            compact ? "flex-1 min-h-[80px]" : "flex-1 min-h-[192px]"
          } flex items-center justify-center ${
            isDragOver
              ? "border-tertiary-400 bg-tertiary-400/10"
              : "border-white/30 bg-white/5"
          } ${
            isUploading || isDeleting ? "opacity-50 pointer-events-none" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={isUploading || isDeleting}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className={`space-y-${compact ? "1" : "2"}`}>
            <div className={compact ? "text-2xl" : "text-4xl"}>📸</div>
            <div className="text-white/80">
              {isUploading ? (
                <div>
                  <div className={compact ? "text-xs" : "text-sm"}>
                    Upload... {progress}%
                  </div>
                  <div
                    className={`w-full bg-white/20 rounded-full ${
                      compact ? "h-1 mt-1" : "h-2 mt-2"
                    }`}
                  >
                    <div
                      className="bg-tertiary-400 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, height: "100%" }}
                    />
                  </div>
                </div>
              ) : isDeleting ? (
                <div className={compact ? "text-xs" : "text-sm"}>
                  Suppression...
                </div>
              ) : (
                <div>
                  <div
                    className={`font-medium ${compact ? "text-xs" : "text-sm"}`}
                  >
                    {currentImage
                      ? "Remplacer"
                      : compact
                      ? "Glissez ou cliquez"
                      : "Glissez une image ici ou cliquez pour sélectionner"}
                  </div>
                  <div
                    className={`${
                      compact ? "text-[10px]" : "text-xs"
                    } text-white/60 mt-1`}
                  >
                    {compact
                      ? "JPG, PNG, WebP"
                      : "Formats acceptés: JPG, PNG, WebP (max 8MB)"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages d'aide - adaptés au mode compact */}
      {compact && currentImage && (
        <div className="text-[10px] text-white/60">Image sélectionnée</div>
      )}

      {!compact && currentImage && (
        <div className="text-xs text-white/60">
          Aperçu : Cette image sera affichée dans votre profil
        </div>
      )}

      {/* Bouton de sélection alternatif - seulement en mode normal et sans image */}
      {!compact && !currentImage && !isUploading && (
        <button
          type="button"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              handleFiles(target.files);
            };
            input.click();
          }}
          className="w-full py-3 px-4 bg-tertiary-400/20 hover:bg-tertiary-400/30 text-white rounded-[20px] border border-tertiary-400/50 transition-colors"
        >
          📷 Choisir une image
        </button>
      )}
    </div>
  );
}
