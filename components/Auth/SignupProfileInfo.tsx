import { CalendarDays, Info, Link2, Sparkles, UserRound, UsersRound } from "lucide-react";
import type { SignupRole } from "@/lib/offers";
import styles from "./AuthForms.module.css";

export default function SignupProfileInfo({ role }: { role: SignupRole }) {
  const salon = role === "user_salon";
  return (
    <aside className={styles.profileInfo} aria-labelledby="profile-info-title">
      <div className={styles.profileInfoHeading}>
        <span className={styles.profileInfoIcon}><Info size={15} aria-hidden="true" /></span>
        <div>
          <p className={styles.profileInfoKicker}>Bon à savoir</p>
          <h2 id="profile-info-title">{salon ? "Un espace pour votre salon et ses artistes" : "Un espace à vous, même au sein d’un salon"}</h2>
        </div>
      </div>
      <ul className={styles.profileInfoList}>
        {salon ? <>
          <li><UsersRound size={15} aria-hidden="true" /><p><strong>Réunissez vos artistes.</strong> Reliez les profils des tatoueurs indépendants qui travaillent dans votre salon.</p></li>
          <li><CalendarDays size={15} aria-hidden="true" /><p><strong>Gérez l’équipe avec Business.</strong> Consultez les rendez-vous des tatoueurs créés dans votre salon ou reliés à celui-ci.</p></li>
        </> : <>
          <li><UserRound size={15} aria-hidden="true" /><p><strong>Gardez votre propre profil.</strong> Présentez votre travail et gérez votre activité en votre nom.</p></li>
          <li><Link2 size={15} aria-hidden="true" /><p><strong>Travaillez en lien avec un salon.</strong> Vous pouvez y relier votre profil tout en conservant votre espace personnel.</p></li>
        </>}
      </ul>
      <div className={styles.profileInfoOffer}>
        <Sparkles size={15} aria-hidden="true" />
        <p>
          <strong>{salon ? "Business : 2 mois offerts, sans carte bancaire." : "Pro : 3 mois offerts, sans carte bancaire."}</strong>
          <span>{salon ? "L’offre Business est réservée aux salons. L’offre Pro est réservée aux tatoueurs indépendants." : "L’offre Pro est réservée aux tatoueurs indépendants. L’offre Business est réservée aux salons."}</span>
          <span>Vous pourrez choisir votre abonnement à l’étape suivante.</span>
        </p>
      </div>
    </aside>
  );
}
