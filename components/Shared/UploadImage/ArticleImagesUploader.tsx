"use client";

import Image from "next/image";
import imageCompression from "browser-image-compression";
import { useState } from "react";
import { useUploadThing } from "@/lib/utils/uploadthing";

interface UploadedFile {
  url: string;
  key?: string;
}

interface ArticleImagesUploaderProps {
  imageUrls: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export default function ArticleImagesUploader({
  imageUrls,
  onChange,
  disabled = false,
  maxFiles = 10,
}: ArticleImagesUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState(0);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onUploadProgress: (p: number) => setProgress(p),
  });

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length || disabled || isUploading) return;

    const availableSlots = Math.max(0, maxFiles - imageUrls.length);
    if (availableSlots === 0) return;

    const selected = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, availableSlots);

    if (selected.length === 0) return;

    try {
      const compressedFiles = await Promise.all(
        selected.map((file) =>
          imageCompression(file, {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: "image/webp",
            initialQuality: 0.8,
          }),
        ),
      );

      const result = (await startUpload(compressedFiles)) as
        | UploadedFile[]
        | undefined;

      if (!result?.length) return;

      const uploadedUrls = result
        .map((file) => file.url)
        .filter(Boolean);

      onChange([...imageUrls, ...uploadedUrls]);
    } catch (error) {
      console.error("Erreur upload images article:", error);
    }
  };

  const removeImage = (index: number) => {
    const next = imageUrls.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    uploadFiles(event.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        className={`relative rounded-lg border-2 border-dashed p-4 text-center transition-all ${
          isDragOver
            ? "border-tertiary-400 bg-tertiary-400/10"
            : "border-white/20 bg-noir-500/40"
        } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={disabled || isUploading}
          onChange={(event) => uploadFiles(event.target.files)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />

        <p className="text-xs font-one text-white/80">
          {isUploading
            ? `Upload en cours... ${progress}%`
            : "Glissez/deposez vos images ici ou cliquez pour selectionner"}
        </p>
        <p className="mt-1 text-[11px] font-one text-white/50">
          PNG, JPG, WebP • max 2MB compresse • {imageUrls.length}/{maxFiles}
        </p>
      </div>

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {imageUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative overflow-hidden rounded-lg border border-white/15 bg-noir-500/40"
            >
              <Image
                src={url}
                alt={`Image article ${index + 1}`}
                width={220}
                height={150}
                className="h-24 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled}
                className="absolute right-1 top-1 rounded-md bg-red-500/80 px-1.5 py-0.5 text-[10px] text-white hover:bg-red-500 disabled:opacity-50"
              >
                Suppr.
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}