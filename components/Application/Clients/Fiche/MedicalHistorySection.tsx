"use client";
import React from "react";
import { RiHealthBookLine } from "react-icons/ri";
import { ClientProps } from "@/lib/type";

interface MedicalHistorySectionProps {
  medicalHistory: ClientProps["medicalHistory"] | undefined;
}

export default function MedicalHistorySection({
  medicalHistory,
}: MedicalHistorySectionProps) {
  const cardClass =
    "rounded-2xl border border-white/10 bg-white/5 p-3 shadow-sm shadow-black/10";
  const labelClass = "mb-1 text-[11px] uppercase tracking-wide text-white/55 font-one";

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/6 to-white/[0.02] p-4 shadow-lg shadow-black/10">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-tertiary-400/30 bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/10">
            <RiHealthBookLine className="h-5 w-5 text-tertiary-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold uppercase tracking-wide text-white font-one">
              Historique médical
            </h3>
            <p className="text-xs text-white/55 font-two">
              Informations sensibles et antécédents déclarés
            </p>
          </div>
        </div>

        <div
          className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold font-one ${
            medicalHistory?.pregnancy
              ? "border-yellow-400/40 bg-yellow-500/10 text-yellow-200"
              : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {medicalHistory
            ? medicalHistory.pregnancy
              ? "Attention"
              : "RAS"
            : "Vide"}
        </div>
      </div>

      {medicalHistory ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className={cardClass}>
              <p className={labelClass}>Allergies</p>
              <p className="text-sm text-white font-two break-words">
                {medicalHistory.allergies || "Aucune allergie connue"}
              </p>
            </div>

            <div className={cardClass}>
              <p className={labelClass}>Problèmes de santé</p>
              <p className="text-sm text-white font-two break-words">
                {medicalHistory.healthIssues || "Aucun problème signalé"}
              </p>
            </div>

            <div className={cardClass}>
              <p className={labelClass}>Médicaments</p>
              <p className="text-sm text-white font-two break-words">
                {medicalHistory.medications || "Aucun médicament"}
              </p>
            </div>

            <div className={cardClass}>
              <p className={labelClass}>Historique tatouages</p>
              <p className="text-sm text-white font-two break-words">
                {medicalHistory.tattooHistory || "Aucun historique de tatouage"}
              </p>
            </div>

            <div className={cardClass}>
              <p className={labelClass}>Réactions antérieures</p>
              <p className="text-sm text-white font-two break-words">
                {medicalHistory.previousReactions || "Aucune réaction signalée"}
              </p>
            </div>

            <div
              className={`rounded-2xl border p-3 ${
                medicalHistory.pregnancy
                  ? "border-yellow-400/40 bg-yellow-500/10"
                  : "border-emerald-400/40 bg-emerald-500/10"
              }`}
            >
              <p className={labelClass}>Grossesse / Allaitement</p>
              <p
                className={`text-sm font-semibold ${
                  medicalHistory.pregnancy
                    ? "text-yellow-200"
                    : "text-emerald-200"
                }`}
              >
                {medicalHistory.pregnancy
                  ? "Attention: enceinte ou allaite actuellement"
                  : "Aucun signalement"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-10 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-tertiary-400/20 bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/10">
            <RiHealthBookLine className="h-6 w-6 text-tertiary-300" />
          </div>
          <p className="text-sm text-white/65 font-one">
            Aucune information médicale disponible
          </p>
          <p className="mt-1 text-xs text-white/45 font-two">
            Les champs seront affichés dès qu’un historique est enregistré.
          </p>
        </div>
      )}
    </div>
  );
}
