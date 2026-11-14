"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, CheckCircle2, Copy, MailPlus, MessageCircle, PenTool, Send, Share2, type LucideIcon } from "lucide-react";
import RdvActionButton from "@/components/Application/RDV/RdvActionButton";
import {
  createClientInvitationAction,
  getClientInvitationStatusAction,
  type ClientInvitationState,
} from "@/lib/queries/client-invitation";

type Props = {
  clientId: string;
  firstName?: string | null;
  email?: string | null;
  /** Fiche déjà reliée à un compte Inkera (connu par la liste) : évite un appel. */
  linked?: boolean;
  className?: string;
};

const BENEFITS: { icon: LucideIcon; text: string }[] = [
  { icon: CalendarCheck, text: "Il retrouve les rendez-vous que vous lui créez, avec leurs rappels." },
  { icon: MessageCircle, text: "Vous échangez dans la messagerie Inkera, rattachée à sa fiche." },
  { icon: PenTool, text: "Ses dessins et ses suivis de cicatrisation arrivent dans son espace." },
];

const dateFr = (value: string) => new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

function statusLine(invitation: ClientInvitationState | null): string | null {
  if (!invitation) return null;
  if (invitation.status === "EXPIRED") return `L’invitation du ${dateFr(invitation.createdAt)} a expiré : renvoyez-en une.`;
  if (invitation.status !== "ACTIVE") return null;
  return invitation.emailSentAt
    ? `Invitation envoyée par e-mail le ${dateFr(invitation.emailSentAt)} · valable jusqu’au ${dateFr(invitation.expiresAt)}.`
    : `Lien d’invitation créé le ${dateFr(invitation.createdAt)} · valable jusqu’au ${dateFr(invitation.expiresAt)}.`;
}

/** Invitation du client à rejoindre Inkera People : envoi par e-mail, copie ou partage du lien. */
export default function ClientInvitationCard({ clientId, firstName, email, linked: linkedHint, className = "" }: Props) {
  const name = firstName?.trim() || "votre client";
  const [linked, setLinked] = useState(!!linkedHint);
  const [invitation, setInvitation] = useState<ClientInvitationState | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<"email" | "copy" | "share" | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function"), []);

  useEffect(() => {
    let active = true;
    setUrl(null);
    setLinked(!!linkedHint);
    if (linkedHint) return;
    void getClientInvitationStatusAction(clientId).then((result) => {
      if (!active || !result.ok) return;
      setLinked(result.data.linked);
      setInvitation(result.data.invitation);
    });
    return () => { active = false; };
  }, [clientId, linkedHint]);

  const createLink = async (sendEmail: boolean) => {
    const result = await createClientInvitationAction(clientId, sendEmail);
    if (!result.ok) {
      if (result.code === "CLIENT_ALREADY_LINKED") setLinked(true);
      toast.error(result.message);
      return null;
    }
    setUrl(result.data.url);
    setInvitation(result.data.invitation);
    return result.data;
  };

  const sendEmail = async () => {
    setBusy("email");
    const created = await createLink(true);
    setBusy(null);
    if (!created) return;
    if (created.emailSent) toast.success(`Invitation envoyée à ${email}`);
    else toast.error("L’e-mail n’a pas pu partir. Copiez ou partagez le lien à la place.");
  };

  const linkUrl = async () => url ?? (await createLink(false))?.url ?? null;

  const copy = async () => {
    setBusy("copy");
    const link = await linkUrl();
    setBusy(null);
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Lien d’invitation copié");
    } catch {
      toast.error("Copie impossible : sélectionnez le lien et copiez-le à la main.");
    }
  };

  const share = async () => {
    setBusy("share");
    const link = await linkUrl();
    setBusy(null);
    if (!link) return;
    try {
      await navigator.share({ title: "Invitation Inkera", text: "Retrouvez vos rendez-vous et échangez avec nous sur Inkera :", url: link });
    } catch {
      // partage annulé par l'utilisateur
    }
  };

  if (linked) {
    return (
      <section aria-label="Compte Inkera du client" className={`flex items-start gap-3 rounded-2xl bg-emerald-400/[0.08] p-4 ${className}`}>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300"><CheckCircle2 size={17} aria-hidden="true" /></span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">Compte Inkera relié</h3>
          <p className="mt-0.5 text-xs leading-5 text-white/55">{firstName?.trim() || "Ce client"} retrouve ses rendez-vous dans son espace et peut vous écrire dans la messagerie Inkera.</p>
        </div>
      </section>
    );
  }

  const status = statusLine(invitation);
  return (
    <section aria-label="Inviter le client sur Inkera" className={`rounded-2xl bg-noir-600 p-4 sm:p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-tertiary-400/15 text-tertiary-400"><MailPlus size={17} aria-hidden="true" /></span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">Invitez {name} sur Inkera</h3>
          <p className="mt-0.5 text-xs leading-5 text-white/50">Gratuit pour votre client. Avec son compte, créé à l’adresse de sa fiche :</p>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {BENEFITS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex gap-2.5 text-xs leading-5 text-white/70"><Icon size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-tertiary-400" />{text}</li>
        ))}
      </ul>
      {!email?.trim()
        ? <p className="mt-4 rounded-xl bg-amber-400/10 px-3 py-2.5 text-xs leading-5 text-amber-300">Ajoutez l’e-mail de {name} à sa fiche pour l’inviter.</p>
        : <>
            {status && <p className="mt-4 text-[11px] leading-5 text-white/45">{status}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <RdvActionButton tone="primary" icon={Send} loading={busy === "email"} disabled={!!busy} className="!w-auto flex-1 sm:flex-none" onClick={() => void sendEmail()}>{invitation?.emailSentAt && invitation.status === "ACTIVE" ? "Renvoyer par e-mail" : "Envoyer par e-mail"}</RdvActionButton>
              <RdvActionButton tone="neutral" icon={Copy} loading={busy === "copy"} disabled={!!busy} className="!w-auto flex-1 sm:flex-none" onClick={() => void copy()}>Copier le lien</RdvActionButton>
              {canShare && <RdvActionButton tone="neutral" icon={Share2} loading={busy === "share"} disabled={!!busy} className="!w-auto flex-1 sm:flex-none" onClick={() => void share()}>Partager</RdvActionButton>}
            </div>
            <p className="mt-3 text-[10px] leading-4 text-white/35">Le lien est personnel : seul un compte avec l’adresse {email} pourra retrouver ces rendez-vous.</p>
          </>}
    </section>
  );
}
