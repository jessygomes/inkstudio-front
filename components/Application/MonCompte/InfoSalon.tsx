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
    <div className="space-y-3">
      {/* Identité salon */}
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
          {salon.image ? (
            <Image
              width={56}
              height={56}
              src={salon.image}
              alt="Salon Image"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xl">📸</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-white text-base font-one font-bold truncate">
            {salon.salonName}
          </h2>
          <p className="text-white/55 font-two text-xs mt-0.5 truncate">
            {salon.address}, {salon.postalCode} {salon.city}
          </p>
        </div>
        <Link
          href="/mon-compte/modifier-salon"
          className="cursor-pointer flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-[14px] transition-all duration-300 font-medium font-one text-xs shadow-lg"
        >
          <span className="hidden sm:inline">Modifier</span>
          <span className="sm:hidden">Modifier</span>
        </Link>
      </div>

      {/* Description */}
      {salon.description && (
        <div className=" rounded-xl px-3 py-2.5 border border-white/8">
          <p className="text-white/50 font-one text-[10px] uppercase tracking-wider mb-1">Description</p>
          <p className="text-white/85 font-two text-xs leading-relaxed">{salon.description}</p>
        </div>
      )}

      {/* Prestations + Réseaux */}
      {((salon.prestations && salon.prestations.length > 0) ||
        salon.instagram || salon.facebook || salon.tiktok || salon.website) && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {salon.prestations && salon.prestations.length > 0 && (
            <div>
              <p className="text-white/50 font-one text-[10px] uppercase tracking-wider mb-1.5">Prestations</p>
              <div className="flex flex-wrap gap-1.5">
                {salon.prestations.map((prestation) => (
                  <span
                    key={prestation}
                    className="rounded-[10px] border border-white/10 bg-white/6 px-2 py-0.5 text-white/80 font-one text-xs"
                  >
                    {prestation}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(salon.instagram || salon.facebook || salon.tiktok || salon.website) && (
            <div>
              <p className="text-white/50 font-one text-[10px] uppercase tracking-wider mb-1.5">Réseaux</p>
              <div className="flex flex-wrap gap-1.5">
                {salon.instagram && (
                  <Link href={salon.instagram} target="_blank"
                    className="flex items-center gap-1.5 font-one px-2 py-1 bg-pink-500/15 text-pink-300 border border-pink-500/25 rounded-[10px] text-xs hover:bg-pink-500/25 transition-colors">
                    <CiInstagram size={14} /> <span className="hidden sm:inline">Instagram</span>
                  </Link>
                )}
                {salon.facebook && (
                  <Link href={salon.facebook} target="_blank"
                    className="flex items-center gap-1.5 font-one px-2 py-1 bg-blue-500/15 text-blue-300 border border-blue-500/25 rounded-[10px] text-xs hover:bg-blue-500/25 transition-colors">
                    <CiFacebook size={14} /> <span className="hidden sm:inline">Facebook</span>
                  </Link>
                )}
                {salon.tiktok && (
                  <Link href={salon.tiktok} target="_blank"
                    className="flex items-center gap-1.5 font-one px-2 py-1 bg-white/8 text-white/70 border border-white/15 rounded-[10px] text-xs hover:bg-white/12 transition-colors">
                    <PiTiktokLogoThin size={14} /> <span className="hidden sm:inline">TikTok</span>
                  </Link>
                )}
                {salon.website && (
                  <Link href={salon.website} target="_blank"
                    className="flex items-center gap-1.5 font-one px-2 py-1 bg-green-500/15 text-green-300 border border-green-500/25 rounded-[10px] text-xs hover:bg-green-500/25 transition-colors">
                    <TfiWorld size={13} /> <span className="hidden sm:inline">Site Web</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profil public */}
      <div className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/8">
        <p className="text-white/50 font-one text-[10px] uppercase tracking-wider mb-1.5">Profil public</p>
        <div className="flex items-center gap-2">
          <p className="flex-1 text-white/60 font-one text-[12px] truncate">
            {publicProfileHref}
          </p>
          <div className="relative flex-shrink-0">
            <button
              onClick={handleCopyLink}
              className="cursor-pointer rounded-[10px] border border-white/15 bg-white/8 p-1.5 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
              title="Copier le lien"
            >
              <IoCopy size={13} />
            </button>
            {copied && (
              <div className="absolute bottom-full right-0 mb-1.5 bg-tertiary-500 text-white px-2 py-1 rounded-lg text-[12px] font-one whitespace-nowrap z-10">
                Lien copié !
              </div>
            )}
          </div>
        </div>
        <Link
          href={publicProfileHref}
          target="_blank"
          className="text-white text-[12px] font-one hover:underline mt-1 inline-block"
        >
          Voir mon profil public →
        </Link>
      </div>


    </div>
  );
}
