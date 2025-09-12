/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import SalonGalleryUploader from "./SalonGalleryUploader";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
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
  const fetchImages = async () => {
    if (!salonId) return;

    try {
      const response = await fetchSalonPhotosAction(salonId);

      if (response.ok) {
        const data = response.data;

        console.log("Photos récupérées :", data);

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
  };

  useEffect(() => {
    fetchImages();
  }, [salonId]);

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
      <div className="w-full flex flex-col">
        {/* Header responsive */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-3 sm:p-4 rounded-xl shadow-xl border border-white/10">
          <div>
            <p className="text-white font-semibold font-one text-sm sm:text-lg tracking-widest">
              <span className="hidden sm:inline">Galerie photos</span>
              <span className="sm:hidden">Photos</span>
            </p>
            <p className="text-xs text-white/60 font-two">Chargement...</p>
          </div>
        </div>
        {/* Loader responsive */}
        <div className="w-full flex items-center justify-center py-16 sm:py-20">
          <div className="w-full rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center gap-6 mx-auto">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
            <p className="text-white/60 font-two text-xs text-center">
              Chargement des images...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header avec compteur responsive */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white font-semibold font-one text-sm tracking-widest">
            <span className="hidden sm:inline">
              Galerie photos ({images.length}/6 photos)
            </span>
            <span className="sm:hidden">Photos ({images.length}/6)</span>
          </p>
          <p className="text-xs text-white/60 font-two">
            <span className="hidden sm:inline">
              Gérez les photos de votre salon (maximum 6 images)
            </span>
            <span className="sm:hidden">Maximum 6 images</span>
          </p>
        </div>
      </div>

      {/* Zone d'ajout d'images responsive */}
      {images.length < 6 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
          <h4 className="text-white font-medium font-one text-sm mb-3 sm:mb-4">
            <span className="hidden sm:inline">Ajouter des photos</span>
            <span className="sm:hidden">Ajouter</span>
          </h4>
          <SalonGalleryUploader
            onImagesUploaded={handleMultipleImagesUploaded}
            maxImages={6}
            currentImageCount={images.length}
          />
        </div>
      )}

      {/* Galerie d'images responsive */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-200 group"
            >
              <div className="aspect-square relative">
                <Image
                  src={image.url}
                  alt="Photo du salon"
                  fill
                  className="object-cover"
                />

                {/* Overlay avec bouton de suppression responsive */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    onClick={() => {
                      setSelectedImageId(image.id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="cursor-pointer px-3 sm:px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-xs font-one transition-colors"
                  >
                    <span className="hidden sm:inline">Supprimer</span>
                    <span className="sm:hidden">✕</span>
                  </button>
                </div>
              </div>

              {/* Informations sur l'image responsive */}
              <div className="p-2 sm:p-3">
                <p className="text-xs text-white/50 font-two">
                  <span className="hidden sm:inline">
                    Ajoutée le{" "}
                    {new Date(image.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="sm:hidden">
                    {new Date(image.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-white/10 text-center">
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-one text-base sm:text-lg mb-2">
                Aucune photo ajoutée
              </h3>
              <p className="text-white/60 font-two text-xs">
                <span className="hidden sm:inline">
                  Commencez par ajouter des photos de votre salon pour attirer
                  vos clients
                </span>
                <span className="sm:hidden">
                  Ajoutez des photos de votre salon
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation responsive */}
      {isDeleteModalOpen && selectedImageId && (
        <DeleteConfirmationModal
          tatoueurName="cette image"
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setSelectedImageId(null);
          }}
          onConfirm={() => handleImageDelete(selectedImageId)}
        />
      )}
    </div>
  );
}
