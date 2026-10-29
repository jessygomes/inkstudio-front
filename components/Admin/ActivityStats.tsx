"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ContactRound, Images, Share2 } from "lucide-react";
import { getAdminActivityStats } from "@/lib/queries/admin-activity";
import { getAllRegisteredSalons } from "@/lib/queries/admin";
import { projectStatusLabels, type ActivityFilters, type ActivityStats as Stats } from "@/lib/admin-activity";
import styles from "./ActivityStats.module.css";

const initialFilters: ActivityFilters = { year: "", month: "", role: "", accountId: "", status: "" };
const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
interface Account { id: string; salonName?: string; nickname?: string; email: string }

export default function ActivityStats() {
  const [draft, setDraft] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    getAdminActivityStats(filters).then((data) => {
      if (active) setStats(data);
    }).catch(() => {
      if (active) setError("Impossible de charger les statistiques d’activité. Réessayez.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters, retry]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      getAllRegisteredSalons(1, 30, search, undefined, undefined, draft.role as "user_salon" | "user_tatoueur" || undefined)
        .then((result) => {
          if (!active) return;
          if (!result.ok) { setAccountError("Recherche de comptes indisponible."); return; }
          setAccounts(result.salons ?? []);
        }).catch(() => { if (active) setAccountError("Recherche de comptes indisponible."); })
        .finally(() => { if (active) setAccountLoading(false); });
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [search, draft.role]);

  function apply(next: ActivityFilters) {
    setLoading(true); setError(""); setStats(null); setFilters({ ...next });
  }
  const number = (value: number | undefined) => loading || value === undefined ? "—" : value.toLocaleString("fr-FR");
  const metric = (key: keyof Stats["totals"], label: string, Icon: typeof CalendarDays) => (
    <div className={styles.metric} key={key}>
      <h4><Icon size={16} aria-hidden="true" />{label}</h4>
      <p className={styles.value}>{number(stats?.filtered[key])}</p>
      <p className={styles.total}>Dans la sélection · Total plateforme : {number(stats?.totals[key])}</p>
    </div>
  );
  return <section className={`admin-panel ${styles.workspace}`} aria-labelledby="activity-heading">
    <header className={styles.heading}><div><h2 id="activity-heading">Activité de la plateforme</h2><p>Volumes enregistrés, toutes périodes confondues ou selon vos filtres.</p></div></header>
    <form className={styles.filters} onSubmit={(event) => { event.preventDefault(); apply(draft); }}>
      <label>Année<input type="number" min="2000" max="9998" placeholder="Toutes les années" value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value, month: e.target.value ? draft.month : "" })} /></label>
      <label>Mois<select value={draft.month} disabled={!draft.year} onChange={(e) => setDraft({ ...draft, month: e.target.value })}><option value="">Tous les mois</option>{months.map((month, i) => <option key={month} value={i + 1}>{month}</option>)}</select></label>
      <label>Type de compte professionnel<select value={draft.role} onChange={(e) => { setDraft({ ...draft, role: e.target.value, accountId: "" }); setAccounts([]); setAccountLoading(true); setAccountError(""); }}><option value="">Salons et indépendants</option><option value="user_salon">Salons</option><option value="user_tatoueur">Indépendants</option></select></label>
      <div className={styles.accounts}>
        <label>Rechercher un compte<input type="search" placeholder="Nom ou e-mail" value={search} onChange={(e) => { setSearch(e.target.value); setDraft({ ...draft, accountId: "" }); setAccounts([]); setAccountLoading(true); setAccountError(""); }} /></label>
        <label>Compte professionnel<select value={draft.accountId} disabled={accountLoading || !!accountError} onChange={(e) => setDraft({ ...draft, accountId: e.target.value })}><option value="">{accountLoading ? "Recherche…" : "Tous les comptes"}</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.salonName || account.nickname || account.email} · {account.email}</option>)}</select></label>
        {accountError ? <p role="alert" className={styles.note}>{accountError}</p> : <p className={styles.note}>30 résultats maximum. Affinez la recherche pour trouver un compte.</p>}
      </div>
      <label>Statut des moodboards partagés<select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}><option value="">Tous les statuts</option>{Object.entries(projectStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <div className="flex flex-wrap gap-3"><button className="admin-button" type="submit">Appliquer</button><button className="admin-button" type="button" onClick={() => { setDraft(initialFilters); setSearch(""); if (search || draft.role) { setAccounts([]); setAccountLoading(true); } setAccountError(""); apply(initialFilters); }}>Réinitialiser</button></div>
    </form>
    <p className={styles.note}>Sélection appliquée : {filters.year ? `${filters.month ? `${months[Number(filters.month) - 1]} ` : "Année "}${filters.year}` : "Toutes les périodes"} · {filters.accountId ? "Compte professionnel sélectionné" : filters.role === "user_salon" ? "Salons" : filters.role === "user_tatoueur" ? "Indépendants" : "Tous les comptes professionnels"} · Moodboards partagés : {filters.status ? projectStatusLabels[filters.status] : "tous les statuts"}. Choisissez une année pour filtrer par mois.</p>
    {error && <div className="admin-error" role="alert">{error}<button className="admin-button ml-3" onClick={() => { setLoading(true); setError(""); setRetry(retry + 1); }}>Réessayer</button></div>}
    <div aria-busy={loading} aria-live="polite" className={styles.workspace}>
      <section className={styles.section}><h3>Rendez-vous et fiches clients</h3><p className={styles.note}>Filtres : période, type de compte et compte précis. Période basée sur la création, heure de Paris. Les fiches sont celles enregistrées par les professionnels, distinctes des comptes clients.</p><div className={styles.cards}>{metric("appointments", "Prises de rendez-vous", CalendarDays)}{metric("clientRecords", "Fiches clients créées", ContactRound)}</div></section>
      <section className={styles.section}><h3>Moodboards</h3><p className={styles.note}>Le filtre de période s’applique à la création des moodboards et à la première publication des partagés. Le statut actuel filtre uniquement les partagés. Ces chiffres couvrent tous les clients, indépendamment du compte professionnel sélectionné.</p><div className={styles.cards}>{metric("moodboards", "Moodboards créés", Images)}{metric("sharedMoodboards", "Moodboards partagés", Share2)}</div>
        <p className={styles.note}>Répartition des moodboards partagés sur la période, avant filtre de statut.</p>
        <div className={styles.statuses}>{!loading && stats?.sharedByStatus.map(({ status, count }) => <span key={status}>{projectStatusLabels[status] ?? status}<strong>{number(count)}</strong></span>)}</div>
        {!loading && stats?.sharedByStatus.length === 0 && <p className={styles.note}>Aucun moodboard partagé sur cette période.</p>}
      </section>
      <p className={styles.note}>Les totaux comptent les éléments encore présents en base. Un moodboard partagé est compté une seule fois, même s’il est republié ou repasse en privé.</p>
    </div>
  </section>;
}
