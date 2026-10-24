"use client";
import Image from "next/image";
import { useId, useState } from "react";
import { respondToReviewAction } from "@/lib/queries/review";
import { openImageInNewTab } from "@/lib/utils/openImage";
import { BadgeCheck, LoaderCircle, Send, Star, X } from "lucide-react";
import { dashboardControl } from "./DashboardPrimitives";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  photos: string[];
  isVerified: boolean;
  createdAt: string;
  salonResponse?: string | null;
  salonRespondedAt?: string | null;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  appointment?: {
    id: string;
    date: string;
    prestation: string;
  };
}

interface ReviewDetailsPanelProps {
  selectedReview: Review;
  onClose: () => void;
  onResponseSent: () => void;
}

export default function ReviewDetailsPanel({
  selectedReview,
  onClose,
  onResponseSent,
}: ReviewDetailsPanelProps) {
  const inputId = useId();
  const formId = useId();
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!response.trim()) {
      toast.error("Veuillez entrer une réponse");
      return;
    }

    try {
      setIsLoading(true);

      const result = await respondToReviewAction(
        selectedReview.id,
        response.trim()
      );

      if (result.ok) {
        toast.success(result.message || "Réponse publiée avec succès");
        setResponse("");
        onResponseSent();
      } else {
        toast.error(result.message || "Erreur lors de la publication");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return <div className="flex h-full min-h-0 flex-col bg-noir-700 font-one"><header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-noir-600 p-4"><div className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5 text-xs text-white/60">{selectedReview.author?.image ? <Image src={selectedReview.author.image} alt="" fill sizes="36px" unoptimized className="object-cover" /> : selectedReview.author?.name?.charAt(0) || "C"}</div><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold text-white/90">{selectedReview.author?.name || "Client anonyme"}</h2><p className="mt-1 text-[10px] text-white/40">{formatDate(selectedReview.createdAt)}</p></div><span className="flex shrink-0 items-center gap-1 text-xs text-amber-200"><Star size={13} />{selectedReview.rating.toLocaleString("fr-FR")}/5</span><button type="button" onClick={onClose} disabled={isLoading} aria-label="Fermer l’avis" className={dashboardControl + " size-8 !p-0"}><X size={16} /></button></header><div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 scrollbar-hidden"><section className="rounded-2xl border border-white/10 bg-noir-600 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-medium text-white/85">{selectedReview.title || "Avis client"}</h3>{selectedReview.isVerified && <span className="flex items-center gap-1 text-[10px] text-emerald-300"><BadgeCheck size={13} />Avis vérifié</span>}</div>{selectedReview.comment && <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-6 text-white/65">{selectedReview.comment}</p>}{selectedReview.appointment && <p className="mt-3 border-t border-white/[0.07] pt-3 text-[10px] text-white/40">{selectedReview.appointment.prestation} · {formatDate(selectedReview.appointment.date)}</p>}{!!selectedReview.photos?.length && <div className="mt-4 flex flex-wrap gap-2">{selectedReview.photos.map((photo,index) => <button type="button" key={photo + index} onClick={() => openImageInNewTab(photo)} aria-label={"Agrandir la photo " + (index + 1)} className="relative size-20 cursor-pointer overflow-hidden rounded-xl border border-white/10"><Image src={photo} alt={"Photo de l’avis " + (index + 1)} fill sizes="80px" unoptimized className="object-cover" /></button>)}</div>}</section>{selectedReview.salonResponse ? <section className="rounded-2xl border border-white/10 bg-noir-600 p-4"><h3 className="text-xs font-medium text-white/80">Votre réponse</h3><p className="mt-3 whitespace-pre-wrap break-words text-xs leading-6 text-white/65">{selectedReview.salonResponse}</p>{selectedReview.salonRespondedAt && <p className="mt-2 text-[10px] text-white/35">Publiée le {formatDate(selectedReview.salonRespondedAt)}</p>}</section> : <form id={formId} onSubmit={handleSubmitResponse} className="rounded-2xl border border-white/10 bg-noir-600 p-4"><label htmlFor={inputId} className="mb-2 block text-xs font-medium text-white/75">Répondre à cet avis</label><p className="mb-3 text-[11px] leading-5 text-white/40">Votre réponse sera visible sur le profil public du studio.</p><textarea id={inputId} value={response} onChange={event => setResponse(event.target.value)} disabled={isLoading} rows={6} placeholder="Remerciez votre client et répondez à son retour…" className="w-full resize-y rounded-xl border border-white/10 bg-noir-700 p-3 text-xs leading-6 text-white placeholder:text-white/30 focus:border-tertiary-400/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400/10" /></form>}</div><footer className="flex shrink-0 justify-end gap-2 border-t border-white/10 bg-noir-600 p-4"><button type="button" onClick={onClose} disabled={isLoading} className={dashboardControl}>Fermer</button>{!selectedReview.salonResponse && <button type="submit" form={formId} disabled={isLoading || !response.trim()} className={dashboardControl + " !bg-white/90 !text-noir-700"}>{isLoading ? <LoaderCircle size={13} className="animate-spin" /> : <Send size={13} />}{isLoading ? "Publication…" : "Publier la réponse"}</button>}</footer></div>;
}
