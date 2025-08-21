/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
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

export default function TatoueurImageUploader({
  currentImage,
  onImageUpload,
  onImageRemove,
}: TatoueurImageUploaderProps) {
  const [progress, setProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      alert("Erreur lors de l'upload de l'image");
    },
  });

  // Fonction pour extraire la clé d'une URL UploadThing
  // const extractKeyFromUrl = (url: string): string | null => {
  //   try {
  //     // Format UploadThing: https://uploadthing-prod.s3.us-west-2.amazonaws.com/key
  //     // ou https://utfs.io/f/key
  //     const match = url.match(/\/f\/([^\/\?]+)|\/([^\/\?]+)$/);
  //     return match ? match[1] || match[2] : null;
  //   } catch {
  //     return null;
  //   }
  // };

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
          body: JSON.stringify({ key }),
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

      await startUpload([compressed]);
    } catch (error) {
      console.error("Erreur lors de la compression:", error);
      alert("Erreur lors du traitement de l'image");
    }
  }

  // Fonction pour gérer la suppression de l'image
  const handleImageRemove = async () => {
    if (currentImage) {
      setIsDeleting(true);
      try {
        await deleteFromUploadThing(currentImage);
        onImageRemove();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      } finally {
        setIsDeleting(false);
      }
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {/* Preview de l'image actuelle */}
        <div className="relative">
          <div
            className={`w-44 h-44 bg-white/10 rounded-xl border border-white/20 overflow-hidden flex items-center justify-center ${
              isDragOver ? "border-tertiary-400 bg-tertiary-400/10" : ""
            } ${isUploading || isDeleting ? "opacity-50" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {currentImage ? (
              <Image
                src={currentImage}
                alt="Photo du tatoueur"
                width={80}
                height={80}
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
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={isUploading || isDeleting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {currentImage && (
            <button
              type="button"
              onClick={handleImageRemove}
              disabled={isUploading || isDeleting}
              className="absolute cursor-pointer -top-2 -right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              disabled={isUploading || isDeleting}
            />
            <div
              className={`px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-one text-xs text-center ${
                isUploading || isDeleting ? "opacity-50 cursor-not-allowed" : ""
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
              ) : currentImage ? (
                "Changer"
              ) : (
                "Ajouter"
              )}
            </div>
          </label>

          <p className="text-xs text-white/50 font-two">
            PNG, JPG, WebP jusqu'à 8MB
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
}
