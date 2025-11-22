// Exemple d'usage des analytics avec consentement
// À utiliser dans vos composants pour tracker les événements

import { useGoogleAnalytics } from "@/components/Cookies/GoogleAnalytics";

export function ExempleUsageAnalytics() {
  const { trackEvent, trackPageView, trackPurchase, canTrack } =
    useGoogleAnalytics();

  // Tracker une inscription
  const handleSignup = () => {
    trackEvent("sign_up", {
      method: "email",
      plan: "free",
    });
  };

  // Tracker un clic sur bouton
  const handleCTAClick = () => {
    trackEvent("cta_click", {
      button_name: "essai_gratuit",
      page_location: window.location.pathname,
    });
  };

  // Tracker un achat/abonnement
  const handleSubscription = (plan: string, price: number) => {
    trackPurchase(`sub_${Date.now()}`, price);
    trackEvent("subscribe", {
      plan_name: plan,
      value: price,
      currency: "EUR",
    });
  };

  // Tracker navigation
  const handlePageView = (path: string) => {
    trackPageView(path, document.title);
  };

  // Événements métier spécifiques
  const trackTattooBooking = () => {
    trackEvent("tattoo_booking_started", {
      category: "engagement",
      label: "booking_flow",
    });
  };

  const trackPortfolioView = (artistId: string) => {
    trackEvent("portfolio_view", {
      artist_id: artistId,
      category: "content",
    });
  };

  return {
    handleSignup,
    handleCTAClick,
    handleSubscription,
    handlePageView,
    trackTattooBooking,
    trackPortfolioView,
    canTrack, // Pour vérifier si le tracking est autorisé
  };
}

// Hook pour les événements de conversion
export function useConversionTracking() {
  const { trackEvent, canTrack } = useGoogleAnalytics();

  const trackLead = (source: string) => {
    if (canTrack) {
      trackEvent("generate_lead", {
        lead_source: source,
        value: 1,
        currency: "EUR",
      });
    }
  };

  const trackTrialStart = (plan: string) => {
    if (canTrack) {
      trackEvent("begin_checkout", {
        currency: "EUR",
        value: 0,
        item_name: `trial_${plan}`,
      });
    }
  };

  const trackFormSubmit = (formName: string) => {
    if (canTrack) {
      trackEvent("form_submit", {
        form_name: formName,
        page_location: window.location.pathname,
      });
    }
  };

  return {
    trackLead,
    trackTrialStart,
    trackFormSubmit,
  };
}
