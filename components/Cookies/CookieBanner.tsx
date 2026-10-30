"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Cookie, SlidersHorizontal, ArrowLeft, X, ArrowUpRight } from "lucide-react";
import { useCookieConsent } from "./CookieConsentContext";
import DashboardButton from "@/components/Shared/DashboardButton";
import CookiePreferences from "./CookiePreferences";
import s from "./Cookies.module.css";

export default function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, hideBanner } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const customize = useRef<HTMLButtonElement>(null);
  const detailsWereOpen = useRef(false);
  useEffect(() => {
    if (!showDetails && detailsWereOpen.current) customize.current?.focus();
    detailsWereOpen.current = showDetails;
  }, [showDetails]);
  if (!showBanner) return null;
  function openDetails() { setShowDetails(true); panel.current?.focus(); }
  function closeDetails() { setShowDetails(false); }
  return <div className={s.bannerPosition}>
    <section ref={panel} tabIndex={-1} className={`${s.banner} ${showDetails ? s.expanded : ""}`} aria-labelledby="cookie-banner-title" onKeyDown={event => { if (event.key === "Escape") { if (showDetails) closeDetails(); else hideBanner(); } }}>
      <button className={s.close} type="button" onClick={hideBanner} aria-label="Fermer sans accepter les cookies facultatifs"><X size={18} /></button>
      <div className={s.bannerHeading}><span className={s.icon}><Cookie size={23} aria-hidden="true" /></span><div><span className={s.eyebrow}>Votre navigation, vos choix</span><h2 id="cookie-banner-title">{showDetails ? "Réglons vos préférences." : "Une place pour vos préférences."}</h2></div></div>
      {showDetails ? <><button type="button" className={s.back} onClick={closeDetails}><ArrowLeft size={14} />Retour</button><CookiePreferences compact onSaved={() => setShowDetails(false)} /></> : <><p className={s.bannerText}>Les cookies essentiels font fonctionner le site. Avec votre accord, les cookies d’audience et de marketing nous aident à améliorer votre expérience.</p><div className={s.bannerActions}><DashboardButton variant="secondary" onClick={rejectAll}>Tout refuser</DashboardButton><DashboardButton variant="secondary" onClick={acceptAll}>Tout accepter</DashboardButton><button ref={customize} type="button" onClick={openDetails} className={s.customize}><SlidersHorizontal size={15} aria-hidden="true" />Personnaliser</button></div></>}
      <div className={s.bannerFooter}><span>Modifiables à tout moment</span><Link href="/politique-de-confidentialite#article-08">Confidentialité & cookies <ArrowUpRight size={12} aria-hidden="true" /></Link></div>
    </section>
  </div>;
}
