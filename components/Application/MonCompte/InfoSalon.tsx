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
        <div className="relative w-full lg:w-[250px] h-[250px] rounded-2xl overflow-hidden bg-white/10 flex-shrink-0">
          {salon.image ? (
            <Image
              width={250}
              height={250}
              src={salon.image}
              alt="Salon Image"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-4xl">📸</div>
                <span className="text-white/60 font-two text-sm">
                  Aucune image
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-white/70 font-one">
              Nom du salon
            </label>
            <h1 className="text-white text-2xl font-one font-bold">
              {salon.salonName}
            </h1>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/70 font-one">Adresse</label>
            <p className="text-white font-two text-sm">
              {salon.address}, {salon.postalCode} {salon.city}
            </p>
          </div>

          {salon.description && (
            <div className="space-y-1">
              <label className="text-xs text-white/70 font-one">
                Description
              </label>
              <p className="text-white font-two text-sm">{salon.description}</p>
            </div>
          )}

          {/* Réseaux sociaux */}
          {(salon.instagram ||
            salon.facebook ||
            salon.tiktok ||
            salon.website) && (
            <div className="space-y-2">
              <label className="text-xs text-white/70 font-one">
                Réseaux sociaux
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {salon.instagram && (
                  <Link
                    href={salon.instagram}
                    target="_blank"
                    className="flex items-center gap-2 font-one px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white border border-pink-500/30 rounded-full text-xs hover:bg-pink-500/30 transition-colors"
                  >
                    <CiInstagram size={15} /> Instagram
                  </Link>
                )}
                {salon.facebook && (
                  <Link
                    href={salon.facebook}
                    target="_blank"
                    className="flex items-center gap-2 font-one px-3 py-1 bg-blue-500/20 text-white border border-blue-500/30 rounded-full text-xs hover:bg-blue-500/30 transition-colors"
                  >
                    <CiFacebook size={15} /> Facebook
                  </Link>
                )}
                {salon.tiktok && (
                  <Link
                    href={salon.tiktok}
                    target="_blank"
                    className="flex items-center gap-2 font-one px-3 py-1 bg-gray-500/20 text-white border border-gray-500/30 rounded-full text-xs hover:bg-gray-500/30 transition-colors"
                  >
                    <PiTiktokLogoThin size={15} /> TikTok
                  </Link>
                )}
                {salon.website && (
                  <Link
                    href={salon.website}
                    target="_blank"
                    className="flex items-center gap-2 font-one px-3 py-1 bg-green-500/20 text-white border border-green-500/30 rounded-full text-xs hover:bg-green-500/30 transition-colors"
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
          className="px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs"
        >
          Modifier
        </Link>
      </div>
    </div>
  );
}
