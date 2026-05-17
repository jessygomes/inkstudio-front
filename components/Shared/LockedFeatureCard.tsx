import { ReactNode } from "react";

import DashboardButton from "@/components/Shared/DashboardButton";
import { cn } from "@/lib/utils";

type LockedFeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  features: string[];
  className?: string;
  ctaHref?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
};

export default function LockedFeatureCard({
  icon,
  title,
  description,
  features,
  className,
  ctaHref = "/parametres",
  primaryLabel = "Passer à PRO",
  secondaryLabel = "Voir les plans",
}: LockedFeatureCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-tertiary-500/30 bg-gradient-to-r from-tertiary-500/10 to-tertiary-500/10 p-6",
        className,
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-tertiary-500/25 bg-tertiary-500/12 text-tertiary-400">
          {icon}
        </div>

        <div className="flex-1">
          <h2 className="mb-2 font-one text-base font-semibold text-white md:text-lg">
            {title}
          </h2>

          <p className="mb-4 font-one text-sm leading-6 text-white/70">
            {description}
          </p>

          <div className="mb-4 flex flex-wrap gap-2.5">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-1"
              >
                <span className="font-one text-xs text-white/80">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <DashboardButton
              href={ctaHref}
              className="min-w-0 px-4 py-2 text-sm"
            >
              {primaryLabel}
            </DashboardButton>

            <DashboardButton
              href={ctaHref}
              variant="secondary"
              className="min-w-0 px-4 py-2 text-sm"
            >
              {secondaryLabel}
            </DashboardButton>
          </div>
        </div>
      </div>
    </div>
  );
}