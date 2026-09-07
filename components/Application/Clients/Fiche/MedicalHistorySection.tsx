"use client";
import React from "react";
import { AlertTriangle, HeartPulse, Pill, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { ClientProps } from "@/lib/type";

interface MedicalHistorySectionProps {
  medicalHistory: ClientProps["medicalHistory"] | undefined;
}

export default function MedicalHistorySection({
  medicalHistory,
}: MedicalHistorySectionProps) {
  const cardClass =
    "rounded-2xl border border-white/[0.08] bg-black/10 p-4 transition-colors hover:border-white/15 hover:bg-white/[0.025]";
  const labelClass = "mb-1 text-[11px] uppercase tracking-wide text-white/55 font-one";

  return (
    <section aria-label="Informations de santé">
      {medicalHistory && <div className="mb-3 flex justify-end"><div
          className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold font-one ${
            medicalHistory?.pregnancy
              ? "border-yellow-400/40 bg-yellow-500/10 text-yellow-200"
              : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {medicalHistory.pregnancy ? "Vigilance requise" : "Aucun risque signalé"}
        </div></div>}
      {medicalHistory ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            <div className={cardClass}>
              <p className={`${labelClass} flex items-center gap-2`}><AlertTriangle size={13} className="text-amber-300" />Allergies</p>
              <p className="text-sm text-white font-two break-words">
                {medicalHistory.allergies || "Aucune allergie connue"}
              </p>
            </div>

            <div className={cardClass}>
              <p className={`${labelClass} flex items-center gap-2`}><Stethoscope size={13} className="text-tertiary-400" />Problèmes de santé</p>
              <p className="text-sm text-white font-two break-words">
                {medicalHistory.healthIssues || "Aucun problème signalé"}
              </p>
            </div>

            <div className={cardClass}>
              <p className={`${labelClass} flex items-center gap-2`}><Pill size={13} className="text-blue-300" />Médicaments</p>
              <p className="text-sm text-white font-two break-words">
                {medicalHistory.medications || "Aucun médicament"}
              </p>
            </div>

            <div className={cardClass}>
              <p className={`${labelClass} flex items-center gap-2`}><Sparkles size={13} className="text-tertiary-400" />Historique tatouages</p>
              <p className="text-sm text-white font-two break-words">
                {medicalHistory.tattooHistory || "Aucun historique de tatouage"}
              </p>
            </div>

            <div className={cardClass}>
              <p className={`${labelClass} flex items-center gap-2`}><ShieldCheck size={13} className="text-emerald-300" />Réactions antérieures</p>
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
            <HeartPulse className="h-6 w-6 text-tertiary-300" />
          </div>
          <p className="text-sm text-white/65 font-one">
            Aucune information médicale disponible
          </p>
          <p className="mt-1 text-xs text-white/45 font-two">
            Les champs seront affichés dès qu’un historique est enregistré.
          </p>
        </div>
      )}
    </section>
  );
}
