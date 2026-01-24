"use client";
import { useSession } from "next-auth/react";
import { PortfolioProps } from "@/lib/type";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import CreateOrUpdatePhoto from "./CreateOrUpdatePhoto";
import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import DeletePhoto from "./DeletePhoto";
import { FaIdCardClip } from "react-icons/fa6";

export default function ShowPortfolio() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);

  //! State
  const [photos, setPhotos] = useState<PortfolioProps[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioProps | null>(
    null,
  );

  //! Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  //! Récupère les photos du portfolio
  const fetchPhotos = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/portfolio/${session?.user?.id}`,
        {
          cache: "no-store",
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Vérifier que data est un tableau
      if (Array.isArray(data)) {
        setPhotos(data);
      } else {
        console.error("La réponse n'est pas un tableau:", data);
        setPhotos([]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des photos :", err);
      setPhotos([]); // S'assurer que photos reste un tableau
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchPhotos();
    } else {
      setLoading(false);
    }
  }, [session?.user?.id, fetchPhotos]);

  //! Handlers pour les actions
  const handleCreate = () => {
    setSelectedPhoto(null);
    setIsModalOpen(true);
  };

  const handleEdit = (photo: PortfolioProps) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const handleDelete = (photo: PortfolioProps) => {
    setSelectedPhoto(photo);
    setIsModalDeleteOpen(true);
  };

  return (
    <section className="w-full">
      {/* Header responsive */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 md:mb-0 w-full md:w-auto">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center">
            <FaIdCardClip
              size={20}
              className="sm:w-7 sm:h-7 text-tertiary-400 animate-pulse"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-white font-one tracking-wide uppercase">
              Portfolio
            </h1>
            <p className="text-white/70 text-xs font-one mt-1">
              <span className="hidden sm:inline">
                Gérez le portfolio de votre salon, ajoutez, modifiez ou
                supprimez des photos de vos œuvres.
              </span>
              <span className="sm:hidden">
                Gérez vos photos de réalisations
              </span>
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-4 items-center w-full md:w-auto">
          <button
            onClick={handleCreate}
            className="cursor-pointer w-full md:w-[175px] flex justify-center items-center gap-2 py-2 px-4 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">Nouvelle photo</span>
            <span className="sm:hidden">Ajouter photo</span>
          </button>
        </div>
      </div>

      <div className="w-full h-full">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-2xl overflow-hidden border border-white/20"
              >
                <div className="aspect-square relative overflow-hidden bg-white/10 animate-pulse"></div>

                <div className="p-3 sm:p-4 space-y-3">
                  {/* Header avec titre */}
                  <div className="space-y-1">
                    <div className="h-4 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                  </div>

                  {/* Description */}
                  <div className="border-t border-white/10 pt-2 space-y-2">
                    <div className="h-3 bg-white/10 rounded-lg w-full animate-pulse"></div>
                    <div className="h-3 bg-white/10 rounded-lg w-3/4 animate-pulse"></div>
                  </div>

                  {/* Actions au bas */}
                  <div className="flex gap-2 justify-end pt-2 lg:hidden">
                    <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse"></div>
                    <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="h-full w-full flex">
            <div className="w-full rounded-2xl shadow-xl border border-white/10 p-6 sm:p-10 flex flex-col items-center justify-center gap-6 mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 rounded-full flex items-center justify-center mb-2">
                <FaIdCardClip
                  size={32}
                  className="sm:w-10 sm:h-10 text-tertiary-400 animate-pulse"
                />
              </div>
              <h2 className="text-white font-one text-lg sm:text-xl text-center">
                Aucun visuel dans votre portfolio
              </h2>
              <p className="text-white/60 font-two text-xs text-center">
                Ajoutez vos plus belles réalisations pour inspirer vos clients !
              </p>
              <button
                onClick={handleCreate}
                className="cursor-pointer mt-2 px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg font-medium font-one text-xs shadow-lg transition-all"
              >
                Ajouter une photo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 hover:border-tertiary-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl group"
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    width={500}
                    height={500}
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay avec actions - masqué sur mobile */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center hidden xl:flex">
                    <div className="flex gap-3">
                      <button
                        className="cursor-pointer p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200"
                        onClick={() => handleEdit(photo)}
                      >
                        <IoCreateOutline
                          size={20}
                          className="text-white hover:text-tertiary-400 transition-colors"
                        />
                      </button>
                      <button
                        className="cursor-pointer p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-red-500/30 transition-all duration-200"
                        onClick={() => handleDelete(photo)}
                      >
                        <AiOutlineDelete
                          size={20}
                          className="text-white hover:text-red-400 transition-colors"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 space-y-3">
                  {/* Header avec titre */}
                  <div className="space-y-1">
                    <h3 className="text-white font-one text-sm font-bold tracking-wide truncate">
                      {photo.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <div className="border-t border-white/10 pt-2">
                    <p className="text-white/70 text-xs font-one line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {photo.description}
                    </p>
                  </div>

                  {/* Actions au bas - toujours visibles sur mobile */}
                  <div className="flex gap-2 justify-end pt-2 xl:hidden">
                    <button
                      className="cursor-pointer p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200"
                      onClick={() => handleEdit(photo)}
                    >
                      <IoCreateOutline
                        size={16}
                        className="text-white hover:text-tertiary-400 transition-colors"
                      />
                    </button>
                    <button
                      className="cursor-pointer p-1.5 bg-white/10 rounded-lg hover:bg-red-500/20 transition-all duration-200"
                      onClick={() => handleDelete(photo)}
                    >
                      <AiOutlineDelete
                        size={16}
                        className="text-white hover:text-red-400 transition-colors"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales existantes */}
      {isModalOpen && (
        <CreateOrUpdatePhoto
          onCreate={() => {
            fetchPhotos();
            setIsModalOpen(false);
          }}
          setIsOpen={setIsModalOpen}
          existingPhoto={selectedPhoto ?? undefined}
        />
      )}

      {isModalDeleteOpen && (
        <DeletePhoto
          onDelete={() => {
            fetchPhotos();
            setIsModalDeleteOpen(false);
          }}
          setIsOpen={setIsModalDeleteOpen}
          photo={selectedPhoto ?? undefined}
        />
      )}
    </section>
  );
}
