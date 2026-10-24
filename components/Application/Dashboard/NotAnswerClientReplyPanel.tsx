"use client";
import { useId, useState } from "react";
import Image from "next/image";
import { LoaderCircle, Send, Star, X } from "lucide-react";
import { openImageInNewTab } from "@/lib/utils/openImage";
import { dashboardControl } from "./DashboardPrimitives";
import { toast } from "sonner";

interface Client {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface Appointment {
  id: string;
  title: string;
  client: Client;
  tatoueur: {
    name: string;
  };
}

interface FollowUpSubmission {
  id: string;
  rating: number;
  review?: string;
  photoUrl: string;
  createdAt: string;
  isAnswered: boolean;
  appointmentId: string;
  clientId: string;
  appointment: Appointment;
}

interface NotAnswerClientReplyPanelProps {
  selectedFollowUp: FollowUpSubmission;
  onClose: () => void;
  onReplySuccess: () => void;
}

export default function NotAnswerClientReplyPanel({
  selectedFollowUp,
  onClose,
  onReplySuccess,
}: NotAnswerClientReplyPanelProps) {
  const inputId = useId();
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);



  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return "Très insatisfait";
      case 2:
        return "Insatisfait";
      case 3:
        return "Neutre";
      case 4:
        return "Satisfait";
      case 5:
        return "Très satisfait";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReplySubmit = async () => {
    if (!selectedFollowUp || !replyText.trim()) {
      toast.error("Veuillez saisir une réponse");
      return;
    }

    setIsReplying(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/follow-up/reply/${selectedFollowUp.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            response: replyText,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de l'envoi de la réponse"
        );
      }

      toast.success(
        "Réponse envoyée avec succès ! Le client va recevoir un email."
      );

      // Appeler le callback de succès
      onReplySuccess();

      // Fermer la modale
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de la réponse"
      );
    } finally {
      setIsReplying(false);
    }
  };

  return <div className="flex h-full min-h-0 flex-col bg-noir-700 font-one"><header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-noir-600 p-4"><div className="min-w-0 flex-1"><p className="text-[10px] text-white/40">Suivi de cicatrisation</p><h2 className="mt-1 text-sm font-semibold text-white/90">{selectedFollowUp.appointment.client.firstName} {selectedFollowUp.appointment.client.lastName}</h2></div><button type="button" onClick={onClose} disabled={isReplying} aria-label="Fermer le suivi" className={dashboardControl + " size-8 !p-0"}><X size={16} /></button></header><div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 scrollbar-hidden"><section className="rounded-2xl border border-white/10 bg-noir-600 p-4"><div className="flex items-center justify-between gap-2"><h3 className="text-xs font-medium text-white/80">{selectedFollowUp.appointment.title}</h3><span className="flex items-center gap-1 text-[11px] text-amber-200"><Star size={12} />{selectedFollowUp.rating}/5</span></div><p className="mt-1.5 text-[10px] text-white/40">{getRatingLabel(selectedFollowUp.rating)} · {formatDate(selectedFollowUp.createdAt)}</p>{selectedFollowUp.review && <p className="mt-3 whitespace-pre-wrap text-xs leading-6 text-white/65">{selectedFollowUp.review}</p>}{selectedFollowUp.photoUrl && <button type="button" onClick={() => openImageInNewTab(selectedFollowUp.photoUrl)} aria-label="Agrandir la photo de cicatrisation" className="relative mt-3 block size-24 cursor-pointer overflow-hidden rounded-xl border border-white/10"><Image src={selectedFollowUp.photoUrl} alt="Photo de cicatrisation" fill sizes="96px" unoptimized className="object-cover" /></button>}</section><div className="rounded-2xl border border-white/10 bg-noir-600 p-4"><label htmlFor={inputId} className="mb-2 block text-xs font-medium text-white/75">Votre réponse</label><p className="mb-3 text-[11px] leading-5 text-white/40">Accompagnez votre client et donnez-lui vos conseils de cicatrisation. Votre réponse lui sera envoyée par email.</p><textarea id={inputId} value={replyText} onChange={event => setReplyText(event.target.value)} disabled={isReplying} rows={6} placeholder="Écrivez votre réponse…" className="w-full resize-y rounded-xl border border-white/10 bg-noir-700 p-3 text-xs leading-6 text-white placeholder:text-white/30 focus:border-tertiary-400/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400/10" /></div></div><footer className="flex shrink-0 justify-end gap-2 border-t border-white/10 bg-noir-600 p-4"><button type="button" onClick={onClose} disabled={isReplying} className={dashboardControl}>Fermer</button><button type="button" onClick={handleReplySubmit} disabled={isReplying || !replyText.trim()} className={dashboardControl + " !bg-white/90 !text-noir-700"}>{isReplying ? <LoaderCircle size={13} className="animate-spin" /> : <Send size={13} />}{isReplying ? "Envoi…" : "Envoyer la réponse"}</button></footer></div>;
}
