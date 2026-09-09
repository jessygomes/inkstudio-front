import { ArrowLeft } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import PiercingManager from "@/components/Application/MonCompte/PiercingManager";

export default function PiercingPage() {
  return (
    <div className="wrapper-global pb-24 lg:pb-8">
      <section className="w-full space-y-5 pt-4">
        <div className="flex flex-col gap-4 px-1 py-3 sm:px-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-tertiary-400 font-one">
              Mon compte
            </p>
            <h1 className="mt-1 text-xl font-semibold text-white font-one sm:text-2xl">
              Configuration piercing
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55 font-one">
              Gérez ici les zones, services et tarifs de la prestation piercing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <DashboardButton
              href="/mon-compte/modifier-salon"
              variant="secondary"
              className="min-w-0 px-4 text-[11px]"
            >
              <ArrowLeft size={15} aria-hidden="true" /> Retour au salon
            </DashboardButton>
            <DashboardButton
              href="/mon-compte"
              className="min-w-0 px-4 text-[11px]"
            >
              Mon compte
            </DashboardButton>
          </div>
        </div>

        <div className="min-w-0">
          <PiercingManager />
        </div>
      </section>
    </div>
  );
}
