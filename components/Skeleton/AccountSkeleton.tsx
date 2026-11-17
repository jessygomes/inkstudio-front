import { Bone, SkeletonRegion } from "./Skeleton";

/** Page Mon compte en cours de chargement : couverture et profil, infos, horaires, équipe, galerie (sans contour). */
export default function AccountSkeleton() {
  return (
    <SkeletonRegion label="Chargement de votre compte" className="space-y-4">
      {/* Couverture, photo de profil et nom */}
      <div className="overflow-hidden rounded-3xl bg-white/[0.03]">
        <Bone className="h-36 w-full !rounded-none !bg-white/[0.05] sm:h-48" />
        <div className="flex flex-wrap items-end gap-4 px-5 pb-5">
          <Bone className="-mt-10 h-20 w-20 shrink-0 !rounded-2xl !bg-white/[0.09]" />
          <div className="min-w-0 flex-1 space-y-2 pb-1">
            <Bone className="h-5 w-48 max-w-full" />
            <Bone className="h-3 w-64 max-w-full !bg-white/[0.05]" />
          </div>
          <div className="flex gap-2 pb-1">
            <Bone className="h-9 w-28 !rounded-xl" />
            <Bone className="h-9 w-9 !rounded-xl" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Infos et horaires */}
        <div className="space-y-4">
          <div className="space-y-3 rounded-3xl bg-white/[0.03] p-5">
            <Bone className="h-3.5 w-32" />
            {[0, 1, 2].map((index) => <Bone key={index} className="h-10 !rounded-xl !bg-white/[0.05]" />)}
          </div>
          <div className="space-y-3 rounded-3xl bg-white/[0.03] p-5">
            <Bone className="h-3.5 w-24" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }, (_, index) => <Bone key={index} className="h-12 !rounded-xl !bg-white/[0.05]" />)}
            </div>
          </div>
        </div>

        {/* Équipe et galerie */}
        <div className="space-y-4">
          <div className="space-y-3 rounded-3xl bg-white/[0.03] p-5">
            <Bone className="h-3.5 w-36" />
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3">
                  <Bone className="h-11 w-11 shrink-0 !rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2"><Bone className="h-3 w-3/4" /><Bone className="h-2.5 w-1/2 !bg-white/[0.05]" /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3 rounded-3xl bg-white/[0.03] p-5">
            <Bone className="h-3.5 w-44" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }, (_, index) => <Bone key={index} className="aspect-square !rounded-xl !bg-white/[0.05]" />)}
            </div>
          </div>
        </div>
      </div>
    </SkeletonRegion>
  );
}
