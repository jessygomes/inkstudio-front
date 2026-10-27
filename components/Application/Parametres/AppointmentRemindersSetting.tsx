"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarClock, Check, Eye, LoaderCircle, Mail, MessageSquare, RotateCcw, Send } from "lucide-react";
import { toast } from "sonner";
import SettingsSectionHeader from "./SettingsSectionHeader";
import DashboardButton from "@/components/Shared/DashboardButton";
import { getReminderSettingsAction, updateReminderSettingsAction } from "@/lib/queries/reminder-settings";
import { previewReminder, reminderVariables, validReminderSettings, type ReminderChannel, type ReminderSettings, type ReminderSettingsResponse } from "@/lib/reminder-settings";
import card from "./SettingsCard.module.css";
import styles from "./AppointmentRemindersSetting.module.css";

const channels: { value: ReminderChannel; label: string; description: string; Icon: typeof Mail }[] = [
  { value: "EMAIL", label: "Email", description: "Dans sa boîte mail", Icon: Mail },
  { value: "INKERA", label: "Message Inkera", description: "Conversation existante", Icon: MessageSquare },
  { value: "BOTH", label: "Les deux", description: "Email et conversation", Icon: Send },
];

export default function AppointmentRemindersSetting({ salonName }: { salonName?: string | null }) {
  const [loaded, setLoaded] = useState<ReminderSettingsResponse | null>(null);
  const [draft, setDraft] = useState<ReminderSettings | null>(null);
  const [active, setActive] = useState<"followUp" | "retouch">("followUp");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let current = true;
    getReminderSettingsAction().then(response => {
      if (current) { setLoaded(response); setDraft(response.settings); }
    }).catch(error => { if (current) setError(error instanceof Error ? error.message : "Chargement impossible."); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [attempt]);

  const followUp = active === "followUp";
  const messageKey = followUp ? "followUpMessage" : "retouchMessage";
  const dayKey = followUp ? "followUpEmailDelayDays" : "retouchEmailDelayDays";
  const channelKey = followUp ? "followUpDeliveryChannel" : "retouchDeliveryChannel";
  const message = draft?.[messageKey] || "";
  const changed = draft && loaded && JSON.stringify(draft) !== JSON.stringify(loaded.settings);
  const valid = draft ? validReminderSettings(draft) : false;

  function insertVariable(key: string) {
    if (!draft || saving) return;
    const start = textarea.current?.selectionStart ?? message.length;
    const end = textarea.current?.selectionEnd ?? message.length;
    const token = `{${key}}`;
    const value = message.slice(0, start) + token + message.slice(end);
    if (value.length > 3000) return;
    setDraft({ ...draft, [messageKey]: value });
    requestAnimationFrame(() => { textarea.current?.focus(); textarea.current?.setSelectionRange(start + token.length, start + token.length); });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft || !valid || !changed || saving) return;
    setSaving(true); setError("");
    try {
      const response = await updateReminderSettingsAction(draft);
      setLoaded(response); setDraft(response.settings);
      toast.success("Rappels après séance enregistrés.");
    } catch (error) { setError(error instanceof Error ? error.message : "Enregistrement impossible."); }
    finally { setSaving(false); }
  }

  return <section className={card.card}>
    <SettingsSectionHeader icon={CalendarClock} title="Rappels après séance" description="Choisissez le bon moment, le canal et les mots pour prendre des nouvelles de vos clients." />
    {loading ? <p role="status" className={card.empty}><LoaderCircle size={16} className="mx-auto mb-2 animate-spin" />Chargement de vos réglages…</p> : !draft || !loaded ? <div className={card.body}><p role="alert" className={styles.error}>{error || "Chargement impossible."}</p><DashboardButton variant="secondary" className="!min-w-0" onClick={() => { setLoading(true); setError(""); setAttempt(value => value + 1); }}>Réessayer</DashboardButton></div> : <form className={card.body} onSubmit={save}>
      <div className={styles.tabs} role="group" aria-label="Type de rappel à configurer">
        {([ ["followUp", "Suivi de cicatrisation", "Tatouage, piercing et retouche"], ["retouch", "Rappel de retouche", "Après une séance de tatouage"] ] as const).map(([value, label, description]) => <button key={value} type="button" aria-pressed={active === value} disabled={saving} onClick={() => setActive(value)}><span>{label}</span><small>{description}</small></button>)}
      </div>
      <div className={styles.schedule}>
        <div><label htmlFor="reminder-days" className={card.label}>Quand envoyer ce rappel ?</label><p id="reminder-days-hint" className={card.note}>Délai après le passage du rendez-vous à « Terminé ».</p></div>
        <div className={styles.days}><input id="reminder-days" type="number" min={1} max={365} step={1} required disabled={saving} value={draft[dayKey] || ""} aria-describedby="reminder-days-hint" onChange={event => setDraft({ ...draft, [dayKey]: Number(event.target.value) })} /><span>jour{draft[dayKey] > 1 ? "s" : ""} après</span></div>
      </div>
      <fieldset className={styles.channels} disabled={saving}>
        <legend className={card.label}>Où envoyer ce rappel ?</legend>
        {channels.map(({ value, label, description, Icon }) => <label key={value}>
          <input type="radio" name="reminder-channel" value={value} checked={draft[channelKey] === value} onChange={() => setDraft({ ...draft, [channelKey]: value })} />
          <Icon size={17} aria-hidden="true" /><span><strong>{label}</strong><small>{description}</small></span>{draft[channelKey] === value && <Check size={13} aria-hidden="true" className={styles.check} />}
        </label>)}
      </fieldset>
      {draft[channelKey] !== "EMAIL" && <p className={styles.chatNote}><MessageSquare size={15} aria-hidden="true" /><span>Le message Inkera est envoyé uniquement dans une conversation déjà liée au client. Sans conversation disponible, aucun message n’est créé.{draft[channelKey] === "BOTH" ? " L’email reste envoyé." : " Aucun email de remplacement ne sera envoyé."}</span></p>}
      <div className={styles.editor}>
        <div className={styles.editorHeading}><label htmlFor="reminder-message" className={card.label}>Votre message</label><button type="button" disabled={saving} onClick={() => setDraft({ ...draft, [messageKey]: loaded.defaults[messageKey] })}><RotateCcw size={12} aria-hidden="true" />Message de base</button></div>
        <p id="reminder-message-hint" className={card.note}>Le texte ci-dessous est envoyé sur les canaux choisis. Personnalisez-le ou insérez une information automatique.</p>
        <div className={styles.variables} aria-label="Informations à insérer dans le message">{reminderVariables.filter(variable => followUp || variable.key !== "lien_suivi").map(variable => <button key={variable.key} type="button" disabled={saving} onClick={() => insertVariable(variable.key)} title={`Insérer {${variable.key}}`}>{`{${variable.key}}`}<span className="sr-only"> : {variable.label}</span></button>)}</div>
        <textarea key={active} ref={textarea} id="reminder-message" required rows={7} maxLength={3000} disabled={saving} value={message} aria-describedby="reminder-message-hint reminder-count" onChange={event => setDraft({ ...draft, [messageKey]: event.target.value })} />
        <div className={styles.editorBottom}><button type="button" aria-expanded={previewOpen} aria-controls="reminder-preview" onClick={() => setPreviewOpen(open => !open)}><Eye size={13} aria-hidden="true" />{previewOpen ? "Masquer l’aperçu" : "Voir un exemple"}</button><span id="reminder-count">{message.length.toLocaleString("fr-FR")} / 3 000</span></div>
        {followUp && <p className={card.note}>Le lien du formulaire de suivi est ajouté automatiquement s’il n’est pas présent dans votre texte. Il reste valable 14 jours après l’envoi.</p>}
        {previewOpen && <div id="reminder-preview" className={styles.preview}><p>Exemple avec des informations fictives</p><blockquote>{previewReminder(message, followUp, salonName || undefined)}</blockquote></div>}
      </div>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {!valid && <p role="status" className={styles.error}>Pour les deux rappels, choisissez un délai de 1 à 365 jours et un message non vide, avec les variables proposées uniquement.</p>}
      <div className={card.footer}><div><p role="status" className={card.note}>{changed ? "Modifications à enregistrer" : "Vos rappels sont à jour"}</p><p className={card.note}>Les nouveaux délais s’appliquent aussi aux rappels encore en attente. Les rappels déjà envoyés ne sont pas renvoyés.</p></div><DashboardButton type="submit" disabled={saving || !changed || !valid} className="!min-w-0">{saving ? <><LoaderCircle size={14} className="animate-spin" />Enregistrement…</> : "Enregistrer les rappels"}</DashboardButton></div>
    </form>}
  </section>;
}
