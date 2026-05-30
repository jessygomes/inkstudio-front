"use client";

import { useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { useUploadThing } from "@/lib/utils/uploadthing";
import { extractUploadThingKey } from "@/lib/utils/uploadImg/extractUploadThingKey";

interface SalonImageUploaderProps {
  currentImage?: string;
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: () => void | Promise<void>;
  compact?: boolean;
  variant?: "default" | "profile" | "banner";
  onFileSelect?: (file: File) => void;
  selectedFile?: File | null;
  previewMode?: boolean;
}

const buildCroppedImage = async ({
  file,
  outputSize,
  aspect,
  positionX,
  positionY,
  zoom,
}: {
  file: File;
  outputSize: number;
  aspect: number;
  positionX: number;
  positionY: number;
  zoom: number;
}): Promise<File> => {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Erreur de chargement image"));
      image.src = sourceUrl;
    });

    const outWidth = outputSize;
    const outHeight = Math.round(outputSize / aspect);

    const canvas = document.createElement("canvas");
    canvas.width = outWidth;
    canvas.height = outHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Contexte canvas indisponible");
    }

    const baseScale = Math.max(outWidth / img.naturalWidth, outHeight / img.naturalHeight);
    const finalScale = baseScale * zoom;
    const drawWidth = img.naturalWidth * finalScale;
    const drawHeight = img.naturalHeight * finalScale;

    const dx = ((outWidth - drawWidth) * positionX) / 100;
    const dy = ((outHeight - drawHeight) * positionY) / 100;

    ctx.clearRect(0, 0, outWidth, outHeight);
    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) return reject(new Error("Conversion canvas impossible"));
          resolve(b);
        },
        "image/webp",
        0.9,
      );
    });

    return new File([blob], `cropped-${Date.now()}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
};

export default function SalonImageUploader({
  currentImage,
  onImageUpload,
  onImageRemove,
  compact = false,
  variant = "default",
}: // onFileSelect,
// selectedFile,
// previewMode = false,
SalonImageUploaderProps) {
  const [progress, setProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // État pour le loader de suppression

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res: { url?: string; ufsUrl?: string; key: string }[]) => {
      if (res && res[0]) {
        const uploadedUrl = res[0].ufsUrl ?? res[0].url;
        if (uploadedUrl) {
          onImageUpload(uploadedUrl);
        }
      }
      setProgress(100);
    },
    onUploadProgress: (p: number) => setProgress(p),
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
    },
  });

  // Fonction pour supprimer de UploadThing
  const deleteFromUploadThing = async (imageUrl: string): Promise<boolean> => {
    try {
      const key = extractUploadThingKey(imageUrl);
      if (!key) {
        console.warn("⚠️ Impossible d'extraire la clé de l'URL:", imageUrl);
        return false;
      }

      const response = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileKeys: [key] }),
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
      await onImageRemove();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setIsDeleting(false); // Désactiver le loader
    }
  };

  const uploadProcessedFile = async (file: File) => {
    if (currentImage) {
      await deleteFromUploadThing(currentImage);
    }

    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.8,
    });

    await startUpload([compressed]);
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
      if (variant === "profile") {
        await uploadProcessedFile(file);
        return;
      }

      if (variant === "banner") {
        const croppedBanner = await buildCroppedImage({
          file,
          outputSize: 1600,
          aspect: 16 / 6,
          positionX: 50,
          positionY: 50,
          zoom: 1,
        });

        await uploadProcessedFile(croppedBanner);
        return;
      }

      await uploadProcessedFile(file);
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

  const previewShapeClass =
    variant === "profile"
      ? "rounded-full"
      : variant === "banner"
        ? "rounded-2xl sm:rounded-2xl"
        : compact
          ? "rounded-2xl"
          : "rounded-2xl sm:rounded-2xl";

  const previewSizeClass =
    variant === "profile"
      ? "mx-auto h-[150px] w-[150px] sm:h-[180px] sm:w-[180px]"
      : variant === "banner"
        ? "w-full h-40 sm:h-52 lg:h-60"
        : compact
          ? "w-full h-24"
          : "w-full sm:w-[250px] h-48 sm:h-[250px]";

  const hasDisplayImage = Boolean(currentImage);

  const uploaderMinHeightClass =
    variant === "banner"
      ? "min-h-[150px] sm:min-h-[180px]"
      : variant === "profile"
        ? "min-h-[150px] sm:min-h-[180px]"
      : compact
        ? "min-h-[80px]"
        : "min-h-[140px] sm:min-h-[192px]";

  const splitLayoutClass =
    hasDisplayImage && (variant === "banner" || variant === "profile")
      ? "grid grid-cols-1 gap-3 md:grid-cols-4 md:items-stretch"
      : variant === "banner"
        ? "space-y-3"
        : compact
          ? "space-y-2"
          : "flex flex-col sm:flex-row gap-4";

  const imagePaneClass =
    variant === "banner"
      ? "md:col-span-3"
      : variant === "profile"
        ? "md:col-span-2"
        : "";

  const dropPaneClass =
    variant === "banner"
      ? "md:col-span-1"
      : variant === "profile"
        ? "md:col-span-2"
        : "";

  return (
    <div className={compact ? "w-full space-y-2" : "w-full space-y-4"}>
      {/* Zone d'affichage et d'upload responsive */}
      <div className={splitLayoutClass}>
        {/* Zone d'affichage de l'image actuelle responsive */}
        {hasDisplayImage && (
          <div
            className={`${imagePaneClass}`}
          >
            <div
              className={`relative ${previewSizeClass} ${previewShapeClass} overflow-hidden bg-white/10 ${compact || variant === "banner" || variant === "profile" ? "" : "sm:flex-shrink-0"}`}
            >
              <Image
                src={currentImage || ""}
                alt="Image uploadée"
                fill
                className="object-cover"
              />

              <button
                type="button"
                onClick={handleImageRemove}
                disabled={isDeleting}
                className={`absolute top-1 right-1 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-full ${
                  compact ? "w-6 h-6 text-xs" : "w-7 h-7 sm:w-8 sm:h-8"
                } flex items-center justify-center transition-colors z-10 disabled:cursor-not-allowed`}
              >
                {isDeleting ? (
                  <div
                    className={`animate-spin rounded-full border-b-2 border-white ${
                      compact ? "w-3 h-3" : "w-3 h-3 sm:w-4 sm:h-4"
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
          </div>
        )}

        {/* Zone d'upload responsive */}
        <div
          className={`${dropPaneClass} relative border-2 border-dashed ${compact ? "rounded-lg" : "rounded-xl sm:rounded-[20px]"} ${compact ? "p-3" : "p-4 sm:p-6"} text-center transition-colors flex items-center justify-center ${uploaderMinHeightClass} ${
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

          <div className={compact ? "space-y-1" : "space-y-2"}>
            <div className={compact ? "text-2xl" : "text-3xl sm:text-4xl"}>
              📸
            </div>
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
                    {hasDisplayImage ? (
                      "Remplacer"
                    ) : compact ? (
                      "Glissez ou cliquez"
                    ) : (
                      <>
                        <span className="hidden sm:inline">
                          {variant === "banner"
                            ? "Glissez une image paysage ou cliquez"
                            : "Glissez une image ici ou cliquez pour sélectionner"}
                        </span>
                        <span className="sm:hidden">
                          Touchez pour sélectionner une image
                        </span>
                      </>
                    )}
                  </div>
                  <div
                    className={`${
                      compact ? "text-[10px]" : "text-xs"
                    } text-white/60 mt-1`}
                  >
                    {compact ? (
                      variant === "profile"
                        ? "Image ronde JPG, PNG, WebP"
                        : "JPG, PNG, WebP"
                    ) : (
                      <>
                        <span className="hidden sm:inline">
                          {variant === "banner"
                            ? "Formats acceptés: JPG, PNG, WebP (recadrage automatique en paysage)"
                            : "Formats acceptés: JPG, PNG, WebP (max 8MB)"}
                        </span>
                        <span className="sm:hidden">
                          JPG, PNG, WebP (max 8MB)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages d'aide - adaptés au mode compact et responsive */}
      {compact && hasDisplayImage && (
        <div className="text-[10px] text-white/60">Image sélectionnée</div>
      )}

      {!compact && hasDisplayImage && (
        <div className="text-xs text-white/60">
          <span className="hidden sm:inline">
            {variant === "banner"
              ? "Aperçu : cette image sera affichée en bannière paysage"
              : "Aperçu : cette image sera affichée dans votre profil"}
          </span>
          <span className="sm:hidden">
            {variant === "banner" ? "Image de bannière" : "Image pour votre profil"}
          </span>
        </div>
      )}

      {/* Bouton de sélection alternatif - responsive */}
      {!compact && !hasDisplayImage && !isUploading && (
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
          className="w-full py-3 px-4 bg-tertiary-400/20 hover:bg-tertiary-400/30 text-white rounded-xl sm:rounded-[20px] border border-tertiary-400/50 transition-colors"
        >
          <span className="hidden sm:inline">📷 Choisir une image</span>
          <span className="sm:hidden">📷 Sélectionner</span>
        </button>
      )}
    </div>
  );
}
