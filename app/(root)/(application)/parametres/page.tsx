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
import ColorProfile from "@/components/Application/MonCompte/ColorProfile";
import NotifChatPreference from "@/components/Application/Parametres/NotifChatPreference";
import InspirationSalonSetting from "@/components/Application/Parametres/InspirationSalonSetting";
import PageHeader from "@/components/Shared/PageHeader";

import { SettingsGroup, SettingsNavigation } from "@/components/Application/Parametres/SettingsLayout";

export default function ParamPage() {
  const { data: session } = useSession();
  const [billingRefreshKey, setBillingRefreshKey] = useState(0);


  // États pour les sections dépliantes
  const [openSections, setOpenSections] = useState({
    account: true,
    subscription: true,
    notifications: false,
    security: true,
    preferences: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="min-h-screen bg-noir-700 gap-4 px-3 pb-24 sm:px-4 lg:px-10 lg:pb-10">
      <div className="space-y-6 pt-4">
        <div>
          <PageHeader icon={<CiSettings size={20} className="text-tertiary-400" />} title="Paramètres" />
          <p className="mt-2 text-sm text-white/55">Personnalisez votre espace et gérez votre compte au même endroit.</p>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          <SettingsNavigation />
          <div className="min-w-0 space-y-10">
            <SettingsGroup id="compte" title="Compte et documents" description="Vos informations professionnelles et les documents de vérification de votre compte.">
              <AccountInfoSection userId={session?.user?.id || null} openSections={openSections} toggleSection={toggleSection} />
              <VerificationDocumentsSection />
            </SettingsGroup>
            <SettingsGroup id="rendez-vous" title="Rendez-vous" description="Choisissez comment les rendez-vous sont confirmés et qui peut accéder à votre agenda.">
              <AppointmentConfirmationSetting userId={session?.user?.id || null} />
              {session?.user?.role === "user_tatoueur" && (
                <AppointmentModeSetting userId={session.user.id || null} saasPlan={session.user.saasPlan || null} />
              )}
            </SettingsGroup>
            <SettingsGroup id="preferences" title="Préférences" description="Adaptez les notifications, les couleurs et la visibilité de votre portfolio.">
              <div className="grid items-start gap-4 2xl:grid-cols-2">
                <NotifChatPreference />
                <ColorProfile />
              </div>
              <InspirationSalonSetting userId={session?.user?.id || null} />
            </SettingsGroup>
            <SettingsGroup id="facturation" title="Abonnement et factures" description="Retrouvez votre offre, vos paiements et vos justificatifs de facturation.">
              <SubscriptionSection openSections={openSections} toggleSection={toggleSection} userId={session?.user?.id || null}
                onBillingRefresh={() => setBillingRefreshKey((currentKey) => currentKey + 1)} />
              <BillingHistorySection userId={session?.user?.id || null} refreshKey={billingRefreshKey} />
            </SettingsGroup>
            <SettingsGroup id="securite" title="Sécurité" description="Gérez le mot de passe utilisé pour vous connecter à votre compte.">
              <SecuritySection openSections={openSections} toggleSection={toggleSection} />
            </SettingsGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
