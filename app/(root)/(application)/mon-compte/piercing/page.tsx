import DashboardButton from "@/components/Shared/DashboardButton";
import PiercingManager from "@/components/Application/MonCompte/PiercingManager";

export default function PiercingPage() {
  return (
    <div className="wrapper-global pb-16 sm:pb-10 px-3 sm:px-4 lg:px-6">
      <section className="w-full space-y-3 pt-4 pb-10 xl:pb-0">
        <div className="dashboard-hero flex flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-white/50 font-one">
              Mon compte
            </p>
            <h1 className="text-base font-bold uppercase tracking-wide text-white font-one sm:text-lg">
              Configuration piercing
            </h1>
            <p className="mt-0.5 text-[11px] text-white/70 font-one">
              Gérez ici les zones, services et tarifs de la prestation piercing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <DashboardButton
              href="/mon-compte/modifier-salon"
              variant="secondary"
              className="min-w-0 px-4 text-[11px]"
            >
              Retour
            </DashboardButton>
            <DashboardButton
              href="/mon-compte"
              className="min-w-0 px-4 text-[11px]"
            >
              Mon compte
            </DashboardButton>
          </div>
        </div>

        <div className="dashboard-embedded-section p-3 sm:p-4">
          <PiercingManager />
        </div>
      </section>
    </div>
  );
}
