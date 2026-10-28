"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function DrawingDialog({ title, description, busy = false, scrollable = true, onClose, children }: {
  title: string; description: string; busy?: boolean; scrollable?: boolean; onClose: () => void; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = overflow; };
  }, []);
  return createPortal(
    <dialog ref={ref} aria-labelledby={titleId} onKeyDown={event => { if (event.key === "Escape") event.stopPropagation(); }} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-noir-700 p-0 font-one text-white shadow-2xl open:flex open:flex-col backdrop:bg-black/70 backdrop:backdrop-blur-sm [&_button:not(:disabled)]:cursor-pointer [&_select]:[color-scheme:dark] [&_select]:bg-[#171717] [&_option]:bg-[#171717] [&_option]:text-white">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 bg-gradient-to-br from-tertiary-400/10 to-transparent px-5 py-3">
        <div className="min-w-0"><h2 id={titleId} className="text-base font-semibold">{title}</h2><p className="mt-0.5 text-[11px] leading-4 text-white/50">{description}</p></div>
        <button type="button" disabled={busy} onClick={onClose} aria-label="Fermer" className="shrink-0 rounded-lg border border-white/10 p-1.5 text-white/60 hover:bg-white/5 disabled:opacity-40"><X size={15} /></button>
      </header>
      <div className={`flex min-h-0 flex-1 flex-col ${scrollable ? "overflow-y-auto overscroll-contain" : "overflow-hidden"}`}>{children}</div>
    </dialog>, document.body,
  );
}
