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
  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-4 border border-white/10 shadow-lg">
      <div className="space-y-4">
        {medicalHistory ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                <p className="text-xs text-white/70 font-one mb-1">
                  Allergies
                </p>
                <p className="text-white font-two text-sm break-words">
                  {medicalHistory.allergies || "Aucune allergie connue"}
                </p>
              </div>

              <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                <p className="text-xs text-white/70 font-one mb-1">
                  Problèmes de santé
                </p>
                <p className="text-white font-two text-sm break-words">
                  {medicalHistory.healthIssues ||
                    "Aucun problème de santé signalé"}
                </p>
              </div>

              <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                <p className="text-xs text-white/70 font-one mb-1">
                  Médicaments
                </p>
                <p className="text-white font-two text-sm break-words">
                  {medicalHistory.medications || "Aucun médicament"}
                </p>
              </div>

              <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                <p className="text-xs text-white/70 font-one mb-1">
                  Historique tatouages
                </p>
                <p className="text-white font-two text-sm break-words">
                  {medicalHistory.tattooHistory || "Aucun historique de tatouage"}
                </p>
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl border ${
                medicalHistory.pregnancy
                  ? "border-yellow-400/50 bg-yellow-400/10"
                  : "border-green-400/50 bg-green-400/10"
              }`}
            >
              <p className="text-xs text-white/70 font-one mb-1">
                Grossesse / Allaitement
              </p>
              <p
                className={`text-sm font-semibold ${
                  medicalHistory.pregnancy
                    ? "text-yellow-300"
                    : "text-green-300"
                }`}
              >
                {medicalHistory.pregnancy
                  ? "⚠️ Enceinte ou allaite actuellement"
                  : "✅ Non enceinte / n'allaite pas"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/10 rounded-2xl flex items-center justify-center mb-4 border border-tertiary-400/20">
              <RiHealthBookLine className="w-6 h-6 text-tertiary-400" />
            </div>
            <p className="text-white/60 text-sm font-one">
              Aucune information médicale disponible
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
