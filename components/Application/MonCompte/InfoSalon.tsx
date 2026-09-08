"use client";

import { UpdateSalonUserProps } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";
import DashboardButton from "@/components/Shared/DashboardButton";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  MapPin,
  Pencil,
  Plus,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { CiInstagram, CiFacebook } from "react-icons/ci";
import { PiTiktokLogoThin } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";
import { QRCodeSVG } from "qrcode.react";
import { makeCitySlug, makeSlug } from "@/lib/utils/makeLink";

const editHref = "/mon-compte/modifier-salon";
const actionClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400";

export default function InfoSalon({ salon }: { salon: UpdateSalonUserProps }) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [origin, setOrigin] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slug =
    (salon as UpdateSalonUserProps & { slug?: string }).slug ??
    makeSlug(salon.salonName);
  const path =
    salon.city && salon.postalCode
      ? `/salon/${slug}/${makeCitySlug(salon.city)}-${salon.postalCode}`
      : `/salon/${slug}`;
  const publicBase =
    process.env.NEXT_PUBLIC_FRONTENDPUBLIC_URL?.replace(/\/$/, "") || origin;
  const publicHref = publicBase + path;
  const address = [
    salon.address,
    [salon.postalCode, salon.city].filter(Boolean).join(" "),
  ]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
  const essentials = [
    { label: "Photo de profil", complete: Boolean(salon.profileImage) },
    { label: "Prestations", complete: Boolean(salon.prestations?.length) },
    {
      label: "Adresse complète",
      complete: Boolean(
        salon.address?.trim() && salon.city?.trim() && salon.postalCode?.trim(),
      ),
    },
  ];
  const completed = essentials.filter((item) => item.complete).length;
  const socials = [
    {
      href: salon.instagram,
      label: "Instagram",
      icon: <CiInstagram size={22} />,
    },
    { href: salon.facebook, label: "Facebook", icon: <CiFacebook size={22} /> },
    {
      href: salon.tiktok,
      label: "TikTok",
      icon: <PiTiktokLogoThin size={21} />,
    },
    { href: salon.website, label: "Site web", icon: <TfiWorld size={18} /> },
  ];

  useEffect(() => {
    setOrigin(window.location.origin);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copyLink = async () => {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(
        new URL(publicHref, window.location.origin).href,
      );
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    timer.current = setTimeout(() => setCopyStatus("idle"), 4000);
  };

  return (
    <div className="grid w-full items-stretch gap-5 font-one xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
      <section
        aria-labelledby="salon-identity"
        className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]"
      >
        <div className="relative h-40 xl:flex-1 xl:min-h-52 bg-[radial-gradient(ellipse_at_top_right,rgba(255,157,0,0.2),transparent_65%)] sm:h-52">
          {salon.image && (
            <Image
              fill
              src={salon.image}
              alt="Couverture du salon"
              sizes="(min-width: 1280px) 70vw, 100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-noir-700/80 to-transparent" />
          <DashboardButton
            href={editHref}
            variant="secondary"
            className="absolute right-4 top-4"
          >
            <Pencil size={14} aria-hidden="true" />
            {salon.image ? "Modifier la couverture" : "Ajouter une couverture"}
          </DashboardButton>
        </div>
        <div className="relative shrink-0 px-5 pb-6 sm:px-7">
          <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
            <div className="min-w-0 sm:flex sm:items-end sm:gap-5">
              <div className="relative -mt-10 flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-noir-700 bg-noir-500 text-3xl text-tertiary-400 sm:size-28">
                {salon.profileImage ? (
                  <Image
                    fill
                    src={salon.profileImage}
                    alt={`Photo de profil de ${salon.salonName}`}
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <span aria-label="Photo de profil non renseignée">
                    {salon.salonName?.trim().charAt(0).toUpperCase() || "S"}
                  </span>
                )}
              </div>
              <div className="min-w-0 pt-4 sm:pt-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h2
                    id="salon-identity"
                    className="min-w-0 break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl"
                  >
                    {salon.salonName || "Votre salon"}
                  </h2>
                  {salon.verifiedSalon && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                      <ShieldCheck size={14} aria-hidden="true" />
                      Vérifié
                    </span>
                  )}
                </div>
                <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-white/60">
                  <MapPin
                    size={16}
                    className="mt-1 shrink-0"
                    aria-hidden="true"
                  />
                  {address || "Ajoutez l’adresse de votre salon"}
                </p>
              </div>
            </div>
            <DashboardButton href={editHref} variant="secondary">
              <Pencil size={15} aria-hidden="true" />
              Modifier le profil
            </DashboardButton>
          </div>
        </div>
      </section>
      <section
        aria-labelledby="public-profile-title"
        className="min-w-0 rounded-3xl border border-tertiary-400/20 bg-gradient-to-b from-tertiary-400/[0.07] to-white/[0.02] p-5 sm:p-6"
      >
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-tertiary-400/10 text-tertiary-400">
          <QrCode size={20} aria-hidden="true" />
        </div>
        <h3
          id="public-profile-title"
          className="text-lg font-semibold text-white"
        >
          Votre profil public
        </h3>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Un lien à partager pour faire découvrir votre salon.
        </p>
        <DashboardButton
          href={publicHref}
          variant="secondary"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 min-h-10 w-full min-w-0"
        >
          Voir mon profil public
          <ArrowUpRight size={17} aria-hidden="true" />
          <span className="sr-only"> (nouvel onglet)</span>
        </DashboardButton>
        <div className="mt-4 rounded-xl border border-white/10 bg-black/15 p-3">
          <p className="mb-1 text-xs text-white/50">Lien du profil</p>
          <p className="break-all text-xs leading-5 text-white/70">
            {publicHref}
          </p>
        </div>
        <button
          type="button"
          onClick={copyLink}
          className={`${actionClass} mt-2 w-full cursor-pointer border border-white/10 text-white/80 hover:bg-white/5`}
        >
          {copyStatus === "copied" ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Copy size={16} aria-hidden="true" />
          )}
          {copyStatus === "copied" ? "Lien copié" : "Copier le lien"}
        </button>
        <p
          role="status"
          className={
            copyStatus === "error"
              ? "mt-2 text-xs leading-5 text-amber-300"
              : "sr-only"
          }
        >
          {copyStatus === "error"
            ? "La copie a échoué. Vous pouvez sélectionner le lien ci-dessus."
            : copyStatus === "copied"
              ? "Le lien a été copié dans le presse-papiers."
              : ""}
        </p>
        <details className="group mt-4 border-t border-white/10 pt-4">
          <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 text-sm text-white/70 focus-visible:outline-2 focus-visible:outline-tertiary-400 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <QrCode size={16} aria-hidden="true" />
              Partager par QR code
            </span>
            <Plus
              size={16}
              className="transition-transform group-open:rotate-45"
              aria-hidden="true"
            />
          </summary>
          <div className="pt-4 text-center">
            {publicBase && (
              <div className="mx-auto w-fit rounded-2xl bg-white p-3">
                <QRCodeSVG
                  value={publicHref}
                  size={176}
                  includeMargin
                  level="M"
                  title="QR code du profil public du salon"
                />
              </div>
            )}
            <p className="mt-3 text-xs leading-5 text-white/50">
              À scanner pour accéder directement à votre profil.
            </p>
          </div>
        </details>
      </section>
      {completed < essentials.length && (
        <section
          aria-labelledby="profile-completion"
          className="xl:col-span-2 rounded-2xl border border-tertiary-400/20 bg-tertiary-400/[0.04] p-5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h3
              id="profile-completion"
              className="text-base font-semibold text-white"
            >
              Complétez votre vitrine
            </h3>
            <span className="shrink-0 text-xs text-white/60">
              {completed} / {essentials.length}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Les informations essentielles pour présenter votre salon aux
            clients.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {essentials.map((item) =>
              item.complete ? (
                <span
                  key={item.label}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/5 px-3 text-sm text-white/60"
                >
                  <Check
                    size={14}
                    className="text-emerald-300"
                    aria-hidden="true"
                  />
                  {item.label}
                  <span className="sr-only"> : renseigné</span>
                </span>
              ) : (
                <Link
                  key={item.label}
                  href={editHref}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-tertiary-400/20 px-3 text-sm text-tertiary-400 hover:bg-tertiary-400/10"
                >
                  <Plus size={14} aria-hidden="true" />
                  {item.label}
                  <span className="sr-only"> : à compléter</span>
                </Link>
              ),
            )}
          </div>
        </section>
      )}
      <section
        aria-labelledby="salon-presentation"
        className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]"
      >
        <div className="flex-1 p-5 sm:p-7">
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-tertiary-400">
            Votre univers
          </p>
          <h3
            id="salon-presentation"
            className="text-xl font-semibold text-white"
          >
            À propos du salon
          </h3>
          {salon.description?.trim() ? (
            <p className="mt-4  whitespace-pre-line break-words text-sm leading-7 text-white/75 sm:text-sm">
              {salon.description}
            </p>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-white/15 p-5">
              <p className="text-sm leading-6 text-white/60">
                Présentez votre histoire, votre approche et ce qui rend votre
                salon unique.
              </p>
              <Link
                href={editHref}
                className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm text-tertiary-400 hover:underline"
              >
                <Plus size={15} aria-hidden="true" />
                Ajouter une présentation
              </Link>
            </div>
          )}
        </div>
        <div className="grid border-t border-white/10 md:grid-cols-2">
          {[
            {
              title: "Prestations",
              values: salon.prestations,
              empty: "Ajoutez les prestations proposées au salon.",
            },
            {
              title: "Styles de tatouage",
              values: salon.style,
              empty:
                "Précisez vos styles pour aider les clients à vous choisir.",
            },
          ].map(({ title, values, empty }, index) => (
            <div
              key={title}
              className={`min-w-0 p-5 sm:p-7 ${index === 1 ? "border-t border-white/10 md:border-l md:border-t-0" : ""}`}
            >
              <h4 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                {title}
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-normal text-white/50">
                  {values?.length || 0}
                </span>
              </h4>
              {values?.length ? (
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => (
                    <span
                      key={value}
                      className="max-w-full break-words rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/75"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              ) : (
                <Link
                  href={editHref}
                  className="block text-sm leading-6 text-white/60 hover:text-tertiary-400"
                >
                  {empty}
                  <span className="mt-2 block text-tertiary-400">
                    Compléter →
                  </span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
      <section
        aria-labelledby="salon-socials"
        className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
      >
        <h3 id="salon-socials" className="text-lg font-semibold text-white">
          Retrouvez-nous en ligne
        </h3>
        <div className="mt-4 divide-y divide-white/8">
          {socials.map(({ href, label, icon }) => (
            <Link
              key={label}
              href={href || editHref}
              target={href ? "_blank" : undefined}
              rel={href ? "noopener noreferrer" : undefined}
              className="flex min-h-14 items-center gap-3 py-3 text-sm text-white/70 transition-colors hover:text-tertiary-400"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5"
                aria-hidden="true"
              >
                {icon}
              </span>
              <span className="flex-1">{label}</span>
              {href ? (
                <>
                  <ArrowUpRight size={16} aria-hidden="true" />
                  <span className="sr-only">Ouvrir dans un nouvel onglet</span>
                </>
              ) : (
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <Plus size={13} aria-hidden="true" />
                  Ajouter
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
