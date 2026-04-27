"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { FaBolt } from "react-icons/fa6";
import { FlashProps } from "@/lib/type";
import CreateOrUpdateFlash from "./CreateOrUpdateFlash";
import DeleteFlash from "./DeleteFlash";

export default function ShowFlash() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [flashs, setFlashs] = useState<FlashProps[]>([]);
  const [selectedFlash, setSelectedFlash] = useState<FlashProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  const fetchFlashs = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/flash/${session?.user?.id}`,
        { cache: "no-store" },
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setFlashs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des flashs :", error);
      setFlashs([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchFlashs();
    } else {
      setLoading(false);
    }
  }, [session?.user?.id, fetchFlashs]);

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
      <div className="dashboard-hero flex flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-5 lg:py-2.5">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-400/30">
            <FaBolt
              size={18}
              className="text-tertiary-400 animate-pulse"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-bold text-white font-one tracking-wide uppercase">
              Flashs
            </h1>
            <p className="mt-0.5 text-[11px] text-white/70 font-one">
              Gérez vos flashs disponibles: création, modification et
              suppression.
            </p>
          </div>
        </div>
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
          Nouveau flash
        </button>
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

      {isModalOpen && (
        <CreateOrUpdateFlash
          onCreate={() => {
            fetchFlashs();
            setIsModalOpen(false);
          }}
          setIsOpen={setIsModalOpen}
          existingFlash={selectedFlash ?? undefined}
        />
      )}

      {isModalDeleteOpen && (
        <DeleteFlash
          onDelete={() => {
            fetchFlashs();
            setIsModalDeleteOpen(false);
          }}
          setIsOpen={setIsModalDeleteOpen}
          flash={selectedFlash ?? undefined}
        />
      )}
    </section>
  );
}
