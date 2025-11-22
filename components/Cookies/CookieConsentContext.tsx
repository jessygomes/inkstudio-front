"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface CookieConsentContextType {
  hasConsent: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  acceptAll: () => void;
  acceptAnalytics: () => void;
  acceptMarketing: () => void;
  rejectAll: () => void;
  showBanner: boolean;
  hideBanner: () => void;
}

const CookieConsentContext = createContext<
  CookieConsentContextType | undefined
>(undefined);

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      "useCookieConsent must be used within CookieConsentProvider"
    );
  }
  return context;
}

interface CookieConsentProviderProps {
  children: React.ReactNode;
}

export function CookieConsentProvider({
  children,
}: CookieConsentProviderProps) {
  const [hasConsent, setHasConsent] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Vérifier le consentement existant au chargement
  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("inkera_cookie_consent");
      const analyticsConsentStored =
        localStorage.getItem("inkera_analytics_consent") === "true";
      const marketingConsentStored =
        localStorage.getItem("inkera_marketing_consent") === "true";

      if (consent) {
        setHasConsent(true);
        setAnalyticsConsent(analyticsConsentStored);
        setMarketingConsent(marketingConsentStored);
        setShowBanner(false);
      } else {
        // Afficher la bannière si aucun consentement n'a été donné
        setShowBanner(true);
      }

      setIsLoaded(true);
    }
  }, []);

  // Injecter GA4 si consentement analytics donné
  useEffect(() => {
    if (analyticsConsent && typeof window !== "undefined") {
      // Inject Google Analytics
      const gtagScript = document.createElement("script");
      gtagScript.async = true;
      gtagScript.src =
        "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID";
      document.head.appendChild(gtagScript);

      const gtagConfigScript = document.createElement("script");
      gtagConfigScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID', {
          cookie_flags: 'SameSite=None;Secure'
        });
      `;
      document.head.appendChild(gtagConfigScript);

      // Marquer GA comme chargé
      console.log("✅ Google Analytics chargé avec consentement");
    }
  }, [analyticsConsent]);

  const acceptAll = () => {
    setHasConsent(true);
    setAnalyticsConsent(true);
    setMarketingConsent(true);
    setShowBanner(false);

    localStorage.setItem("inkera_cookie_consent", "true");
    localStorage.setItem("inkera_analytics_consent", "true");
    localStorage.setItem("inkera_marketing_consent", "true");

    console.log("✅ Tous les cookies acceptés");
  };

  const acceptAnalytics = () => {
    setHasConsent(true);
    setAnalyticsConsent(true);
    setShowBanner(false);

    localStorage.setItem("inkera_cookie_consent", "true");
    localStorage.setItem("inkera_analytics_consent", "true");
    localStorage.setItem("inkera_marketing_consent", "false");

    console.log("✅ Cookies Analytics acceptés");
  };

  const acceptMarketing = () => {
    setHasConsent(true);
    setMarketingConsent(true);

    localStorage.setItem("inkera_cookie_consent", "true");
    localStorage.setItem("inkera_marketing_consent", "true");

    console.log("✅ Cookies Marketing acceptés");
  };

  const rejectAll = () => {
    setHasConsent(true);
    setAnalyticsConsent(false);
    setMarketingConsent(false);
    setShowBanner(false);

    localStorage.setItem("inkera_cookie_consent", "true");
    localStorage.setItem("inkera_analytics_consent", "false");
    localStorage.setItem("inkera_marketing_consent", "false");

    console.log("❌ Tous les cookies refusés");
  };

  const hideBanner = () => {
    setShowBanner(false);
  };

  return (
    <CookieConsentContext.Provider
      value={{
        hasConsent,
        analyticsConsent,
        marketingConsent,
        acceptAll,
        acceptAnalytics,
        acceptMarketing,
        rejectAll,
        showBanner: showBanner && isLoaded,
        hideBanner,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}
