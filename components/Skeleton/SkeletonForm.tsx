import React from "react";

export default function SkeletonForm() {
  return (
    <div className="wrapper-global pb-16 px-3 sm:px-4 lg:px-6">
      <section className="w-full space-y-3 pt-4">
        <div className="dashboard-hero flex items-center gap-3 px-4 py-3 sm:px-5 lg:py-2.5">
          <div className="h-8 w-8 rounded-xl bg-white/10 animate-pulse" />
          <div className="space-y-1">
            <div className="h-2.5 w-20 rounded bg-white/10 animate-pulse" />
            <div className="h-4 w-40 rounded bg-white/10 animate-pulse" />
            <div className="h-2.5 w-56 rounded bg-white/10 animate-pulse" />
          </div>
        </div>

        <div className="dashboard-embedded-panel w-full rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4">
          <div className="space-y-2.5">
            {[...Array(6)].map((_, sectionIndex) => (
              <div key={sectionIndex} className="dashboard-embedded-section p-3 sm:p-4">
                <div className="mb-3 h-4 w-44 rounded bg-white/10 animate-pulse" />
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {[...Array(sectionIndex === 0 ? 1 : 4)].map((_, fieldIndex) => (
                    <div key={fieldIndex} className="space-y-1">
                      <div className="h-2.5 w-24 rounded bg-white/10 animate-pulse" />
                      <div className="h-9 rounded-xl bg-white/10 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-col justify-end gap-2 py-2 sm:flex-row">
              <div className="h-9 w-full rounded-[14px] bg-white/10 animate-pulse sm:w-24" />
              <div className="h-9 w-full rounded-[14px] bg-white/10 animate-pulse sm:w-56" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
