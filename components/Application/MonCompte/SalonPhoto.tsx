"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import DashboardButton from "@/components/Shared/DashboardButton";
import { ImagePlus, Images, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
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

  const [showUploader, setShowUploader] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [images, setImages] = useState<SalonImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // //! Fonction pour extraire la clé d'une URL UploadThing
  // const extractKeyFromUrl = (url: string): string | null => {
  //   try {
  //     const match = url.match(/\/f\/([^\/\?]+)|\/([^\/\?]+)$/);
  //     return match ? match[1] || match[2] : null;
  //   } catch {
  //     return null;
  //   }
  // };

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

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-5 font-one">
        {/* Header skeleton */}
        <div className="rounded-2xl bg-noir-700/6 p-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-white/6 animate-pulse border border-white/8"
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
          <span className="flex size-11 items-center justify-center rounded-2xl bg-tertiary-400/10 text-tertiary-400"><Images size={21} aria-hidden="true" /></span>
          <div>
            <h3 className="text-base font-semibold text-white">Votre sélection <span className="ml-2 text-sm font-normal text-white/50">{images.length} / 6</span></h3>
            <p className="mt-1 text-sm text-white/55">{images.length === 6 ? "Votre galerie est complète." : `${6 - images.length} emplacement${images.length < 5 ? "s" : ""} disponible${images.length < 5 ? "s" : ""}`}</p>
          </div>
        </div>
        {!loadError && images.length < 6 && images.length > 0 && (
          <DashboardButton className="!min-h-0" onClick={() => setShowUploader(value => !value)} variant={showUploader ? "secondary" : "primary"}>
            {showUploader ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{showUploader ? "Fermer l’ajout" : "Ajouter des photos"}
          </DashboardButton>
        )}
      </div>

      {loadError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4"><p className="text-sm text-amber-200">Impossible de charger la galerie.</p><DashboardButton className="!min-h-0" variant="secondary" onClick={fetchImages}>Réessayer</DashboardButton></div>}

      {!loadError && images.length < 6 && (showUploader || images.length === 0) && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
          <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white"><ImagePlus size={17} className="text-tertiary-400" aria-hidden="true" />{images.length ? "Enrichissez votre galerie" : "Ajoutez vos premières photos"}</h4>
          <p className="mb-4 text-sm leading-6 text-white/55">Montrez l’ambiance, les espaces et les détails qui rendent votre salon unique.</p>
          <SalonGalleryUploader onImagesUploaded={handleMultipleImagesUploaded} maxImages={6} currentImageCount={images.length} />
        </div>
      )}

      {/* Galerie */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.025] group"
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={image.url}
                  alt={`Photo du salon ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                />
                {/* Overlay suppression */}
                <div className="absolute bottom-3 right-3">
                  <button
                    onClick={() => {
                      setSelectedImageId(image.id);
                      setIsDeleteModalOpen(true);
                    }}
                    aria-label={`Supprimer la photo ${index + 1}`}
                    className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg border border-white/15 bg-black/55 backdrop-blur-sm text-white/80 hover:bg-red-500/80 px-3 py-1.5 text-xs transition-colors"
                  >
                    <Trash2 size={13} aria-hidden="true" />Supprimer
                  </button>
                </div>
              </div>
              {/* Badge numéro */}
              <div className="absolute top-3 left-3 rounded-lg bg-black/50 px-2 py-1 text-xs text-white/80 font-one">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Modale de suppression */}
      {isDeleteModalOpen && selectedImageId && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dashboard-embedded-panel rounded-2xl w-full max-w-sm border border-white/20 shadow-2xl">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">
                Confirmation
              </p>
              <h2 className="text-white font-one text-base font-semibold mt-1">
                Supprimer cette photo
              </h2>
              <p className="text-white/60 font-two text-xs mt-1">
                Cette action est définitive.
              </p>
            </div>

            {/* Aperçu de la photo */}
            <div className="p-4">
              <div className="rounded-xl overflow-hidden border border-white/10 aspect-video relative">
                <Image
                  src={images.find((img) => img.id === selectedImageId)?.url ?? ""}
                  alt="Photo à supprimer"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="dashboard-embedded-footer p-4 border-t border-white/10 flex justify-end gap-2">
              <DashboardButton className="!min-h-0"
                variant="secondary"
                disabled={isDeleting}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedImageId(null);
                }}
              >
                Annuler
              </DashboardButton>
              <button
                disabled={isDeleting}
                onClick={() => handleImageDelete(selectedImageId)}
                className="cursor-pointer rounded-[14px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 text-xs text-white transition-all duration-300 font-one"
              >
                {isDeleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
