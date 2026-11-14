"use client";
import { useId, useState } from "react";
import { Send, Star, X } from "lucide-react";
import { toast } from "sonner";
import RdvActionButton from "@/components/Application/RDV/RdvActionButton";
import { FollowUpHealing, FollowUpPhotos, FollowUpReplyFields, replySentMessage } from "@/components/Application/Clients/FollowUpExtras";
import { replySuiviAction } from "@/lib/queries/followUp";
import { followUpPhotos, followUpRatingLabel, type FollowUpReplyChannel, type HealingStatus } from "@/lib/types/followUp";

interface FollowUpSubmission {
  id: string;
  rating: number;
  healingStatus?: HealingStatus | null;
  review?: string | null;
  photoUrl: string;
  photoUrls?: string[] | null;
  createdAt: string;
  isAnswered: boolean;
  appointmentId: string;
  clientId?: string | null;
  appointment: {
    id: string;
    title: string;
    client: { firstName?: string; lastName?: string };
    tatoueur?: { name: string } | null;
  };
}

interface NotAnswerClientReplyPanelProps {
  selectedFollowUp: FollowUpSubmission;
  onClose: () => void;
  onReplySuccess: () => void;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });

/** Réponse à un suivi de cicatrisation depuis le tableau de bord. */
export default function NotAnswerClientReplyPanel({ selectedFollowUp, onClose, onReplySuccess }: NotAnswerClientReplyPanelProps) {
  const inputId = useId();
  const [replyText, setReplyText] = useState("");
  const [channel, setChannel] = useState<FollowUpReplyChannel>("EMAIL");
  const [isReplying, setIsReplying] = useState(false);
  const clientName = [selectedFollowUp.appointment.client.firstName, selectedFollowUp.appointment.client.lastName].filter(Boolean).join(" ") || "Client";

  const handleReplySubmit = async () => {
    if (!replyText.trim()) { toast.error("Veuillez saisir une réponse"); return; }
    setIsReplying(true);
    try {
      // Action serveur : ajoute le jeton de la session (la route exige d’être connecté).
      const result = await replySuiviAction(selectedFollowUp.id, replyText.trim(), channel);
      if (!result.ok) throw new Error(result.message || "Erreur lors de l'envoi de la réponse");
      toast.success(replySentMessage(channel, result.data?.inkeraSent));
      onReplySuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'envoi de la réponse");
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-noir-700 font-one">
      <header className="flex shrink-0 items-center gap-3 bg-noir-600 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-white/40">Suivi de cicatrisation</p>
          <h2 className="mt-1 truncate text-sm font-semibold text-white/90">{clientName}</h2>
        </div>
        <RdvActionButton tone="neutral" iconOnly size="sm" icon={X} onClick={onClose} disabled={isReplying}>Fermer le suivi</RdvActionButton>
      </header>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 scrollbar-hidden">
        <section className="space-y-3 rounded-2xl bg-noir-600 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-xs font-medium text-white/80">{selectedFollowUp.appointment.title}</h3>
            <span className="flex shrink-0 items-center gap-1 text-[11px] text-amber-200"><Star size={12} />{selectedFollowUp.rating}/5</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FollowUpHealing status={selectedFollowUp.healingStatus} />
            <span className="text-[10px] text-white/40">{followUpRatingLabel(selectedFollowUp.rating)} · {formatDate(selectedFollowUp.createdAt)}</span>
          </div>
          {selectedFollowUp.review && <p className="whitespace-pre-wrap text-xs leading-6 text-white/65">{selectedFollowUp.review}</p>}
          <FollowUpPhotos urls={followUpPhotos(selectedFollowUp)} clientName={clientName} />
        </section>
        <section className="rounded-2xl bg-noir-600 p-4">
          <FollowUpReplyFields id={inputId} healingStatus={selectedFollowUp.healingStatus} value={replyText} onChange={setReplyText} channel={channel} onChannelChange={setChannel} disabled={isReplying} />
        </section>
      </div>
      <footer className="flex shrink-0 justify-end gap-2 bg-noir-600 p-4">
        <RdvActionButton tone="neutral" className="!w-auto" onClick={onClose} disabled={isReplying}>Fermer</RdvActionButton>
        <RdvActionButton tone="primary" className="!w-auto" icon={Send} loading={isReplying} disabled={!replyText.trim()} onClick={() => void handleReplySubmit()}>{isReplying ? "Envoi…" : "Envoyer la réponse"}</RdvActionButton>
      </footer>
    </div>
  );
}
