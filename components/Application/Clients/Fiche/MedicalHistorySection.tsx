import { HeartPulse } from "lucide-react";
import type { ClientProps } from "@/lib/type";

interface MedicalHistorySectionProps {
  medicalHistory: ClientProps["medicalHistory"] | undefined;
}

export default function MedicalHistorySection({ medicalHistory }: MedicalHistorySectionProps) {
  return (
    <section aria-label="Informations de santé">

      {medicalHistory ? (
        <div className="grid items-start gap-3 lg:grid-cols-2">
          <article className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <h4 className="text-sm font-semibold text-white font-one">Déclarations du client</h4>
            <dl className="mt-1 divide-y divide-white/[0.07]">
              <MedicalItem label="Allergies" value={medicalHistory.allergies} />
              <MedicalItem label="Problèmes de santé" value={medicalHistory.healthIssues} />
              <MedicalItem label="Médicaments" value={medicalHistory.medications} />
            </dl>
            <div className={`mt-3 rounded-xl border p-3 ${medicalHistory.pregnancy ? "border-amber-400/25 bg-amber-400/[0.06]" : "border-white/10 bg-white/[0.025]"}`}>
              <p className="text-xs text-white/60 font-one">Grossesse / Allaitement</p>
              <p className={`mt-1 text-sm font-medium font-two ${medicalHistory.pregnancy ? "text-amber-200" : "text-white/85"}`}>
                {medicalHistory.pregnancy ? "Enceinte ou allaite actuellement" : "Aucun signalement"}
              </p>
            </div>
          </article>
          <article className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <h4 className="text-sm font-semibold text-white font-one">Expériences précédentes</h4>
            <dl className="mt-1 divide-y divide-white/[0.07]">
              <MedicalItem label="Historique des tatouages" value={medicalHistory.tattooHistory} />
              <MedicalItem label="Réactions antérieures" value={medicalHistory.previousReactions} />
            </dl>
          </article>
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center">
          <HeartPulse size={24} className="mb-3 text-tertiary-400" aria-hidden="true" />
          <p className="text-sm text-white/75 font-one">Aucune information médicale disponible</p>
          <p className="mt-1 text-xs text-white/55 font-two">Les informations apparaîtront une fois l’historique renseigné.</p>
        </div>
      )}
    </section>
  );
}

function MedicalItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-3">
      <dt className="text-xs font-medium text-white/55 font-one">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/85 font-two">{value?.trim() || "Non renseigné"}</dd>
    </div>
  );
}
