"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useUploadThing } from "@/lib/utils/uploadthing";
import { extractUploadThingKey } from "@/lib/utils/uploadImg/extractUploadThingKey";

const MAX_PHOTOS = 50;
const UPLOAD_CHUNK_SIZE = 5; // limite maxFileCount du routeur UploadThing

export default function BatchPhotoUploader({
  urls,
  onChange,
  disabled = false,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const { startUpload } = useUploadThing("imageUploader");

  const deleteRemote = async (url: string) => {
    const key = extractUploadThingKey(url);
    if (!key) return;
    try {
      await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKeys: [key] }),
      });
    } catch (e) {
      console.error("Suppression UploadThing impossible:", e);
    }
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length || busy || disabled) return;

    const remaining = MAX_PHOTOS - urls.length;
    const images = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/")
    );
    const files = images.slice(0, Math.max(remaining, 0));

    setError(null);
    if (images.length < fileList.length) {
      setError("Certains fichiers ignorés : seules les images sont acceptées.");
    }
    if (images.length > files.length) {
      setError(`Maximum ${MAX_PHOTOS} photos par lot.`);
    }
    if (files.length === 0) return;

    setBusy(true);
    setProgress({ done: 0, total: files.length });
    const uploaded: string[] = [];

    try {
      for (let i = 0; i < files.length; i += UPLOAD_CHUNK_SIZE) {
        const chunk = await Promise.all(
          files.slice(i, i + UPLOAD_CHUNK_SIZE).map((file) =>
            imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
              fileType: "image/webp",
              initialQuality: 0.8,
            })
          )
        );
        const res = await startUpload(chunk);
        (res ?? []).forEach((r) => {
          const url = r.ufsUrl ?? r.url;
          if (url) uploaded.push(url);
        });
        setProgress({ done: Math.min(i + chunk.length, files.length), total: files.length });
        onChange([...urls, ...uploaded]);
      }
    } catch (e) {
      console.error("Erreur d'upload par lot:", e);
      setError("L'envoi de certaines photos a échoué. Veuillez réessayer.");
      if (uploaded.length) onChange([...urls, ...uploaded]);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = async (index: number) => {
    const url = urls[index];
    onChange(urls.filter((_, i) => i !== index));
    await deleteRemote(url);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        type="button"
        disabled={busy || disabled || urls.length >= MAX_PHOTOS}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-black/15 px-4 py-8 text-white/70 transition hover:border-tertiary-400/45 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 font-one"
      >
        {busy ? (
          <LoaderCircle size={22} className="animate-spin" aria-hidden="true" />
        ) : (
          <ImagePlus size={22} aria-hidden="true" />
        )}
        <span className="text-sm">
          {busy
            ? `Envoi en cours (${progress.done}/${progress.total})...`
            : "Ajouter des photos (plusieurs à la fois)"}
        </span>
        <span className="text-[11px] text-white/45">
          {urls.length}/{MAX_PHOTOS} photos
        </span>
      </button>

      {error && (
        <p role="alert" className="text-xs text-red-300 font-one">
          {error}
        </p>
      )}

      {urls.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {urls.map((url, index) => (
            <li
              key={url}
              className="relative aspect-square overflow-hidden rounded-xl border border-white/10"
            >
              <Image
                src={url}
                alt={`Photo ${index + 1}`}
                fill
                sizes="150px"
                className="object-cover"
              />
              <button
                type="button"
                aria-label={`Retirer la photo ${index + 1}`}
                disabled={busy}
                onClick={() => removeAt(index)}
                data-theme-contrast="dark"
                className="absolute right-1 top-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white hover:bg-black disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
