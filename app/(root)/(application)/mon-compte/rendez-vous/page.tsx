import { CreationPageHeader } from "@/components/Shared/CreationWorkspace";
import AppointmentSettingsWorkspace from "@/components/Application/Parametres/AppointmentSettingsWorkspace";

export default function AppointmentSettingsPage() {
  return <main className="wrapper-global pb-24 pt-5 lg:pb-8"><div className="mx-auto w-full max-w-[1600px]">
    <CreationPageHeader category="Mon compte" categoryHref="/mon-compte" context="Réglages des rendez-vous" title="Vos réglages de rendez-vous" description="Préparez le premier échange, choisissez la confirmation des réservations et personnalisez vos rappels après séance, au même endroit." backHref="/mon-compte" backLabel="Retour à mon profil" />
    <AppointmentSettingsWorkspace />
  </div></main>;
}
