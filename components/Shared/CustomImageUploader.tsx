"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { useUploadThing } from "@/lib/utils/uploadthing";

export default function CustomImageUploader() {
  const [progress, setProgress] = useState<number>(0);
  const { startUpload, isUploading } = useUploadThing(
    "imageUploader",
    {
      onClientUploadComplete: () => setProgress(100),
      onUploadProgress: (p) => setProgress(p),
    }
  );

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    // Exemple: compresser le 1er fichier (étends à plusieurs si besoin)
    const original = files[0];

    const compressed = await imageCompression(original, {
      maxSizeMB: 1, // cible ~1 Mo
      maxWidthOrHeight: 1920, // resize max
      useWebWorker: true,
      fileType: "image/webp", // souvent plus léger (sinon "image/jpeg")
      initialQuality: 0.8,
    });

    await startUpload([compressed]); // on envoie la version compressée
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={isUploading}
      />
      {isUploading && <div>Upload… {progress}%</div>}
    </div>
  );
}
