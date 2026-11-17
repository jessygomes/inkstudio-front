import type { ReactNode } from "react";

/**
 * Briques de skeleton communes au site Studio : sans contour, fonds translucides (inversés en thème clair),
 * pulsation coupée si l'utilisateur a réduit les animations. Les lecteurs d'écran n'entendent que le libellé.
 */

/** Forme fantôme (bloc arrondi). */
export function Bone({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block rounded-md bg-white/[0.07] ${className}`} />;
}

/** Conteneur : annonce le chargement et fait pulser son contenu. */
export function SkeletonRegion({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-label={label} className={`motion-safe:animate-pulse ${className}`}>
      {children}
      <span className="sr-only">{label}…</span>
    </div>
  );
}

const LINE_WIDTHS = ["w-32", "w-44", "w-28", "w-40", "w-36", "w-24"];

/** Liste de lignes : avatar, deux lignes de texte, pastille à droite (clients, rendez-vous, suivis…). */
export function SkeletonRows({ count = 6, label, avatar = true, className = "" }: { count?: number; label: string; avatar?: boolean; className?: string }) {
  return (
    <SkeletonRegion label={label} className={`space-y-2 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-3.5">
          {avatar && <Bone className="h-10 w-10 shrink-0 !rounded-xl" />}
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className={`h-3 ${LINE_WIDTHS[index % LINE_WIDTHS.length]} max-w-full`} />
            <Bone className={`h-2.5 ${LINE_WIDTHS[(index + 2) % LINE_WIDTHS.length]} max-w-full !bg-white/[0.05]`} />
          </div>
          <Bone className="hidden h-6 w-20 shrink-0 !rounded-lg sm:block" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** Grille de cartes : image puis quelques lignes (portfolio, flashs, produits, projets…). */
export function SkeletonCardGrid({
  count = 8,
  label,
  gridClassName = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
  imageClassName = "aspect-square",
  lines = 2,
}: { count?: number; label: string; gridClassName?: string; imageClassName?: string; lines?: number }) {
  return (
    <SkeletonRegion label={label} className={gridClassName}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl bg-white/[0.03]">
          <Bone className={`${imageClassName} w-full !rounded-none !bg-white/[0.06]`} />
          <div className="space-y-2 p-3">
            {Array.from({ length: lines }, (_, line) => (
              <Bone key={line} className={`h-2.5 ${line === 0 ? "w-3/4 h-3" : "w-1/2 !bg-white/[0.05]"}`} />
            ))}
          </div>
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** Rangée de chiffres clés (stocks, avis…). */
export function SkeletonStats({ count = 4, className = "grid grid-cols-2 gap-3 lg:grid-cols-4" }: { count?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={`motion-safe:animate-pulse ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-3 rounded-2xl bg-white/[0.03] p-4">
          <Bone className="h-2.5 w-20 !bg-white/[0.05]" />
          <Bone className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Colonnes de type Kanban (suivi dessin). */
export function SkeletonColumns({
  columns = 5,
  cards = 3,
  label,
  className = "flex gap-3 overflow-hidden",
  columnClassName = "w-72 shrink-0",
}: { columns?: number; cards?: number; label: string; className?: string; columnClassName?: string }) {
  return (
    <SkeletonRegion label={label} className={className}>
      {Array.from({ length: columns }, (_, column) => (
        <div key={column} className={`${columnClassName} space-y-3 rounded-2xl bg-white/[0.03] p-3`}>
          <div className="flex items-center justify-between"><Bone className="h-3 w-24" /><Bone className="h-5 w-7 !rounded-lg" /></div>
          {Array.from({ length: Math.max(1, cards - (column % 2)) }, (_, card) => (
            <div key={card} className="space-y-2 rounded-xl bg-white/[0.04] p-3">
              <Bone className="aspect-[4/3] w-full !rounded-lg !bg-white/[0.06]" />
              <Bone className="h-3 w-3/4" />
              <Bone className="h-2.5 w-1/2 !bg-white/[0.05]" />
            </div>
          ))}
        </div>
      ))}
    </SkeletonRegion>
  );
}
