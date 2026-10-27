export type ReminderChannel = "EMAIL" | "INKERA" | "BOTH";
export type ReminderSettings = {
  followUpEmailDelayDays: number;
  retouchEmailDelayDays: number;
  followUpDeliveryChannel: ReminderChannel;
  retouchDeliveryChannel: ReminderChannel;
  followUpMessage: string;
  retouchMessage: string;
};
export type ReminderSettingsResponse = {
  settings: ReminderSettings;
  defaults: Pick<ReminderSettings, "followUpMessage" | "retouchMessage">;
};
export const reminderVariables = [
  { key: "prenom", label: "Prénom", example: "Camille" },
  { key: "salon", label: "Salon / artiste", example: "Votre studio" },
  { key: "artiste", label: "Artiste", example: "Votre artiste" },
  { key: "date_rdv", label: "Date de la séance", example: "12/10/2026" },
  { key: "lien_suivi", label: "Lien du suivi", example: "https://inkera.fr/suivi?f=exemple" },
] as const;

export function previewReminder(message: string, followUp: boolean, salonName?: string) {
  const values: Record<string, string> = Object.fromEntries(reminderVariables.map(variable => [variable.key, variable.example]));
  if (salonName) values.salon = salonName;
  if (!followUp) values.lien_suivi = "";
  const preview = message.replace(/\{(prenom|salon|artiste|date_rdv|lien_suivi)\}/g, (_, key: string) => values[key]);
  return followUp && !preview.includes(values.lien_suivi) ? `${preview}\n\nEnvoyer mon suivi : ${values.lien_suivi}` : preview;
}

export function validReminderSettings(settings: ReminderSettings) {
  return [settings.followUpEmailDelayDays, settings.retouchEmailDelayDays].every(days => Number.isInteger(days) && days >= 1 && days <= 365)
    && [settings.followUpMessage, settings.retouchMessage].every(message => message.trim().length > 0 && message.length <= 3000
      && [...message.matchAll(/\{([^{}]+)\}/g)].every(match => reminderVariables.some(variable => variable.key === match[1])))
    && [settings.followUpDeliveryChannel, settings.retouchDeliveryChannel].every(channel => ["EMAIL", "INKERA", "BOTH"].includes(channel));
}
