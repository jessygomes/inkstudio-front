"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { LoaderCircle, X } from "lucide-react";

export default function SideFormDrawer({ title, category, description, onClose, busy = false, footer, children }: {
  title: string;
  category: string;
  description: string;
  onClose: () => void | Promise<void>;
  busy?: boolean;
  footer: ReactNode;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeRequested = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [mounted]);

  const requestClose = async () => {
    if (busy || closeRequested.current) return;
    closeRequested.current = true;
    try { await onClose(); } finally { closeRequested.current = false; }
  };

  if (!mounted) return null;
  return createPortal(<dialog ref={dialog} data-modal aria-labelledby={titleId} aria-describedby={descriptionId}
    onCancel={(event) => { event.preventDefault(); void requestClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) void requestClose(); }}
    className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-white backdrop:bg-black/65 backdrop:backdrop-blur-[2px]">
    <motion.div initial={{ x: reduceMotion ? 0 : "100%" }} animate={{ x: 0 }} transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
      className="@container ml-auto flex h-full w-full flex-col border-l border-white/10 bg-noir-700 font-one shadow-2xl md:w-1/2 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_a]:cursor-pointer [&_select]:cursor-pointer [&_input[type=checkbox]]:cursor-pointer [&_button:focus-visible]:outline-none [&_button:focus-visible]:ring-2 [&_button:focus-visible]:ring-tertiary-400 [&_a:focus-visible]:outline-none [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-tertiary-400">
      <header className="flex shrink-0 items-start gap-3 border-b border-white/10 bg-noir-600 px-4 py-4 sm:px-5">
        <div className="min-w-0 flex-1"><p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/35">{category}</p><h2 id={titleId} className="mt-1 text-lg font-semibold tracking-tight text-white">{title}</h2><p id={descriptionId} className="mt-1.5 text-[11px] leading-5 text-white/40">{description}</p></div>
        <button type="button" onClick={() => void requestClose()} disabled={busy} aria-label="Fermer le formulaire" className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/45 transition hover:bg-white/5 hover:text-white disabled:opacity-40">{busy ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <X size={17} aria-hidden="true" />}</button>
      </header>
      <div aria-busy={busy} className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">{children}</div>
      <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-white/10 bg-noir-600 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 [&_button]:min-w-0 [&_button]:rounded-xl [&_button]:px-3 [&_button]:text-[11px] [&_button]:shadow-none">{footer}</footer>
    </motion.div>
  </dialog>, document.body);
}
