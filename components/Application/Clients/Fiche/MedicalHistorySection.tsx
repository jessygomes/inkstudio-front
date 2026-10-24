import { HeartPulse, History } from "lucide-react";
import type { ClientProps } from "@/lib/type";

interface MedicalHistorySectionProps {
  medicalHistory: ClientProps["medicalHistory"] | undefined;
}

export default function MedicalHistorySection({ medicalHistory }: MedicalHistorySectionProps) {
  return (
    <section aria-label="Informations de santé">

      {medicalHistory ? (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <article className="min-w-0 rounded-2xl border border-white/10 bg-noir-600 p-4 sm:p-5">
            <h4 className="flex items-center gap-2 text-xs font-semibold text-white/85 font-one"><HeartPulse size={15} className="text-white/40" />Déclarations du client</h4><p className="mt-2 text-[11px] leading-5 text-white/35">Informations renseignées dans le dossier client.</p>
            <dl className="mt-3 divide-y divide-white/[0.07]">
              <MedicalItem label="Allergies" value={medicalHistory.allergies} />
              <MedicalItem label="Problèmes de santé" value={medicalHistory.healthIssues} />
              <MedicalItem label="Médicaments" value={medicalHistory.medications} />
            </dl>
            <div className={`mt-3 rounded-xl border px-3 py-2.5 ${medicalHistory.pregnancy ? "border-amber-400/25 bg-amber-400/[0.06]" : "border-white/10 bg-white/[0.025]"}`}>
              <p className="text-[10px] text-white/40 font-one">Grossesse / Allaitement</p>
              <p className={`mt-1 text-xs font-medium font-two ${medicalHistory.pregnancy ? "text-amber-200" : "text-white/85"}`}>
                {medicalHistory.pregnancy ? "Enceinte ou allaite actuellement" : "Aucun signalement"}
              </p>
            </div>
          </article>
          <article className="min-w-0 rounded-2xl border border-white/10 bg-noir-600 p-4 sm:p-5">
            <h4 className="flex items-center gap-2 text-xs font-semibold text-white/85 font-one"><History size={15} className="text-white/40" />Antécédents & expériences</h4><p className="mt-2 text-[11px] leading-5 text-white/35">Historique et réactions signalées lors de précédentes séances.</p>
            <dl className="mt-3 divide-y divide-white/[0.07]">
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
    <div className="grid gap-1.5 py-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-[11px] leading-5 text-white/40 font-one">{label}</dt>
      <dd className={"whitespace-pre-wrap break-words text-xs leading-5 font-two " + (value?.trim() ? "text-white/80" : "text-white/25")}>{value?.trim() || "Non renseigné"}</dd>
    </div>
  );
}
