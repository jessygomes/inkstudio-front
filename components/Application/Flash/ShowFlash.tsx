"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { FaBolt } from "react-icons/fa6";
import { FlashProps } from "@/lib/type";
import CreateOrUpdateFlash from "./CreateOrUpdateFlash";
import DeleteFlash from "./DeleteFlash";
import PageHeader from "@/components/Shared/PageHeader";
import DashboardButton from "@/components/Shared/DashboardButton";
import { getAvailableFlashsByUserAction } from "@/lib/queries/flash";
import {
  getSalonTatoueursForPortfolioAction,
  PortfolioTatoueurDto,
} from "@/lib/queries/portfolio";

export default function ShowFlash() {
  const { data: session } = useSession();
  type AvailabilityFilter = "all" | "available" | "unavailable";

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

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [flashs, setFlashs] = useState<FlashProps[]>([]);
  const [tatoueurs, setTatoueurs] = useState<PortfolioTatoueurDto[]>([]);
  const [selectedFlash, setSelectedFlash] = useState<FlashProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  const isLinkedFlash = (flash: FlashProps) => {
    if (session?.user?.role?.toLowerCase() !== "user_salon") {
      return false;
    }
    return Boolean(flash.userId && flash.userId !== session.user.id);
  };

  const getFlashTatoueurName = (flash: FlashProps) => {
    const directName = getTatoueurDisplayName(flash.tatoueur);
    if (directName) {
      return directName;
    }

    if (flash.tatoueurId) {
      const byTatoueurId = tatoueurs.find(
        (tatoueur) => tatoueur.id === flash.tatoueurId,
      );
      const matchedName = getTatoueurDisplayName(byTatoueurId);
      if (matchedName) {
        return matchedName;
      }
    }

    if (flash.userId && session?.user?.id && flash.userId !== session.user.id) {
      const byLinkedUser = tatoueurs.find(
        (tatoueur) =>
          tatoueur.linkedUserId === flash.userId || tatoueur.id === flash.userId,
      );
      const linkedName = getTatoueurDisplayName(byLinkedUser);
      if (linkedName) {
        return linkedName;
      }
    }

    return "";
  };

  const fetchFlashs = useCallback(
    async (page: number = 1, reset: boolean = true) => {
      if (!session?.user?.id) {
        setFlashs([]);
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

        const isAvailableParam =
          availabilityFilter === "all"
            ? undefined
            : availabilityFilter === "available";

        const result = await getAvailableFlashsByUserAction(
          session.user.id,
          page,
          isAvailableParam,
        );

        if (!result.ok || !result.data) {
          if (reset) {
            setFlashs([]);
            setHasNextPage(false);
            setCurrentPage(1);
          }
          return;
        }

        const nextFlashs = result.data.flashs as FlashProps[];
        if (reset) {
          setFlashs(nextFlashs);
        } else {
          setFlashs((prev) => [...prev, ...nextFlashs]);
        }

        setHasNextPage(result.data.pagination.hasNextPage);
        setCurrentPage(result.data.pagination.page);
      } catch (error) {
        console.error("Erreur lors du chargement des flashs :", error);
        if (reset) {
          setFlashs([]);
          setHasNextPage(false);
          setCurrentPage(1);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [availabilityFilter, session?.user?.id],
  );

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
      fetchFlashs(1, true);
      fetchTatoueurs();
    } else {
      setLoading(false);
    }
  }, [session?.user?.id, fetchFlashs, fetchTatoueurs]);

  useEffect(() => {
    if (!loadMoreRef.current || loading || loadingMore || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !loadingMore) {
          fetchFlashs(currentPage + 1, false);
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [currentPage, fetchFlashs, hasNextPage, loading, loadingMore]);

  const handleCreate = () => {
    setSelectedFlash(null);
    setIsModalOpen(true);
  };

  const handleEdit = (flash: FlashProps) => {
    setSelectedFlash(flash);
    setIsModalOpen(true);
  };

  const handleDelete = (flash: FlashProps) => {
    setSelectedFlash(flash);
    setIsModalDeleteOpen(true);
  };

  return (
    <section className="w-full space-y-3">
      <PageHeader
        icon={<FaBolt size={15} className="text-tertiary-400" />}
        title="Flashs"
      >
        <div className="hidden md:flex items-center gap-2">
          <label htmlFor="availability-filter" className="text-xs text-white/60 font-one">
            Disponibilité
          </label>
          <select
            id="availability-filter"
            value={availabilityFilter}
            onChange={(event) => {
              setAvailabilityFilter(event.target.value as AvailabilityFilter);
              setCurrentPage(1);
              setHasNextPage(false);
            }}
            className="cursor-pointer rounded-2xl border border-white/15 bg-white/8 px-3 py-1 text-xs font-one text-white focus:border-tertiary-400 focus:outline-none"
          >
            <option value="all" className="bg-noir-500">Tous</option>
            <option value="available" className="bg-noir-500">Disponibles</option>
            <option value="unavailable" className="bg-noir-500">Indisponibles</option>
          </select>
        </div>

        <DashboardButton onClick={handleCreate}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau flash
        </DashboardButton>
      </PageHeader>

      <div className="md:hidden flex items-center gap-2 px-1">
        <label htmlFor="availability-filter-mobile" className="text-xs text-white/60 font-one">
          Disponibilité
        </label>
        <select
          id="availability-filter-mobile"
          value={availabilityFilter}
          onChange={(event) => {
            setAvailabilityFilter(event.target.value as AvailabilityFilter);
            setCurrentPage(1);
            setHasNextPage(false);
          }}
          className="cursor-pointer rounded-2xl border border-white/15 bg-white/8 px-3 py-1 text-xs font-one text-white focus:border-tertiary-400 focus:outline-none"
        >
          <option value="all" className="bg-noir-500">Tous</option>
          <option value="available" className="bg-noir-500">Disponibles</option>
          <option value="unavailable" className="bg-noir-500">Indisponibles</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg sm:rounded-2xl"
            >
              <div className="aspect-square bg-white/10 animate-pulse"></div>
              <div className="space-y-2 p-3 sm:p-3.5">
                <div className="h-4 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                <div className="h-3 bg-white/10 rounded-lg w-16 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : flashs.length === 0 ? (
        <div className="dashboard-empty-state flex w-full flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 p-6 sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 sm:h-16 sm:w-16">
            <FaBolt size={28} className="text-tertiary-400" />
          </div>
          <h2 className="text-center text-lg text-white font-one sm:text-xl">
            Aucun flash disponible
          </h2>
          <button
            onClick={handleCreate}
            className="cursor-pointer mt-1 rounded-2xl bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-5 py-2 text-xs font-medium text-white shadow-lg transition-all hover:from-tertiary-500 hover:to-tertiary-600 font-one"
          >
            Ajouter un flash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
          {flashs.map((flash) => (
            <div
              key={flash.id}
              className="overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-noir-500/10 to-noir-500/5 shadow-xl transition-all duration-300 hover:border-tertiary-400/50 backdrop-blur-lg sm:rounded-2xl"
            >
              <div className="aspect-square relative overflow-hidden">
                <Image
                  width={500}
                  height={500}
                  src={flash.imageUrl}
                  alt={flash.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-2 p-3 sm:p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-[13px] font-bold tracking-wide text-white font-one sm:text-sm">
                    {flash.title}
                  </h3>
                  <span
                    className={`rounded-full border px-1.5 py-0.5 text-[9px] ${
                      flash.isAvailable
                        ? "text-green-300 border-green-500/40 bg-green-500/10"
                        : "text-red-300 border-red-500/40 bg-red-500/10"
                    }`}
                  >
                    {flash.isAvailable ? "Disponible" : "Indisponible"}
                  </span>
                </div>

                <p className="text-xs font-semibold text-white font-one">
                  {flash.price} €
                </p>

                {flash.dimension && (
                  <p className="text-[11px] text-white/80 font-one sm:text-xs">
                    Dimensions: {flash.dimension}
                  </p>
                )}

                <p className="min-h-8 line-clamp-2 text-[11px] leading-relaxed text-white/70 font-one sm:text-xs">
                  {flash.description || "Aucune description"}
                </p>

                {flash.style && flash.style.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {flash.style.map((styleItem) => (
                      <span
                        key={`${flash.id}-${styleItem}`}
                        className="rounded-full border border-tertiary-400/35 bg-tertiary-500/10 px-2 py-0.5 text-[10px] text-tertiary-400 font-one"
                      >
                        {styleItem}
                      </span>
                    ))}
                  </div>
                )}

                {session?.user?.role?.toLowerCase() === "user_salon" &&
                  getFlashTatoueurName(flash) && (
                  <p className="text-[10px] text-white/50 font-one">
                    Tatoueur : {getFlashTatoueurName(flash)}
                    {isLinkedFlash(flash) ? " (lecture seule)" : ""}
                  </p>
                )}

                {!isLinkedFlash(flash) && (
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      className="cursor-pointer rounded-lg bg-white/10 p-1.5 transition-all duration-200 hover:bg-white/20"
                      onClick={() => handleEdit(flash)}
                    >
                      <IoCreateOutline size={16} className="text-white" />
                    </button>
                    <button
                      className="cursor-pointer rounded-lg bg-white/10 p-1.5 transition-all duration-200 hover:bg-red-500/20"
                      onClick={() => handleDelete(flash)}
                    >
                      <AiOutlineDelete size={16} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && flashs.length > 0 && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-4">
          {loadingMore && (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/25 border-t-tertiary-400" />
          )}
          {!hasNextPage && !loadingMore && (
            <p className="text-[11px] text-white/45 font-one">Vous avez atteint la fin de la liste</p>
          )}
        </div>
      )}

      {isModalOpen && (
        <CreateOrUpdateFlash
          onCreate={() => {
            fetchFlashs(1, true);
            setIsModalOpen(false);
          }}
          tatoueurs={tatoueurs}
          setIsOpen={setIsModalOpen}
          existingFlash={selectedFlash ?? undefined}
        />
      )}

      {isModalDeleteOpen && (
        <DeleteFlash
          onDelete={() => {
            fetchFlashs(1, true);
            setIsModalDeleteOpen(false);
          }}
          setIsOpen={setIsModalDeleteOpen}
          flash={selectedFlash ?? undefined}
        />
      )}
    </section>
  );
}
