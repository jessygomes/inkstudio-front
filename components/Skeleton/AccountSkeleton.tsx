import React from 'react'

export default function AccountSkeleton() {
  return (
            <div className="mt-3 space-y-3 sm:space-y-4 mx-auto">
              {/* Section INFO SALON skeleton */}
              <div className="dashboard-embedded-panel p-3 sm:p-4">
                <div className="dashboard-embedded-section p-3">
                  <div className="h-5 bg-white/10 rounded-lg w-32 mb-4 animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="h-10 bg-white/10 rounded-lg animate-pulse"></div>
                    <div className="h-10 bg-white/10 rounded-lg animate-pulse"></div>
                    <div className="h-10 bg-white/10 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
    
              {/* Section HORAIRES skeleton */}
              <div className="dashboard-embedded-panel p-3 sm:p-4">
                <div className="dashboard-embedded-section p-3">
                  <div className="h-5 bg-white/10 rounded-lg w-32 mb-4 animate-pulse"></div>
                  <div className="space-y-2">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="h-4 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                        <div className="h-6 bg-white/10 rounded-lg w-40 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
    
              {/* Section TATOUEURS skeleton */}
              <div className="dashboard-embedded-panel p-3 sm:p-4">
                <div className="dashboard-embedded-section p-3">
                  <div className="h-5 bg-white/10 rounded-lg w-32 mb-4 animate-pulse"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-20 bg-white/10 rounded-lg animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
    
              {/* Section PHOTOS skeleton */}
              <div className="dashboard-embedded-panel p-3 sm:p-4">
                <div className="dashboard-embedded-section p-3">
                  <div className="h-5 bg-white/10 rounded-lg w-32 mb-4 animate-pulse"></div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-white/10 rounded-lg animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
  )
}
