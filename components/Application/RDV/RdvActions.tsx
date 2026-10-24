"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import type { UpdateRdvFormProps } from "@/lib/type";
import { getAppointmentActions } from "@/lib/utils/appointment-actions";
import ConfirmRdv from "./ConfirmRdv";
import UpdateRdv from "./UpdateRdv";
import CancelRdv from "./CancelRdv";
import SendMessageRdv from "./SendMessageRdv";
import ChangeStatusButtons from "./ChangeStatusButtons";

export default function RdvActions({ appointment, userId, onUpdated, onStatusChange }: {
  appointment: { id: string; status?: string; end: string | Date; conversation?: { id: string } | null };
  userId: string | null;
  onUpdated: (id: string) => void;
  onStatusChange?: (id: string, status: "COMPLETED" | "NO_SHOW") => void;
}) {
  const actions = getAppointmentActions(appointment.status || "", appointment.end);
  return <section aria-label="Actions du rendez-vous" className="@container rounded-2xl border border-white/10 bg-noir-600 p-3 font-one">
    <h3 className="mb-3 text-xs font-semibold text-white/85">{actions.edit || actions.attendance ? "Gérer le rendez-vous" : "Contacter le client"}</h3>
    {(actions.edit || actions.attendance) && <div className="grid grid-cols-2 gap-2">
      {actions.confirm && <ConfirmRdv rdvId={appointment.id} appointment={appointment} onConfirm={() => onUpdated(appointment.id)} />}
      {actions.attendance && <ChangeStatusButtons rdvId={appointment.id} currentStatus={appointment.status} onStatusChange={(id, status) => { if (onStatusChange) onStatusChange(id, status); else onUpdated(id); }} className="col-span-2" />}
      {actions.edit && <UpdateRdv rdv={appointment as unknown as UpdateRdvFormProps} userId={userId || ""} onUpdate={() => onUpdated(appointment.id)} />}
      {actions.cancel && <CancelRdv rdvId={appointment.id} appointment={appointment} onCancel={() => onUpdated(appointment.id)} />}
    </div>}
    {(appointment.conversation?.id || actions.email) && <div className={`grid grid-cols-2 gap-2 ${(actions.edit || actions.attendance) ? "mt-3 border-t border-white/10 pt-3" : ""}`}>
      {appointment.conversation?.id && <Link href={`/messagerie/${appointment.conversation.id}`} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs font-medium text-white/70 transition hover:border-white/20 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400"><MessageSquare size={14} />Conversation</Link>}
      {actions.email && <SendMessageRdv rdvId={appointment.id} appointment={appointment} onMessageSent={() => onUpdated(appointment.id)} buttonLabel="Envoyer un mail" />}
    </div>}
  </section>;
}
