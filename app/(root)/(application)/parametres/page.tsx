"use client";

export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { CiSettings } from "react-icons/ci";
import AccountInfoSection from "@/components/Application/Parametres/AccountInfoSection";
import AppointmentModeSetting from "@/components/Application/Parametres/AppointmentModeSetting";
import AppointmentConfirmationSetting from "@/components/Application/Parametres/AppointmentConfirmationSetting";
import BillingHistorySection from "@/components/Application/Parametres/BillingHistorySection";
import SubscriptionSection from "@/components/Application/Parametres/SubscriptionSection";
import SecuritySection from "@/components/Application/Parametres/SecuritySection";
import VerificationDocumentsSection from "@/components/Application/Parametres/VerificationDocumentsSection";
// import { MdOutlinePalette } from "react-icons/md";
import ColorProfile from "@/components/Application/MonCompte/ColorProfile";
import NotifChatPreference from "@/components/Application/Parametres/NotifChatPreference";

export default function ParamPage() {
  const { data: session } = useSession();
  const [billingRefreshKey, setBillingRefreshKey] = useState(0);

  // États pour les sections dépliantes
  const [openSections, setOpenSections] = useState({
    account: true,
    subscription: true,
    notifications: false,
    security: false,
    preferences: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="wrapper-global px-3 sm:px-4 lg:px-6 pb-24 lg:pb-4">
      <section className="w-full space-y-3 pt-4">
        {/* Header */}
        <div className="dashboard-hero rounded-2xl border border-white/12 bg-noir-700/6 p-3 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-tertiary-400/20 border border-tertiary-400/25 flex items-center justify-center">
              <CiSettings size={20} className="text-tertiary-500" />
            </div>
            <div className="space-y-1">
              <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">
                Paramètres
              </p>
              <div className="flex flex-wrap items-end gap-x-2 gap-y-0.5">
                <h1 className="text-white font-one text-base sm:text-lg font-semibold leading-tight">
                  Paramètres du compte
                </h1>
                <p className="text-white/55 font-two text-xs">
                  Compte, abonnement, notifications et sécurité
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Section Informations du compte responsive */}
          <AccountInfoSection
            openSections={openSections}
            toggleSection={toggleSection}
          />

          <VerificationDocumentsSection />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
            <AppointmentModeSetting
              userId={session?.user?.id || null}
              saasPlan={session?.user?.saasPlan || null}
            />

            <AppointmentConfirmationSetting
              userId={session?.user?.id || null}
            />
          </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
          <NotifChatPreference />
          <ColorProfile />
          </div>

          <SubscriptionSection
            openSections={openSections}
            toggleSection={toggleSection}
            userId={session?.user?.id || null}
            onBillingRefresh={() =>
              setBillingRefreshKey((currentKey) => currentKey + 1)
            }
          />

          <BillingHistorySection
            userId={session?.user?.id || null}
            refreshKey={billingRefreshKey}
          />

          <SecuritySection
            openSections={openSections}
            toggleSection={toggleSection}
          />

          {/* Section Préférences responsive */}
          {/* <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
            <button
              onClick={() => toggleSection("preferences")}
              className="w-full flex items-center justify-between mb-3 sm:mb-4"
            >
              <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl text-white font-one">
                <MdOutlinePalette
                  size={20}
                  className="sm:w-6 sm:h-6 text-tertiary-400"
                />
                Préférences
              </h2>
              <div className="text-white/50">
                {openSections.preferences ? "−" : "+"}
              </div>
            </button>

            {openSections.preferences && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <h3 className="text-white font-one mb-2 text-sm sm:text-base">
                    <span className="hidden sm:inline">Fuseau horaire</span>
                    <span className="sm:hidden">Fuseau</span>
                  </h3>
                  <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors">
                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="America/New_York">
                      America/New_York (UTC-5)
                    </option>
                  </select>
                </div>

                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <h3 className="text-white font-one mb-2 text-sm sm:text-base">
                    Langue
                  </h3>
                  <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            )}
          </div> */}
        </div>
      </section>
    </div>
  );
}
