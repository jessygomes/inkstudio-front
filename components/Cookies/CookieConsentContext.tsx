"use client";

import { createContext, useContext, useEffect, useState } from "react";

type CookiePreferences = { analytics: boolean; marketing: boolean };
interface CookieConsentContextType {
  hasConsent: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  savePreferences: (preferences: CookiePreferences) => void;
  acceptAll: () => void;
  acceptAnalytics: () => void;
  acceptMarketing: () => void;
  rejectAll: () => void;
  showBanner: boolean;
  hideBanner: () => void;
}
const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) throw new Error("useCookieConsent must be used within CookieConsentProvider");
  return context;
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [hasConsent, setHasConsent] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("inkera_cookie_consent");
    setHasConsent(Boolean(consent));
    setAnalyticsConsent(Boolean(consent) && localStorage.getItem("inkera_analytics_consent") === "true");
    setMarketingConsent(Boolean(consent) && localStorage.getItem("inkera_marketing_consent") === "true");
    setShowBanner(!consent);
    setIsLoaded(true);
  }, []);

  const savePreferences = ({ analytics, marketing }: CookiePreferences) => {
    localStorage.setItem("inkera_analytics_consent", String(analytics));
    localStorage.setItem("inkera_marketing_consent", String(marketing));
    localStorage.setItem("inkera_cookie_consent", "true");
    setHasConsent(true);
    setAnalyticsConsent(analytics);
    setMarketingConsent(marketing);
    setShowBanner(false);
  };
  const acceptAll = () => savePreferences({ analytics: true, marketing: true });
  const rejectAll = () => savePreferences({ analytics: false, marketing: false });
  const acceptAnalytics = () => savePreferences({ analytics: true, marketing: marketingConsent });
  const acceptMarketing = () => savePreferences({ analytics: analyticsConsent, marketing: true });
  const hideBanner = () => setShowBanner(false);

  return <CookieConsentContext.Provider value={{ hasConsent, analyticsConsent, marketingConsent, savePreferences, acceptAll, acceptAnalytics, acceptMarketing, rejectAll, showBanner: showBanner && isLoaded, hideBanner }}>{children}</CookieConsentContext.Provider>;
}
