"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export default function DashboardDetailOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const dialog = ref.current;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return createPortal(<dialog ref={ref} aria-label={title} onCancel={event => { event.preventDefault(); onClose(); }} className="studio-dashboard fixed inset-0 m-0 ml-auto h-dvh max-h-none w-full max-w-none overflow-hidden border-0 border-l border-white/10 bg-noir-700 p-0 text-white shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm md:w-2/3 xl:w-1/2"><div className="h-full min-h-0 font-one">{children}</div></dialog>, document.body);
}
