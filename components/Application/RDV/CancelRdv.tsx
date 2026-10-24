"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, CalendarDays, LoaderCircle, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { confirmAppointmentAction } from "@/lib/queries/appointment";

type CancellationDetails = {
  title?: string; start?: string | Date; end?: string | Date;
  client?: { firstName?: string; lastName?: string; email?: string };
};
const buttonClass = "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed disabled:opacity-50";

function CancelConfirmation({ appointment, busy, error, reason, setReason, onClose, onConfirm }: {
  appointment?: CancellationDetails; busy: boolean; error: string | null; reason: string;
  setReason: (reason: string) => void; onClose: () => void; onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const reasonId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, []);
  return createPortal(<dialog ref={ref} role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
    className="fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-2xl border border-white/15 bg-noir-700 p-0 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm font-one">
    <form onSubmit={event => { event.preventDefault(); if (!busy) onConfirm(); }}>
      <header className="flex items-start gap-3 border-b border-white/10 bg-noir-600 p-4"><div className="grid size-9 shrink-0 place-items-center rounded-xl border border-red-400/20 bg-tertiary-400/10 text-red-300"><AlertTriangle size={17} /></div><div className="min-w-0 flex-1"><h2 id={titleId} className="text-sm font-semibold">Annuler ce rendez-vous ?</h2><p className="mt-1 text-[11px] text-white/45">Une confirmation est nécessaire.</p></div><button type="button" onClick={onClose} disabled={busy} aria-label="Fermer la confirmation" className={buttonClass + " min-h-8 border-transparent p-1.5 text-white/45 hover:bg-tertiary-400/15"}><X size={16} /></button></header>
      <div className="space-y-4 p-4"><div id={descriptionId} className="rounded-xl border border-red-400/15 bg-red-400/[0.025] p-3"><p className="text-xs font-medium text-red-200">Cette annulation est définitive.</p><p className="mt-1.5 text-[11px] leading-5 text-white/60">Le rendez-vous sera annulé et ne pourra plus être rétabli. Le client recevra un email pour l’en informer.</p></div>
        {appointment && <div className="space-y-2 rounded-xl border border-white/10 p-3"><p className="text-xs font-medium text-white/85">{[appointment.client?.firstName, appointment.client?.lastName].filter(Boolean).join(" ") || appointment.title || "Rendez-vous"}</p>{appointment.title && <p className="text-[11px] text-white/50">{appointment.title}</p>}{appointment.start && <p className="flex items-center gap-2 text-[11px] text-white/55"><CalendarDays size={13} />{new Date(appointment.start).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>}{appointment.client?.email && <p className="flex items-center gap-2 break-all text-[11px] text-white/45"><Mail size={13} className="shrink-0" />{appointment.client.email}</p>}</div>}
        <div><label htmlFor={reasonId} className="mb-2 block text-[11px] font-medium text-white/65">Message au client <span className="font-normal text-white/35">(facultatif)</span></label><textarea id={reasonId} value={reason} onChange={event => setReason(event.target.value)} maxLength={300} rows={3} disabled={busy} placeholder="Précisez la raison de l’annulation…" className="w-full resize-y rounded-xl border border-white/10 bg-noir-600 p-3 text-xs text-white placeholder:text-white/30 focus:border-tertiary-400/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400/10" /><p className="mt-1 text-[10px] text-white/35">Ce message sera inclus dans l’email d’annulation.</p></div>
        {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">{error}</p>}
      </div><footer className="flex flex-wrap justify-end gap-2 border-t border-white/10 bg-noir-600 p-4"><button type="button" autoFocus onClick={onClose} disabled={busy} className={buttonClass + " border-white/10 text-white/70 hover:bg-white/5"}>Conserver le RDV</button><button type="submit" disabled={busy} className={buttonClass + " border-red-400/20 bg-red-500/15 text-red-200 hover:bg-red-500/25"}>{busy && <LoaderCircle size={14} className="animate-spin" />}{busy ? "Annulation…" : "Confirmer l’annulation"}</button></footer>
    </form>
  </dialog>, document.body);
}

export default function CancelRdv({ rdvId, appointment, onCancel }: { rdvId: string; appointment?: CancellationDetails; onCancel: () => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: async () => {
      const result = await confirmAppointmentAction(rdvId, "cancel", reason);
      if (!result || result.error) throw new Error(result?.message || "L’annulation n’a pas pu être enregistrée.");
      return result;
    },
    onSuccess: () => { setOpen(false); setReason(""); toast.success("Rendez-vous annulé. Le client va recevoir un email."); onCancel(); },
    onError: (cause: Error) => setError(cause.message || "Impossible d’annuler ce rendez-vous."),
  });
  return <><button type="button" onClick={() => { setError(null); setOpen(true); }} title="Annuler ce rendez-vous" className={buttonClass + " w-full border-red-400/15 bg-red-400/[0.025] text-red-300 hover:bg-red-400/10 font-one"}><X size={14} />Annuler</button>{open && <CancelConfirmation appointment={appointment} busy={mutation.isPending} error={error} reason={reason} setReason={setReason} onClose={() => { if (!mutation.isPending) setOpen(false); }} onConfirm={() => { if (!mutation.isPending) mutation.mutate(); }} />}</>;
}
