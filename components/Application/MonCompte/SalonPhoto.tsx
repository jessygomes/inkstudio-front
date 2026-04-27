"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
        setImages([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des images:", error);
      setImages([]);
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
    } catch (error) {
      console.error("Erreur lors de l'ajout des images:", error);
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
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }

    setIsDeleteModalOpen(false);
    setSelectedImageId(null);
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-3">
        {/* Header skeleton */}
        <div className="rounded-2xl bg-noir-700/6 p-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">
                Galerie photos
              </p>
              <div className="h-5 w-32 rounded-lg bg-white/8 animate-pulse" />
            </div>
            <div className="h-8 w-28 rounded-[14px] bg-white/8 animate-pulse" />
          </div>
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
      {/* Header */}
      <div className="rounded-2xl bg-noir-700/6 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">
              Galerie photos
            </p>
            <div className="flex items-end gap-2">
              <h3 className="text-white font-one text-base font-semibold leading-tight">
                {images.length} / 6 photos
              </h3>
              <p className="text-white/55 font-two text-xs">
                {6 - images.length} emplacement{6 - images.length > 1 ? "s" : ""} disponible{6 - images.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Barre de progression compacte */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    i < images.length
                      ? "bg-tertiary-400"
                      : "bg-white/15"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zone d'ajout */}
      {images.length < 6 && (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/3 p-3 sm:p-4">
          <p className="text-white/50 font-one text-[10px] uppercase tracking-wider mb-2.5">
            Ajouter des photos
          </p>
          <SalonGalleryUploader
            onImagesUploaded={handleMultipleImagesUploaded}
            maxImages={6}
            currentImageCount={images.length}
          />
        </div>
      )}

      {/* Galerie */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 group"
            >
              <div className="aspect-square relative">
                <Image
                  src={image.url}
                  alt={`Photo du salon ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Overlay suppression */}
                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedImageId(image.id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="cursor-pointer rounded-[14px] border border-red-500/50 bg-red-500/80 hover:bg-red-500 text-white px-3 py-1.5 text-[11px] font-one transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              {/* Badge numéro */}
              <div className="absolute top-1.5 left-1.5 rounded-[8px] bg-black/50 px-1.5 py-0.5 text-[10px] text-white/70 font-one">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/4 p-6 text-center">
          <p className="text-white font-one text-base font-semibold">
            Aucune photo ajoutée
          </p>
          <p className="text-white/60 font-two text-sm mt-1.5">
            Ajoutez jusqu&apos;à 6 photos pour mettre en valeur votre salon.
          </p>
        </div>
      )}

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
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedImageId(null);
                }}
                className="cursor-pointer rounded-[14px] border border-white/20 bg-white/10 px-4 py-2 text-xs text-white transition-colors hover:bg-white/20 font-one"
              >
                Annuler
              </button>
              <button
                onClick={() => handleImageDelete(selectedImageId)}
                className="cursor-pointer rounded-[14px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 text-xs text-white transition-all duration-300 font-one"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
