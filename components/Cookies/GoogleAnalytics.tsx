"use client";
import { useEffect } from "react";
import { useCookieConsent } from "./CookieConsentContext";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

export default function GoogleAnalytics({
  measurementId,
}: GoogleAnalyticsProps) {
  const { analyticsConsent } = useCookieConsent();

  useEffect(() => {
    if (analyticsConsent && measurementId && typeof window !== "undefined") {
      // Vérifier si GA4 n'est pas déjà chargé
      if (document.querySelector(`script[src*="${measurementId}"]`)) {
        return;
      }

      // Charger Google Analytics
      const script1 = document.createElement("script");
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement("script");
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        
        gtag('config', '${measurementId}', {
          cookie_flags: 'SameSite=None;Secure',
          anonymize_ip: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false
        });
      `;
      document.head.appendChild(script2);
    }
  }, [analyticsConsent, measurementId]);

  // Fonction utilitaire pour tracker des événements
  useEffect(() => {
    if (analyticsConsent && typeof window !== "undefined") {
      window.gtag =
        window.gtag ||
        function (...args: unknown[]) {
          (window.dataLayer = window.dataLayer || []).push(args);
        };
    }
  }, [analyticsConsent]);

  return null;
}

// Hook pour tracker des événements
export function useGoogleAnalytics() {
  const { analyticsConsent } = useCookieConsent();

  const trackEvent = (
    eventName: string,
    parameters?: Record<string, string | number | boolean>
  ) => {
    if (analyticsConsent && typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, {
        ...parameters,
        // Ajouter des métadonnées INKERA
        app_name: "INKERA_Studio",
        send_to: "GA_MEASUREMENT_ID",
      });
    }
  };

  const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (analyticsConsent && typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "GA_MEASUREMENT_ID", {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }
  };

  const trackPurchase = (
    transactionId: string,
    value: number,
    currency = "EUR"
  ) => {
    if (analyticsConsent && typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "purchase", {
        transaction_id: transactionId,
        value: value,
        currency: currency,
        app_name: "INKERA_Studio",
      });
    }
  };

  return {
    trackEvent,
    trackPageView,
    trackPurchase,
    canTrack: analyticsConsent,
  };
}
