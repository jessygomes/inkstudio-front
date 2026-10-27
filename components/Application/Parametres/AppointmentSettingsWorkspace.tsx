"use client";

import { useSession } from "next-auth/react";
import CreationWorkspace from "@/components/Shared/CreationWorkspace";
import AppointmentConfirmationSetting from "./AppointmentConfirmationSetting";
import AppointmentRemindersSetting from "./AppointmentRemindersSetting";
import ProjectAppointmentSetting from "./ProjectAppointmentSetting";
import AppointmentModeSetting from "./AppointmentModeSetting";

export default function AppointmentSettingsWorkspace() {
  const { data: session } = useSession();
  const artist = session?.user?.role === "user_tatoueur";
  return <CreationWorkspace sections={[
    { id: "confirmation", label: "Confirmation", hint: "Automatique ou manuelle" },
    { id: "premier-echange", label: "Premier échange", hint: "Durée et tarif du rendez-vous Projet" },
    { id: "rappels", label: "Après la séance", hint: "Délais, canaux et messages" },
    ...(artist ? [{ id: "autorisations", label: "Salons et autorisations", hint: "Les droits de vos salons liés" }] : []),
  ]} summary={<p className="text-xs leading-6 text-white/45">Chaque rubrique possède son enregistrement. Les réglages de confirmation sont appliqués dès le changement ; les autres formulaires se valident avec leur bouton.</p>}>
    <div className="space-y-5">
      <div id="confirmation" className="scroll-mt-5"><AppointmentConfirmationSetting userId={session?.user?.id || null} /></div>
      <div id="premier-echange" className="scroll-mt-5"><ProjectAppointmentSetting /></div>
      <div id="rappels" className="scroll-mt-5"><AppointmentRemindersSetting salonName={session?.user?.salonName} /></div>
      {artist && <div id="autorisations" className="scroll-mt-5"><AppointmentModeSetting userId={session?.user?.id || null} saasPlan={session?.user?.saasPlan || null} /></div>}
    </div>
  </CreationWorkspace>;
}
