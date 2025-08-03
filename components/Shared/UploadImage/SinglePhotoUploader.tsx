"use client";

import { useState } from "react";
import Image from "next/image";
import { MdOutlineAddAPhoto } from "react-icons/md";

interface SinglePhotoUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  title?: string;
  description?: string;
  error?: string;
  disabled?: boolean;
}

export default function SinglePhotoUploader({
  onFileSelect,
  selectedFile,
  title = "📸 Photo de cicatrisation",
  description = "Partagez une photo de votre tatouage",
  error,
  disabled = false,
}: SinglePhotoUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length || disabled) return;

    const file = files[0];

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      alert(`Le fichier ${file.name} n'est pas une image valide`);
      return;
    }

    // Vérifier la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
      return;
    }

    // Créer l'aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Notifier le parent
    onFileSelect(file);
  }

  const handleRemoveFile = () => {
    setImagePreview(null);
    onFileSelect(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
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
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <h2 className="text-lg font-semibold font-one tracking-widest text-white mb-2">
        {title}
      </h2>
      <p className="text-white/70 text-sm mb-6 font-one">{description}</p>

      <div className="space-y-4">
        {/* Aperçu de l'image sélectionnée */}
        {(selectedFile || imagePreview) && (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium font-one text-xs">
                Photo sélectionnée
              </h4>
              <button
                onClick={handleRemoveFile}
                disabled={disabled}
                className="cursor-pointer text-red-300 hover:text-red-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Supprimer
              </button>
            </div>

            <div className="aspect-video bg-white/10 rounded-md overflow-hidden border border-white/20 mb-3">
              <Image
                src={
                  imagePreview ||
                  (selectedFile ? URL.createObjectURL(selectedFile) : "")
                }
                alt="Aperçu"
                width={400}
                height={225}
                className="w-full h-full object-cover"
              />
            </div>

            {selectedFile && (
              <div className="text-xs text-white/70">
                <div>Fichier: {selectedFile.name}</div>
                <div>
                  Taille: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}
          </div>
        )}

        {/* Zone d'upload principale - cachée si image sélectionnée */}
        {!selectedFile && !imagePreview && (
          <>
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDragOver
                  ? "border-tertiary-400 bg-tertiary-400/10"
                  : error
                  ? "border-red-400/50 bg-red-400/5"
                  : "border-white/30 hover:border-white/50 bg-white/5"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFiles(e.target.files)}
                disabled={disabled}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />

              <div className="space-y-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                  <MdOutlineAddAPhoto size={24} className="text-white/60" />
                </div>
                <div className="text-white/80">
                  <div className="space-y-2">
                    <div className="font-medium text-sm font-one">
                      Glissez votre photo ici
                    </div>
                    <div className="text-white/60 text-sm mb-4">ou</div>
                    <div className="text-xs text-white/70 font-one">
                      PNG, JPG, WebP • Max 10MB
                    </div>
                    {isDragOver && (
                      <div className="text-sm text-tertiary-400 font-medium">
                        Relâchez pour sélectionner
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton alternatif pour sélectionner */}
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
              disabled={disabled}
              className="cursor-pointer w-full py-3 px-4 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-one text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📁 Parcourir les fichiers
            </button>
          </>
        )}

        {/* Zone de remplacement si image sélectionnée */}
        {(selectedFile || imagePreview) && (
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
            disabled={disabled}
            className="cursor-pointer w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-one text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 Changer la photo
          </button>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-300 text-xs">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
