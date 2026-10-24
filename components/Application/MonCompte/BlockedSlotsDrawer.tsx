"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarOff, X } from "lucide-react";
import BlockedSlots from "./BlockedSlots";

export default function BlockedSlotsDrawer({ userId, tatoueurs, onClose }: {
  userId: string;
  tatoueurs: { id: string; name: string }[];
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return createPortal(<dialog ref={dialog} aria-labelledby="blocked-drawer-title" aria-describedby="blocked-drawer-description"
    onCancel={(event) => { event.preventDefault(); if (!dialog.current?.querySelector("[data-modal]")) onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget && !dialog.current?.querySelector("[data-modal]")) onClose(); }}
    className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-white backdrop:bg-black/60 backdrop:backdrop-blur-[2px]">
    <motion.div initial={{ x: reduceMotion ? 0 : "100%" }} animate={{ x: 0 }} transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
      className="ml-auto flex h-full w-1/2 flex-col border-l border-white/10 bg-noir-700 font-one shadow-2xl [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_select]:cursor-pointer [&_button:focus-visible]:outline-none [&_button:focus-visible]:ring-2 [&_button:focus-visible]:ring-tertiary-400">
      <header className="flex shrink-0 items-start gap-3 border-b border-white/10 bg-noir-600 px-4 py-4 sm:px-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/20 bg-tertiary-400/10 text-tertiary-400"><CalendarOff size={17} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1"><h2 id="blocked-drawer-title" className="text-sm font-semibold">Absences & créneaux bloqués</h2><p id="blocked-drawer-description" className="mt-1 text-[11px] leading-5 text-white/40">Gérez les indisponibilités du salon et des artistes.</p></div>
        <button type="button" onClick={onClose} aria-label="Fermer les absences et créneaux bloqués" className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition hover:bg-tertiary-400/15 hover:text-white"><X size={18} /></button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5"><BlockedSlots userId={userId} tatoueurs={tatoueurs} /></div>
    </motion.div>
  </dialog>, document.body);
}
