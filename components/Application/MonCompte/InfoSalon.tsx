"use client";
import { UpdateSalonUserProps } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";

import { CiInstagram, CiFacebook } from "react-icons/ci";
import { PiTiktokLogoThin } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";

interface InfoSalonProps {
  salon: UpdateSalonUserProps;
}

export default function InfoSalon({ salon }: InfoSalonProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative w-full lg:w-[180px] h-[180px] rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
          {salon.image ? (
            <Image
              width={180}
              height={180}
              src={salon.image}
              alt="Salon Image"
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-3xl">📸</div>
                <span className="text-white/60 font-two text-xs">
                  Aucune image
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-white text-xl font-one font-bold mb-1">
              {salon.salonName}
            </h1>
            <p className="text-white/70 font-two text-xs">
              {salon.address}, {salon.postalCode} {salon.city}
            </p>
          </div>

          {salon.description && (
            <div>
              <p className="text-white/60 font-one text-xs mb-1">Description</p>
              <p className="text-white font-two text-sm">{salon.description}</p>
            </div>
          )}

          {/* Réseaux sociaux */}
          {(salon.instagram ||
            salon.facebook ||
            salon.tiktok ||
            salon.website) && (
            <div>
              <p className="text-white/60 font-one text-xs mb-1">Réseaux</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {salon.instagram && (
                  <Link
                    href={salon.instagram}
                    target="_blank"
                    className="flex items-center gap-2 font-one px-2 py-1 bg-pink-500/20 text-white border border-pink-500/30 rounded-full text-xs hover:bg-pink-500/30 transition-colors"
                  >
                    <CiInstagram size={15} /> Instagram
                  </Link>
                )}
                {salon.facebook && (
                  <Link
                    href={salon.facebook}
                    target="_blank"
                    className="flex items-center gap-2 font-one px-2 py-1 bg-blue-500/20 text-white border border-blue-500/30 rounded-full text-xs hover:bg-blue-500/30 transition-colors"
                  >
                    <CiFacebook size={15} /> Facebook
                  </Link>
                )}
                {salon.tiktok && (
                  <Link
                    href={salon.tiktok}
                    target="_blank"
                    className="flex items-center gap-2 font-one px-2 py-1 bg-gray-500/20 text-white border border-gray-500/30 rounded-full text-xs hover:bg-gray-500/30 transition-colors"
                  >
                    <PiTiktokLogoThin size={15} /> TikTok
                  </Link>
                )}
                {salon.website && (
                  <Link
                    href={salon.website}
                    target="_blank"
                    className="flex items-center gap-2 font-one px-2 py-1 bg-green-500/20 text-white border border-green-500/30 rounded-full text-xs hover:bg-green-500/30 transition-colors"
                  >
                    <TfiWorld size={14} /> Site Web
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bouton de modification */}
      <div className="flex justify-end pt-4 border-t border-white/10">
        <Link
          href="/mon-compte/modifier-salon"
          className="cursor-pointer w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
        >
          Modifier les informations
        </Link>
      </div>
    </div>
  );
}
