"use client";
import { useEffect, useState } from "react";
import { residencyRequest } from "@/lib/residencies-client";
import DashboardButton from "@/components/Shared/DashboardButton";
import type { Residency } from "./ResidenciesManager";
const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const input = "min-w-0 w-full rounded-lg border border-white/15 bg-noir-700 px-2 py-2 text-xs outline-none focus:border-tertiary-400 disabled:opacity-40";
const button = "rounded-lg border border-white/20 px-3 py-2 text-sm disabled:opacity-40";
export default function ResidencySchedule({ member: r, artist, busy, run }: { member: Residency; artist: boolean; busy: boolean; run: (action: () => Promise<unknown>) => Promise<void> }) {
 const [schedule, setSchedule] = useState(r.pendingSchedule ?? r.schedule);
 useEffect(() => { setSchedule(r.pendingSchedule ?? r.schedule); }, [r.pendingSchedule, r.schedule]);
 const approved = artist ? r.artistApproved : r.salonApproved;
 return <section className="space-y-4 border-t border-white/10 pt-5"><h3 className="text-sm font-semibold">Planning de présence</h3><p className="text-xs leading-5 opacity-60">Proposez les plages de présence dans ce salon, en heure de Paris. Le nouveau planning devient actif uniquement après validation du salon et du tatoueur.</p>
    <div className="space-y-1 text-xs leading-5"><p className="font-medium">Planning actif</p>{r.schedule.length ? r.schedule.map((slot, index) => <p key={index} className="opacity-60">{days[slot.day - 1]} · {slot.start}–{slot.end}</p>) : <p className="opacity-60">Aucune présence validée pour le moment.</p>}</div>
    {r.pendingSchedule !== null && <div className="space-y-2 rounded-xl border border-tertiary-400/25 bg-tertiary-400/5 p-4"><p className="text-xs leading-5">Planning proposé : {r.pendingSchedule.length ? r.pendingSchedule.map(w => `${days[w.day-1]} ${w.start}–${w.end}`).join(", ") : "aucune présence"}</p><p className="text-xs opacity-70">Salon : {r.salonApproved ? "validé" : "en attente"} · Tatoueur : {r.artistApproved ? "validé" : "en attente"}</p>{!approved && <button className={button} disabled={busy} onClick={() => run(() => residencyRequest(`/${r.id}/schedule/approve`, "POST"))}>Valider ce planning</button>}</div>}
    <form className="space-y-3" onSubmit={e => { e.preventDefault(); void run(() => residencyRequest(`/${r.id}/schedule`, "PATCH", { schedule })); }}>
      {schedule.map((w,i) => <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto]"><select disabled={busy} aria-label="Jour" className={input} value={w.day} onChange={e => setSchedule(schedule.map((v,n) => n === i ? {...v,day:Number(e.target.value)} : v))}>{days.map((d,n) => <option key={d} value={n+1}>{d}</option>)}</select>{(["start","end"] as const).map(k => <input disabled={busy} aria-label={k === "start" ? "Début" : "Fin"} key={k} type="time" required className={input} value={w[k]} onChange={e => setSchedule(schedule.map((v,n) => n === i ? {...v,[k]:e.target.value} : v))} />)}<button disabled={busy} type="button" className={button} onClick={() => setSchedule(schedule.filter((_,n) => n !== i))}>Retirer</button></div>)}
      <div className="flex flex-wrap gap-2"><DashboardButton variant="secondary" type="button" disabled={busy || schedule.length >= 28} onClick={() => setSchedule([...schedule,{day:1,start:"09:00",end:"18:00"}])}>Ajouter une plage</DashboardButton><DashboardButton type="submit" disabled={busy}>Soumettre à validation</DashboardButton></div>
    </form>
 </section>;
}
