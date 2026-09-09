import type { ReactNode } from "react";

export default function FormSectionHeader({ eyebrow, title, description, icon }: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/25 bg-tertiary-500/10 text-tertiary-400" aria-hidden="true">{icon}</span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-tertiary-400/80 font-one">{eyebrow}</p>
        <h3 className="mt-1 text-base font-semibold text-white font-one">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-white/50 font-two">{description}</p>
      </div>
    </div>
  );
}
