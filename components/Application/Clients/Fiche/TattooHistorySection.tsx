/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { FaFilePen } from "react-icons/fa6";
import Image from "next/image";
import { TattooHistoryProps } from "@/lib/type";

interface TattooHistorySectionProps {
  tattooHistory: TattooHistoryProps[] | undefined;
}

export default function TattooHistorySection({
  tattooHistory,
}: TattooHistorySectionProps) {
  const [showTattooHistory, setShowTattooHistory] = useState(false);

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4 border border-white/10 shadow-lg">
      <button
        onClick={() => setShowTattooHistory(!showTattooHistory)}
        className="w-full flex items-center justify-between group hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 flex items-center justify-center border border-tertiary-400/30 group-hover:border-tertiary-400/50 transition-all">
            <FaFilePen size={16} className="text-tertiary-400" />
          </div>
          <h3 className="text-base font-semibold text-white font-one uppercase tracking-wide flex items-center gap-2">
            Historique tatouages
            <span className="px-2.5 py-1 bg-tertiary-400/20 border border-tertiary-400/30 rounded-md text-xs font-semibold text-tertiary-400">
              {tattooHistory?.length || 0}
            </span>
          </h3>
        </div>
        <div className="p-1 cursor-pointer bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
          {showTattooHistory ? (
            <IoChevronUp className="text-white/70 w-5 h-5" />
          ) : (
            <IoChevronDown className="text-white/70 w-5 h-5" />
          )}
        </div>
      </button>

      {showTattooHistory && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {tattooHistory && tattooHistory.length > 0 ? (
            tattooHistory.map((tattoo: TattooHistoryProps, index: number) => (
              <div
                key={tattoo.id}
                className="bg-gradient-to-br from-white/10 to-white/5 p-3 rounded-lg border border-white/20 hover:border-tertiary-400/30 transition-all duration-200"
              >
                {/* Header compact avec photo et date */}
                <div className="flex items-start justify-between gap-3 mb-2 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 border border-white/20 flex-shrink-0">
                      {tattoo.photo ? (
                        <Image
                          width={40}
                          height={40}
                          src={tattoo.photo}
                          alt="Photo du tatouage"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaFilePen className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-one font-semibold text-sm truncate">
                        Tatouage #{index + 1}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(tattoo.date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {tattoo.photo && (
                    <button
                      onClick={() => window.open(tattoo.photo, "_blank")}
                      className="cursor-pointer text-tertiary-400 hover:text-tertiary-300 text-xs font-one whitespace-nowrap"
                    >
                      Voir →
                    </button>
                  )}
                </div>

                {/* Détails compacts */}
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <span className="text-xs text-white/50 font-one min-w-[80px]">
                      Zone :
                    </span>
                    <span className="text-white/80 text-xs font-two flex-1">
                      {tattoo.zone || "Non spécifiée"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-white/50 font-one min-w-[80px]">
                      Taille :
                    </span>
                    <span className="text-white/80 text-xs font-two flex-1">
                      {tattoo.size || "Non spécifiée"}
                    </span>
                  </div>
                  {tattoo.price && (
                    <div className="flex gap-2">
                      <span className="text-xs text-white/50 font-one min-w-[80px]">
                        Prix :
                      </span>
                      <span className="text-green-400 text-xs font-two font-semibold">
                        {tattoo.price}€
                      </span>
                    </div>
                  )}
                  {tattoo.tatoueurId && (
                    <div className="flex gap-2">
                      <span className="text-xs text-white/50 font-one min-w-[80px]">
                        Tatoueur :
                      </span>
                      <span className="text-white/80 text-xs font-two">
                        {tattoo.tatoueur.name}
                      </span>
                    </div>
                  )}
                  {tattoo.healingTime && (
                    <div className="flex gap-2">
                      <span className="text-xs text-white/50 font-one min-w-[80px]">
                        Cicatrisation :
                      </span>
                      <span className="text-white/80 text-xs font-two flex-1">
                        {tattoo.healingTime}
                      </span>
                    </div>
                  )}
                  {tattoo.careProducts && (
                    <div className="flex gap-2">
                      <span className="text-xs text-white/50 font-one min-w-[80px]">
                        Soins :
                      </span>
                      <span className="text-purple-400 text-xs font-two flex-1">
                        {tattoo.careProducts}
                      </span>
                    </div>
                  )}
                  {tattoo.description && (
                    <div className="flex gap-2">
                      <span className="text-xs text-white/50 font-one min-w-[80px]">
                        Description :
                      </span>
                      <p className="text-white/80 text-xs font-two flex-1 line-clamp-2">
                        {tattoo.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-tertiary-400/20">
                <FaFilePen className="w-6 h-6 text-tertiary-400" />
              </div>
              <p className="text-white/60 text-sm font-one">
                Aucun historique de tatouage
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
