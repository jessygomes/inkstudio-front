"use client";

import { useState, useEffect, useCallback, useId, useRef, type ReactNode } from "react";
import Image from "next/image";
import DashboardButton from "@/components/Shared/DashboardButton";
import { ChevronLeft, ChevronRight, Images, LoaderCircle, Maximize2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import styles from "./SalonGallery.module.css";
import SalonGalleryUploader from "./SalonGalleryUploader";
import { useUser } from "@/components/Auth/Context/UserContext";
import { extractKeyFromUrl } from "@/lib/utils/uploadImg/extractKeyFromUrl";
import { fetchSalonPhotosAction } from "@/lib/queries/user";

interface SalonImage {
  id: string;
  url: string;
  createdAt: string;
}

export default function SalonPhoto() {
  const user = useUser();
  const salonId = user?.id;

  const [viewedImageId, setViewedImageId] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [images, setImages] = useState<SalonImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  //! Fonction pour supprimer une image d'UploadThing
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

  //! Récupérer les images du salon
  const fetchImages = useCallback(async () => {
    if (!salonId) return;
    setLoadError(false);

    try {
      const response = await fetchSalonPhotosAction(salonId);

      if (response.ok) {
        const data = response.data;

        // Si le backend retourne un tableau de strings, on les convertit en objets
        if (data.salonPhotos && Array.isArray(data.salonPhotos)) {
          const convertedImages = data.salonPhotos.map(
            (url: string, index: number) => ({
              id: `photo-${index}`, // ID temporaire
              url: url,
              createdAt: new Date().toISOString(), // Date factice
            })
          );
          setImages(convertedImages);
        } else {
          setImages([]);
        }
      } else {
        setLoadError(true);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des images:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  //! Fonction pour gérer l'ajout de plusieurs images
  const handleMultipleImagesUploaded = async (imageUrls: string[]) => {
    try {
      // Récupérer les URLs des images existantes
      const currentPhotos = images.map((img) => img.url);

      // Combiner avec les nouvelles images
      const allPhotos = [...currentPhotos, ...imageUrls];

      // Limiter à 6 maximum
      const limitedPhotos = allPhotos.slice(0, 6);

      // Sauvegarder le tableau de strings
      await savePhotosToDatabase(limitedPhotos);

      // Rafraîchir la liste des images
      await fetchImages();
      toast.success("Photos ajoutées à la galerie.");
    } catch (error) {
      console.error("Erreur lors de l'ajout des images:", error);
      toast.error("Impossible d’enregistrer les photos.");
    }
  };

  //! Fonction pour sauvegarder les photos (tableau de strings)
  const savePhotosToDatabase = async (photoUrls: string[]) => {
    if (!salonId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/users/${salonId}/photos`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            photoUrls, // Envoyer directement le tableau de strings
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des images:", error);
      throw error;
    }
  };

  //! Supprimer une image
  const handleImageDelete = async (imageId: string) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const imageToDelete = images.find((img) => img.id === imageId);
      if (imageToDelete) {
        await deleteFromUploadThing(imageToDelete.url);
      }

      // Supprimer l'image du tableau local
      const updatedImages = images.filter((img) => img.id !== imageId);
      const updatedPhotoUrls = updatedImages.map((img) => img.url);

      // Mettre à jour le tableau de strings sur le serveur
      await savePhotosToDatabase(updatedPhotoUrls);

      // Mettre à jour le state local
      setImages(updatedImages);
      setIsDeleteModalOpen(false);
      setSelectedImageId(null);
      toast.success("Photo supprimée.");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Impossible de supprimer cette photo. Réessayez.");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedImage = images.find(image => image.id === selectedImageId);
  const viewedIndex = images.findIndex(image => image.id === viewedImageId);
  const viewedImage = images[viewedIndex];
  const closeDelete = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setSelectedImageId(null);
  };
  const navigateImage = (direction: number) => {
    const next = (viewedIndex + direction + images.length) % images.length;
    setViewedImageId(images[next].id);
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-5 font-one">
        {/* Header skeleton */}
        <div className="rounded-2xl bg-noir-700 p-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">
                Votre sélection
              </p>
              <div className="h-5 w-32 rounded-lg bg-white/8 animate-pulse" />
            </div>
            <div className="h-8 w-28 rounded-[14px] bg-white/8 animate-pulse" />
          </div>
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-xl bg-white/6 animate-pulse border border-white/8"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-tertiary-400/10 text-tertiary-400"><Images size={17} aria-hidden="true" /></span>
          <div>
            <h3 className="text-sm font-semibold text-white">Votre sélection <span className="ml-2 text-sm font-normal text-white/50">{images.length} / 6</span></h3>
            <p className="mt-1 text-[11px] text-white/45">{images.length === 6 ? "Votre galerie est complète." : `${6 - images.length} emplacement${images.length < 5 ? "s" : ""} disponible${images.length < 5 ? "s" : ""}`}</p>
          </div>
        </div>
        {!loadError && images.length < 6 && images.length > 0 && (
          <DashboardButton className="!min-h-0" onClick={() => setShowUploader(value => !value)} variant={showUploader ? "secondary" : "primary"}>
            {showUploader ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{showUploader ? "Fermer l’ajout" : "Ajouter des photos"}
          </DashboardButton>
        )}
      </div>

      {loadError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/20 bg-noir-700 p-4"><p className="text-sm text-amber-200">Impossible de charger la galerie.</p><DashboardButton className="!min-h-0" variant="secondary" onClick={fetchImages}>Réessayer</DashboardButton></div>}

      {!loadError && images.length < 6 && (showUploader || images.length === 0) && (
        <div>
          <SalonGalleryUploader onImagesUploaded={handleMultipleImagesUploaded} maxImages={6} currentImageCount={images.length} />
        </div>
      )}

      {/* Galerie */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative rounded-xl overflow-hidden border border-white/10 bg-noir-700 group"
            >
              <div className="aspect-[4/3] relative">
                <button type="button" className={styles.openPhoto} onClick={() => setViewedImageId(image.id)} aria-label={`Agrandir la photo ${index + 1} du salon`} aria-haspopup="dialog">
                  <Image src={image.url} alt={`Photo du salon ${index + 1}`} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 16vw" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
                  <span className={styles.zoomIcon}><Maximize2 size={14} aria-hidden="true" /></span>
                </button>
                {/* Overlay suppression */}
                <div className="absolute bottom-2 right-2">
                  <button
                    onClick={() => {
                      setSelectedImageId(image.id);
                      setIsDeleteModalOpen(true);
                    }}
                    aria-label={`Supprimer la photo ${index + 1}`}
                    className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg border border-white/15 bg-black/55 backdrop-blur-sm text-white/80 hover:bg-red-500/80 px-3 py-1.5 text-xs transition-colors"
                  >
                    <Trash2 size={13} aria-hidden="true" /><span className="sr-only">Supprimer</span>
                  </button>
                </div>
              </div>
              {/* Badge numéro */}
              <div className="pointer-events-none absolute top-2 left-2 rounded-lg bg-black/50 px-2 py-1 text-xs text-white/80 font-one">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {viewedImage && <GalleryDialog title={`Photo ${viewedIndex + 1} sur ${images.length}`} onClose={() => setViewedImageId(null)} wide onNavigate={navigateImage}>
        <div className={styles.fullPhoto}><Image src={viewedImage.url} alt={`Photo du salon ${viewedIndex + 1}`} fill sizes="(max-width: 1024px) 95vw, 1000px" className="object-contain" /></div>
        {images.length > 1 && <footer className={styles.viewerFooter}><button type="button" className={styles.cancel} onClick={() => navigateImage(-1)}><ChevronLeft size={16} aria-hidden="true" />Précédente</button><span>{viewedIndex + 1} / {images.length}</span><button type="button" className={styles.cancel} onClick={() => navigateImage(1)}>Suivante<ChevronRight size={16} aria-hidden="true" /></button></footer>}
      </GalleryDialog>}
      {isDeleteModalOpen && selectedImage && <GalleryDialog title="Supprimer cette photo ?" description="Cette photo sera retirée de votre galerie. Cette action est définitive." onClose={closeDelete} busy={isDeleting} destructive>
        <div className={styles.deleteBody}><div className={styles.deletePreview}><Image src={selectedImage.url} alt="Photo à supprimer" fill sizes="400px" className="object-cover" /></div><p>Vous pourrez ajouter une nouvelle photo pour la remplacer.</p></div>
        <footer className={styles.dialogFooter}><button type="button" autoFocus className={styles.cancel} onClick={closeDelete} disabled={isDeleting}>Conserver la photo</button><button type="button" className={styles.deleteConfirm} onClick={() => void handleImageDelete(selectedImage.id)} disabled={isDeleting}>{isDeleting ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Trash2 size={14} aria-hidden="true" />}{isDeleting ? "Suppression…" : "Supprimer"}</button></footer>
      </GalleryDialog>}
    </div>
  );
}

function GalleryDialog({ title, description, children, onClose, busy = false, wide = false, destructive = false, onNavigate }: {
  title: string; description?: string; children: ReactNode; onClose: () => void; busy?: boolean; wide?: boolean; destructive?: boolean; onNavigate?: (direction: number) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const element = dialog.current;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => { element?.close(); document.body.style.overflow = overflow; previousFocus?.focus(); };
  }, []);
  return <dialog ref={dialog} data-modal className={styles.galleryDialog} data-wide={wide} role={destructive ? "alertdialog" : "dialog"} aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} aria-busy={busy}
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
    onClick={event => {
      if (busy || event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}
    onKeyDown={event => { if (onNavigate && (event.key === "ArrowLeft" || event.key === "ArrowRight")) { event.preventDefault(); onNavigate(event.key === "ArrowLeft" ? -1 : 1); } }}>
    <header className={styles.dialogHeader}>{destructive && <span className={styles.deleteIcon}><Trash2 size={19} aria-hidden="true" /></span>}<div><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId}>{description}</p>}</div><button type="button" className={styles.clear} onClick={onClose} disabled={busy} aria-label="Fermer la modale"><X size={18} aria-hidden="true" /></button></header>
    {children}
  </dialog>;
}
