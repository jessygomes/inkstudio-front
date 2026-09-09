import React from "react";

export default function SkeletonHoursForm() {
  return (
    <div className="wrapper-global pb-24 lg:pb-8" role="status" aria-label="Chargement des horaires">
      <section className="w-full space-y-5 pt-4" aria-hidden="true">
        <div className="flex items-center gap-3 px-1 py-3 sm:px-2">
          <div className="space-y-3">
            <div className="h-2.5 w-24 rounded bg-white/10 animate-pulse" />
            <div className="h-7 w-60 rounded bg-white/10 animate-pulse" />
            <div className="h-4 w-64 max-w-full rounded bg-white/10 animate-pulse" />
          </div>
        </div>

        <div className="rounded-[22px] border border-tertiary-400/20 bg-tertiary-500/5 p-4 sm:p-5">
          <div className="mb-4 h-5 w-52 rounded bg-white/10 animate-pulse" />
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2].map((index) => <div key={index} className="h-11 w-full rounded-xl bg-white/10 animate-pulse sm:w-48" />)}
          </div>
        </div>
        <div className="space-y-4">
          <div className="dashboard-embedded-section rounded-[22px] p-4 sm:p-5">
            <div className="mb-5 h-5 w-48 rounded bg-white/10 animate-pulse" />
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-black/15 p-4 sm:p-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                    <div className="grid grid-cols-2 gap-3 md:w-2/3">
                      <div className="h-11 rounded-xl bg-white/10 animate-pulse" />
                      <div className="h-11 rounded-xl bg-white/10 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-end gap-2 border-t border-white/10 pt-3 sm:flex-row">
            <div className="h-9 w-full rounded-[14px] bg-white/10 animate-pulse sm:w-24" />
            <div className="h-9 w-full rounded-[14px] bg-white/10 animate-pulse sm:w-44" />
          </div>
        </div>
      </section>
    </div>
  );
}
