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
import RdvActionButton from "@/components/Application/RDV/RdvActionButton";
import FilterSelect from "@/components/Shared/FilterSelect";
import { Hash, ListFilter, Palette, Plus, Ruler, UserRound, X } from "lucide-react";
import {
  getPortfolioCategoriesAction,
  getPortfolioPhotosAction,
  getPortfolioStylesAction,
  getSalonTatoueursForPortfolioAction,
  PortfolioCategoryDto,
  PortfolioStyleDto,
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
  const [pieceSizeFilter, setPieceSizeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [hashtagFilter, setHashtagFilter] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [styles, setStyles] = useState<PortfolioStyleDto[]>([]);
  const [categories, setCategories] = useState<PortfolioCategoryDto[]>([]);
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
        {
          pieceSize: pieceSizeFilter,
          category: categoryFilter,
          style: styleFilter,
          hashtag: hashtagFilter,
        },
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
  }, [
    session?.user?.id,
    tatoueurFilter,
    pieceSizeFilter,
    categoryFilter,
    styleFilter,
    hashtagFilter,
  ]);

  useEffect(() => {
    let active = true;
    getPortfolioCategoriesAction().then((list) => {
      if (active) setCategories(list);
    });
    return () => {
      active = false;
    };
  }, []);

  const toggleCategoryFilter = (slug: string) =>
    setCategoryFilter(slug);

  const hasActiveFilters = Boolean(
    pieceSizeFilter || categoryFilter || styleFilter || hashtagFilter,
  );

  const resetFilters = () => {
    setPieceSizeFilter("");
    setCategoryFilter("");
    setStyleFilter("");
    setHashtagFilter("");
    setHashtagInput("");
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    let active = true;
    getPortfolioStylesAction(session.user.id, tatoueurFilter).then((list) => {
      if (!active) return;
      setStyles(list);
      setStyleFilter((current) =>
        current && !list.some((s) => s.name === current) ? "" : current,
      );
    });
    return () => {
      active = false;
    };
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
      <PageHeader icon={<FaIdCardClip size={15} className="text-tertiary-400" />} title="Portfolio" />
      <div className="relative z-10 flex w-full flex-wrap items-center gap-2 font-one sm:justify-end">
        <div className="w-full sm:w-44">
          <FilterSelect buttonClassName={`flex h-10 w-full min-w-0 items-center gap-2 rounded-xl px-3 text-left text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${tatoueurFilter !== "all" ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]"}`} label="Tatoueur" placeholder="Tous les tatoueurs" unit="tatoueur" icon={<UserRound size={14} aria-hidden="true" />} multiple={false} align="right"
            selected={tatoueurFilter === "all" ? [] : [tatoueurFilter]}
            options={tatoueurs.map((tatoueur) => ({ value: tatoueur.id, label: getTatoueurDisplayName(tatoueur) }))}
            onApply={(values) => { setTatoueurFilter(values[0] || "all"); setCurrentPage(1); setHasNextPage(false); }} />
        </div>
        <div className="w-full sm:w-44">
          <FilterSelect buttonClassName={`flex h-10 w-full min-w-0 items-center gap-2 rounded-xl px-3 text-left text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${pieceSizeFilter ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]"}`} label="Taille de la pièce" placeholder="Toutes les tailles" unit="taille" icon={<Ruler size={14} aria-hidden="true" />} multiple={false} align="right"
            selected={pieceSizeFilter ? [pieceSizeFilter] : []}
            options={[{ value: "SMALL", label: "Petite pièce" }, { value: "MEDIUM", label: "Moyenne pièce" }, { value: "LARGE", label: "Grosse pièce" }]}
            onApply={(values) => setPieceSizeFilter(values[0] || "")} />
        </div>
        {categories.length > 0 && (
          <div className="w-full sm:w-44">
            <FilterSelect buttonClassName={`flex h-10 w-full min-w-0 items-center gap-2 rounded-xl px-3 text-left text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${categoryFilter ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]"}`} label="Catégorie" placeholder="Toutes les catégories" unit="catégorie" icon={<ListFilter size={14} aria-hidden="true" />} multiple={false} align="right"
              selected={categoryFilter ? [categoryFilter] : []}
              options={categories.map((cat) => ({ value: cat.slug, label: cat.name }))}
              onApply={(values) => toggleCategoryFilter(values[0] || "")} />
          </div>
        )}
        <div className="w-full sm:w-44">
          <FilterSelect buttonClassName={`flex h-10 w-full min-w-0 items-center gap-2 rounded-xl px-3 text-left text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${styleFilter ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]"}`} label="Style" placeholder="Tous les styles" unit="style" icon={<Palette size={14} aria-hidden="true" />} multiple={false} align="right"
            selected={styleFilter ? [styleFilter] : []}
            options={styles.map((style) => ({ value: style.name, label: style.name + (typeof style.count === "number" ? " (" + style.count + ")" : "") }))}
            onApply={(values) => setStyleFilter(values[0] || "")} />
        </div>
        <label className={"relative flex h-10 w-full shrink-0 items-center rounded-xl text-xs transition focus-within:ring-2 focus-within:ring-tertiary-400/40 sm:w-40 " + (hashtagInput ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]")}>
          <Hash className="pointer-events-none absolute left-3 opacity-60" size={14} />
          <input
            id="hashtag-filter"
            aria-label="Filtrer par hashtag"
            value={hashtagInput}
            onChange={(event) => setHashtagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") setHashtagFilter(hashtagInput.trim());
            }}
            onBlur={() => setHashtagFilter(hashtagInput.trim())}
            placeholder="Hashtag"
            className="h-full w-full bg-transparent pl-9 pr-3 text-xs text-inherit outline-none placeholder:text-white/40"
          />
        </label>
        {hasActiveFilters && <RdvActionButton tone="danger" icon={X} onClick={resetFilters} className="!w-auto shrink-0">Effacer</RdvActionButton>}
        <RdvActionButton tone="primary" icon={Plus} onClick={handleCreate} className="!w-auto shrink-0">Nouvelle photo</RdvActionButton>
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
                    <div data-theme-contrast="dark" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center hidden xl:flex">
                      <div className="flex gap-3">
                        <button
                          className="cursor-pointer p-2 bg-tertiary-400/10 backdrop-blur-sm rounded-full hover:bg-tertiary-400/15 transition-all duration-200"
                          onClick={() => handleEdit(photo)}
                        >
                          <IoCreateOutline
                            size={20}
                            className="text-white hover:text-tertiary-400 transition-colors"
                          />
                        </button>
                        <button
                          className="cursor-pointer p-2 bg-tertiary-400/10 backdrop-blur-sm rounded-full hover:bg-red-500/30 transition-all duration-200"
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
                    {(photo.pieceSize || (photo.categories && photo.categories.length > 0)) && (
                      <p className="mt-2 text-[10px] uppercase tracking-wide text-white/50 font-one">
                        {[
                          photo.pieceSize &&
                            { SMALL: "Petite pièce", MEDIUM: "Moyenne pièce", LARGE: "Grosse pièce" }[photo.pieceSize],
                          ...(photo.categories?.map((c) => c.name) ?? []),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
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
                    {photo.hashtags && photo.hashtags.length > 0 && (
                      <p className="mt-1 text-[10px] text-white/45 font-one">
                        {photo.hashtags.map((tag) => `#${tag}`).join(" ")}
                      </p>
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
                        className="cursor-pointer rounded-lg bg-tertiary-400/10 p-1.5 transition-all duration-200 hover:bg-tertiary-400/15"
                        onClick={() => handleEdit(photo)}
                      >
                        <IoCreateOutline
                          size={16}
                          className="text-white hover:text-tertiary-400 transition-colors"
                        />
                      </button>
                      <button
                        className="cursor-pointer rounded-lg bg-tertiary-400/10 p-1.5 transition-all duration-200 hover:bg-red-500/20"
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
