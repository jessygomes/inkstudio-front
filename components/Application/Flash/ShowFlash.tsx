"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { FaBolt } from "react-icons/fa6";
import { FlashProps } from "@/lib/type";
import CreateOrUpdateFlash from "./CreateOrUpdateFlash";
import DeleteFlash from "./DeleteFlash";
import FlashCard from "./FlashCard";
import cardStyles from "./FlashCards.module.css";
import PageHeader from "@/components/Shared/PageHeader";
import RdvActionButton from "@/components/Application/RDV/RdvActionButton";
import FilterSelect from "@/components/Shared/FilterSelect";
import { ListFilter, Plus } from "lucide-react";
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

  const formatDuration = (minutes?: number) => {
    if (!minutes || minutes <= 0) return "1 h";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder === 0 ? `${hours} h` : `${hours} h ${remainder}`;
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
      <PageHeader icon={<FaBolt size={15} className="text-tertiary-400" />} title="Flashs" />
      <div className="relative z-10 flex w-full flex-wrap items-center gap-2 font-one sm:justify-end">
        <div className="w-full sm:w-52">
          <FilterSelect
            buttonClassName={`flex h-10 w-full min-w-0 items-center gap-2 rounded-xl px-3 text-left text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${availabilityFilter !== "all" ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white hover:bg-white/[0.09]"}`}
            label="Disponibilité" placeholder="Toutes les disponibilités" unit="disponibilité" icon={<ListFilter size={14} aria-hidden="true" />}
            multiple={false} align="right"
            selected={availabilityFilter === "all" ? [] : [availabilityFilter]}
            options={[{ value: "available", label: "Disponibles" }, { value: "unavailable", label: "Indisponibles" }]}
            onApply={(values) => { setAvailabilityFilter((values[0] || "all") as AvailabilityFilter); setCurrentPage(1); setHasNextPage(false); }}
          />
        </div>
        <RdvActionButton tone="primary" icon={Plus} onClick={handleCreate} className="!w-auto shrink-0">Nouveau flash</RdvActionButton>
      </div>

      <div className="hidden">
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
        <div className={cardStyles.grid} role="status" aria-label="Chargement des flashs">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className={cardStyles.skeleton} aria-hidden="true">
              <div className={cardStyles.skeletonImage} />
              <div className={cardStyles.skeletonBody}><div /><div /><div /></div>
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
        <div className={cardStyles.grid}>
          {flashs.map((flash) => (
            <FlashCard
              key={flash.id}
              flash={flash}
              artistName={session?.user?.role?.toLowerCase() === "user_salon" ? getFlashTatoueurName(flash) : ""}
              durationLabel={formatDuration(flash.appointmentDurationMinutes)}
              readOnly={isLinkedFlash(flash)}
              onEdit={() => handleEdit(flash)}
              onDelete={() => handleDelete(flash)}
            />
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
