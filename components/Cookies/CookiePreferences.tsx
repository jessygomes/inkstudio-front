"use client";
import { useCookieConsent } from "@/components/Cookies/CookieConsentContext";
import { FaCookie, FaShieldAlt, FaChartLine, FaTrash } from "react-icons/fa";
import { useState } from "react";
import { toast } from "sonner";

export default function CookiePreferences() {
  const { 
    analyticsConsent, 
    marketingConsent, 
    acceptAnalytics, 
    acceptMarketing, 
    rejectAll,
    acceptAll 
  } = useCookieConsent();
  
  const [tempAnalytics, setTempAnalytics] = useState(analyticsConsent);
  const [tempMarketing, setTempMarketing] = useState(marketingConsent);

  const handleSave = () => {
    if (tempAnalytics && !analyticsConsent) {
      acceptAnalytics();
    }
    if (tempMarketing && !marketingConsent) {
      acceptMarketing();
    }
    if (!tempAnalytics && !tempMarketing) {
      rejectAll();
    }
    
    toast.success("Préférences cookies sauvegardées !");
  };

  const handleClearAll = () => {
    localStorage.removeItem("inkera_cookie_consent");
    localStorage.removeItem("inkera_analytics_consent");
    localStorage.removeItem("inkera_marketing_consent");
    
    // Reload pour réafficher la bannière
    window.location.reload();
  };

  return (
    <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-tertiary-500/20 rounded-full flex items-center justify-center">
          <FaCookie className="w-5 h-5 text-tertiary-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold font-one">Gestion des cookies</h3>
          <p className="text-white/70 text-xs font-one">
            Contrôlez vos préférences de confidentialité
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Cookies essentiels */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FaShieldAlt className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium font-one text-sm">
                Cookies essentiels
              </span>
            </div>
            <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-one">
              Toujours activé
            </div>
          </div>
          <p className="text-white/70 text-xs font-one">
            Nécessaires au fonctionnement : authentification, sécurité, navigation.
          </p>
        </div>

        {/* Analytics */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FaChartLine className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium font-one text-sm">
                Analytics (Google Analytics)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tempAnalytics}
                onChange={(e) => setTempAnalytics(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-500"></div>
            </label>
          </div>
          <p className="text-white/70 text-xs font-one mb-1">
            Analyse du trafic et amélioration de l&apos;expérience utilisateur.
          </p>
          <p className="text-white/50 text-xs font-one">
            ID: G-W3LKS9M53F • Anonymisé • Durée: 2 ans
          </p>
        </div>

        {/* Marketing */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FaCookie className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium font-one text-sm">
                Marketing & Publicité
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tempMarketing}
                onChange={(e) => setTempMarketing(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-500"></div>
            </label>
          </div>
          <p className="text-white/70 text-xs font-one mb-1">
            Personnalisation des publicités et suivi des campagnes.
          </p>
          <p className="text-white/50 text-xs font-one">
            Partenaires tiers • Durée: 1 an
          </p>
        </div>
      </div>

      {/* Statut actuel */}
      <div className="mt-6 p-4 bg-tertiary-500/10 rounded-lg border border-tertiary-500/30">
        <h4 className="text-tertiary-400 font-medium font-one text-sm mb-2">
          Statut actuel
        </h4>
        <div className="space-y-1 text-xs font-one">
          <p className="text-white/70">
            Analytics: {analyticsConsent ? "✅ Accepté" : "❌ Refusé"}
          </p>
          <p className="text-white/70">
            Marketing: {marketingConsent ? "✅ Accepté" : "❌ Refusé"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={handleSave}
          className="cursor-pointer flex-1 px-4 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-sm"
        >
          💾 Sauvegarder
        </button>
        
        <button
          onClick={acceptAll}
          className="cursor-pointer px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium font-one text-sm"
        >
          ✅ Tout accepter
        </button>
        
        <button
          onClick={handleClearAll}
          className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium font-one text-sm flex items-center gap-2"
        >
          <FaTrash className="w-3 h-3" />
          Effacer tout
        </button>
      </div>
      
      <p className="text-white/50 text-xs font-one mt-4 text-center">
        Les modifications prennent effet immédiatement. Certains changements nécessitent un rechargement de la page.
      </p>
    </div>
  );
}