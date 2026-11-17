import { Bone, SkeletonRegion } from "./Skeleton";

/** Liste de rendez-vous en cours de chargement : tuile de date, titre, détails et statut, sans contour. */
export default function RdvListSkeleton({ count = 6 }: { count?: number }) {
  const titles = ["w-40", "w-52", "w-32", "w-48", "w-36", "w-44"];
  return (
    <SkeletonRegion label="Chargement des rendez-vous" className="space-y-2">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center gap-4 rounded-2xl bg-white/[0.03] px-4 py-3.5">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl bg-white/[0.05]">
            <Bone className="h-4 w-6" />
            <Bone className="h-2 w-8 !bg-white/[0.05]" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className={`h-3.5 ${titles[index % titles.length]} max-w-full`} />
            <Bone className="h-2.5 w-56 max-w-full !bg-white/[0.05]" />
          </div>
          <Bone className="h-6 w-24 shrink-0 !rounded-lg" />
        </div>
      ))}
    </SkeletonRegion>
  );
}
