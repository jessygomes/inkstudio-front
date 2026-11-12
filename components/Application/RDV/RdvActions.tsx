"use client";

import { MessageSquare } from "lucide-react";
import type { UpdateRdvFormProps } from "@/lib/type";
import { getAppointmentActions } from "@/lib/utils/appointment-actions";
import RdvActionButton from "./RdvActionButton";
import ConfirmRdv from "./ConfirmRdv";
import UpdateRdv from "./UpdateRdv";
import CancelRdv from "./CancelRdv";
import SendMessageRdv from "./SendMessageRdv";
import ChangeStatusButtons from "./ChangeStatusButtons";

export default function RdvActions({ appointment, userId, onUpdated, onStatusChange, variant = "card" }: {
  appointment: { id: string; status?: string; end: string | Date; conversation?: { id: string } | null };
  userId: string | null;
  onUpdated: (id: string) => void;
  onStatusChange?: (id: string, status: "COMPLETED" | "NO_SHOW") => void;
  /** `card` : bloc avec titre dans le contenu ; `footer` : une seule rangée de boutons compacts, pour l'en-tête ou le pied d'une fenêtre. */
  variant?: "card" | "footer";
}) {
  const actions = getAppointmentActions(appointment.status || "", appointment.end);
  // Pied de la fenêtre : les actions sont des icônes seules (infobulle au survol) ; « Annuler » vient en dernier, à droite du bouton mail.
  if (variant === "footer") {
    if (!(actions.confirm || actions.edit || actions.cancel || actions.attendance || appointment.conversation?.id || actions.email)) return null;
    return <div aria-label="Actions du rendez-vous" role="group" className="flex items-center gap-1.5 font-one">
      {actions.confirm && <ConfirmRdv iconOnly rdvId={appointment.id} appointment={appointment} onConfirm={() => onUpdated(appointment.id)} />}
      {actions.attendance && <ChangeStatusButtons iconOnly rdvId={appointment.id} currentStatus={appointment.status} onStatusChange={(id, status) => { if (onStatusChange) onStatusChange(id, status); else onUpdated(id); }} />}
      {actions.edit && <UpdateRdv iconOnly rdv={appointment as unknown as UpdateRdvFormProps} userId={userId || ""} onUpdate={() => onUpdated(appointment.id)} />}
      {appointment.conversation?.id && <RdvActionButton iconOnly href={`/messagerie/${appointment.conversation.id}`} tone="neutral" icon={MessageSquare}>Conversation</RdvActionButton>}
      {actions.email && <SendMessageRdv iconOnly rdvId={appointment.id} appointment={appointment} onMessageSent={() => onUpdated(appointment.id)} buttonLabel="Envoyer un mail" />}
      {actions.cancel && <CancelRdv iconOnly rdvId={appointment.id} appointment={appointment} onCancel={() => onUpdated(appointment.id)} />}
    </div>;
  }
  return <section aria-label="Actions du rendez-vous" className="@container rounded-2xl border border-white/10 bg-noir-600 p-3 font-one">
    <h3 className="mb-3 text-xs font-semibold text-white/85">{actions.edit || actions.attendance ? "Gérer le rendez-vous" : "Contacter le client"}</h3>
    {(actions.edit || actions.attendance) && <div className="grid grid-cols-2 gap-2">
      {actions.confirm && <ConfirmRdv rdvId={appointment.id} appointment={appointment} onConfirm={() => onUpdated(appointment.id)} />}
      {actions.attendance && <ChangeStatusButtons rdvId={appointment.id} currentStatus={appointment.status} onStatusChange={(id, status) => { if (onStatusChange) onStatusChange(id, status); else onUpdated(id); }} className="col-span-2" />}
      {actions.edit && <UpdateRdv rdv={appointment as unknown as UpdateRdvFormProps} userId={userId || ""} onUpdate={() => onUpdated(appointment.id)} />}
      {actions.cancel && <CancelRdv rdvId={appointment.id} appointment={appointment} onCancel={() => onUpdated(appointment.id)} />}
    </div>}
    {(appointment.conversation?.id || actions.email) && <div className={`grid grid-cols-2 gap-2 ${(actions.edit || actions.attendance) ? "mt-3 border-t border-white/10 pt-3" : ""}`}>
      {appointment.conversation?.id && <RdvActionButton href={`/messagerie/${appointment.conversation.id}`} tone="neutral" icon={MessageSquare}>Conversation</RdvActionButton>}
      {actions.email && <SendMessageRdv rdvId={appointment.id} appointment={appointment} onMessageSent={() => onUpdated(appointment.id)} buttonLabel="Envoyer un mail" />}
    </div>}
  </section>;
}
