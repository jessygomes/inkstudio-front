"use client";
import SettingsSectionHeader from "./SettingsSectionHeader";
import { UserRound } from "lucide-react";

import styles from "./SettingsCard.module.css";

import { getUserParamAction } from "@/lib/queries/user";
import { useEffect, useState } from "react";

type SectionKeys =
  | "account"
  | "subscription"
  | "notifications"
  | "security"
  | "preferences";

interface AccountInfoSectionProps {
  userId: string | null;
  openSections: {
    account: boolean;
    subscription: boolean;
    notifications: boolean;
    security: boolean;
    preferences: boolean;
  };
  toggleSection: (section: SectionKeys) => void;
}

export default function AccountInfoSection({
  userId,
  openSections,
  toggleSection,
}: AccountInfoSectionProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchUserData = async () => {
      if (!userId) { setLoading(false); return; }
      setLoading(true);
      setError(false);
      try {
        const result = await getUserParamAction(userId);
        if (!cancelled) { setUser(result.data); setError(!result.data); }
      } catch { if (!cancelled) setError(true); }
      finally { if (!cancelled) setLoading(false); }
    };
    void fetchUserData();
    return () => { cancelled = true; };
  }, [userId]);

  return (<div className={styles.card}>
<SettingsSectionHeader icon={UserRound} title="Informations du compte" description="Les coordonnées associées à votre espace professionnel." expanded={openSections.account} controls="settings-account-content" onToggle={() => toggleSection("account")} />
{openSections.account && <div id="settings-account-content" className={styles.body}>
{loading ? <p role="status" className={styles.empty}>Chargement de votre profil…</p> : error ? <p role="alert" className={styles.notice}>Impossible de charger votre profil. Rechargez la page pour réessayer.</p> : <dl className={styles.details}>
{[{label:"Salon",value:user?.salonName},{label:"Titulaire",value:[user?.firstName,user?.lastName].filter(Boolean).join(" ")},{label:"Adresse email",value:user?.email},{label:"Téléphone",value:user?.phone},{label:"Adresse",value:[user?.address,[user?.postalCode,user?.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")},{label:"Offre",value:user?.saasPlan}].map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.value || "Non renseigné"}</dd></div>)}
</dl>}
<p className={styles.note}>Ces informations sont utilisées pour votre profil public et la facturation.</p>
</div>}
</div>);
}
