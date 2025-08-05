"use client";
import React, { useState } from "react";
import Image from "next/image";

interface CicatrisationImageProps {
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  error?: string;
  disabled?: boolean;
}

export default function CicatrisationImage({
  onFileSelect,
  // selectedFile,
  error,
  disabled = false,
}: CicatrisationImageProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false); // Nouvel état pour le loader de suppression

  const handleFiles = (files: FileList | null) => {
    if (!files?.length || disabled) return;

    const file = files[0];

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      onFileSelect(null);
      return;
    }

    // Vérifier la taille (8MB max)
    if (file.size > 8 * 1024 * 1024) {
      onFileSelect(null);
      return;
    }

    // Créer l'aperçu
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelect(file);
  };

  const handleRemoveImage = async () => {
    setIsRemoving(true); // Activer le loader

    // Simuler un petit délai pour montrer le loader (optionnel)
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onFileSelect(null);
    setIsRemoving(false); // Désactiver le loader
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) {
      const files = e.dataTransfer.files;
      handleFiles(files);
    }
  };

  const displayImage = previewUrl;

  return (
    <div className="space-y-4">
      {/* Zone d'affichage de l'image */}
      {displayImage && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden bg-white/10">
          <Image
            src={displayImage}
            alt="Aperçu de l'image de cicatrisation"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled || isRemoving}
            className="cursor-pointer absolute top-2 right-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors disabled:cursor-not-allowed"
          >
            {isRemoving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              "✕"
            )}
          </button>
          <div className="absolute bottom-2 left-2 bg-blue-500/80 text-white text-xs px-2 py-1 rounded">
            Photo de cicatrisation
          </div>
        </div>
      )}

      {/* Zone d'upload */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors min-h-[120px] flex items-center justify-center ${
          isDragOver
            ? "border-tertiary-400 bg-tertiary-400/10"
            : error
            ? "border-red-400 bg-red-400/10"
            : "border-white/30 bg-white/5"
        } ${disabled || isRemoving ? "opacity-50 pointer-events-none" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled || isRemoving}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="space-y-2">
          <div className="text-3xl">📸</div>
          <div className="text-white/80">
            <div className="font-medium text-sm">
              {isRemoving
                ? "Suppression..."
                : displayImage
                ? "Remplacer l'image"
                : "Glissez une image ici ou cliquez pour sélectionner"}
            </div>
            <div className="text-xs text-white/60 mt-1">
              Photo de cicatrisation - JPG, PNG, WebP (max 8MB)
            </div>
          </div>
        </div>
      </div>

      {/* Bouton alternatif */}
      {!displayImage && !disabled && !isRemoving && (
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
          className="w-full py-3 px-4 bg-tertiary-400/20 hover:bg-tertiary-400/30 text-white rounded-lg border border-tertiary-400/50 transition-colors"
        >
          📷 Choisir une image
        </button>
      )}

      {/* Message d'erreur */}
      {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
    </div>
  );
}
