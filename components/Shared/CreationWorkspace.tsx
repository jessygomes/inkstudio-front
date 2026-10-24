import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export type CreationSection = { id: string; label: string; hint: string; disabled?: boolean };

export function CreationPageHeader({ title, description, backHref, backLabel, category, categoryHref, context = "Création" }: {
  title: string; description: string; backHref: string; backLabel: string; category: string; categoryHref?: string; context?: string;
}) {
  return <header className="mb-6 font-one">
    <nav aria-label="Fil d’Ariane" className="mb-3 flex items-center text-[11px] text-white/40">{categoryHref ? <Link href={categoryHref} className="cursor-pointer rounded transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400">{category}</Link> : <span>{category}</span>}<span aria-hidden="true" className="mx-2 text-white/20">/</span><span aria-current="page">{context}</span></nav>
    <div className="flex items-start gap-3">
      <Link href={backHref} aria-label={backLabel} title={backLabel} className="mt-0.5 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-white/55 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400"><ArrowLeft size={21} aria-hidden="true" /></Link>
      <div><h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-xs leading-6 text-white/45 sm:text-sm">{description}</p></div>
    </div>
  </header>;
}

export default function CreationWorkspace({ sections, summary, children }: {
  sections: CreationSection[]; summary?: ReactNode; children: ReactNode;
}) {
  return <div className="grid items-start gap-4 font-one xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-6 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_a]:cursor-pointer [&_select]:cursor-pointer [&_input[type=checkbox]]:cursor-pointer [&_input[type=date]]:cursor-pointer [&_button:focus-visible]:outline-none [&_button:focus-visible]:ring-2 [&_button:focus-visible]:ring-tertiary-400 [&_a:focus-visible]:outline-none [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-tertiary-400">
    <aside className="scrollbar-hidden min-w-0 rounded-2xl border border-white/10 bg-noir-600 p-2 xl:sticky xl:top-5 xl:max-h-[calc(100dvh-2.5rem)] xl:overflow-y-auto xl:p-4">
      <p className="mb-3 hidden px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 xl:block">Dans ce formulaire</p>
      <nav aria-label="Rubriques du formulaire" className="flex gap-1 overflow-x-auto xl:flex-col xl:overflow-visible">
        {sections.map((section, index) => {
          const content = <><span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-[10px] text-white/35">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0"><span className="block whitespace-nowrap text-[11px] font-medium">{section.label}</span><span className="mt-1 hidden text-[10px] leading-4 text-white/30 xl:block">{section.hint}</span></span>{!section.disabled && <ArrowUpRight size={12} className="ml-auto hidden shrink-0 text-white/20 xl:block" aria-hidden="true" />}</>;
          return section.disabled ? <span key={section.id} aria-disabled="true" className="flex shrink-0 items-center gap-2.5 rounded-xl px-2 py-3 text-white/25">{content}</span> : <a key={section.id} href={`#${section.id}`} className="flex shrink-0 items-center gap-2.5 rounded-xl px-2 py-3 text-white/65 transition hover:bg-white/5 hover:text-white">{content}</a>;
        })}
      </nav>
      {summary && <div className="mt-5 hidden border-t border-white/[0.08] px-2 pt-5 xl:block"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">En un coup d’œil</p>{summary}</div>}
    </aside>
    <div className="min-w-0">{children}</div>
  </div>;
}
