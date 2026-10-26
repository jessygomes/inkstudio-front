"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { makeCitySlug, makeSlug } from "@/lib/utils/makeLink";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Building2, CalendarDays, Clock3, LoaderCircle, MapPin, Plus, Search, ShieldCheck } from "lucide-react";
import { residencyRequest } from "@/lib/residencies-client";
import { presenceDescription, type LocationPresence } from "@/lib/residency-presence";
import SideFormDrawer from "@/components/Shared/SideFormDrawer";
import DashboardButton from "@/components/Shared/DashboardButton";
import ResidencyEnd from "./ResidencyEnd";
import ResidencySchedule from "./ResidencySchedule";
import ResidencyPermissionsDrawer from "./ResidencyPermissionsDrawer";
import { artistPermissions, salonPermissions } from "./residency-permissions";
import styles from "./Residencies.module.css";

type Profile = { id: string; salonName?: string; firstName?: string; lastName?: string; city?: string; postalCode?: string; slug?: string; address?: string; profileImage?: string | null; image?: string | null };
export type Residency = { id: string; salonId: string; artistId: string; salon: Profile; artist: Profile; presence: LocationPresence | null; currentSalonMode?: "automatic" | "manual"; currentSalonUntil?: string | null; isCurrentSalon: boolean; nextPresenceAt?: string } & Record<string, unknown>;
type Invitation = { id: string; incoming: boolean; salon: Profile; tatoueurUser: Profile; message?: string };
const name = (profile: Profile) => profile.salonName || [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Salon";
const compactButton = "!min-w-0 !px-3 !py-2 !text-[11px]";

function publicProfileHref(profile: Profile) {
  const slug = profile.slug || makeSlug(profile.salonName || [profile.firstName, profile.lastName].filter(Boolean).join(" "));
  if (!slug) return undefined;
  const path = profile.city && profile.postalCode
    ? `/salon/${slug}/${makeCitySlug(profile.city)}-${profile.postalCode}`
    : `/salon/${slug}`;
  return (process.env.NEXT_PUBLIC_FRONTENDPUBLIC_URL?.replace(/\/$/, "") || "") + path;
}

function ProfilePhoto({ profile, compact = false }: { profile: Profile; compact?: boolean }) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const sources = [...new Set([profile.profileImage?.trim(), profile.image?.trim()].filter((source): source is string => Boolean(source)))];
  const candidates = sources.flatMap(source => [{ source, direct: false }, { source, direct: true }]);
  const candidate = candidates.find(({ source, direct }) => !failedSources.includes(`${source}:${direct}`));
  return <span className={styles.avatar} aria-hidden="true">
    {candidate ? <Image key={`${candidate.source}:${candidate.direct}`} src={candidate.source} alt="" fill sizes={compact ? "48px" : "64px"} unoptimized={candidate.direct} onError={() => setFailedSources(previous => [...previous, `${candidate.source}:${candidate.direct}`])} /> : <span>{name(profile).charAt(0).toUpperCase()}</span>}
  </span>;
}

function City({ city }: { city?: string }) {
  return city ? <p className={styles.city}><MapPin size={11} aria-hidden="true" />{city.toLocaleUpperCase("fr-FR")}</p> : null;
}

export default function ResidenciesManager() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Residency[]>([]);
  const [requests, setRequests] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [error, setError] = useState("");
  const artist = session?.user?.role === "user_tatoueur";
  const reload = useCallback(async () => {
    try {
      const [active, invitations] = await Promise.all([residencyRequest(), residencyRequest("/requests")]);
      setMembers(active.residencies);
      setRequests(invitations.requests);
      setError("");
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void reload();
    const refresh = () => { void reload(); };
    window.addEventListener("inkera:residencies-updated", refresh);
    return () => window.removeEventListener("inkera:residencies-updated", refresh);
  }, [reload]);
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try { await action(); await reload(); toast.success("Modification enregistrée."); }
    catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };
  const search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim().length < 2 || searching) return;
    setSearching(true);
    setSearchError("");
    setSearched(false);
    setResults([]);
    try {
      setResults(await residencyRequest(`/salons/search?q=${encodeURIComponent(query.trim())}`));
      setSearched(true);
    } catch (e) { setSearchError((e as Error).message); }
    finally { setSearching(false); }
  };

  return <section className={styles.section} aria-label={artist ? "Mes salons de résidence" : "Tatoueurs indépendants rattachés"}>
    <header className={styles.heading}><div><h2>{artist ? "Mes salons de résidence" : "Tatoueurs indépendants rattachés"}</h2><p>Vos lieux de travail, vos présences et les droits partagés avec chaque salon. Le tatoueur indique ses jours ou périodes de présence et conserve ses propres horaires.</p></div>{!loading && <span className={styles.count}>{members.length} {artist ? `salon${members.length > 1 ? "s" : ""}` : `rattachement${members.length > 1 ? "s" : ""}`}</span>}</header>
    {error && <div role="alert" className={styles.error}><p>{error}</p><DashboardButton variant="secondary" className={compactButton} onClick={() => void reload()}>Réessayer</DashboardButton></div>}
    {loading ? <p role="status" className={styles.label}><LoaderCircle size={14} className="animate-spin" />{artist ? "Chargement de vos salons…" : "Chargement des demandes et rattachements…"}</p> : !error && members.length === 0 ? <div className={styles.empty}><Building2 size={23} /><div><strong>Aucun rattachement actif</strong><p className={styles.note}>{artist ? "Recherchez un salon ci-dessous pour proposer de le rejoindre." : "Les demandes des tatoueurs souhaitant rejoindre votre équipe apparaîtront ici."}</p></div></div> : null}
    {artist && members.length > 0 && <div className={styles.search}><label className="block text-sm" htmlFor="current-residency">Mon salon actuel</label><select id="current-residency" className="mt-2 w-full rounded-lg border border-white/15 bg-noir-700 p-3 text-sm" disabled={busy} value={members.find(m => m.isCurrentSalon && m.currentSalonMode === "manual")?.id || ""} onChange={event => void run(() => residencyRequest("/current", "PATCH", { residencyId: event.target.value || null }))}><option value="">Automatique · selon mes présences</option>{members.map(m => <option key={m.id} value={m.id}>{name(m.salon)} · {m.salon.city}</option>)}</select><p className={styles.note}>Un choix manuel reste actif jusqu’au prochain changement de salon prévu. Les réservations suivent vos jours et périodes de présence.</p>{members.find(m => m.isCurrentSalon && m.currentSalonMode === "manual")?.currentSalonUntil && <p className={styles.note}>Retour automatique le {new Date(members.find(m => m.isCurrentSalon)!.currentSalonUntil!).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}.</p>}</div>}
    {members.length > 0 && <div className={styles.grid}>{[...members].sort((a, b) => Number(b.isCurrentSalon) - Number(a.isCurrentSalon)).map(member => <ResidencyCard key={member.id} member={member} artist={artist} busy={busy} run={run} />)}</div>}

    {requests.length > 0 && <section className={styles.requests} aria-label="Demandes de rattachement"><h3>Demandes de rattachement <span className={styles.note}>· {requests.length}</span></h3><div className={styles.resultGrid}>{requests.map(request => {
      const profile = artist ? request.salon : request.tatoueurUser;
      const profileHref = publicProfileHref(profile);
      return <RequestCard key={request.id} request={request} profile={profile} profileHref={profileHref} busy={busy} run={run} />;
    })}</div></section>}

    {artist && <section className={styles.search} aria-labelledby="residency-search-heading"><h3 id="residency-search-heading">Trouver un salon</h3><p className={styles.note}>Recherchez par nom ou par ville, puis envoyez une demande de rattachement.</p><form className={styles.searchForm} onSubmit={search}><label className={styles.searchInput}><Search size={16} aria-hidden="true" /><span className="sr-only">Nom ou ville du salon</span><input value={query} onChange={event => { setQuery(event.target.value); setResults([]); setSearched(false); setSearchError(""); }} placeholder="Nom du salon ou ville…" minLength={2} required disabled={searching} /></label><DashboardButton type="submit" variant="secondary" className={compactButton} disabled={busy || searching || query.trim().length < 2}>{searching ? <LoaderCircle size={14} className="animate-spin" /> : <Search size={14} />}{searching ? "Recherche…" : "Rechercher"}</DashboardButton></form>
      <div role="status" className={styles.note}>{searching ? "Recherche des salons…" : searched ? `${results.length} salon${results.length > 1 ? "s" : ""} trouvé${results.length > 1 ? "s" : ""}` : ""}</div>
      {searchError && <p role="alert" className={styles.error}>{searchError}</p>}
      {searched && results.length === 0 && <p className={styles.note}>Aucun salon ne correspond à cette recherche. Essayez un autre nom ou une autre ville.</p>}
      {results.length > 0 && <div className={styles.resultGrid}>{results.map(salon => {
        const linked = members.some(member => member.salonId === salon.id);
        const pending = requests.some(request => request.salon.id === salon.id);
        return <article className={styles.result} key={salon.id}><div className={styles.identity}><ProfilePhoto profile={salon} compact /><div className={styles.identityText}><h4>{name(salon)}</h4><City city={salon.city} /></div></div><DashboardButton variant="secondary" className="!min-w-0 !px-2.5 !py-1.5 !text-[10px]" disabled={busy || linked || pending} onClick={() => void run(() => residencyRequest("/requests", "POST", { salonId: salon.id }))}>{!linked && !pending && <Plus size={12} />}{linked ? "Déjà rattaché" : pending ? "Demande en cours" : "Demander à rejoindre"}</DashboardButton></article>;
      })}</div>}
    </section>}
  </section>;
}

function ResidencyCard({ member, artist, busy, run }: { member: Residency; artist: boolean; busy: boolean; run: (action: () => Promise<unknown>) => Promise<void> }) {
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [presenceOpen, setPresenceOpen] = useState(false);
  const profile = artist ? member.salon : member.artist;
  const ownRights = artist ? artistPermissions : salonPermissions;
  const allowedCount = ownRights.filter(item => member[item.key] === true).length;
  return <article className={styles.card} data-current={member.isCurrentSalon}>
    <div className={styles.body}><div className={styles.identity}><ProfilePhoto profile={profile} /><div className={styles.identityText}><h3>{name(profile)}</h3><City city={member.salon.city} /><span className={styles.status} data-current={member.isCurrentSalon}>{member.isCurrentSalon ? "Présent actuellement" : "Salon de résidence"}</span></div></div>
      {member.salon.address && <p className={styles.address}>{member.salon.address}</p>}
      <div className={styles.schedule}><p className={styles.label}><CalendarDays size={13} />Présence dans ce salon</p><p className={styles.note}>{presenceDescription(member.presence)}</p>{!member.presence && <p className={styles.note}>Le tatoueur doit renseigner sa présence pour ouvrir les réservations ici.</p>}{!member.isCurrentSalon && member.nextPresenceAt && <p className={styles.note}>Prochaine présence : {new Date(member.nextPresenceAt).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "long" })}</p>}</div>
    </div>
    <footer className={styles.footer}>{artist && <DashboardButton variant="secondary" disabled={busy} className={compactButton} onClick={() => setPresenceOpen(true)} aria-haspopup="dialog"><CalendarDays size={13} />Modifier ma présence</DashboardButton>}<DashboardButton variant="secondary" disabled={busy} className={compactButton} onClick={() => setPermissionsOpen(true)} aria-haspopup="dialog"><ShieldCheck size={13} />Gérer les autorisations</DashboardButton><span>{allowedCount} / {ownRights.length} droits accordés</span></footer>
    {presenceOpen && <SideFormDrawer title="Ma présence dans ce salon" category={name(member.salon)} description="Dates ou jours de présence, avec vos horaires personnels." busy={busy} onClose={() => setPresenceOpen(false)} footer={null}><ResidencySchedule member={member} artist={artist} busy={busy} run={run} /></SideFormDrawer>}
    {permissionsOpen && <ResidencyPermissionsDrawer extra={<><ResidencyEnd name={name(profile)} busy={busy} onConfirm={() => run(() => residencyRequest(`/${member.id}`, "DELETE"))} /></>} permissions={member} artist={artist} profileName={name(profile)} salonName={name(member.salon)} busy={busy} onClose={() => setPermissionsOpen(false)} onChange={(key, checked) => run(() => residencyRequest(`/${member.id}/permissions`, "PATCH", { [key]: checked }))} />}
  </article>;
}

function RequestCard({ request, profile, profileHref, busy, run }: { request: Invitation; profile: Profile; profileHref?: string; busy: boolean; run: (action: () => Promise<unknown>) => Promise<void> }) {
  return <article className={styles.request} key={request.id}><div className={styles.identity}><ProfilePhoto profile={profile} compact /><div className={styles.identityText}><p className={styles.label}>{request.incoming ? "Demande de liaison reçue" : "Demande envoyée"}</p><h4>{name(profile)}</h4><City city={profile.city || profile.address} />{profileHref && <a href={profileHref} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-xs text-tertiary-400 underline underline-offset-4">Voir le profil public<span className="sr-only"> (nouvel onglet)</span></a>}</div></div>{request.message && <p className={styles.note}>{request.message}</p>}{request.incoming ? <div className={styles.actions}><DashboardButton disabled={busy} className={compactButton} onClick={() => void run(() => residencyRequest(`/requests/${request.id}/respond`, "PATCH", { action: "accept" }))}>Accepter</DashboardButton><DashboardButton variant="secondary" disabled={busy} className={compactButton} onClick={() => void run(() => residencyRequest(`/requests/${request.id}/respond`, "PATCH", { action: "refuse" }))}>Refuser</DashboardButton></div> : <p className={styles.label}><Clock3 size={12} />En attente de réponse</p>}</article>;
}

export function SalonTeamRequestCards({ onCountChange, onAccepted }: { onCountChange: (count: number) => void; onAccepted: () => Promise<void> }) {
  const [requests, setRequests] = useState<Invitation[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    try {
      const result = await residencyRequest("/requests");
      const incoming = (result.requests as Invitation[]).filter(request => request.incoming);
      setRequests(incoming);
      onCountChange(incoming.length);
      setError("");
    } catch (e) { setError((e as Error).message); }
  }, [onCountChange]);
  useEffect(() => {
    void reload();
    const refresh = () => { void reload(); };
    window.addEventListener("inkera:residencies-updated", refresh);
    return () => window.removeEventListener("inkera:residencies-updated", refresh);
  }, [reload]);
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try { await action(); await reload(); await onAccepted(); toast.success("Modification enregistrée."); }
    catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };
  return <>
    {error && <div role="alert" className={styles.error}><p>{error}</p><DashboardButton variant="secondary" onClick={() => void reload()}>Réessayer</DashboardButton></div>}
    {requests.map(request => <RequestCard key={request.id} request={request} profile={request.tatoueurUser} profileHref={publicProfileHref(request.tatoueurUser)} busy={busy} run={run} />)}
  </>;
}
