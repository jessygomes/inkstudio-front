"use client";

import { useId, useState } from "react";
import { Check, ChartNoAxesCombined, Megaphone, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useCookieConsent } from "./CookieConsentContext";
import DashboardButton from "@/components/Shared/DashboardButton";
import s from "./Cookies.module.css";

type PreferencesProps = { compact?: boolean; onSaved?: () => void };

export default function CookiePreferences({ compact = false, onSaved }: PreferencesProps) {
  const { analyticsConsent, marketingConsent, savePreferences } = useCookieConsent();
  const [draft, setDraft] = useState<{ analytics: boolean; marketing: boolean } | null>(null);
  const [saved, setSaved] = useState(false);
  const analytics = draft?.analytics ?? analyticsConsent;
  const marketing = draft?.marketing ?? marketingConsent;
  const id = useId();
  function save(choices: { analytics: boolean; marketing: boolean }) {
    savePreferences(choices);
    setDraft(null);
    setSaved(true);
    onSaved?.();
  }
  return <div className={`${s.preferences} ${compact ? s.compact : ""}`}>
    {!compact && <div className={s.preferenceHeading}><span className={s.icon}><SlidersHorizontal size={20} aria-hidden="true" /></span><div><span className={s.eyebrow}>Vous gardez la main</span><h3>Vos préférences de cookies</h3><p>Choisissez ce que vous souhaitez autoriser. Vous pourrez revenir sur votre décision à tout moment.</p></div></div>}
    <div className={s.categories}>
      <div className={s.category}><div className={s.categoryHeading}><ShieldCheck size={19} aria-hidden="true" /><h4>Cookies essentiels</h4><span className={s.required}><Check size={12} aria-hidden="true" />Toujours actifs</span></div><p>Nécessaires à la connexion, à la sécurité et au fonctionnement du site.</p></div>
      {[{ key: "analytics" as const, title: "Mesure d’audience", text: "Google Analytics nous aide à comprendre la fréquentation du site et à améliorer votre expérience.", Icon: ChartNoAxesCombined, checked: analytics }, { key: "marketing" as const, title: "Marketing & publicité", text: "Permettent de personnaliser les publicités et de mesurer les campagnes.", Icon: Megaphone, checked: marketing }].map(({ key, title, text, Icon, checked }) => <div key={key} className={s.category}><div className={s.categoryHeading}><Icon size={19} aria-hidden="true" /><h4><label htmlFor={`${id}-${key}`}>{title}</label></h4><label className={s.switch}><input id={`${id}-${key}`} type="checkbox" role="switch" checked={checked} aria-describedby={`${id}-${key}-description`} onChange={event => { setDraft({ analytics, marketing, [key]: event.target.checked }); setSaved(false); }} /><span aria-hidden="true" /></label></div><p id={`${id}-${key}-description`}>{text}</p></div>)}
    </div>
    <div className={s.preferenceActions}><DashboardButton onClick={() => save({ analytics, marketing })}>Enregistrer mes choix <Check size={15} aria-hidden="true" /></DashboardButton><DashboardButton variant="secondary" onClick={() => save({ analytics: false, marketing: false })}>Tout refuser</DashboardButton><DashboardButton variant="secondary" onClick={() => save({ analytics: true, marketing: true })}>Tout accepter</DashboardButton></div>
    <p className={s.feedback} role="status" aria-live="polite">{saved ? "Vos préférences ont bien été enregistrées." : "Seuls les cookies essentiels restent actifs si vous refusez les cookies facultatifs."}</p>
  </div>;
}
