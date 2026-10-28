"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, CalendarDays, Check, Loader2, Search, UserRound, X } from "lucide-react";
import { searchClientsAction } from "@/lib/queries/client";
import { createDrawingCard, getDrawingAppointmentOptions, updateDrawingCardAssociations } from "@/lib/queries/suiviDessin";
import type { DrawingAppointmentOption, DrawingCard } from "@/lib/types/suiviDessin";
import DrawingDialog from "./DrawingDialog";
import DashboardButton from "@/components/Shared/DashboardButton";

type ClientChoice = { id: string; kind: "client" | "account"; label: string; email?: string | null };
type SearchClient = { id: string; firstName?: string | null; lastName?: string | null; email?: string | null };
const clientChoice = (person: SearchClient, kind: ClientChoice["kind"]): ClientChoice => ({ ...person, kind, label: [person.firstName, person.lastName].filter(Boolean).join(" ") || person.email || "Client" });
const field = "mt-2 w-full rounded-xl border border-white/10 bg-noir-600 p-3 text-sm text-white outline-none transition focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10";

export default function DrawingCardEditor({ card, onClose, onSaved }: {
  card?: DrawingCard; onClose: () => void; onSaved: (card: DrawingCard) => Promise<void> | void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [client, setClient] = useState<ClientChoice | null>(() => card?.client ? clientChoice(card.client, "client") : card?.clientUser ? clientChoice(card.clientUser, "account") : null);
  const [clientSearch, setClientSearch] = useState("");
  const [clientChoices, setClientChoices] = useState<ClientChoice[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientError, setClientError] = useState("");
  const [confirmedReplacements, setConfirmedReplacements] = useState<Record<string, string>>({});
  const [appointmentRetry, setAppointmentRetry] = useState(0);
  const [appointments, setAppointments] = useState<DrawingAppointmentOption[]>([]);
  const [retainedAppointments, setRetainedAppointments] = useState<DrawingAppointmentOption[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentError, setAppointmentError] = useState("");
  const [sourceId, setSourceId] = useState(card?.sourceAppointmentId || "");
  const [tattooId, setTattooId] = useState(card?.tattooAppointmentId || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setClientChoices([]); setClientError("");
    if (clientSearch.trim().length < 2) { setClientsLoading(false); return; }
    setClientsLoading(true);
    const timer = setTimeout(() => {
      searchClientsAction(clientSearch).then(result => {
        if (!active) return;
        if (result.error) { setClientError(result.message || "Recherche indisponible."); return; }
        setClientChoices([
          ...(result.clients || []).map((person: SearchClient) => clientChoice(person, "client")),
          ...(result.userClients || []).map((person: SearchClient) => clientChoice(person, "account")),
        ]);
      }).catch(() => { if (active) setClientError("Impossible de rechercher les clients."); })
        .finally(() => { if (active) setClientsLoading(false); });
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [clientSearch]);

  useEffect(() => {
    let active = true;
    setAppointmentsLoading(true); setAppointmentError(""); setAppointments([]); setConfirmedReplacements({});
    getDrawingAppointmentOptions({ cardId: card?.id, clientId: client?.kind === "client" ? client.id : undefined, clientUserId: client?.kind === "account" ? client.id : undefined })
      .then(items => { if (active) setAppointments(items); })
      .catch(() => { if (active) setAppointmentError("Impossible de charger les rendez-vous du client."); })
      .finally(() => { if (active) setAppointmentsLoading(false); });
    return () => { active = false; };
  }, [card?.id, client?.id, client?.kind, appointmentRetry]);

  const options = useMemo(() => {
    const retained = [card?.sourceAppointment, card?.tattooAppointment].filter((item): item is NonNullable<typeof item> => Boolean(item));
    const selected = [...retained, ...retainedAppointments].filter(item => item.id === sourceId || item.id === tattooId);
    return [...new Map([...selected, ...appointments].map(item => [item.id, item])).values()] as DrawingAppointmentOption[];
  }, [appointments, retainedAppointments, card, sourceId, tattooId]);
  const retainAppointment = (id: string) => {
    const option = options.find(item => item.id === id);
    if (option) setRetainedAppointments(current => [...new Map([...current, option].map(item => [item.id, item])).values()]);
  };
  const selectedAppointment: DrawingAppointmentOption | undefined = options.find(item => item.id === sourceId);
  const appointmentClient = selectedAppointment?.client ?? selectedAppointment?.clientUser;
  const replacements = [
    { slot: "source" as const, appointment: appointments.find(item => item.id === sourceId) },
    { slot: "tattoo" as const, appointment: appointments.find(item => item.id === tattooId) },
  ].flatMap(({ slot, appointment }) => {
    const occupied = appointment?.drawingCardSource ?? appointment?.drawingCardTattoo;
    return appointment && occupied && occupied.id !== card?.id ? [{ slot, appointment, occupied }] : [];
  });
  const replacementsConfirmed = replacements.every(item => confirmedReplacements[item.appointment.id] === item.occupied.id);
  const optionLabel = (option: DrawingAppointmentOption) => {
    const occupied = option.drawingCardSource ?? option.drawingCardTattoo;
    return `${option.title} · ${new Date(option.start).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}${option.prestation ? ` · ${option.prestation}` : ""}${occupied && occupied.id !== card?.id ? " · Card déjà reliée" : ""}${!appointmentsLoading && !appointmentError && !appointments.some(item => item.id === option.id) ? " · Hors client sélectionné" : ""}`;
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (saving) return;
    if ((sourceId || tattooId) && (appointmentsLoading || appointmentError)) return;
    if (!replacementsConfirmed) { setError("Confirmez le remplacement de la card déjà associée au rendez-vous avant d’enregistrer."); return; }
    setSaving(true); setError("");
    try {
      const identity = { clientId: client?.kind === "client" ? client.id : null, clientUserId: client?.kind === "account" ? client.id : null };
      const result = card
        ? await updateDrawingCardAssociations(card.id, { ...identity, sourceAppointmentId: sourceId || null, tattooAppointmentId: tattooId || null, expectedUpdatedAt: card.updatedAt, replaceSourceCardId: replacements.find(item => item.slot === "source")?.occupied.id, replaceTattooCardId: replacements.find(item => item.slot === "tattoo")?.occupied.id })
        : await createDrawingCard({ title: title.trim(), description: description.trim() || undefined, sourceAppointmentId: sourceId || undefined, clientId: identity.clientId || undefined, clientUserId: identity.clientUserId || undefined });
      await onSaved(result);
      onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Impossible d’enregistrer cette card."); }
    finally { setSaving(false); }
  };

  return <DrawingDialog title={card ? "Modifier les liaisons" : "Créer une card"} description="Client et rendez-vous facultatifs." busy={saving} scrollable={false} onClose={onClose}>
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
      <fieldset disabled={saving} className="min-w-0 space-y-5">
      {!card && <>
        <label className="block text-xs text-white/60">Titre du dessin <span className="text-tertiary-400">*</span><input required maxLength={200} value={title} onChange={event => setTitle(event.target.value)} placeholder="Ex. Projet floral avant-bras" className={field} /></label>
        <label className="block text-xs text-white/60">Description <span className="text-white/30">(facultative)</span><textarea rows={3} value={description} onChange={event => setDescription(event.target.value)} className={field} /></label>
      </>}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="flex items-center gap-2 text-xs font-medium text-white/75"><UserRound size={14} />Client <span className="text-white/35">(facultatif)</span></h3>
        {client ? <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3"><div><p className="text-sm text-white/85">{client.label}</p><p className="mt-1 text-[11px] text-white/40">{client.email}</p></div><button type="button" onClick={() => setClient(null)} aria-label="Retirer le client" className="rounded-lg p-2 text-white/50 hover:bg-white/5"><X size={15} /></button></div> : <>
          <label className="relative block"><Search size={14} className="absolute left-3 top-5 text-white/35" /><input aria-label="Rechercher un client" value={clientSearch} onChange={event => setClientSearch(event.target.value)} placeholder="Nom ou email, 2 caractères minimum" className={`${field} pl-9`} /></label>
          {clientsLoading && <p role="status" className="mt-2 text-xs text-white/40">Recherche…</p>}
          {clientError && <p role="alert" className="mt-2 text-xs text-red-300">{clientError}</p>}
          {!clientsLoading && clientSearch.trim().length >= 2 && !clientError && !clientChoices.length && <p className="mt-2 text-xs text-white/40">Aucun client trouvé.</p>}
          <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">{clientChoices.map(choice => <button type="button" key={`${choice.kind}:${choice.id}`} onClick={() => { setClient(choice); setClientSearch(""); }} className="block w-full rounded-xl px-3 py-2 text-left transition hover:bg-white/5"><span className="block text-xs text-white/80">{choice.label}</span><span className="mt-1 block text-[10px] text-white/40">{choice.email} · {choice.kind === "client" ? "Fiche client" : "Compte Inkera"}</span></button>)}</div>
        </>}
        {!client && <p className="mt-2 text-[11px] leading-relaxed text-white/40">Sans sélection, le client du RDV choisi sera repris automatiquement.</p>}
        {card && <p className="mt-2 text-[11px] leading-relaxed text-white/40">Un changement de client réinitialise les indications d’envoi et l’approbation des versions, pour recueillir l’avis du nouveau client.</p>}
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-xs font-medium text-white/75"><CalendarDays size={14} />Rendez-vous <span className="text-white/35">(facultatif)</span></h3><button type="button" disabled={appointmentsLoading} onClick={() => setAppointmentRetry(value => value + 1)} className="text-[11px] text-tertiary-400 hover:underline disabled:opacity-40">Actualiser</button></div>
        <label className="mt-3 block text-[11px] text-white/50">RDV source<select disabled={appointmentsLoading || Boolean(appointmentError)} value={sourceId} onChange={event => { retainAppointment(event.target.value); setSourceId(event.target.value); setConfirmedReplacements({}); setError(""); }} className={field}><option value="">Aucun rendez-vous</option>{options.map(option => <option key={option.id} value={option.id} disabled={!appointments.some(item => item.id === option.id)}>{optionLabel(option)}</option>)}</select></label>
        {appointmentClient && <p className="mt-2 text-[11px] text-white/45">Client du RDV : {[appointmentClient.firstName, appointmentClient.lastName].filter(Boolean).join(" ")}</p>}
        {card?.tattooAppointmentId && <label className="mt-3 block text-[11px] text-white/50">RDV Tattoo associé<select disabled={appointmentsLoading || Boolean(appointmentError)} value={tattooId} onChange={event => { retainAppointment(event.target.value); setTattooId(event.target.value); setConfirmedReplacements({}); setError(""); }} className={field}><option value="">Aucun RDV Tattoo</option>{options.filter(option => option.prestation === "TATTOO" || option.id === tattooId).map(option => <option key={option.id} value={option.id} disabled={!appointments.some(item => item.id === option.id)}>{optionLabel(option)}</option>)}</select></label>}
        {appointmentsLoading && <p role="status" className="mt-2 text-xs text-white/40">Chargement des rendez-vous…</p>}
        {appointmentError && <div role="alert" className="mt-2 text-xs text-red-300">{appointmentError}<button type="button" onClick={() => setAppointmentRetry(value => value + 1)} className="ml-2 underline">Réessayer</button></div>}
        <p className="mt-2 text-[11px] leading-relaxed text-white/35">{client ? `Rendez-vous de ${client.label}, avec titre, date et heure.` : "Choisissez un client pour voir ses rendez-vous, ou sélectionnez un RDV pour reprendre son client."}</p>
        {!appointmentsLoading && !appointmentError && !appointments.length && <p className="mt-2 text-xs text-white/45">Aucun rendez-vous disponible pour ce client.</p>}
        {replacements.map(({ appointment, occupied }) => <div key={appointment.id} className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-200"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><span>Le rendez-vous « {appointment.title} » du {new Date(appointment.start).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })} possède déjà la card « {occupied.title} ». Elle sera détachée de ce RDV et remplacée par cette card. Son dessin et ses versions seront conservés.</span></p>
          <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-amber-100"><input type="checkbox" checked={confirmedReplacements[appointment.id] === occupied.id} onChange={event => setConfirmedReplacements(current => ({ ...current, [appointment.id]: event.target.checked ? occupied.id : "" }))} className="mt-0.5 accent-amber-400" />Je confirme le remplacement de la card de ce rendez-vous.</label>
        </div>)}
      </section>
      {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-xs leading-relaxed text-red-200">{error}</p>}
      </fieldset>
      </div>
      <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-white/10 bg-noir-700 px-5 py-3">
        <DashboardButton variant="secondary" type="button" disabled={saving} onClick={onClose} className="!min-w-0">Annuler</DashboardButton>
        <DashboardButton variant="primary" type="submit" disabled={saving || (Boolean(sourceId || tattooId) && (appointmentsLoading || Boolean(appointmentError))) || !replacementsConfirmed || (!card && !title.trim())} className="!min-w-0">{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}{saving ? "Enregistrement…" : card ? "Enregistrer les liaisons" : "Créer la card"}</DashboardButton>
      </footer>
    </form>
  </DrawingDialog>;
}
