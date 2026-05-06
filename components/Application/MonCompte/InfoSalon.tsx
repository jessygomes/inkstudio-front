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

  console.log("SALON INFO:", salon);

  return (
    <div className="space-y-3">
      {/* Identité salon */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="relative h-44 sm:h-56 lg:h-64">
          {salon.image ? (
            <Image
              fill
              src={salon.image}
              alt="Banniere du salon"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-white/10 via-white/5 to-white/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/20" />
        </div>

        <div className="relative px-3 pb-3 pt-0 sm:px-4 sm:pb-4">
          <div className="-mt-10 flex items-end gap-3 sm:-mt-11">
            <div className="relative h-[96px] w-[96px] overflow-hidden rounded-full border-2 border-white/20 bg-black/40 shadow-xl sm:h-26 sm:w-26">
              {salon.profileImage ? (
                <Image
                  fill
                  src={salon.profileImage}
                  alt="Photo de profil du salon"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <h2 className="truncate text-base font-bold text-white font-one sm:text-lg">
                {salon.salonName}
              </h2>
              <p className="mt-0.5 truncate text-xs text-white/70 font-two">
                {salon.address}, {salon.postalCode} {salon.city}
              </p>
            </div>

            <Link
              href="/mon-compte/modifier-salon"
              className="cursor-pointer flex-shrink-0 rounded-[14px] bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all duration-300 hover:from-tertiary-500 hover:to-tertiary-600 font-one"
            >
              Modifier
            </Link>
          </div>
        </div>
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
