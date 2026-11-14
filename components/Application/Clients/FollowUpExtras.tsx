"use client";

import Image from "next/image";
import { HeartPulse, Mail, MessageCircle, Sparkles } from "lucide-react";
import {
  HEALING_LABELS,
  REPLY_SUGGESTIONS,
  isHealingConcern,
  type FollowUpReplyChannel,
  type HealingStatus,
} from "@/lib/types/followUp";

/** Pastille de l’état de la cicatrisation (orange si le client signale un souci). */
export function FollowUpHealing({ status }: { status?: HealingStatus | null }) {
  if (!status) return null;
  const concern = isHealingConcern(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium ${concern ? "bg-amber-400/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"}`}>
      <HeartPulse size={12} aria-hidden="true" />{HEALING_LABELS[status]}
    </span>
  );
}

/** Photos d’un suivi (1 à 3), agrandies dans un nouvel onglet. */
export function FollowUpPhotos({ urls, clientName }: { urls: string[]; clientName: string }) {
  if (!urls.length) return null;
  return (
    <div className="grid grid-cols-3 gap-2">
      {urls.map((url, index) => (
        <a key={url} href={url} target="_blank" rel="noopener noreferrer" aria-label={`Agrandir la photo ${index + 1}`} className="relative block aspect-square overflow-hidden rounded-xl bg-white/[0.05]">
          <Image src={url} alt={`Photo de cicatrisation ${index + 1} de ${clientName}`} fill sizes="(max-width: 768px) 33vw, 200px" unoptimized className="object-cover" />
        </a>
      ))}
    </div>
  );
}

/** Réponse au suivi : réponses proposées selon l’état de la cicatrisation, texte libre et canal d’envoi. */
export function FollowUpReplyFields({
  id,
  healingStatus,
  value,
  onChange,
  channel,
  onChannelChange,
  disabled,
  maxLength = 2000,
}: {
  id: string;
  healingStatus?: HealingStatus | null;
  value: string;
  onChange: (value: string) => void;
  channel: FollowUpReplyChannel;
  onChannelChange: (channel: FollowUpReplyChannel) => void;
  disabled?: boolean;
  maxLength?: number;
}) {
  const suggestions = REPLY_SUGGESTIONS[healingStatus ?? "DEFAULT"];
  const channels: { value: FollowUpReplyChannel; label: string; hint: string; icon: typeof Mail }[] = [
    { value: "EMAIL", label: "Par e-mail", hint: "Le client reçoit votre réponse par e-mail.", icon: Mail },
    { value: "EMAIL_AND_INKERA", label: "E-mail + messagerie Inkera", hint: "Aussi dans votre conversation Inkera avec le client, s’il en a une.", icon: MessageCircle },
  ];
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-white/55"><Sparkles size={12} aria-hidden="true" className="text-tertiary-400" />Réponses proposées</p>
        <div className="flex flex-col gap-1.5">
          {suggestions.map((text) => (
            <button key={text} type="button" disabled={disabled} onClick={() => onChange(text)} className="cursor-pointer rounded-xl bg-white/[0.05] px-3 py-2 text-left text-[11px] leading-5 text-white/70 transition hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
              {text}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-white/75">Votre réponse</label>
        <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} rows={6} maxLength={maxLength} placeholder="Choisissez une réponse proposée ou écrivez la vôtre…" className="w-full resize-y rounded-xl bg-white/[0.05] p-3 text-xs leading-6 text-white outline-none transition placeholder:text-white/30 focus:bg-white/[0.07] focus:ring-2 focus:ring-tertiary-400/30" />
        <p className="mt-1 text-right text-[10px] text-white/35">{value.length}/{maxLength}</p>
      </div>
      <div role="radiogroup" aria-label="Envoyer la réponse" className="grid gap-1.5 sm:grid-cols-2">
        {channels.map(({ value: option, label, hint, icon: Icon }) => {
          const active = channel === option;
          return (
            <button key={option} type="button" role="radio" aria-checked={active} disabled={disabled} onClick={() => onChannelChange(option)} className={`flex cursor-pointer items-start gap-2 rounded-xl p-3 text-left transition disabled:cursor-not-allowed ${active ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.05] text-white/60 hover:bg-white/[0.08]"}`}>
              <Icon size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span><span className="block text-xs font-medium">{label}</span><span className="mt-0.5 block text-[10px] leading-4 text-white/45">{hint}</span></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Message de confirmation après l’envoi, selon le canal réellement utilisé. */
export function replySentMessage(channel: FollowUpReplyChannel, inkeraSent?: boolean) {
  if (channel === "EMAIL") return "Réponse envoyée au client par e-mail";
  return inkeraSent ? "Réponse envoyée par e-mail et dans la messagerie Inkera" : "Réponse envoyée par e-mail (le client n’a pas de conversation Inkera avec vous)";
}
