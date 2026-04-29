import React from "react";

export default function ConversationSkeleton() {
  return (
    <>
      {/* Version Mobile */}
      <div
        className="lg:hidden dashboard-embedded-panel w-full flex flex-col p-3"
        style={{ height: "calc(100dvh - 7rem)" }}
      >
        {/* Header Skeleton */}
        <div className="dashboard-embedded-header flex-shrink-0 flex flex-col gap-2 p-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="h-6 w-16 rounded bg-white/10 animate-pulse" />
            <div className="h-6 w-20 rounded bg-white/10 animate-pulse" />
          </div>
        </div>

        {/* Messages Container Skeleton */}
        <div className="dashboard-embedded-section flex-1 overflow-y-auto min-h-0 p-3 space-y-3 scrollbar-thin scrollbar-thumb-tertiary-500/30 scrollbar-track-transparent">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Input Area Mobile Skeleton */}
        <div className="mt-3 flex-shrink-0 border-t border-white/10 bg-noir-800/95 backdrop-blur-md p-3 rounded-xl">
          <div className="flex gap-2 items-center">
            <div className="flex-1 h-10 rounded-lg bg-white/10 animate-pulse" />
            <div className="h-10 w-10 rounded-lg bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Version Desktop */}
      <div className="hidden lg:flex w-full flex-row gap-3 h-[calc(100vh-100px)]">
        {/* Messages Section - Gauche */}
        <div className="dashboard-embedded-panel w-3/5 flex flex-col gap-3 h-full p-3">
          {/* Header Skeleton */}
          <div className="dashboard-embedded-header flex items-center justify-between p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 w-40 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-32 rounded bg-white/10 animate-pulse" />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-6 w-20 rounded-2xl bg-white/10 animate-pulse" />
              <div className="h-6 w-24 rounded-2xl bg-white/10 animate-pulse" />
            </div>
          </div>

          {/* Messages Container */}
          <div className="dashboard-embedded-section border border-white/10 rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-tertiary-500/30 scrollbar-track-transparent">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
                    <div className="h-3 w-5/6 rounded bg-white/10 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-white/10 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area Desktop */}
            <div className="flex-shrink-0 border-t border-white/10 bg-noir-800/95 backdrop-blur-sm p-2">
              <div className="flex gap-2 items-center">
                <div className="flex-1 h-10 rounded-lg bg-white/10 animate-pulse" />
                <div className="h-10 w-10 rounded-lg bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* RDV Details Section - Droite */}
        <div className="w-3/5">
          <div className="dashboard-embedded-section rounded-xl border border-white/10 p-4 space-y-4">
            <div className="h-6 w-40 rounded bg-white/10 animate-pulse" />

            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
                  <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-2">
              <div className="h-10 w-full rounded-lg bg-white/10 animate-pulse" />
              <div className="h-10 w-full rounded-lg bg-white/10 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
