import React from "react";

export default function MessageListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="dashboard-embedded-section rounded-xl border border-white/20 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/50 animate-spin" />
          <div className="h-5 w-56 rounded-lg bg-white/10 animate-pulse" />
        </div>
      </div>

      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="dashboard-list-item rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-white/10 animate-pulse" />

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="h-4 w-44 rounded bg-white/10 animate-pulse" />
                  <div className="h-5 w-14 rounded-full bg-white/10 animate-pulse" />
                </div>

                <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />

                <div className="flex items-center gap-2 pt-1">
                  <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
                  <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 pt-2">
        <div className="h-9 w-24 rounded-lg bg-white/10 animate-pulse" />
        <div className="h-9 w-9 rounded-lg bg-white/10 animate-pulse" />
        <div className="h-9 w-9 rounded-lg bg-white/10 animate-pulse" />
        <div className="h-9 w-9 rounded-lg bg-white/10 animate-pulse" />
        <div className="h-9 w-24 rounded-lg bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}
