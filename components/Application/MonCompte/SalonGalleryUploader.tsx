"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { useUploadThing } from "@/lib/utils/uploadthing";
import { Check, ImagePlus, LoaderCircle, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import styles from "./SalonGallery.module.css";

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

  const input = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const busy = uploadingFiles.length > 0;
  const remainingSlots = Math.max(0, maxImages - currentImageCount);
  useEffect(() => {
    const urls = previewImages.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [previewImages]);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res: { ufsUrl: string; key: string }[]) => {
      if (res && res.length > 0) {
        const uploadedUrls = res.map((file) => file.ufsUrl);
        onImagesUploaded(uploadedUrls);
        setUploadingFiles([]);
        setPreviewImages([]);
      }
      setProgress(100);
    },
    onUploadProgress: (p: number) => setProgress(p),
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      toast.error("Erreur lors de l'upload des images");
      setUploadingFiles([]);
    },
  });

  async function handleFiles(files: FileList | null) {
    if (!files?.length || busy) return;

    // Vérifier la limite
    if (remainingSlots <= 0) {
      toast.error(`Vous avez atteint la limite de ${maxImages} images maximum`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    // Vérifier les types de fichiers
    for (const file of filesToUpload) {
      if (!file.type.startsWith("image/")) {
        toast.error(`Le fichier ${file.name} n'est pas une image valide`);
        return;
      }

      // Vérifier la taille (8MB max)
      if (file.size > 8 * 1024 * 1024) {
        toast.error(`Le fichier ${file.name} est trop volumineux (max 8MB)`);
        return;
      }
    }

    // Créer l'aperçu
    setProgress(0);
    setPreviewImages(filesToUpload);
  }

  const handleConfirmUpload = async () => {
    if (previewImages.length === 0 || busy || isUploading) return;

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
        }),
      );

      await startUpload(compressedFiles);
    } catch (error) {
      console.error("Erreur lors de la compression:", error);
      toast.error("Erreur lors du traitement des images");
      setUploadingFiles([]);
      setPreviewImages([]);
    } finally {
      setUploadingFiles([]);
    }
  };

  const handleCancelPreview = () => {
    setPreviewImages([]);
  };

  const removePreviewImage = (index: number) => {
    if (busy) return;
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!busy) setIsDragOver(true);
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

  if (remainingSlots <= 0) return <p role="status" className={styles.limit}><Check size={15} aria-hidden="true" />Votre galerie est complète · {maxImages} photos</p>;

  return <div className={styles.uploader} aria-busy={busy || isUploading}>
    <input ref={input} id={inputId} type="file" accept="image/*" multiple disabled={busy || isUploading} className="sr-only" tabIndex={-1} aria-label="Sélectionner des photos du salon" onChange={event => { void handleFiles(event.target.files); event.target.value = ""; }} />
    {previewImages.length === 0 ? <button type="button" className={styles.dropzone} data-dragging={isDragOver} disabled={busy || isUploading} onClick={() => input.current?.click()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} aria-controls={inputId}>
      <span className={styles.uploadIcon}><UploadCloud size={24} aria-hidden="true" /></span>
      <span className={styles.dropText}><strong>{isDragOver ? "Déposez vos photos ici" : "Glissez vos photos ou choisissez un fichier"}</strong><small>JPG, PNG, WebP · 8 Mo maximum par photo</small></span>
      <span className={styles.browse}><ImagePlus size={14} aria-hidden="true" />Choisir des photos</span>
    </button> : <div className={styles.previewPanel}>
      <div className={styles.previewHeader}><p>{previewImages.length} photo{previewImages.length > 1 ? "s" : ""} prête{previewImages.length > 1 ? "s" : ""} à ajouter</p><button type="button" onClick={handleCancelPreview} disabled={busy || isUploading} className={styles.clear} aria-label="Annuler la sélection"><X size={16} aria-hidden="true" /></button></div>
      <div className={styles.previews}>{previewImages.map((file, index) => <div className={styles.preview} key={file.name + index}>
        <div className={styles.thumbnail}>{previewUrls[index] && <Image src={previewUrls[index]} alt={file.name} fill unoptimized sizes="80px" className="object-cover" />}<button type="button" disabled={busy || isUploading} onClick={() => removePreviewImage(index)} aria-label={`Retirer ${file.name}`} className={styles.remove}><X size={12} aria-hidden="true" /></button></div>
        <span title={file.name}>{file.name}</span>
      </div>)}</div>
      <div className={styles.previewActions}><button type="button" onClick={handleCancelPreview} disabled={busy || isUploading} className={styles.cancel}>Annuler</button><button type="button" disabled={busy || isUploading} onClick={() => void handleConfirmUpload()} className={styles.confirm}>{busy || isUploading ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <ImagePlus size={14} aria-hidden="true" />}{busy || isUploading ? "Ajout en cours…" : `Ajouter ${previewImages.length} photo${previewImages.length > 1 ? "s" : ""}`}</button></div>
    </div>}
    {busy && <div className={styles.uploadStatus} role="status"><span>{isUploading ? `Envoi des photos · ${progress}%` : "Préparation des photos…"}</span><div role="progressbar" aria-label="Envoi des photos" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className={styles.progressTrack}><div style={{ width: `${progress}%` }} /></div></div>}
    <div className={styles.capacity}><span>{remainingSlots} emplacement{remainingSlots > 1 ? "s" : ""} disponible{remainingSlots > 1 ? "s" : ""}</span><div className={styles.slotIndicators} aria-hidden="true">{Array.from({length: maxImages}, (_, i) => <span key={i} data-filled={i < currentImageCount} />)}</div><span>{currentImageCount} / {maxImages}</span></div>
  </div>;
}
