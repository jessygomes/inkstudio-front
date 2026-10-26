import Link from "next/link";
import { currentUser } from "@/lib/auth.server";
import InvitationRegister from "@/components/Auth/Form/InvitationRegister";
import type { Metadata } from "next";
import { ArrowRight, Gift, LockKeyhole, MailWarning } from "lucide-react";
import AuthShell from "@/components/Auth/AuthShell";
import InvitationSessionNotice from "@/components/Auth/InvitationSessionNotice";
import DashboardButton from "@/components/Shared/DashboardButton";
import { FormError } from "@/components/Shared/FormError";
import styles from "@/components/Auth/AuthForms.module.css";
import invitation from "@/components/Auth/Invitation.module.css";

export const metadata: Metadata = {
  title: "Votre invitation Inkera Studio",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function InvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";
  const user = await currentUser();
  let offer = null;
  let message = "Ce lien d’invitation est invalide, expiré ou déjà utilisé.";
  if (/^[a-f0-9]{64}$/.test(token)) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/auth/invitation?token=${encodeURIComponent(token)}`,
        { cache: "no-store" },
      );
      if (response.ok) offer = await response.json();
      else if (response.status >= 500 || response.status === 429)
        message =
          "Le service est temporairement indisponible. Réessayez dans quelques instants.";
    } catch {
      message =
        "Impossible de vérifier l’invitation. Réessayez dans quelques instants.";
    }
  }
  return (
    <AuthShell mode="register">
        {user ? (
          <div className={styles.card}>
            <span className={invitation.stateIcon}><LockKeyhole size={23} /></span>
            <header className={styles.heading}><span className={styles.kicker}><Gift size={13} />Votre invitation Inkera</span><h1>Vous êtes déjà connecté.</h1></header>
            <p className={invitation.stateText}>
              Cette invitation permet de créer un nouveau compte.
              Déconnectez-vous pour l’utiliser avec l’adresse e-mail souhaitée.
            </p>
            <InvitationSessionNotice token={token} />
            <div className={styles.footnote}><Link href="/dashboard">Retour à mon compte<ArrowRight size={12} className="ml-1 inline" /></Link></div>
          </div>
        ) : offer ? (
          <InvitationRegister offer={offer} token={token} />
        ) : (
          <div className={styles.card}>
            <span className={invitation.stateIcon}><MailWarning size={23} /></span>
            <header className={styles.heading}><span className={styles.kicker}>Votre invitation Inkera</span><h1>Invitation indisponible.</h1><p>Ce lien ne permet pas de poursuivre l’inscription pour le moment.</p></header>
            <FormError title="Impossible d’utiliser ce lien" message={message} />
            <p className={`${invitation.stateText} mt-5`}>Si le lien a expiré ou a déjà été utilisé, demandez une nouvelle invitation à la personne qui vous l’a partagé.</p>
            <div className={invitation.actions}><DashboardButton href="/connexion" className="!min-w-0">Se connecter<ArrowRight size={14} /></DashboardButton><DashboardButton href="/inscription" variant="secondary" className="!min-w-0">Créer un compte</DashboardButton></div>
          </div>
        )}
    </AuthShell>
  );
}
