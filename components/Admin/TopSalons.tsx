'use client';

import { FiTrendingUp, FiEye, FiMapPin } from 'react-icons/fi';
import { useState } from 'react';

interface TopSalon {
  id: string;
  name: string;
  image?: string;
  city: string;
  views: number;
  rank: number;
}

interface TopSalonsProps {
  initialData?: TopSalon[];
  loading?: boolean;
}

const getRankClasses = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        badge: 'bg-gradient-to-br from-amber-500/20 to-amber-400/10',
        text: 'text-amber-500',
        bar: 'bg-gradient-to-r from-amber-500 to-amber-400',
      };
    case 2:
      return {
        badge: 'bg-gradient-to-br from-slate-400/20 to-slate-300/10',
        text: 'text-slate-300',
        bar: 'bg-gradient-to-r from-slate-400 to-slate-300',
      };
    case 3:
      return {
        badge: 'bg-gradient-to-br from-amber-700/20 to-amber-600/10',
        text: 'text-amber-600',
        bar: 'bg-gradient-to-r from-amber-700 to-amber-600',
      };
    default:
      return {
        badge: 'bg-white/5',
        text: 'text-white/60',
        bar: 'bg-gradient-to-r from-white/20 to-white/10',
      };
  }
};

export default function TopSalons({ initialData = [], loading = false }: TopSalonsProps) {
  const [salons] = useState<TopSalon[]>(initialData);
  const [days] = useState(30);

  const maxViews = salons.length > 0 ? Math.max(...salons.map(s => s.views)) : 100;

  if (loading && salons.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg p-4 space-y-2">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-32 bg-white/10 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (salons.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-dashed border-white/15 shadow-lg p-4 text-center">
        <p className="text-white/60 text-xs font-one">
          Aucune donnée de visites disponible
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg p-3">
      {/* Header Compact */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
        <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <FiTrendingUp className="w-4 h-4 text-primary-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white font-one">Top Salons</h3>
          <p className="text-[10px] text-white/50">30 derniers jours</p>
        </div>
      </div>

      {/* Salons List - Compact Grid */}
      <div className="space-y-1.5">
        {salons.map((salon) => {
          const progressPercent = (salon.views / maxViews) * 100;
          const rankClasses = getRankClasses(salon.rank);

          return (
            <div
              key={salon.id}
              className="group rounded-lg bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10 transition-all duration-200 p-2.5"
            >
              <div className="flex items-start gap-2.5">
                {/* Rank Badge - Compact */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${rankClasses.badge} border border-white/10 flex items-center justify-center`}>
                  <span className={`text-xs font-bold font-one ${rankClasses.text}`}>
                    #{salon.rank}
                  </span>
                </div>

                {/* Main Info - Vertically Stacked */}
                <div className="flex-1 min-w-0">
                  {/* Name + Views Row */}
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <h4 className="text-xs font-bold text-white font-one truncate">
                      {salon.name}
                    </h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <FiEye className="w-3.5 h-3.5 text-white/50" />
                      <span className="text-xs font-bold text-white font-one tabular-nums whitespace-nowrap">
                        {salon.views.toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* City + Progress Bar Row */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-white/50 flex-shrink-0">
                      <FiMapPin size={11} />
                      <span className="truncate">{salon.city}</span>
                    </div>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${rankClasses.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats - Compact */}
      <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-3 gap-1.5 text-center">
        <div className="rounded-lg bg-white/5 p-1.5">
          <p className="text-[9px] text-white/50 font-one mb-0.5">Total</p>
          <p className="text-xs font-bold text-white font-one">
            {salons.reduce((sum, s) => sum + s.views, 0).toLocaleString('fr-FR')}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-1.5">
          <p className="text-[9px] text-white/50 font-one mb-0.5">Moyenne</p>
          <p className="text-xs font-bold text-white font-one">
            {Math.round(salons.reduce((sum, s) => sum + s.views, 0) / salons.length).toLocaleString('fr-FR')}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-1.5">
          <p className="text-[9px] text-white/50 font-one mb-0.5">Salons</p>
          <p className="text-xs font-bold text-white font-one">
            {salons.length}
          </p>
        </div>
      </div>
    </div>
  );
}
