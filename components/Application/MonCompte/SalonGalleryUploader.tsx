"use client";

import { useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { useUploadThing } from "@/lib/utils/uploadthing";
import { MdOutlineAddAPhoto } from "react-icons/md";

interface SalonGalleryUploaderProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  maxImages: number;
  currentImageCount: number;
}

export default function SalonGalleryUploader({
  onImagesUploaded,
  maxImages = 6,
  currentImageCount = 0,
}: SalonGalleryUploaderProps) {
  const [progress, setProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<File[]>([]);

  const remainingSlots = maxImages - currentImageCount;

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res: { url: string; key: string }[]) => {
      if (res && res.length > 0) {
        const uploadedUrls = res.map((file) => file.url);
        onImagesUploaded(uploadedUrls);
        setUploadingFiles([]);
        setPreviewImages([]);
      }
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    },
    onUploadProgress: (p: number) => setProgress(p),
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      alert("Erreur lors de l'upload des images");
      setUploadingFiles([]);
    },
  });

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    // Vérifier la limite
    if (remainingSlots <= 0) {
      alert(`Vous avez atteint la limite de ${maxImages} images maximum`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    // Vérifier les types de fichiers
    for (const file of filesToUpload) {
      if (!file.type.startsWith("image/")) {
        alert(`Le fichier ${file.name} n'est pas une image valide`);
        return;
      }

      // Vérifier la taille (8MB max)
      if (file.size > 8 * 1024 * 1024) {
        alert(`Le fichier ${file.name} est trop volumineux (max 8MB)`);
        return;
      }
    }

    // Créer l'aperçu
    setPreviewImages(filesToUpload);
  }

  const handleConfirmUpload = async () => {
    if (previewImages.length === 0) return;

    // Afficher les noms des fichiers en cours d'upload
    setUploadingFiles(previewImages.map((file) => file.name));

    try {
      // Compresser toutes les images
      const compressedFiles = await Promise.all(
        previewImages.map(async (file) => {
          return await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: "image/webp",
            initialQuality: 0.8,
          });
        })
      );

      await startUpload(compressedFiles);
    } catch (error) {
      console.error("Erreur lors de la compression:", error);
      alert("Erreur lors du traitement des images");
      setUploadingFiles([]);
      setPreviewImages([]);
    }
  };

  const handleCancelPreview = () => {
    setPreviewImages([]);
  };

  const removePreviewImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
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

  if (remainingSlots <= 0) {
    return (
      <div className="bg-yellow-500/10 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/20">
        <p className="text-yellow-300 text-xs font-one">
          ⚠️ Limite atteinte : Vous avez ajouté le maximum de {maxImages}{" "}
          images.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Aperçu des images sélectionnées */}
      {previewImages.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-medium font-one text-xs">
              Aperçu ({previewImages.length} image
              {previewImages.length > 1 ? "s" : ""})
            </h4>
            <button
              onClick={handleCancelPreview}
              className="cursor-pointer text-white/60 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          {/* Grille d'aperçu compacte */}
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {previewImages.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-white/10 rounded-md overflow-hidden border border-white/20">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Aperçu ${index + 1}`}
                    width={60}
                    height={60}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removePreviewImage(index)}
                  className="absolute cursor-pointer -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Boutons d'action pour l'aperçu */}
          <div className="flex gap-2">
            <button
              onClick={handleCancelPreview}
              className="cursor-pointer flex-1 py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white rounded-md border border-white/20 transition-colors font-one text-xs"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmUpload}
              disabled={isUploading}
              className="cursor-pointer flex-1 py-1.5 px-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 disabled:from-tertiary-400/50 disabled:to-tertiary-500/50 text-white rounded-md transition-all duration-300 font-one text-xs disabled:cursor-not-allowed"
            >
              {isUploading ? "Upload..." : "Confirmer"}
            </button>
          </div>
        </div>
      )}

      {/* Zone d'upload principale - cachée si aperçu actif */}
      {previewImages.length === 0 && (
        <>
          <div
            className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors min-h-[100px] flex items-center justify-center ${
              isDragOver
                ? "border-tertiary-400 bg-tertiary-400/10"
                : "border-white/30 bg-white/5"
            } ${isUploading ? "opacity-70" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />

            <div className="space-y-2">
              <div className="text-white">
                <MdOutlineAddAPhoto size={30} className="mx-auto" />
              </div>
              <div className="text-white/80">
                {isUploading ? (
                  <div className="space-y-1">
                    <div className="text-xs font-medium">
                      Upload... {progress}%
                    </div>
                    <div className="w-32 bg-white/20 rounded-full h-1 mx-auto">
                      <div
                        className="bg-tertiary-400 rounded-full transition-all duration-300 h-1"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="font-medium text-sm font-one">
                      Ajoutez vos photos
                    </div>
                    <div className="text-xs text-white/70 font-one">
                      Jusqu&apos;à {remainingSlots} image
                      {remainingSlots > 1 ? "s" : ""}
                    </div>
                    <div className="text-[10px] text-white/60">
                      JPG, PNG, WebP • Max 8MB
                    </div>
                    {isDragOver && (
                      <div className="text-xs text-tertiary-400 font-medium">
                        Relâchez pour uploader
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations sur les emplacements restants */}
          <div className="bg-white/5 backdrop-blur-sm rounded-md p-2 border border-white/10">
            <div className="flex items-center justify-between text-xs">
              <div className="text-white/70">
                <span className="font-medium">{remainingSlots}</span> restant
                {remainingSlots > 1 ? "s" : ""}
              </div>
              <div className="text-white/50 text-[10px]">
                {currentImageCount}/{maxImages}
              </div>
            </div>

            {/* Barre de progression des emplacements */}
            <div className="w-full bg-white/10 rounded-full h-0.5 mt-1">
              <div
                className="bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full transition-all duration-300 h-0.5"
                style={{ width: `${(currentImageCount / maxImages) * 100}%` }}
              />
            </div>
          </div>

          {/* Bouton alternatif pour sélectionner */}
          {!isUploading && (
            <button
              type="button"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.multiple = true;
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  handleFiles(target.files);
                };
                input.click();
              }}
              className="cursor-pointer w-full py-2 px-3 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/20 transition-colors font-one text-xs"
            >
              📁 Parcourir
            </button>
          )}
        </>
      )}

      {/* État d'upload en cours */}
      {isUploading && uploadingFiles.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="space-y-1">
            <div className="text-xs font-medium text-white">
              Upload... {progress}%
            </div>
            <div className="w-full bg-white/20 rounded-full h-1">
              <div
                className="bg-tertiary-400 rounded-full transition-all duration-300 h-1"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] text-white/60">Fichiers:</div>
              {uploadingFiles.slice(0, 3).map((fileName, index) => (
                <div key={index} className="text-[10px] text-white/70 truncate">
                  • {fileName}
                </div>
              ))}
              {uploadingFiles.length > 3 && (
                <div className="text-[10px] text-white/60">
                  +{uploadingFiles.length - 3} autres...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
