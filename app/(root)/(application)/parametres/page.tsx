"use client";

export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Settings2 } from "lucide-react";
import Link from "next/link";
import styles from "./settings.module.css";
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
import AppearanceSetting from "@/components/Application/Parametres/AppearanceSetting";


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
    <div className={styles.page + " min-h-screen min-w-0 bg-noir-700 px-3 pb-24 pt-5 lg:px-6 lg:pb-12 lg:pt-7 xl:px-8"}>
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header><nav aria-label="Fil d’Ariane" className="mb-3 flex items-center gap-2 text-[10px] text-white/35"><Link href="/mon-compte" className="transition hover:text-tertiary-400">Mon compte</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-white/55">Paramètres</span></nav><div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl border border-tertiary-400/20 bg-tertiary-400/10 text-tertiary-400"><Settings2 size={19} /></span><div><h1 className="text-xl font-semibold tracking-tight text-white">Paramètres</h1><p className="mt-1.5 text-xs leading-5 text-white/45">Votre compte, vos préférences et les réglages de votre activité.</p></div></div></header>
        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6">
          <SettingsNavigation />
          <div className="min-w-0 space-y-7">
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
              <AppearanceSetting />
              <div className="grid min-w-0 items-start gap-3 2xl:grid-cols-2">
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
