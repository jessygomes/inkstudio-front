"use client";
import { UpdateSalonUserProps } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { CiInstagram, CiFacebook } from "react-icons/ci";
import { PiTiktokLogoThin } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";
import { IoCopy } from "react-icons/io5";
import { makeCitySlug, makeSlug } from "@/lib/utils/makeLink";

interface InfoSalonProps {
  salon: UpdateSalonUserProps;
}

export default function InfoSalon({ salon }: InfoSalonProps) {
  const [copied, setCopied] = useState(false);
  const salonWithMaybeSlug = salon as UpdateSalonUserProps & { slug?: string };
  const salonSlug = salonWithMaybeSlug.slug ?? makeSlug(salon.salonName);

  const publicProfileHref =
    salon?.city && salon?.postalCode
      ? `${
          process.env.NEXT_PUBLIC_FRONTENDPUBLIC_URL
        }/salon/${salonSlug}/${makeCitySlug(salon.city)}-${salon.postalCode}`
      : `/salon/${salonSlug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileHref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
    }
  };

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

          {salon.prestations && salon.prestations.length > 0 && (
            <div>
              <p className="text-white/60 font-one text-xs mb-1">Prestations</p>
              <ul className="text-white font-one flex gap-2 text-xs">
                {salon.prestations.map((prestation) => (
                  <li
                    className="bg-white/5 px-2 py-1 rounded-lg"
                    key={prestation}
                  >
                    {prestation}
                  </li>
                ))}
              </ul>
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
                    className="flex items-center gap-2 font-one px-2 py-1 bg-pink-500/20 text-white border border-pink-500/30 rounded-lg text-xs hover:bg-pink-500/30 transition-colors"
                  >
                    <CiInstagram size={15} /> Instagram
                  </Link>
                )}
                {salon.facebook && (
                  <Link
                    href={salon.facebook}
                    target="_blank"
                    className="flex items-center gap-2 font-one px-2 py-1 bg-blue-500/20 text-white border border-blue-500/30 rounded-lg text-xs hover:bg-blue-500/30 transition-colors"
                  >
                    <CiFacebook size={15} /> Facebook
                  </Link>
                )}
                {salon.tiktok && (
                  <Link
                    href={salon.tiktok}
                    target="_blank"
                    className="flex items-center gap-2 font-one px-2 py-1 bg-gray-500/20 text-white border border-gray-500/30 rounded-lg text-xs hover:bg-gray-500/30 transition-colors"
                  >
                    <PiTiktokLogoThin size={15} /> TikTok
                  </Link>
                )}
                {salon.website && (
                  <Link
                    href={salon.website}
                    target="_blank"
                    className="flex items-center gap-2 font-one px-2 py-1 bg-green-500/20 text-white border border-green-500/30 rounded-lg text-xs hover:bg-green-500/30 transition-colors"
                  >
                    <TfiWorld size={14} /> Site Web
                  </Link>
                )}
              </div>
            </div>
          )}
          <div>
            <p className="text-white/60 font-one text-xs mb-1">Profil public</p>
            <div className="flex items-center gap-2 w-fit relative">
              <p className="bg-white/5 w-fit p-2 rounded-lg text-white break-all text-xs mb-1 font-one tracking-wide flex-1">
                {publicProfileHref}
              </p>
              <button
                onClick={handleCopyLink}
                className="cursor-pointer hover:bg-white/10 p-2 rounded-lg text-white text-xs font-one transition-colors"
                title="Copier le lien"
              >
                <IoCopy size={15} />
              </button>
              {copied && (
                <div className="absolute top-0 right-0 transform -translate-y-full -translate-x-1/2 mb-2 bg-tertiary-500 text-white p-2 rounded text-xs font-one whitespace-nowrap z-10 md:translate-y-0 md:translate-x-full md:mb-0 md:ml-4">
                  Lien copié !
                </div>
              )}
            </div>
            <Link
              href={publicProfileHref}
              target="_blank"
              className="text-tertiary-400 text-sm font-one hover:underline"
            >
              Voir mon profil public
            </Link>
          </div>
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
