"use client";
import { useSession } from "next-auth/react";
import { PortfolioProps } from "@/lib/type";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CreateOrUpdatePhoto from "./CreateOrUpdatePhoto";
import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import DeletePhoto from "./DeletePhoto";
import { FaIdCardClip } from "react-icons/fa6";
import PageHeader from "@/components/Shared/PageHeader";
import DashboardButton from "@/components/Shared/DashboardButton";
import {
  getPortfolioPhotosAction,
  getSalonTatoueursForPortfolioAction,
  PortfolioTatoueurDto,
} from "@/lib/queries/portfolio";

export default function ShowPortfolio() {
  const { data: session } = useSession();

  const getTatoueurDisplayName = (tatoueur?: {
    name?: string | null;
    salonName?: string | null;
    role?: string | null;
  } | null) => {
    if (!tatoueur) return "";

    const isUserSalon = tatoueur.role?.toLowerCase() === "user_salon";
    if (isUserSalon && tatoueur.salonName?.trim()) {
      return tatoueur.salonName;
    }

    return tatoueur.name || tatoueur.salonName || "";
  };

  const isLinkedPortfolioPhoto = (photo: PortfolioProps) => {
    if (photo.tatoueur?.isLinkedUser) {
      return true;
    }

    if (session?.user?.role?.toLowerCase() !== "user_salon") {
      return false;
    }

    return Boolean(photo.userId && photo.userId !== session.user.id);
  };

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tatoueurFilter, setTatoueurFilter] = useState("all");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const tatoueursRef = useRef<PortfolioTatoueurDto[]>([]);

  //! State
  const [photos, setPhotos] = useState<PortfolioProps[]>([]);
  const [tatoueurs, setTatoueurs] = useState<PortfolioTatoueurDto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioProps | null>(
    null,
  );

  useEffect(() => {
    tatoueursRef.current = tatoueurs;
  }, [tatoueurs]);

  //! Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  //! Récupère les photos du portfolio
  const fetchPhotos = useCallback(async (page: number = 1, reset: boolean = true) => {
    if (!session?.user?.id) {
      setPhotos([]);
      setHasNextPage(false);
      setCurrentPage(1);
      setLoading(false);
      return;
    }

    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const isLinkedTatoueurFilter = (tatoueur?: PortfolioTatoueurDto) => {
        if (!tatoueur) return false;

        return (
          tatoueur.isLinkedUser === true ||
          Boolean(tatoueur.linkedUserId) ||
          tatoueur.role?.toLowerCase() === "user_tatoueur"
        );
      };

      const photoMatchesLinkedTatoueur = (
        photo: PortfolioProps,
        tatoueur?: PortfolioTatoueurDto,
      ) => {
        if (!tatoueur) return false;

        const selectedName = getTatoueurDisplayName(tatoueur)
          .trim()
          .toLowerCase();
        const photoTatoueurName = getTatoueurDisplayName(photo.tatoueur)
          .trim()
          .toLowerCase();

        return (
          (Boolean(selectedName) && photoTatoueurName === selectedName) ||
          (Boolean(tatoueur.linkedUserId) &&
            photo.tatoueur?.linkedUserId === tatoueur.linkedUserId) ||
          (Boolean(tatoueur.linkedUserId) &&
            photo.userId === tatoueur.linkedUserId) ||
          photo.tatoueur?.id === tatoueur.id ||
          photo.userId === tatoueur.id
        );
      };

      const selectedTatoueur = tatoueursRef.current.find(
        (tatoueur) => tatoueur.id === tatoueurFilter,
      );
      const isLinkedFilter = isLinkedTatoueurFilter(selectedTatoueur);

      const result = await getPortfolioPhotosAction(
        session.user.id,
        isLinkedFilter ? undefined : tatoueurFilter,
        page,
      );

      if (!result.ok || !result.data) {
        if (reset) {
          setPhotos([]);
          setHasNextPage(false);
          setCurrentPage(1);
        }
        return;
      }

      const photosFromApi = result.data.photos as PortfolioProps[];
      const nextPhotos = isLinkedFilter
        ? photosFromApi.filter((photo) =>
            photoMatchesLinkedTatoueur(photo, selectedTatoueur),
          )
        : photosFromApi;
      if (reset) {
        setPhotos(nextPhotos);
      } else {
        setPhotos((prev) => [...prev, ...nextPhotos]);
      }

      setHasNextPage(result.data.pagination.hasNextPage);
      setCurrentPage(result.data.pagination.page);
    } catch (err) {
      console.error("Erreur lors du chargement des photos :", err);
      if (reset) {
        setPhotos([]);
        setHasNextPage(false);
        setCurrentPage(1);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [session?.user?.id, tatoueurFilter]);

  const fetchTatoueurs = useCallback(async () => {
    if (!session?.user?.id) {
      setTatoueurs([]);
      return;
    }

    try {
      const result = await getSalonTatoueursForPortfolioAction(session.user.id);

      if (!result.ok || !result.data) {
        setTatoueurs([]);
        return;
      }

      setTatoueurs(result.data);
    } catch (error) {
      console.error("Erreur lors du chargement des tatoueurs:", error);
      setTatoueurs([]);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTatoueurs();
    }
  }, [session?.user?.id, fetchTatoueurs]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchPhotos(1, true);
    } else {
      setLoading(false);
    }
  }, [session?.user?.id, fetchPhotos]);

  useEffect(() => {
    if (!loadMoreRef.current || loading || loadingMore || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !loadingMore) {
          fetchPhotos(currentPage + 1, false);
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [currentPage, fetchPhotos, hasNextPage, loading, loadingMore]);

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
      <PageHeader
        icon={<FaIdCardClip size={15} className="text-tertiary-400" />}
        title="Portfolio"
      >
        <div className="hidden md:flex items-center gap-2">
          <label htmlFor="tatoueur-filter" className="text-xs text-white/60 font-one">
            Tatoueur
          </label>
          <select
            id="tatoueur-filter"
            value={tatoueurFilter}
            onChange={(event) => {
              setTatoueurFilter(event.target.value);
              setCurrentPage(1);
              setHasNextPage(false);
            }}
            className="cursor-pointer rounded-2xl border border-white/15 bg-white/8 px-3 py-1 text-xs font-one text-white focus:border-tertiary-400 focus:outline-none"
          >
            <option value="all" className="bg-noir-500">Tous</option>
            {tatoueurs.map((tatoueur) => (
              <option key={tatoueur.id} value={tatoueur.id} className="bg-noir-500">
                {getTatoueurDisplayName(tatoueur)}
              </option>
            ))}
          </select>
        </div>

        <DashboardButton onClick={handleCreate}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle photo
        </DashboardButton>
      </PageHeader>

      <div className="md:hidden flex items-center gap-2 px-1">
        <label htmlFor="tatoueur-filter-mobile" className="text-xs text-white/60 font-one">
          Tatoueur
        </label>
        <select
          id="tatoueur-filter-mobile"
          value={tatoueurFilter}
          onChange={(event) => {
            setTatoueurFilter(event.target.value);
            setCurrentPage(1);
            setHasNextPage(false);
          }}
          className="cursor-pointer rounded-2xl border border-white/15 bg-white/8 px-3 py-1 text-xs font-one text-white focus:border-tertiary-400 focus:outline-none"
        >
          <option value="all" className="bg-noir-500">Tous</option>
          {tatoueurs.map((tatoueur) => (
            <option key={tatoueur.id} value={tatoueur.id} className="bg-noir-500">
              {getTatoueurDisplayName(tatoueur)}
            </option>
          ))}
        </select>
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

                  {!isLinkedPortfolioPhoto(photo) && (
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
                  )}
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
                    {photo.style && photo.style.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {photo.style.map((styleItem) => (
                          <span
                            key={`${photo.id}-${styleItem}`}
                            className="rounded-full border border-tertiary-400/35 bg-tertiary-500/10 px-2 py-0.5 text-[10px] text-tertiary-400 font-one"
                          >
                            {styleItem}
                          </span>
                        ))}
                      </div>
                    )}
                    {getTatoueurDisplayName(photo.tatoueur) && (
                      <p className="mt-1 text-[10px] text-white/50 font-one">
                          Photo issue du portfolio Tatoueur : {getTatoueurDisplayName(photo.tatoueur)} (lecture seule)
                      </p>
                    )}
                  </div>

                  {!isLinkedPortfolioPhoto(photo) && (
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
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && photos.length > 0 && (
          <div ref={loadMoreRef} className="flex items-center justify-center py-4">
            {loadingMore && (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/25 border-t-tertiary-400" />
            )}
            {!hasNextPage && !loadingMore && (
              <p className="text-[11px] text-white/45 font-one">Vous avez atteint la fin de la liste</p>
            )}
          </div>
        )}
      </div>

      {/* Modales existantes */}
      {isModalOpen && (
        <CreateOrUpdatePhoto
          onCreate={() => {
            fetchPhotos(1, true);
            setIsModalOpen(false);
          }}
          tatoueurs={tatoueurs}
          setIsOpen={setIsModalOpen}
          existingPhoto={selectedPhoto ?? undefined}
        />
      )}

      {isModalDeleteOpen && (
        <DeletePhoto
          onDelete={() => {
            fetchPhotos(1, true);
            setIsModalDeleteOpen(false);
          }}
          setIsOpen={setIsModalDeleteOpen}
          photo={selectedPhoto ?? undefined}
        />
      )}
    </section>
  );
}
