"use client";

import { useState, type ReactNode } from "react";
import { Check, Info, Link2, LoaderCircle, LockKeyhole, Minus, ShieldCheck } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import SideFormDrawer from "@/components/Shared/SideFormDrawer";
import SettingsSwitch from "../Parametres/SettingsSwitch";
import { artistPermissions, salonPermissions, type ResidencyPermissionKey } from "./residency-permissions";
import styles from "./ResidencyPermissions.module.css";

export default function ResidencyPermissionsDrawer({ permissions, artist, profileName, salonName, busy, onChange, onClose, extra, notice }: {
  permissions: Record<string, unknown> | null;
  extra?: ReactNode;
  notice?: ReactNode;
  artist: boolean;
  profileName: string;
  salonName: string;
  busy: boolean;
  onChange: (key: ResidencyPermissionKey, checked: boolean) => Promise<void>;
  onClose: () => void;
}) {
  const own = artist ? artistPermissions : salonPermissions;
  const received = artist ? salonPermissions : artistPermissions;
  const ownCount = own.filter(item => permissions?.[item.key] === true).length;
  const profileLabel = profileName || (artist ? "Ce salon" : "Cet indépendant");
  const [savingKey, setSavingKey] = useState<ResidencyPermissionKey | null>(null);
  const save = async (key: ResidencyPermissionKey, checked: boolean) => {
    if (busy || savingKey) return;
    setSavingKey(key);
    try { await onChange(key, checked); } finally { setSavingKey(null); }
  };

  return <SideFormDrawer title="Autorisations et planning" category="Équipe et salons" description={`Définissez les droits liés à ${profileLabel}. Chaque autorisation s’applique uniquement à ce rattachement.`} onClose={onClose} busy={busy}
    footer={<><p className={styles.saveStatus} role="status">{busy ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />}{busy ? "Enregistrement en cours…" : "Les changements sont enregistrés automatiquement."}</p><DashboardButton variant="secondary" disabled={busy} onClick={onClose}>Fermer</DashboardButton></>}>
    <div className={styles.content}>
      <div className={styles.context}><span className={styles.contextIcon}><Link2 size={18} /></span><div><p>{artist ? "Votre salon de résidence" : "Tatoueur indépendant rattaché"}</p><strong>{profileLabel}</strong><span>{artist ? "Autorisations propres à ce salon" : salonName || "Ce salon"}</span></div>{permissions && <span className={styles.count}>{ownCount} / {own.length} droits accordés</span>}</div>
      {notice}
      {permissions && <>
      <div className={styles.explanation}><Info size={15} /><p><strong>Chacun garde la main sur ses autorisations.</strong> Vous modifiez les droits que vous accordez. Les droits reçus sont décidés par {artist ? "le salon" : "le tatoueur"} et sont affichés en lecture seule.</p></div>
      <section aria-labelledby="residency-own-rights">
        <header className={styles.sectionHeading}><ShieldCheck size={16} /><div><h3 id="residency-own-rights">Ce que vous autorisez</h3><p>{artist ? "Les actions que ce salon peut effectuer pour votre activité." : "Les actions que cet indépendant peut effectuer dans votre salon."}</p></div></header>
        <div className={styles.permissionList}>{own.map(({ key, title, description, icon: Icon }) => <div className={styles.permission} key={key}>
          <span className={styles.permissionIcon}><Icon size={17} aria-hidden="true" /></span><div className={styles.permissionText}><h4>{title}</h4><p id={`permission-${key}-description`}>{description}</p></div>
          <SettingsSwitch label={title} descriptionId={`permission-${key}-description`} checked={permissions?.[key] === true} disabled={busy} busy={savingKey === key} onChange={event => void save(key, event.target.checked)} />
        </div>)}</div>
      </section>
      <section aria-labelledby="residency-received-rights">
        <header className={styles.sectionHeading}><LockKeyhole size={16} /><div><h3 id="residency-received-rights">{artist ? "Ce que le salon vous autorise" : "Ce que le tatoueur vous autorise"}</h3><p>Lecture seule · Ces choix sont gérés par {artist ? "le salon" : "l’indépendant"}.</p></div></header>
        <div className={styles.permissionList}>{received.map(({ key, receivedTitle, receivedDescription, icon: Icon }) => {
          const enabled = permissions?.[key] === true;
          return <div key={key} className={styles.permission}><span className={styles.permissionIcon}><Icon size={16} aria-hidden="true" /></span><div className={styles.permissionText}><h4>{receivedTitle}</h4><p>{receivedDescription}</p></div><span className={styles.receivedStatus} data-enabled={enabled}>{enabled ? <Check size={12} /> : <Minus size={12} />}{enabled ? "Accordé" : "Non accordé"}</span></div>;
        })}</div>
      </section>
      <div className={styles.explanation}><Info size={15} /><p><strong>Les autorisations complètent les présences.</strong> Les dates ou jours de présence déterminent le salon disponible, et les horaires personnels du tatoueur déterminent les créneaux. Pour ouvrir la réservation publique, le salon et le tatoueur doivent tous deux donner leur accord.</p></div>
      </>}
      {extra}
    </div>
  </SideFormDrawer>;
}
