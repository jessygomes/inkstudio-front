"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { useUploadThing } from "@/lib/utils/uploadthing";
import { CiUser } from "react-icons/ci";
import { extractKeyFromUrl } from "@/lib/utils/uploadImg/extractKeyFromUrl";

interface TatoueurImageUploaderProps {
  currentImage?: string;
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: () => void;
}

export interface TatoueurImageUploaderHandle {
  uploadImage: () => Promise<void>;
}

const TatoueurImageUploader = forwardRef<
  TatoueurImageUploaderHandle,
  TatoueurImageUploaderProps
>(
  (
    { currentImage, onImageUpload, onImageRemove }: TatoueurImageUploaderProps,
    ref,
  ) => {
    const [progress, setProgress] = useState<number>(0);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { startUpload } = useUploadThing("imageUploader", {
      onClientUploadComplete: (res: { ufsUrl: string; key: string }[]) => {
        if (res && res[0]) {
          onImageUpload(res[0].ufsUrl);
        }
        setProgress(100);
        setPendingFile(null);
        setPreviewUrl(null);
      },
      onUploadProgress: (p: number) => setProgress(p),
      onUploadError: (error: Error) => {
        console.error("Upload error:", error);
        alert("Erreur lors de l'upload de l'image");
      },
    });

    useImperativeHandle(ref, () => ({
      uploadImage: async () => {
        if (pendingFile) {
          setIsUploading(true);
          try {
            await startUpload([pendingFile], {});
          } catch (error) {
            console.error("Erreur lors de l'upload:", error);
            throw error;
          } finally {
            setIsUploading(false);
          }
        }
      },
    }));

    // Fonction pour supprimer une image d'UploadThing
    const deleteFromUploadThing = async (imageUrl: string) => {
      try {
        const key = extractKeyFromUrl(imageUrl);
        if (key) {
          await fetch("/api/uploadthing/delete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ fileKeys: [key] }),
          });
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
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

        // Stocker le fichier compressé et créer un preview local
        setPendingFile(compressed);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(compressed);
      } catch (error) {
        console.error("Erreur lors de la compression:", error);
        alert("Erreur lors du traitement de l'image");
      }
    }

    // Fonction pour gérer la suppression de l'image
    const handleImageRemove = () => {
      if (currentImage) {
        setIsDeleting(true);
        try {
          deleteFromUploadThing(currentImage);
          onImageRemove();
          setPendingFile(null);
          setPreviewUrl(null);
        } catch (error) {
          console.error("Erreur lors de la suppression:", error);
        } finally {
          setIsDeleting(false);
        }
      } else {
        // Si c'est une image en attente, juste la supprimer du state
        setPendingFile(null);
        setPreviewUrl(null);
      }
    };

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

    // Image à afficher: preview local si en attente, sinon image actuelle
    const displayImage = previewUrl || currentImage;

    return (
      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          {/* Preview de l'image actuelle */}
          <div className="relative w-fit">
            <div
              className={`w-36 h-36 bg-black/15 rounded-2xl border border-dashed border-white/15 overflow-hidden flex items-center justify-center transition-colors hover:border-tertiary-400/50 hover:bg-white/5 focus-within:ring-2 focus-within:ring-tertiary-400/50 ${
                isDragOver ? "border-tertiary-400 bg-tertiary-400/10" : ""
              } ${isUploading || isDeleting ? "opacity-50" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt="Photo du tatoueur"
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white/50 text-2xl">
                  <CiUser size={40} />
                </div>
              )}

              {/* Input file invisible pour le drag & drop */}
              <input
                type="file"
                aria-label="Choisir la photo du tatoueur"
                accept="image/*"
                onChange={(e) => handleFiles(e.target.files)}
                disabled={isUploading || isDeleting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
            </div>

            {displayImage && (
              <button
                type="button"
                aria-label="Retirer la photo du tatoueur"
                onClick={handleImageRemove}
                disabled={isUploading || isDeleting}
                className="absolute cursor-pointer -top-2 -right-2 w-7 h-7 border border-white/15 bg-noir-700 hover:bg-red-500/80 rounded-full flex items-center justify-center text-white text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "✕"
                )}
              </button>
            )}
          </div>

          {/* Boutons d'action et informations */}
          <div className="flex max-w-36 flex-col gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                disabled={isUploading || isDeleting}
              />
              <div
                className={`w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white/75 rounded-xl border border-white/10 transition-colors font-one text-[11px] text-center ${
                  isUploading || isDeleting
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                    {progress}%
                  </div>
                ) : isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                    Suppression...
                  </div>
                ) : displayImage ? (
                  "Changer"
                ) : pendingFile ? (
                  "En attente d'envoi"
                ) : (
                  "Ajouter"
                )}
              </div>
            </label>

            <p className="text-[10px] leading-4 text-white/35 font-two">
              JPG, PNG ou WebP. Glissez une photo ou cliquez pour la choisir.
            </p>

            {isDragOver && !isUploading && !isDeleting && (
              <p className="text-xs text-tertiary-400 font-two">
                Relâchez pour uploader
              </p>
            )}
          </div>
        </div>

        {/* Barre de progression */}
        {isUploading && progress > 0 && (
          <div className="w-full bg-white/20 rounded-full h-1">
            <div
              className="bg-tertiary-400 rounded-full transition-all duration-300 h-1"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    );
  },
);

TatoueurImageUploader.displayName = "TatoueurImageUploader";

export default TatoueurImageUploader;
