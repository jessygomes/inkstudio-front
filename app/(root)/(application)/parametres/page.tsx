"use client";

export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import { useState } from "react";
import // CiBellOn,
// CiLock,
// CiMail,
"react-icons/ci";
import AccountInfoSection from "@/components/Application/Parametres/AccountInfoSection";
import AppointmentModeSetting from "@/components/Application/Parametres/AppointmentModeSetting";
import AppointmentConfirmationSetting from "@/components/Application/Parametres/AppointmentConfirmationSetting";
import SubscriptionSection from "@/components/Application/Parametres/SubscriptionSection";
import SecuritySection from "@/components/Application/Parametres/SecuritySection";
import VerificationDocumentsSection from "@/components/Application/Parametres/VerificationDocumentsSection";
import { MdOutlinePalette } from "react-icons/md";
import { CiSettings } from "react-icons/ci";
import ColorProfile from "@/components/Application/MonCompte/ColorProfile";
import NotifChatPreference from "@/components/Application/Parametres/NotifChatPreference";

export default function ParamPage() {
  const { data: session } = useSession();

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
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4 px-3 sm:px-6 lg:px-10 pb-10 lg:pb-0">
      <div className="flex flex-col relative gap-4 sm:gap-6 w-full mt-4 pb-10 xl:pb-0 xl:mt-23">
        {/* Header responsive */}
        <div className="">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center">
                <CiSettings
                  size={20}
                  className="sm:w-7 sm:h-7 text-tertiary-400 animate-pulse"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white font-one tracking-wide uppercase">
                  <span className="hidden sm:inline">Paramètres du compte</span>
                  <span className="sm:hidden">Paramètres</span>
                </h1>
                <p className="text-white/70 text-xs font-one mt-1">
                  <span className="hidden sm:inline">
                    Gérez votre compte, abonnement et préférences
                  </span>
                  <span className="sm:hidden">Compte et préférences</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Section Informations du compte responsive */}
          <AccountInfoSection
            openSections={openSections}
            toggleSection={toggleSection}
          />

          <VerificationDocumentsSection />

          <AppointmentModeSetting userId={session?.user?.id || null} />

          <AppointmentConfirmationSetting userId={session?.user?.id || null} />

          <ColorProfile />

          <NotifChatPreference />

          <SubscriptionSection
            openSections={openSections}
            toggleSection={toggleSection}
            userId={session?.user?.id || null}
          />

          <SecuritySection
            openSections={openSections}
            toggleSection={toggleSection}
          />

          {/* Section Préférences responsive */}
          <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
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
                    {/* <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="America/New_York">
                      America/New_York (UTC-5)
                    </option> */}
                  </select>
                </div>

                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <h3 className="text-white font-one mb-2 text-sm sm:text-base">
                    Langue
                  </h3>
                  <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors">
                    <option value="fr">Français</option>
                    {/* <option value="en">English</option>
                    <option value="es">Español</option> */}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
