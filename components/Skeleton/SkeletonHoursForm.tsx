import React from "react";

export default function SkeletonHoursForm() {
  return (
    <div className="wrapper-global pb-16 px-3 sm:px-4 lg:px-6">
      <section className="w-full space-y-3 pt-4">
        <div className="dashboard-hero flex items-center gap-3 px-4 py-3 sm:px-5 lg:py-2.5">
          <div className="h-8 w-8 rounded-xl bg-white/10 animate-pulse" />
          <div className="space-y-1">
            <div className="h-2.5 w-24 rounded bg-white/10 animate-pulse" />
            <div className="h-4 w-44 rounded bg-white/10 animate-pulse" />
            <div className="h-2.5 w-52 rounded bg-white/10 animate-pulse" />
          </div>
        </div>

        <div className="dashboard-embedded-panel rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4">
          <div className="dashboard-embedded-section p-3 sm:p-4">
            <div className="mb-3 h-4 w-48 rounded bg-white/10 animate-pulse" />
            <div className="space-y-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                    <div className="flex flex-1 items-center justify-end gap-2">
                      <div className="h-9 w-24 rounded-xl bg-white/10 animate-pulse" />
                      <div className="h-9 w-24 rounded-xl bg-white/10 animate-pulse" />
                      <div className="h-8 w-16 rounded-[10px] bg-white/10 animate-pulse" />
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
