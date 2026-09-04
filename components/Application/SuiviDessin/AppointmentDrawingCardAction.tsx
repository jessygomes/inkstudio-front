"use client";

import { useEffect, useState } from "react";
import { FilePenLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createDrawingCard,
  getDrawingCards,
  getAppointmentDrawingCardStatus,
} from "@/lib/queries/suiviDessin";
import type { AppointmentCardStatus } from "@/lib/types/suiviDessin";
import DashboardButton from "@/components/Shared/DashboardButton";

export default function AppointmentDrawingCardAction({
  appointmentId,
  allowCreate = true,
}: {
  appointmentId: string;
  allowCreate?: boolean;
}) {
  const [status, setStatus] = useState<AppointmentCardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [statusUnavailable, setStatusUnavailable] = useState(false);

  useEffect(() => {
    setLoading(true);
    setStatusUnavailable(false);
    const statusRequest = allowCreate
      ? getAppointmentDrawingCardStatus(appointmentId)
      : getDrawingCards().then((cards) => {
          const card = cards.find(
            (drawingCard) => drawingCard.tattooAppointmentId === appointmentId,
          );

          return {
            appointmentId,
            appointmentCompleted: false,
            canCreate: false,
            cardExists: Boolean(card),
            cardId: card?.id ?? null,
            cardStatus: card?.status ?? null,
          };
        });

    statusRequest
      .then(setStatus)
      .catch(() => {
        setStatus(null);
        setStatusUnavailable(true);
      })
      .finally(() => setLoading(false));
  }, [allowCreate, appointmentId]);

  if (loading)
    return (
      <div className="flex items-center gap-2 p-3 text-xs text-white/35">
        <Loader2 size={13} className="animate-spin" /> Vérification du suivi
        dessin…
      </div>
    );

  const create = async () => {
    try {
      setCreating(true);
      const card = await createDrawingCard({
        sourceAppointmentId: appointmentId,
      });
      setStatus((current) => ({
        appointmentId,
        appointmentCompleted: current?.appointmentCompleted ?? false,
        canCreate: true,
        cardExists: true,
        cardId: card.id,
        cardStatus: card.status,
      }));
      setStatusUnavailable(false);
      toast.success("Card de dessin créée");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Création impossible",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="dashboard-embedded-section flex items-center justify-between gap-3 rounded-2xl border border-tertiary-400/15 p-3">
      <div>
        <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-tertiary-400 font-one">
          Suivi de dessin
        </p>
        <p className="text-[10px] text-white/40">
          {status?.cardExists
            ? "Une card est associée à ce rendez-vous."
            : !allowCreate
              ? "Aucune card n'est associée à ce rendez-vous."
            : statusUnavailable
              ? "La vérification est indisponible, mais la création reste accessible."
              : "Créer une card à partir de ce rendez-vous."}
        </p>
      </div>
      {status?.cardExists ? (
        <DashboardButton
          href={
            status.cardId
              ? `/suiviDessin?cardId=${encodeURIComponent(status.cardId)}`
              : "/suiviDessin"
          }
          variant="primary"
          className="!min-w-0 shrink-0 !rounded-xl !px-3 !py-2 !text-[11px]"
        >
          <FilePenLine size={14} />
          Voir la card
        </DashboardButton>
      ) : allowCreate ? (
        <DashboardButton
          variant="primary"
          disabled={creating}
          onClick={create}
          // className="!min-w-0 shrink-0 !px-3 !py-2 !text-[11px]"
        >
          {creating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <FilePenLine size={14} />
          )}{" "}
          Créer la card
        </DashboardButton>
      ) : null}
    </div>
  );
}
