import ShowSuivis from "@/components/Application/Clients/ShowSuivis";
import { Suspense } from "react";

export default function ClientAvisPage() {
  return (
    <div className="wrapper-global px-3 sm:px-4 lg:px-6 pb-24 lg:pb-8">
      <section className="w-full space-y-3 pt-4">
        <Suspense fallback={<div role="status" className="flex min-h-64 items-center justify-center text-xs text-white/50">Chargement des suivis…</div>}>
          <ShowSuivis />
        </Suspense>
      </section>
    </div>
  );
}
