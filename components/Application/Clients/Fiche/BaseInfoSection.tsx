"use client";
import React from "react";
import { CiUser } from "react-icons/ci";
import { ClientProps } from "@/lib/type";

interface BaseInfoSectionProps {
  client: ClientProps;
}

export default function BaseInfoSection({ client }: BaseInfoSectionProps) {
  const normalizedTags = Array.isArray(client.tags)
    ? client.tags
    : client.tags
      ? client.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

  const formatDate = (value?: string | null) => {
    if (!value) return "Non renseignée";
    return new Date(value).toLocaleDateString("fr-FR");
  };

  const fullName = `${client.firstName} ${client.lastName}`;
  const initials = `${client.firstName?.[0] || ""}${client.lastName?.[0] || ""}`;
  const statusBadgeClass =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold font-one";

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/6 to-white/[0.02] p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-tertiary-400/30 bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20">
            <span className="text-sm font-bold text-white font-one">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-white font-one">
              {fullName}
            </p>
            <p className="text-xs text-white/60 font-two">Fiche client</p>
          </div>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-tertiary-400/30 bg-tertiary-500/10">
          <CiUser size={18} className="text-tertiary-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:col-span-2">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-white/80 font-one">
            Contact
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <p className="text-[11px] text-white/55 font-one">Email</p>
              <p className="text-sm text-white font-two break-all">{client.email}</p>
            </div>
            <div>
              <p className="text-[11px] text-white/55 font-one">Téléphone</p>
              <p className="text-sm text-white font-two">{client.phone || "Non renseigné"}</p>
            </div>
            <div>
              <p className="text-[11px] text-white/55 font-one">Date de naissance</p>
              <p className="text-sm text-white font-two">{formatDate(client.birthDate)}</p>
            </div>
            <div>
              <p className="text-[11px] text-white/55 font-one">Adresse</p>
              <p className="text-sm text-white font-two break-words">{client.address || "Non renseignée"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-white/80 font-one">
            Statut
          </p>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-white/55 font-one">Âge légal</span>
              <span
                className={`${statusBadgeClass} ${
                  client.isMinor
                    ? "border-amber-400/40 bg-amber-500/15 text-amber-200"
                    : "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                }`}
              >
                {client.isMinor ? "Mineur" : "Majeur"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-white/55 font-one">Marketing</span>
              <span
                className={`${statusBadgeClass} ${
                  client.marketingConsent
                    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                    : "border-white/20 bg-white/10 text-white/70"
                }`}
              >
                {client.marketingConsent ? "Accepté" : "Refusé"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:col-span-2">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-white/80 font-one">
            Consentement
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`${statusBadgeClass} ${
                client.consentSigned
                  ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                  : "border-rose-400/35 bg-rose-500/15 text-rose-200"
              }`}
            >
              {client.consentSigned ? "Signé" : "Non signé"}
            </span>
            <span className="text-xs text-white/60 font-two">
              {client.consentSignedAt
                ? `Le ${formatDate(client.consentSignedAt)}`
                : "Date non renseignée"}
            </span>
          </div>

          {client.consentFileUrl ? (
            <a
              href={client.consentFileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl border border-tertiary-400/35 bg-tertiary-500/10 px-3 py-1.5 text-xs font-one text-tertiary-200 transition-colors hover:bg-tertiary-500/20"
            >
              Ouvrir le PDF de consentement
            </a>
          ) : (
            <p className="text-sm text-white/65 font-two">Aucun PDF renseigné</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:col-span-1">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-white/80 font-one">
            Tuteur légal
          </p>
          <p className="text-sm text-white font-two break-words">
            {client.guardianName
              ? `${client.guardianName}${client.guardianPhone ? ` - ${client.guardianPhone}` : ""}`
              : "Non renseigné"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:col-span-3">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-white/80 font-one">
            Tags client
          </p>
          {normalizedTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {normalizedTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-tertiary-400/30 bg-tertiary-400/10 px-2.5 py-1 text-[11px] text-tertiary-500 tracking-widest font-one"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/65 font-two">Aucun tag enregistré</p>
          )}
        </div>
      </div>
    </div>
  );
}
