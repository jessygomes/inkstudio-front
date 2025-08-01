"use client";
import { useUser } from "@/components/Auth/Context/UserContext";
import { PortfolioProps } from "@/lib/type";
import Image from "next/image";
import React, { CSSProperties, useEffect, useState } from "react";
import BarLoader from "react-spinners/BarLoader";
import CreateOrUpdatePhoto from "./CreateOrUpdatePhoto";
import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import DeletePhoto from "./DeletePhoto";

export default function ShowPortfolio() {
  const user = useUser();

  const [loading, setLoading] = useState(true);
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "none",
  };
  const color = "#ff5500";

  //! State
  const [photos, setPhotos] = useState<PortfolioProps[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioProps | null>(
    null
  );

  //! Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  //! Récupère les photos du portfolio
  const fetchPhotos = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/portfolio/${user?.id}`,
        {
          cache: "no-store",
        }
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
    if (user?.id) {
      fetchPhotos();
    } else {
      setLoading(false);
    }
  }, []);

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

  console.log("Photos:", photos);

  return (
    <section className="w-full">
      <div className="">
        <div className="w-full bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg pb-4 border-b border-white/20">
          <h1 className="text-3xl font-bold text-white font-one tracking-wide text-center">
            Portfolio
          </h1>
          <p className="text-white/70 text-sm font-one text-center mt-2">
            Gérez le portfolio de votre salon, ajoutez, modifiez ou supprimez
            des photos de vos œuvres.
          </p>
        </div>
      </div>

      <div className="px-20">
        <div className="flex justify-center gap-4 items-center my-8">
          <button
            onClick={handleCreate}
            className="cursor-pointer w-[200px] text-center px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
          >
            Nouvelle photo
          </button>
        </div>

        {loading ? (
          <div className="w-full flex items-center justify-center">
            <BarLoader
              color={color}
              loading={loading}
              cssOverride={override}
              width={300}
              height={5}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        ) : photos.length === 0 ? (
          <div className="h-[500px] w-full flex justify-center items-center text-white/70">
            Aucune photo dans votre portfolio
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-tertiary-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl group"
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    width={500}
                    height={500}
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay avec actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
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

                <div className="p-4 space-y-3">
                  {/* Header avec titre */}
                  <div className="space-y-1">
                    <h3 className="text-white font-one text-sm font-bold tracking-wide truncate">
                      {photo.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <div className="border-t border-white/10 pt-2">
                    <p className="text-white/70 text-xs font-one line-clamp-3 leading-relaxed">
                      {photo.description}
                    </p>
                  </div>

                  {/* Actions au bas (version alternative pour mobile) */}
                  <div className="flex gap-2 justify-end pt-2 lg:hidden">
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

      {isModalOpen && (
        <CreateOrUpdatePhoto
          userId={user.id ?? ""}
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
