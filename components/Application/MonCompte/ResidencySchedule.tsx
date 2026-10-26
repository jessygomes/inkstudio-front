"use client";
import { useEffect, useState } from "react";
import { residencyRequest } from "@/lib/residencies-client";
import DashboardButton from "@/components/Shared/DashboardButton";
import type { Residency } from "./ResidenciesManager";
import { presenceDescription } from "@/lib/residency-presence";
const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const input = "mt-2 w-full rounded-lg border border-white/15 bg-noir-700 px-3 py-2 text-sm outline-none focus:border-tertiary-400 disabled:opacity-40";

export default function ResidencySchedule({ member, artist, busy, run }: { member: Residency; artist: boolean; busy: boolean; run: (action: () => Promise<unknown>) => Promise<void> }) {
  const [type, setType] = useState(member.presence?.type || "");
  const [selectedDays, setDays] = useState<number[]>(member.presence?.type === "recurring" ? member.presence.days : []);
  const [startDate, setStartDate] = useState(member.presence?.type === "period" ? member.presence.startDate : "");
  const [endDate, setEndDate] = useState(member.presence?.type === "period" ? member.presence.endDate : "");
  useEffect(() => {
    setType(member.presence?.type || "");
    setDays(member.presence?.type === "recurring" ? member.presence.days : []);
    setStartDate(member.presence?.type === "period" ? member.presence.startDate : "");
    setEndDate(member.presence?.type === "period" ? member.presence.endDate : "");
  }, [member.presence]);
  if (!artist) return <p className="text-sm">{presenceDescription(member.presence)} · Le tatoueur gère ses présences.</p>;
  return <form className="space-y-5" onSubmit={event => {
    event.preventDefault();
    const presence = type === "period" ? { type, startDate, endDate } : type === "recurring" ? { type, days: selectedDays } : type === "daily" ? { type } : null;
    void run(() => residencyRequest(`/${member.id}/presence`, "PATCH", { presence }));
  }}>
    <p className="text-xs leading-6 opacity-65">Indiquez uniquement quand vous êtes dans ce salon. Vos horaires personnels servent aux rendez-vous. Aucune validation du salon n’est nécessaire pour ces présences.</p>
    <label className="block text-sm">Type de présence<select className={input} disabled={busy} value={type} onChange={event => setType(event.target.value as typeof type)}><option value="">Non renseignée</option><option value="daily">Quotidienne / salon habituel</option><option value="recurring">Jours récurrents chaque semaine</option><option value="period">Période avec dates</option></select></label>
    {type === "daily" && <p className="text-xs leading-6 opacity-65">Votre lieu habituel. Une présence récurrente ou une période définie dans un autre salon prend la priorité aux dates concernées.</p>}
    {type === "recurring" && <fieldset disabled={busy} className="space-y-3"><legend className="mb-3 text-sm">Jours de présence</legend><div className="flex flex-wrap gap-3">{days.map((day,index) => <label key={day} className="flex items-center gap-2 rounded-xl border border-white/10 p-3 text-xs"><input type="checkbox" checked={selectedDays.includes(index+1)} onChange={event => setDays(event.target.checked ? [...selectedDays,index+1] : selectedDays.filter(d => d !== index+1))} />{day}</label>)}</div><p className="text-xs opacity-60">Chaque semaine, sans recopier vos horaires.</p></fieldset>}
    {type === "period" && <div className="grid grid-cols-2 gap-4"><label className="text-sm">Du<input required disabled={busy} type="date" className={input} value={startDate} onChange={event => setStartDate(event.target.value)} /></label><label className="text-sm">Au, inclus<input required disabled={busy} type="date" min={startDate} className={input} value={endDate} onChange={event => setEndDate(event.target.value)} /></label><p className="col-span-2 text-xs leading-6 opacity-60">Cette période remplace vos lieux habituels ou récurrents aux dates indiquées.</p></div>}
    <DashboardButton type="submit" disabled={busy || (type === "recurring" && selectedDays.length === 0)}>Enregistrer ma présence</DashboardButton>
  </form>;
}
