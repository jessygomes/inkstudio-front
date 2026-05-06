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

export default function ShowFlash() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [flashs, setFlashs] = useState<FlashProps[]>([]);
  const [selectedFlash, setSelectedFlash] = useState<FlashProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

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

        const result = await getAvailableFlashsByUserAction(session.user.id, page);

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
    [session?.user?.id],
  );

  useEffect(() => {
    if (session?.user?.id) {
      fetchFlashs(1, true);
    } else {
      setLoading(false);
    }
  }, [session?.user?.id, fetchFlashs]);

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
        icon={<FaBolt size={20} className="text-tertiary-400" />}
        title="Flashs"
      >
        <DashboardButton onClick={handleCreate}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau flash
        </DashboardButton>
      </PageHeader>

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

                <p className="text-xs font-semibold text-tertiary-300 font-one">
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
