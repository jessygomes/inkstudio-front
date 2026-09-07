import type { ReactNode } from "react";

interface ApplicationToolbarProps {
  search?: ReactNode;
  filters?: ReactNode;
  summary?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const toolbarClasses = {
  root: [
    "relative z-10 flex w-full flex-col gap-2.5 overflow-hidden rounded-2xl border border-white/[0.09] bg-noir-500 p-2",
    "bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018)),#181818]",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_12px_32px_rgba(0,0,0,0.14)]",
    "transition-colors focus-within:border-tertiary-400/20 sm:flex-row sm:items-center sm:gap-2 sm:overflow-visible sm:rounded-3xl sm:p-2.5",
    "[&_input:not([type=checkbox])]:min-h-10 [&_input:not([type=checkbox])]:rounded-xl sm:[&_input:not([type=checkbox])]:rounded-3xl",
    "[&_input:not([type=checkbox])]:border-white/10 [&_input:not([type=checkbox])]:bg-black/15",
    "[&_select]:min-h-10 [&_select]:rounded-[14px] [&_select]:border-white/10 [&_select]:bg-black/15",
  ].join(" "),
  main: "flex w-full min-w-0 flex-1 flex-col items-stretch gap-2 sm:flex-row sm:items-center",
  search: "w-full min-w-0 flex-none sm:flex-[1_1_18rem]",
  filters: "flex w-full min-w-0 max-w-full snap-x snap-mandatory items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hidden [&>*]:shrink-0 [&>*]:snap-start sm:w-auto sm:pb-0",
  summary: "shrink-0 text-[0.7rem] text-white/50 font-one",
  actions: "flex w-full min-w-0 shrink-0 items-center justify-end gap-2 border-t border-white/[0.06] pt-2 [&>*]:min-h-10 [&>*]:min-w-0 [&>*]:flex-1 [&>*]:whitespace-nowrap sm:ml-auto sm:w-auto sm:border-t-0 sm:pt-0 sm:[&>*]:min-h-0 sm:[&>*]:flex-none",
} as const;

export default function ApplicationToolbar({ search, filters, summary, actions, children, className = "" }: ApplicationToolbarProps) {
  return (
    <div className={`${toolbarClasses.root}${className ? ` ${className}` : ""}`}>
      {children ?? (
        <>
          <div className={toolbarClasses.main}>
            {search && <div className={toolbarClasses.search}>{search}</div>}
            {filters && <div className={toolbarClasses.filters}>{filters}</div>}
          </div>
          {summary && <div className={toolbarClasses.summary}>{summary}</div>}
          {actions && <div className={toolbarClasses.actions}>{actions}</div>}
        </>
      )}
    </div>
  );
}
