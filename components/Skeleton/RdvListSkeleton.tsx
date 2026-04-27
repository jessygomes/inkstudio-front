import React from 'react'

export default function RdvListSkeleton() {
  return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
          <div className="h-8 bg-white/10 rounded-2xl w-48 animate-pulse" />
          <div className="hidden sm:flex bg-white/10 rounded-2xl border border-white/20 overflow-hidden h-10 w-32">
            <div className="flex-1 bg-white/5 animate-pulse" />
          </div>
        </div>

        {/* Filtres skeleton */}
        <div className="flex gap-2 mb-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-8 bg-white/10 rounded-2xl w-24 animate-pulse"
            />
          ))}
        </div>

        {/* Table header skeleton */}
        <div className="hidden sm:grid grid-cols-7 gap-4 p-4 bg-white/5 rounded-xl border border-white/10 mb-4">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-white/10 rounded-2xl animate-pulse"
            />
          ))}
        </div>

        {/* Rows skeleton */}
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="hidden sm:grid grid-cols-7 items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
            >
              {[...Array(7)].map((_, j) => (
                <div key={j} className="h-6 bg-white/10 rounded-2xl" />
              ))}
            </div>
          ))}

          {/* Mobile skeleton */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="sm:hidden p-4 rounded-2xl border border-white/10 bg-white/5 space-y-3 animate-pulse"
            >
              <div className="flex justify-between">
                <div className="h-6 bg-white/10 rounded-2xl w-32" />
                <div className="h-6 bg-white/10 rounded-2xl w-20" />
              </div>
              <div className="h-4 bg-white/10 rounded-2xl w-24" />
            </div>
          ))}
      </div>
    </div>
  )
}
