"use client";
import { useState } from "react";
import { useCookieConsent } from "./CookieConsentContext";
import { FaCookie, FaTimes, FaShieldAlt, FaChartLine } from "react-icons/fa";
import Link from "next/link";

export default function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, hideBanner } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0" />

      {/* Bannière */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-noir-700 to-noir-600 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-lg">
          {!showDetails ? (
            /* Vue simple compacte */
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-tertiary-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaCookie className="w-4 h-4 text-tertiary-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium font-one text-sm mb-1">
                    Cookies & Analytics
                  </h3>
                  <p className="text-white/80 text-xs font-one mb-3">
                    Nous utilisons des cookies essentiels et Google Analytics
                    pour améliorer votre expérience.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={acceptAll}
                      className="cursor-pointer px-4 py-1.5 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs"
                    >
                      Accepter
                    </button>

                    <button
                      onClick={() => setShowDetails(true)}
                      className="cursor-pointer px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
                    >
                      Détails
                    </button>

                    {/* <button
                      onClick={rejectAll}
                      className="cursor-pointer px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-colors font-medium font-one text-xs"
                    >
                      Refuser
                    </button> */}
                  </div>
                </div>

                <button
                  onClick={hideBanner}
                  className="cursor-pointer w-6 h-6 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-colors flex-shrink-0"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>

              <p className="text-white/50 text-xs font-one mt-2 text-center">
                <Link
                  href="/politique-de-confidentialite"
                  className="text-tertiary-400 hover:underline"
                >
                  Politique de confidentialité
                </Link>
              </p>
            </div>
          ) : (
            /* Vue détaillée */
            <CookieDetailsModal
              onAcceptAll={acceptAll}
              onRejectAll={rejectAll}
              onBack={() => setShowDetails(false)}
              onClose={hideBanner}
            />
          )}
        </div>
      </div>
    </>
  );
}

function CookieDetailsModal({
  onAcceptAll,
  onRejectAll,
  onBack,
  onClose,
}: {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const { acceptAnalytics } = useCookieConsent();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleSavePreferences = () => {
    if (analyticsEnabled) {
      acceptAnalytics();
    } else {
      onRejectAll();
    }
    onClose();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium font-one text-sm">
          Préférences cookies
        </h3>
        <button
          onClick={onClose}
          className="cursor-pointer w-6 h-6 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <FaTimes className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Cookies essentiels */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium font-one text-sm">
                Essentiels
              </span>
            </div>
            <div className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-one">
              Requis
            </div>
          </div>
          <p className="text-white/70 text-xs font-one">
            Authentification, sécurité, navigation.
          </p>
        </div>

        {/* Cookies analytics */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FaChartLine className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium font-one text-sm">
                Google Analytics
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-tertiary-500"></div>
            </label>
          </div>
          <p className="text-white/70 text-xs font-one">
            Analyse du trafic pour améliorer le site. Données anonymisées.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-white/10">
        <button
          onClick={onBack}
          className="cursor-pointer px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-colors font-medium font-one text-sm"
        >
          ← Retour
        </button>

        <button
          onClick={onRejectAll}
          className="cursor-pointer px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors font-medium font-one text-sm"
        >
          Tout refuser
        </button>

        <button
          onClick={handleSavePreferences}
          className="w-fit cursor-pointer px-4 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-sm"
        >
          Sauvegarder
        </button>

        <button
          onClick={onAcceptAll}
          className="cursor-pointer px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium font-one text-sm"
        >
          Tout accepter
        </button>
      </div>

      <p className="text-white/50 text-xs font-one mt-4 text-center">
        Vous pouvez modifier ces préférences à tout moment dans les paramètres.
      </p>
    </div>
  );
}
