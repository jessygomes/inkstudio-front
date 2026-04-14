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
    <section className="w-full">
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 md:mb-0 w-full md:w-auto">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center">
            <FaBolt
              size={20}
              className="sm:w-7 sm:h-7 text-tertiary-400 animate-pulse"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-white font-one tracking-wide uppercase">
              Flashs
            </h1>
            <p className="text-white/70 text-xs font-one mt-1">
              Gérez vos flashs disponibles: création, modification et
              suppression.
            </p>
          </div>
        </div>
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
          Nouveau flash
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-2xl overflow-hidden border border-white/20"
            >
              <div className="aspect-square bg-white/10 animate-pulse"></div>
              <div className="p-3 sm:p-4 space-y-2">
                <div className="h-4 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                <div className="h-3 bg-white/10 rounded-lg w-16 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : flashs.length === 0 ? (
        <div className="w-full rounded-2xl shadow-xl border border-white/10 p-6 sm:p-10 flex flex-col items-center justify-center gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 rounded-full flex items-center justify-center">
            <FaBolt size={32} className="text-tertiary-400" />
          </div>
          <h2 className="text-white font-one text-lg sm:text-xl text-center">
            Aucun flash disponible
          </h2>
          <button
            onClick={handleCreate}
            className="cursor-pointer mt-2 px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg font-medium font-one text-xs shadow-lg transition-all"
          >
            Ajouter un flash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {flashs.map((flash) => (
            <div
              key={flash.id}
              className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 hover:border-tertiary-400/50 transition-all duration-300 shadow-xl"
            >
              <div className="aspect-square relative overflow-hidden">
                <Image
                  width={500}
                  height={500}
                  src={flash.imageUrl}
                  alt={flash.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-3 sm:p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-white font-one text-sm font-bold tracking-wide truncate">
                    {flash.title}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      flash.isAvailable
                        ? "text-green-300 border-green-500/40 bg-green-500/10"
                        : "text-red-300 border-red-500/40 bg-red-500/10"
                    }`}
                  >
                    {flash.isAvailable ? "Disponible" : "Indisponible"}
                  </span>
                </div>

                <p className="text-tertiary-300 text-xs font-one font-semibold">
                  {flash.price} €
                </p>

                <p className="text-white/70 text-xs font-one line-clamp-2 leading-relaxed min-h-8">
                  {flash.description || "Aucune description"}
                </p>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    className="cursor-pointer p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200"
                    onClick={() => handleEdit(flash)}
                  >
                    <IoCreateOutline size={16} className="text-white" />
                  </button>
                  <button
                    className="cursor-pointer p-1.5 bg-white/10 rounded-lg hover:bg-red-500/20 transition-all duration-200"
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
