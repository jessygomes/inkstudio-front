"use client";

import { useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { useUploadThing } from "@/lib/utils/uploadthing";

interface SalonImageUploaderProps {
  currentImage?: string;
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: () => void;
}

export default function SalonImageUploader({
  currentImage,
  onImageUpload,
  onImageRemove,
}: SalonImageUploaderProps) {
  const [progress, setProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);

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

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const file = files[0];

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image valide");
      return;
    }

    try {
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
    <div className="w-full space-y-4">
      <label className="text-sm text-white">Photo du salon</label>

      {/* Container flex pour affichage côte à côte */}
      <div className="flex gap-6 items-start">
        {/* Zone d'affichage de l'image actuelle - Format circulaire */}
        <div className="flex-shrink-0">
          {currentImage ? (
            <div className="relative w-48 h-48 rounded-full overflow-hidden bg-white/10 border-2 border-white/20">
              <Image
                src={currentImage}
                alt="Image du salon"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={onImageRemove}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-lg"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="w-48 h-48 rounded-full border-2 border-dashed border-white/30 bg-white/5 flex items-center justify-center">
              <div className="text-center text-white/60">
                <div className="text-3xl mb-2">📸</div>
                <div className="text-xs">Aperçu</div>
              </div>
            </div>
          )}
        </div>

        {/* Zone d'upload */}
        <div className="flex-1">
          <div
            className={`relative border-2 border-dashed rounded-[20px] p-6 text-center transition-colors ${
              isDragOver
                ? "border-tertiary-400 bg-tertiary-400/10"
                : "border-white/30 bg-white/5"
            } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="space-y-3">
              <div className="text-4xl">📸</div>
              <div className="text-white/80">
                {isUploading ? (
                  <div>
                    <div className="font-medium mb-2">
                      Upload en cours... {progress}%
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-tertiary-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium mb-1">
                      Glissez une image ici ou cliquez pour sélectionner
                    </div>
                    <div className="text-xs text-white/60 mb-3">
                      Formats acceptés: JPG, PNG, WebP (max 8MB)
                    </div>
                    <div className="text-xs text-tertiary-400 bg-tertiary-400/10 rounded-lg px-3 py-2 inline-block">
                      💡 L&apos;image sera affichée en format circulaire comme
                      l&apos;aperçu
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bouton de sélection alternatif */}
          {!isUploading && (
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
              className="w-full mt-4 py-3 px-4 bg-tertiary-400/20 hover:bg-tertiary-400/30 text-white rounded-[20px] border border-tertiary-400/50 transition-colors"
            >
              📷 Parcourir les fichiers
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
