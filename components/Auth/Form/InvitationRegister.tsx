"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Check, CreditCard, Eye, EyeOff, Gift, LoaderCircle, LockKeyhole, Mail, MailCheck, Phone, UserRound } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import styles from "../AuthForms.module.css";
import invitation from "../Invitation.module.css";

type Offer = {
  email: string | null;
  role: "user_salon" | "user_tatoueur" | null;
  plan: "PRO" | "BUSINESS" | null;
  durationMonths: number;
};
export default function InvitationRegister({
  offer,
  token,
}: {
  offer: Offer;
  token: string;
}) {
  const [role, setRole] = useState(offer.role || "");
  const selectedPlan =
    offer.plan || (role === "user_salon" ? "BUSINESS" : "PRO");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState(offer.email || "");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    if (data.get("password") !== data.get("confirmation")) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            role,
            saasPlan: selectedPlan,
            invitationToken: token,
            salonName: data.get("salonName") || undefined,
            firstName: data.get("firstName"),
            lastName: data.get("lastName"),
            phone: data.get("phone") || "",
            password: data.get("password"),
            website: data.get("website") || "",
          }),
        },
      );
      const result = await response.json();
      if (!response.ok || result.error)
        throw new Error(
          Array.isArray(result.message)
            ? result.message.join(" ")
            : result.message || "Inscription impossible.",
        );
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de joindre le serveur.",
      );
    } finally {
      setPending(false);
    }
  };
  const planLabel = selectedPlan === "BUSINESS" ? "Business" : "Pro";
  if (done) return <div className={styles.card}>
    <span className={invitation.stateIcon} data-success="true"><MailCheck size={23} aria-hidden="true" /></span>
    <header className={styles.heading}><span className={styles.kicker}>Bienvenue chez Inkera</span><h1>Votre compte est créé.</h1><p>Il ne reste plus qu’à confirmer votre adresse e-mail.</p></header>
    <FormSuccess title="Vérifiez votre boîte de réception" message={`Un e-mail de vérification a été envoyé à ${email}.`} />
    <ol className={invitation.nextSteps}>
      <li><span>1</span><p><strong>Ouvrez l’e-mail Inkera</strong>Pensez à regarder dans vos courriers indésirables si vous ne le trouvez pas.</p></li>
      <li><span>2</span><p><strong>Confirmez votre adresse</strong>Suivez le lien reçu pour vérifier votre compte.</p></li>
      <li><span>3</span><p><strong>Retrouvez votre espace</strong>Connectez-vous pour profiter de votre offre {planLabel}.</p></li>
    </ol>
    <DashboardButton href="/connexion" className={invitation.submitButton}>Aller à la connexion<ArrowRight size={15} /></DashboardButton>
  </div>;

  return <div>
    <div className={styles.card}>
      <header className={styles.heading}><span className={styles.kicker}><Gift size={14} />Une invitation pour vous</span><h1>Votre place chez Inkera.</h1><p>Créez votre compte pour profiter de votre abonnement offert.</p></header>
      <section className={invitation.offer} aria-labelledby="invitation-offer-title">
        <div className={invitation.offerTop}><span className={invitation.offerIcon}><Gift size={19} /></span><div><p className={invitation.offerLabel}>Votre invitation comprend</p><h2 id="invitation-offer-title">{offer.durationMonths} mois offert{offer.durationMonths > 1 ? "s" : ""}{role || offer.plan ? ` avec ${planLabel}` : " sur Inkera"}</h2><p className={invitation.offerDescription}>{role ? `Un espace ${role === "user_salon" ? "salon" : "indépendant"} avec la formule ${planLabel}.` : offer.plan ? `La formule ${planLabel} est incluse dans votre invitation.` : "Pro pour un indépendant ou Business pour un salon, selon le profil choisi."}</p></div></div>
        <div className={invitation.offerTags}><span><CreditCard size={12} />Sans carte bancaire</span><span><Check size={12} />Aucun prélèvement automatique</span></div>
        <p className={invitation.offerNote}>La période offerte débute à la création du compte. À son terme, votre compte repasse en Free, sans prélèvement automatique.</p>
      </section>
      <form onSubmit={submit} aria-busy={pending}>
        <fieldset className={invitation.form} disabled={pending}>
          <legend className="sr-only">Créer un compte avec cette invitation</legend>
          {!offer.role && <fieldset className={styles.profileOptions}>
            <legend>Votre activité *</legend>
            {([
              { value: "user_tatoueur", label: "Indépendant", hint: "Votre propre activité", icon: UserRound },
              { value: "user_salon", label: "Un salon", hint: "Un lieu, une équipe", icon: Building2 },
            ] as const).map(({ value, label, hint, icon: Icon }) => <label key={value} className={styles.profileOption}>
              <input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} required className="sr-only" /><Icon size={21} aria-hidden="true" /><span><strong>{label}</strong><small>{hint}</small></span><span className={styles.choiceMark} aria-hidden="true"><Check size={11} /></span>
            </label>)}
          </fieldset>}
          <fieldset className={styles.accessSection}>
            <legend><UserRound size={15} />Votre profil</legend>
            <div className={invitation.sectionBody}>
              <div className={invitation.fieldRow}>
                <div className={styles.field}><label htmlFor="invitation-firstName">Prénom *</label><div className={styles.inputWrap}><UserRound size={15} className={styles.inputIcon} /><input id="invitation-firstName" name="firstName" autoComplete="given-name" required placeholder="Votre prénom" className={styles.withIcon} /></div></div>
                <div className={styles.field}><label htmlFor="invitation-lastName">Nom *</label><div className={styles.inputWrap}><UserRound size={15} className={styles.inputIcon} /><input id="invitation-lastName" name="lastName" autoComplete="family-name" required placeholder="Votre nom" className={styles.withIcon} /></div></div>
              </div>
              {role === "user_salon" && <div className={styles.field}><label htmlFor="invitation-salonName">Nom du salon *</label><div className={styles.inputWrap}><Building2 size={15} className={styles.inputIcon} /><input id="invitation-salonName" name="salonName" autoComplete="organization" required maxLength={150} placeholder="Le nom de votre studio" className={styles.withIcon} /></div></div>}
              <div className={styles.field}><label htmlFor="invitation-phone">Téléphone<span className={styles.optional}>Facultatif</span></label><div className={styles.inputWrap}><Phone size={15} className={styles.inputIcon} /><input id="invitation-phone" name="phone" type="tel" autoComplete="tel" placeholder="06 12 34 56 78" className={styles.withIcon} /></div></div>
            </div>
          </fieldset>
          <fieldset className={styles.accessSection}>
            <legend><LockKeyhole size={15} />Vos accès</legend>
            <div className={invitation.sectionBody}>
              <div className={styles.field}><label htmlFor="invitation-email">Adresse e-mail *</label><div className={styles.inputWrap}><Mail size={15} className={styles.inputIcon} /><input id="invitation-email" name="email" type="email" value={email} onChange={event => setEmail(event.target.value)} readOnly={!!offer.email} required autoComplete="email" autoCapitalize="none" placeholder="vous@votrestudio.fr" aria-describedby={offer.email ? "invitation-email-note" : undefined} className={styles.withIcon} /></div>
                {offer.email && <p id="invitation-email-note" className={invitation.lockedNote}><LockKeyhole size={11} />Cette invitation est liée à cette adresse e-mail.</p>}
              </div>
              <div className={styles.field}><label htmlFor="invitation-password">Mot de passe *</label><div className={styles.inputWrap}><LockKeyhole size={15} className={styles.inputIcon} /><input id="invitation-password" name="password" type={showPassword ? "text" : "password"} required minLength={6} autoComplete="new-password" placeholder="Créez votre mot de passe" aria-describedby="invitation-password-hint" className={styles.withIcon} /><button type="button" className={styles.passwordToggle} aria-controls="invitation-password" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={showPassword} onClick={() => setShowPassword(show => !show)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div><p id="invitation-password-hint" className={invitation.lockedNote}>6 caractères minimum.</p></div>
              <div className={styles.field}><label htmlFor="invitation-confirmation">Confirmez le mot de passe *</label><div className={styles.inputWrap}><LockKeyhole size={15} className={styles.inputIcon} /><input id="invitation-confirmation" name="confirmation" type={showConfirmation ? "text" : "password"} required minLength={6} autoComplete="new-password" placeholder="Saisissez-le une seconde fois" className={styles.withIcon} /><button type="button" className={styles.passwordToggle} aria-controls="invitation-confirmation" aria-label={showConfirmation ? "Masquer la confirmation" : "Afficher la confirmation"} aria-pressed={showConfirmation} onClick={() => setShowConfirmation(show => !show)}>{showConfirmation ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
            </div>
          </fieldset>
          <div className="hidden" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
          <FormError message={error} />
          <div className="space-y-3"><DashboardButton type="submit" disabled={pending} className={invitation.submitButton}>{pending ? <LoaderCircle size={15} className="animate-spin" /> : <ArrowRight size={15} />}{pending ? "Création de votre compte…" : "Créer mon compte avec cette invitation"}</DashboardButton><p className={invitation.submitNote}>Les champs marqués d’un * sont obligatoires. Un e-mail de vérification vous sera envoyé après l’inscription.</p></div>
        </fieldset>
      </form>
    </div>
    <p className={styles.footnote}>Vous avez déjà un compte ? <Link href="/connexion">Se connecter</Link></p>
  </div>;
}
