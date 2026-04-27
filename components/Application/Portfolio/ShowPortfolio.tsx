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
    <section className="w-full space-y-3">
      <div className="dashboard-hero flex flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-5 lg:py-2.5">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-400/30">
            <FaIdCardClip
              size={18}
              className="text-tertiary-400 animate-pulse"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-bold text-white font-one tracking-wide uppercase">
              Portfolio
            </h1>
            <p className="mt-0.5 text-[11px] text-white/70 font-one">
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
        <div className="flex w-full items-center justify-center gap-3 md:w-auto">
          <button
            onClick={handleCreate}
            className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-2xl border border-tertiary-400/30 bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-3.5 py-2 text-[11px] font-medium text-white shadow-xl shadow-tertiary-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-tertiary-500 hover:to-tertiary-600 font-one md:w-[168px]"
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
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg sm:rounded-2xl"
              >
                <div className="aspect-square relative overflow-hidden bg-white/10 animate-pulse"></div>

                <div className="space-y-2.5 p-3 sm:p-3.5">
                  <div className="space-y-1">
                    <div className="h-4 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                  </div>

                  <div className="space-y-2 border-t border-white/10 pt-2">
                    <div className="h-3 bg-white/10 rounded-lg w-full animate-pulse"></div>
                    <div className="h-3 bg-white/10 rounded-lg w-3/4 animate-pulse"></div>
                  </div>

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
            <div className="dashboard-empty-state mx-auto flex w-full flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 p-6 sm:p-8">
              <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 sm:h-16 sm:w-16">
                <FaIdCardClip
                  size={28}
                  className="text-tertiary-400 animate-pulse sm:h-8 sm:w-8"
                />
              </div>
              <h2 className="text-center text-lg text-white font-one sm:text-xl">
                Aucun visuel dans votre portfolio
              </h2>
              <p className="text-center text-xs text-white/60 font-two">
                Ajoutez vos plus belles réalisations pour inspirer vos clients !
              </p>
              <button
                onClick={handleCreate}
                className="cursor-pointer mt-1 rounded-2xl bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-5 py-2 text-xs font-medium text-white shadow-lg transition-all hover:from-tertiary-500 hover:to-tertiary-600 font-one"
              >
                Ajouter une photo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-noir-500/10 to-noir-500/5 shadow-xl transition-all duration-300 hover:border-tertiary-400/50 hover:shadow-2xl backdrop-blur-lg sm:rounded-2xl"
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    width={500}
                    height={500}
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

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

                <div className="space-y-2.5 p-3 sm:p-3.5">
                  <div className="space-y-1">
                    <h3 className="truncate text-[13px] font-bold tracking-wide text-white font-one sm:text-sm">
                      {photo.title}
                    </h3>
                  </div>

                  <div className="border-t border-white/10 pt-2">
                    <p className="line-clamp-2 text-[11px] leading-relaxed text-white/70 font-one sm:line-clamp-3 sm:text-xs">
                      {photo.description}
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 xl:hidden">
                    <button
                      className="cursor-pointer rounded-lg bg-white/10 p-1.5 transition-all duration-200 hover:bg-white/20"
                      onClick={() => handleEdit(photo)}
                    >
                      <IoCreateOutline
                        size={16}
                        className="text-white hover:text-tertiary-400 transition-colors"
                      />
                    </button>
                    <button
                      className="cursor-pointer rounded-lg bg-white/10 p-1.5 transition-all duration-200 hover:bg-red-500/20"
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
