"use client";
import React from "react";
import { FileCheck2, Tag, UserRound } from "lucide-react";
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
  const statusBadgeClass =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold font-one";

  return (
    <div className="client-info-base rounded-2xl border border-white/10 p-3.5 shadow-lg sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserRound size={15} className="text-tertiary-300" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50 font-one">Informations essentielles</p>
        </div>
        <span className="text-[10px] text-white/30 font-one">{fullName}</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-3">
        <div className="client-info-card lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <MailIcon />
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45 font-one">Coordonnées</p>
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <InfoItem label="Email" value={client.email} breakAll />
            <InfoItem label="Téléphone" value={client.phone || "Non renseigné"} />
            <InfoItem label="Date de naissance" value={formatDate(client.birthDate)} />
            <InfoItem label="Adresse" value={client.address || "Non renseignée"} breakAll />
          </div>
        </div>

        <div className="client-info-card">
          <div className="mb-3 flex items-center gap-2">
            <ShieldIcon />
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45 font-one">Statut</p>
          </div>
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

        <div className="client-info-card lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <FileCheck2 size={14} className="text-emerald-300" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45 font-one">Consentement</p>
          </div>
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
              className="inline-flex items-center rounded-xl border border-tertiary-400/35 bg-tertiary-500/10 px-3 py-1.5 text-xs font-one text-tertiary-500 transition-colors hover:bg-tertiary-500/20"
            >
              Ouvrir le PDF de consentement
            </a>
          ) : (
            <p className="text-sm text-white/65 font-two">Aucun PDF renseigné</p>
          )}
        </div>

        <div className="client-info-card">
          <div className="mb-3 flex items-center gap-2">
            <UserRound size={14} className="text-amber-300" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45 font-one">Tuteur légal</p>
          </div>
          <p className="text-sm text-white font-two break-words">
            {client.guardianName
              ? `${client.guardianName}${client.guardianPhone ? ` - ${client.guardianPhone}` : ""}`
              : "Non renseigné"}
          </p>
        </div>

        <div className="client-info-card lg:col-span-3">
          <div className="mb-3 flex items-center gap-2">
            <Tag size={14} className="text-tertiary-300" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45 font-one">Tags client</p>
          </div>
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

function InfoItem({ label, value, breakAll = false }: { label: string; value: string; breakAll?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-white/35 font-one">{label}</p>
      <p className={`mt-0.5 text-xs font-medium text-white/85 font-two ${breakAll ? "break-all" : "break-words"}`}>{value}</p>
    </div>
  );
}

function MailIcon() {
  return <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">@</span>;
}

function ShieldIcon() {
  return <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300"><FileCheck2 size={13} /></span>;
}
