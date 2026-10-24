import type { ReactNode } from "react";

export default function FormSectionHeader({ eyebrow, title, description, icon, compact = false }: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "mb-4 flex items-start gap-2.5" : "mb-5 flex items-start gap-3"}>
      <span className={compact ? "flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/45 [&_svg]:size-4" : "flex size-9 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/25 bg-tertiary-500/10 text-tertiary-400"} aria-hidden="true">{icon}</span>
      <div>
        <p className={compact ? "text-[9px] font-medium uppercase tracking-[0.12em] text-white/30 font-one" : "text-[10px] font-semibold uppercase tracking-[0.16em] text-tertiary-400/80 font-one"}>{eyebrow}</p>
        <h3 className={compact ? "mt-1 text-sm font-medium text-white/85 font-one" : "mt-1 text-base font-semibold text-white font-one"}>{title}</h3>
        <p className={compact ? "mt-1 text-[11px] leading-5 text-white/35 font-two" : "mt-1 text-xs leading-5 text-white/50 font-two"}>{description}</p>
      </div>
    </div>
  );
}
