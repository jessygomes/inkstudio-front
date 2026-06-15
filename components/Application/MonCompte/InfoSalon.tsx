"use client";
import { UpdateSalonUserProps } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { CiInstagram, CiFacebook } from "react-icons/ci";
import { PiTiktokLogoThin } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";
import { IoCopy } from "react-icons/io5";
import { QRCodeSVG } from "qrcode.react";
import { makeCitySlug, makeSlug } from "@/lib/utils/makeLink";
import DashboardButton from "@/components/Shared/DashboardButton";

interface InfoSalonProps {
  salon: UpdateSalonUserProps;
}

export default function InfoSalon({ salon }: InfoSalonProps) {
  const [copied, setCopied] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const emptyFieldLabel = "Non renseigné";
  const hasProfileImage = Boolean(salon.profileImage);
  const hasPrestations = Boolean(salon.prestations && salon.prestations.length > 0);
  const hasAddress = Boolean(
    salon.address?.trim() && salon.city?.trim() && salon.postalCode?.trim(),
  );
  const shouldShowDirectoryIncompleteNotice =
    !hasProfileImage && !hasPrestations && !hasAddress;
  const salonWithMaybeSlug = salon as UpdateSalonUserProps & { slug?: string };
  const salonSlug = salonWithMaybeSlug.slug ?? makeSlug(salon.salonName);
  const publicProfilePath =
    salon?.city && salon?.postalCode
      ? `/salon/${salonSlug}/${makeCitySlug(salon.city)}-${salon.postalCode}`
      : `/salon/${salonSlug}`;
  const frontendPublicUrl = process.env.NEXT_PUBLIC_FRONTENDPUBLIC_URL?.replace(
    /\/$/,
    ""
  );
  const locationLine = [salon.address, salon.postalCode, salon.city]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
  const socialLinks = [
    {
      href: salon.instagram,
      label: "Instagram",
      icon: <CiInstagram size={14} />,
      className:
        "border-pink-500/25 bg-pink-500/15 text-pink-300 hover:bg-pink-500/25",
    },
    {
      href: salon.facebook,
      label: "Facebook",
      icon: <CiFacebook size={14} />,
      className:
        "border-blue-500/25 bg-blue-500/15 text-blue-300 hover:bg-blue-500/25",
    },
    {
      href: salon.tiktok,
      label: "TikTok",
      icon: <PiTiktokLogoThin size={14} />,
      className:
        "border-white/15 bg-white/8 text-white/70 hover:bg-white/12",
    },
    {
      href: salon.website,
      label: "Site web",
      icon: <TfiWorld size={13} />,
      className:
        "border-green-500/25 bg-green-500/15 text-green-300 hover:bg-green-500/25",
    },
  ] as Array<{
    href?: string;
    label: string;
    icon: React.ReactNode;
    className: string;
  }>;

  const publicProfileHref = frontendPublicUrl
    ? `${frontendPublicUrl}${publicProfilePath}`
    : publicProfilePath;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileHref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isQrModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isQrModalOpen]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
        <div className="relative h-48 sm:h-56 lg:h-64">
          {salon.image ? (
            <Image
              fill
              src={salon.image}
              alt="Banniere du salon"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center  px-4 text-center">
              <p className="mt-2 text-[10px] leading-relaxed text-white/45 font-two">
                Aucune image de couverture
              </p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-noir-700 via-black/35 to-black/10" />
        </div>

        <div className="relative px-4 pb-4 pt-0 sm:px-5 sm:pb-5 lg:px-6">
          <div className="-mt-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative mx-auto h-[104px] w-[104px] overflow-hidden rounded-[26px] border border-white/20 bg-black/35 shadow-2xl sm:mx-0 sm:h-[118px] sm:w-[118px]">
                {salon.profileImage ? (
                  <Image
                    fill
                    src={salon.profileImage}
                    alt="Photo de profil du salon"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] px-3 text-center">
                    <p className="mt-2 text-[10px] leading-relaxed text-white/45 font-two">
                      Aucune image de profil
                    </p>
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h2 className="truncate text-lg font-bold text-white font-one sm:text-xl">
                    {salon.salonName}
                  </h2>
                  {salon.verifiedSalon === true && (
                    <span className="inline-flex items-center rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200 font-one">
                      Vérifié
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/72 font-two">
                  {locationLine || emptyFieldLabel}
                </p>
              </div>
            </div>

            <DashboardButton
              href="/mon-compte/modifier-salon"
              className="min-w-0 self-center px-3 py-1.5 text-xs lg:self-auto"
            >
              Modifier
            </DashboardButton>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] xl:items-stretch">

        
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {shouldShowDirectoryIncompleteNotice && (
              <div className="mb-0 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 md:col-span-2">
                <p className="text-sm leading-relaxed text-amber-100/92 font-two">
                  Votre profil public sera affiché dans l&apos;annuaire quand vous aurez
                  ajouté votre <strong>photo de profil</strong>, au moins une <strong>prestation</strong>,
                  votre <strong>adresse complète</strong>.
                </p>
              </div>
            )}

            <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-4 md:col-span-2">
              <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/45 font-one">
                Description
              </p>
              <p className="text-xs leading-relaxed text-white/82 font-two">
                {salon.description?.trim() || emptyFieldLabel}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45 font-one">
                  Prestations
                </p>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/60 font-one">
                  {salon.prestations?.length ?? 0}
                </span>
              </div>
              {hasPrestations ? (
                <div className="flex flex-wrap gap-1.5">
                  {salon.prestations?.map((prestation) => (
                    <span
                      key={prestation}
                      className="rounded-2xl border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs text-white/82 font-one"
                    >
                      {prestation}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/55 font-two">Aucune prestation renseignée</p>
              )}
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45 font-one">
                  Styles
                </p>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/60 font-one">
                  {salon.style?.length ?? 0}
                </span>
              </div>
              {salon.style && salon.style.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {salon.style.map((style) => (
                    <span
                      key={style}
                      className="rounded-2xl border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs text-white/82 font-one"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/55 font-two">Aucun style renseigné</p>
              )}
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-4 md:col-span-2">
              <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/45 font-one">
                Réseaux et liens
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {socialLinks.map((socialLink) =>
                  socialLink.href ? (
                    <Link
                      key={socialLink.label}
                      href={socialLink.href}
                      target="_blank"
                      className={`inline-flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-xs font-one transition-colors ${socialLink.className}`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {socialLink.icon}
                        <span>{socialLink.label}</span>
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-current/80">Ouvrir</span>
                    </Link>
                  ) : (
                    <div
                      key={socialLink.label}
                      className="inline-flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55 font-one"
                    >
                      <span className="inline-flex items-center gap-1.5 text-white/72">
                        {socialLink.icon}
                        <span>{socialLink.label}</span>
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-white/40">{emptyFieldLabel}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-full flex-col rounded-[24px] border border-white/8 bg-white/[0.04] p-4 sm:p-5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/45 font-one">
            Profil public
          </p>

         

          <div className="mt-0 flex flex-1 flex-col space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-white/40 font-one">
                URL publique
              </p>
              <p className="break-all text-xs text-white/78 font-two">
                {publicProfileHref}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button
                  onClick={handleCopyLink}
                  className="cursor-pointer rounded-2xl border border-white/15 bg-white/8 px-2.5 py-1.5 text-xs text-white/80 font-one transition-colors hover:bg-white/15 hover:text-white"
                  title="Copier le lien"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <IoCopy size={13} />
                    Copier le lien
                  </span>
                </button>
                {copied && (
                  <div className="absolute -top-9 left-0 z-10 whitespace-nowrap rounded-2xl bg-tertiary-500 px-2 py-1 text-xs text-white font-one">
                    Lien copié !
                  </div>
                )}
              </div>

              <Link
                href={publicProfileHref}
                target="_blank"
                className="inline-flex items-center rounded-2xl border border-tertiary-400/30 bg-tertiary-500/15 px-2.5 py-1.5 text-xs text-white font-one transition-colors hover:bg-tertiary-500/25"
              >
                Voir mon profil public
              </Link>

              <button
                onClick={() => setIsQrModalOpen(true)}
                className="inline-flex items-center rounded-2xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs text-white font-one transition-colors hover:bg-white/15 sm:hidden"
                title="Afficher le QR code"
              >
                QR code
              </button>
            </div>

            <div className="mt-auto hidden rounded-[22px] border border-white/10 bg-black/20 p-3 sm:block">
              <div className="mx-auto w-fit rounded-xl bg-white p-2.5 shadow-sm">
                <QRCodeSVG
                  value={publicProfileHref}
                  size={112}
                  includeMargin
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#111111"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isClient &&
        isQrModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex h-[100svh] items-center justify-center bg-black/70 p-4 sm:hidden">
            <div
              className="absolute inset-0"
              onClick={() => setIsQrModalOpen(false)}
              aria-hidden="true"
            />

            <div className="relative w-full max-w-xs rounded-2xl border border-white/15 bg-[#151515] p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-white font-one">Profil public</p>
                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-white/90 font-one"
                >
                  Fermer
                </button>
              </div>

              <div className="mx-auto w-fit rounded-xl bg-white p-3">
                <QRCodeSVG
                  value={publicProfileHref}
                  size={220}
                  includeMargin
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#111111"
                />
              </div>
            </div>
          </div>,
          document.body
        )}


    </div>
  );
}
