"use client";
import { BACK_OFFICE_PATH } from "@/lib/back-office";
import { useEffect, useState } from "react";
import Link from "next/link";
import { invitationRequest } from "@/lib/queries/invitations";
import { Copy, Info, Link2, LoaderCircle, Mail, MailPlus, Plus } from "lucide-react";
import styles from "./UsersWorkspace.module.css";

type Redemption = {
  plan: string;
  id: string;
  userId: string | null;
  redeemedAt: string;
  durationMonths: number;
  offerEndsAt: string;
  user: { email: string } | null;
};
type Invitation = {
  id: string;
  email: string | null;
  role: string | null;
  plan: string | null;
  durationMonths: number;
  maxUses: number;
  useCount: number;
  expiresAt: string;
  revokedAt: string | null;
  redemptions: Redemption[];
};
const inputClass = "w-full";

export default function Invitations() {
  const [showCreate, setShowCreate] = useState(false);
  const [items, setItems] = useState<Invitation[]>([]);
  const [mode, setMode] = useState("shared");
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    const result = await invitationRequest("GET");
    if (result.ok) setItems(result.data);
    else setError(result.message || "Chargement impossible.");
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);
  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setNotice("");
    const result = await invitationRequest("POST", undefined, {
      ...(mode === "personal" ? { email: String(data.get("email")) } : {}),
      ...(role ? { role } : {}),
      ...(data.get("plan") ? { plan: String(data.get("plan")) } : {}),
      durationMonths: Number(data.get("months")),
      maxUses: mode === "personal" ? 1 : Number(data.get("maxUses")),
      validityDays: Number(data.get("validityDays")),
    });
    if (result.ok) {
      setUrl(result.data.url);
      await load();
    } else setError(result.message || "Création impossible.");
    setBusy(false);
  };
  const update = async (
    id: string,
    data?: { durationMonths: number; maxUses: number; expiresAt: string },
  ) => {
    setBusy(true);
    setError("");
    setNotice("");
    const result = await invitationRequest(data ? "PATCH" : "DELETE", id, data);
    if (result.ok) {
      setNotice(
        data
          ? "Paramètres mis à jour."
          : "Lien révoqué. Les offres déjà accordées restent actives.",
      );
      await load();
    } else setError(result.message || "Modification impossible.");
    setBusy(false);
  };
  return <div className={styles.invitations}>
    <header className={styles.invitationHeading}>
      <p>Offrez un abonnement et suivez les comptes créés depuis vos liens.</p>
      <button type="button" className={styles.primaryButton} onClick={() => setShowCreate(open => !open)} aria-expanded={showCreate} aria-controls="create-invitation"><Plus size={14} />{showCreate ? "Fermer" : "Créer une invitation"}</button>
    </header>
    {showCreate && <form id="create-invitation" onSubmit={create} className={styles.createForm}>
      <label className={styles.field}>Type de lien<select value={mode} onChange={e => setMode(e.target.value)} className={inputClass}>
        <option value="shared">Partageable, sans destinataire</option><option value="personal">Personnel, lié à un e-mail</option>
      </select></label>
      {mode === "personal" ? <label className={styles.field}>E-mail du bénéficiaire<input name="email" type="email" required className={inputClass} placeholder="nom@exemple.fr" /></label> :
        <label className={styles.field}>Nombre maximal d’inscriptions<input name="maxUses" type="number" min="1" max="1000" defaultValue="5" required className={inputClass} /></label>}
      <label className={styles.field}>Type de compte<select value={role} onChange={e => setRole(e.target.value)} className={inputClass}>
        <option value="">Au choix du bénéficiaire</option><option value="user_salon">Salon</option><option value="user_tatoueur">Tatoueur indépendant</option>
      </select></label>
      <label className={styles.field}>Formule<select key={role} name="plan" defaultValue="" disabled={!role} className={inputClass}>
        <option value="">Au choix du bénéficiaire</option><option value="PRO">Pro</option>{role === "user_salon" && <option value="BUSINESS">Business</option>}
      </select></label>
      <label className={styles.field}>Offre par compte (mois)<input name="months" type="number" min="1" max="120" defaultValue="12" required className={inputClass} /></label>
      <label className={styles.field}>Validité du lien (jours)<input name="validityDays" type="number" min="1" max="365" defaultValue="30" required className={inputClass} /></label>
      <div className={styles.createFooter}><p>Chaque bénéficiaire profite de l’offre dès son inscription, sans carte bancaire. Le lien personnel ne peut servir qu’une fois.</p><button type="submit" disabled={busy} className={styles.primaryButton}>{busy ? <LoaderCircle size={14} className="animate-spin" /> : <Link2 size={14} />}{busy ? "Création…" : "Générer le lien"}</button></div>
    </form>}
    {url && <div className={styles.generatedLink}>
      <label className={styles.field}>Votre lien est prêt à partager<input aria-label="Lien d’invitation" readOnly value={url} onFocus={e => e.target.select()} className={inputClass} /></label>
      <button type="button" className={styles.button} onClick={async () => { try { await navigator.clipboard.writeText(url); setNotice("Lien copié."); } catch { setError("Sélectionnez le lien pour le copier manuellement."); } }}><Copy size={13} />Copier</button>
    </div>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {notice && <p role="status" className={styles.notice}>{notice}</p>}
    <p className={styles.help}><Info size={14} /><span>Aucun e-mail n’est envoyé automatiquement. Copiez le lien dès sa création pour le partager. Sans type de compte ni formule imposés, le bénéficiaire choisit entre indépendant (Pro) et salon (Business).</span></p>
    <div className={styles.viewHeading}><h2>Liens créés</h2><span className={styles.status}>{items.length} invitation{items.length > 1 ? "s" : ""}</span></div>
    {loading ? <div className={styles.state} role="status"><LoaderCircle size={21} className="animate-spin" />Chargement des invitations…</div> : !items.length ?
      <div className={styles.state}><MailPlus size={24} /><strong>Aucune invitation pour le moment</strong><p>Créez votre premier lien pour offrir un accès à Inkera.</p><button type="button" className={styles.button} onClick={() => setShowCreate(true)}><Plus size={13} />Créer une invitation</button></div> :
      <div className={styles.invitationList}>{items.map(item => {
        const status = item.revokedAt ? "Révoqué" : new Date(item.expiresAt) <= new Date() ? "Expiré" : item.useCount >= item.maxUses ? "Quota atteint" : "Actif";
        return <article key={item.id} className={styles.invitation}>
          <div className={styles.invitationTop}>
            <div className={styles.invitationIdentity}><span className={styles.invitationIcon}>{item.email ? <Mail size={16} /> : <Link2 size={16} />}</span><div className="min-w-0">
              <h3 className={styles.invitationName}>{item.email || "Lien partageable"}</h3>
              <div className={styles.invitationMeta}><span>{item.role === "user_salon" ? "Salon" : item.role === "user_tatoueur" ? "Indépendant" : "Salon ou indépendant"}</span><span>{item.plan || "Pro / Business au choix"}</span><span>{item.durationMonths} mois offerts</span><span>{item.useCount} / {item.maxUses} inscriptions</span><span>Expire le {new Date(item.expiresAt).toLocaleDateString("fr-FR")}</span></div>
            </div></div>
            <span className={styles.status} data-active={status === "Actif"}>{status}</span>
          </div>
          <details className={styles.invitationEditor}>
            <summary>Modifier les paramètres du lien</summary>
            <form key={item.id + item.durationMonths + item.maxUses + item.expiresAt} className={styles.editForm} onSubmit={e => {
              e.preventDefault(); const data = new FormData(e.currentTarget);
              void update(item.id, { durationMonths: Number(data.get("months")), maxUses: Number(data.get("maxUses")), expiresAt: new Date(String(data.get("expiresAt")) + "T23:59:59.999").toISOString() });
            }}>
              <label className={styles.field}>Offre par compte (mois)<input name="months" type="number" required min="1" max="120" defaultValue={item.durationMonths} disabled={!!item.revokedAt} className={inputClass} /></label>
              <label className={styles.field}>Quota d’inscriptions<input name="maxUses" type="number" required min={Math.max(1, item.useCount)} max={item.email ? 1 : 1000} readOnly={!!item.email} defaultValue={item.maxUses} disabled={!!item.revokedAt} className={inputClass} /></label>
              <label className={styles.field}>Date limite du lien<input name="expiresAt" type="date" required defaultValue={new Date(item.expiresAt).toLocaleDateString("en-CA")} disabled={!!item.revokedAt} className={inputClass} /></label>
              <button type="submit" disabled={busy || !!item.revokedAt} className={styles.button}>Enregistrer</button>
              {!item.revokedAt && <button type="button" disabled={busy} onClick={() => { void update(item.id); }} className={styles.dangerButton}>Révoquer le lien</button>}
            </form>
          </details>
          {!!item.redemptions.length && <details className={styles.redemptions}><summary>Comptes inscrits ({item.redemptions.length})</summary><ul>{item.redemptions.map(redemption => <li key={redemption.id}>
            {redemption.userId ? <Link href={`${BACK_OFFICE_PATH}/users/${redemption.userId}`}>{redemption.user?.email || "Voir le compte"}</Link> : <span>Compte supprimé</span>}
            <span>{redemption.plan} · {redemption.durationMonths} mois · fin le {new Date(redemption.offerEndsAt).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })}</span>
          </li>)}</ul></details>}
        </article>;
      })}</div>}
    <details className={styles.redemptions}><summary>Comment fonctionnent les offres accordées ?</summary><p className="mt-3 max-w-3xl text-xs leading-6 text-white/50">Chaque inscription réussie consomme une place, même si le compte est ensuite supprimé. Modifier la durée recalcule la fin des offres déjà accordées depuis leur date d’inscription. Les comptes passés sur Stripe sont conservés. Sans souscription, l’offre se termine par un retour en Free, sans prélèvement.</p></details>
  </div>;
}
