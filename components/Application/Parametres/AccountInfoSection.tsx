"use client";
import SettingsSectionHeader from "./SettingsSectionHeader";
import { Mail, MapPin, Pencil, Phone, Sparkles, UserRound, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import RdvActionButton from "@/components/Application/RDV/RdvActionButton";
import { formatPhoneNumber } from "@/lib/utils/formatPhoneNumber";

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
  const { data: session } = useSession();
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const photo = session?.user?.profileImage || session?.user?.image || null; // photo de profil du compte

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

  const planKey = typeof user?.saasPlan === "string" ? user.saasPlan : "";
  const planLabel = ({ FREE: "Gratuite", PRO: "Pro", BUSINESS: "Business" } as Record<string, string>)[planKey] || planKey;
  const owner = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const address = [user?.address, [user?.postalCode, user?.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const name = user?.salonName || owner || "Votre salon";
  const items: Array<{ label: string; icon: LucideIcon; value: ReactNode }> = [
    { label: "Titulaire", icon: UserRound, value: owner || null },
    { label: "Adresse e-mail", icon: Mail, value: user?.email ? <a href={"mailto:" + user.email} className="break-all transition hover:text-tertiary-400">{user.email}</a> : null },
    { label: "Téléphone", icon: Phone, value: user?.phone ? <a href={"tel:" + user.phone} className="transition hover:text-tertiary-400">{formatPhoneNumber(user.phone)}</a> : null },
    { label: "Adresse", icon: MapPin, value: address || null },
  ];
  return (<div className={styles.card}>
<SettingsSectionHeader icon={UserRound} title="Informations du compte" description="Les coordonnées associées à votre espace professionnel." expanded={openSections.account} controls="settings-account-content" onToggle={() => toggleSection("account")} />
{openSections.account && <div id="settings-account-content" className={styles.body}>
{loading ? <p role="status" className={styles.empty}>Chargement de votre profil…</p> : error ? <p role="alert" className={styles.notice}>Impossible de charger votre profil. Rechargez la page pour réessayer.</p> : <>
<div className="flex flex-wrap items-center gap-3.5 rounded-2xl bg-white/[0.04] p-4">
  <span aria-hidden="true" className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-tertiary-400 to-tertiary-500 text-xl font-semibold text-[#ffffff]">{photo && photo !== failedPhoto ? <Image src={photo} alt="" fill sizes="56px" unoptimized className="object-cover" onError={() => setFailedPhoto(photo)} /> : name.charAt(0).toUpperCase()}</span>
  <div className="min-w-0 flex-1">
    <p className="flex flex-wrap items-center gap-2"><span className="truncate text-base font-medium text-white">{name}</span>{planLabel && <span className="inline-flex h-5 items-center gap-1 rounded-md bg-tertiary-400/15 px-2 text-[10px] font-semibold text-tertiary-400"><Sparkles size={10} aria-hidden="true" />Offre {planLabel}</span>}</p>
    <p className="mt-1 text-xs text-white/45">Compte professionnel</p>
  </div>
  <RdvActionButton href="/mon-compte/modifier-salon" tone="neutral" icon={Pencil} className="!w-auto shrink-0">Modifier le profil</RdvActionButton>
</div>
<dl className="grid gap-2 sm:grid-cols-2">
{items.map(({ label, icon: Icon, value }) => <div key={label} className="flex min-w-0 items-start gap-3 rounded-xl bg-white/[0.04] px-3.5 py-3">
  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-tertiary-400/10 text-tertiary-400"><Icon size={14} aria-hidden="true" /></span>
  <div className="min-w-0"><dt className="text-[10px] font-medium uppercase tracking-wider text-white/40">{label}</dt><dd className={"mt-1 break-words text-xs leading-5 " + (value ? "text-white/90" : "text-white/30")}>{value || "Non renseigné"}</dd></div>
</div>)}
</dl></>}
<p className={styles.note}>Ces informations sont utilisées pour votre profil public et la facturation.</p>
</div>}
</div>);
}
