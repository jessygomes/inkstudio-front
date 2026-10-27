import { BACK_OFFICE_PATH } from "@/lib/back-office";
import { getSalonById } from "@/lib/queries/admin";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, ChevronRight, Clock3, CreditCard, Gift, Mail, MapPin, Phone, ShieldCheck, TriangleAlert, UserRound, UsersRound } from "lucide-react";
import styles from "@/components/Admin/UserProfile.module.css";
import { documentStatus } from "@/lib/admin-verification";
import VerificationDocumentsSection from "@/components/Admin/VerificationDocumentsSection";
import DeleteUser from "@/components/Admin/DeleteUser";
import ContactUser from "@/components/Admin/ContactUser";
import UserSubscriptionEditor from "@/components/Admin/UserSubscriptionEditor";
import UserPublicVisibility from "@/components/Admin/UserPublicVisibility";
import AccountAge from "@/components/Admin/AccountAge";


// Page serveur : nécessite l'auth admin via le layout parent
export default async function AdminUserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await getSalonById(id);



  if (!result.ok) {
    // Rediriger vers la liste si l'ID est invalide ou l'API renvoie une erreur
    redirect(`${BACK_OFFICE_PATH}/users`);
  }

  type HoursSlot = { start: string; end: string };
  type HoursMap = Partial<
    Record<
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday",
      HoursSlot | null
    >
  >;

  type VerificationDoc = {
    id?: string;
    type?: string;
    name?: string;
    fileUrl?: string;
    url?: string;
    status?: string;
    createdAt?: string;
  };

  type Tattooer = {
    id: string;
    name?: string;
    img?: string;
    description?: string;
    hours?: string | HoursMap;
    phone?: string;
    instagram?: string;
    skills?: string[];
    style?: string[];
    rdvBookingEnabled?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };

  type ClientProfile = {
    pseudo?: string;
    birthDate?: string;
    city?: string;
    postalCode?: string;
  };

  type Salon = {
    id: string;
    role?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    salonName?: string;
    nickname?: string | null;
    publicVisibility?: "VISIBLE" | "SEARCH_HIDDEN" | "HIDDEN";
    salonHours?: string | HoursMap;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    profileImage?: string;
    image?: string;
    description?: string;
    verifiedSalon?: boolean;
    redeemedInvitation?: { id: string; durationMonths: number; redeemedAt: string } | null;
    hasStripeSubscription?: boolean;
    saasPlanUntil?: string | null;
    saasPlanDetails?: { startDate?: string; endDate?: string | null; paymentMethod?: string | null; planStatus?: string; trialEndDate?: string | null };
    saasPlan?: string;
    createdAt?: string;
    updatedAt?: string;
    Tatoueur?: Tattooer[];
    clientProfile?: ClientProfile;
    SalonVerificationDocument?: VerificationDoc[];
    documents?: VerificationDoc[];
    user?: Salon;
  };

  const raw = result as unknown as Record<string, unknown> & { ok: boolean };
  const entity = (raw.salon as Salon | undefined) ?? (raw as unknown as Salon); // l'API peut renvoyer {salon} ou l'objet directement
  const salon: Salon = (entity.user as Salon | undefined) ?? entity; // certains endpoints renvoient { user, ... }
  const entityRecord = entity as unknown as Record<string, unknown>;
  const hasNestedUser = Boolean(entityRecord?.user);
  const clientIdForContact =
    hasNestedUser && typeof entityRecord?.id === "string" && entityRecord.id !== salon.id
      ? entityRecord.id
      : undefined;
  const verificationDocs: VerificationDoc[] =
    entity?.documents ??
    (entity as Salon)?.SalonVerificationDocument ??
    salon?.SalonVerificationDocument ??
    [];

  if (!salon) {
    notFound();
  }

  const displayName =
    salon.nickname || salon.salonName ||
    `${salon.firstName || ""} ${salon.lastName || ""}`.trim() ||
    "Sans nom";

  const roleLabel =
    (salon.role === "client" || salon.role === "user") ? "Compte client" : salon.role === "admin" ? "Administrateur" : salon.role === "user_tatoueur" ? "Compte indépendant" : "Compte salon";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Europe/Paris",
    });
  };

  const parseHours = (hoursInput?: string | HoursMap): HoursMap => {
    try {
      if (!hoursInput) return {} as HoursMap;
      const obj =
        typeof hoursInput === "string"
          ? (JSON.parse(hoursInput) as HoursMap)
          : (hoursInput as HoursMap);
      return obj || ({} as HoursMap);
    } catch {
      return {} as HoursMap;
    }
  };

  const dayLabels: Record<string, string> = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  };

  const renderHours = (hours: HoursMap) => <dl className={styles.hours}>{Object.keys(dayLabels).map(day => {
    const slot = hours[day as keyof HoursMap]; const open = !!(slot?.start && slot?.end);
    return <div key={day}><dt>{dayLabels[day]}</dt><dd data-open={open}>{open ? slot!.start + " - " + slot!.end : "Fermé"}</dd></div>;
  })}</dl>;

  const tattooers: Tattooer[] =
    (entity as Salon)?.Tatoueur ?? salon?.Tatoueur ?? [];
  const salonHoursObj = parseHours(salon?.salonHours);

  const approvedDocsCount = verificationDocs.filter(doc => documentStatus(doc.status) === "approved").length;
  const pendingDocsCount = verificationDocs.filter(doc => documentStatus(doc.status) === "pending").length;
  const completionRate = verificationDocs.length ? Math.round(approvedDocsCount / verificationDocs.length * 100) : 0;

  const professional = salon.role === "user_salon" || salon.role === "user_tatoueur";
  const clientProfile = entity.clientProfile ?? salon.clientProfile;
  const profileLocation = [salon.postalCode || clientProfile?.postalCode, salon.city || clientProfile?.city].filter(Boolean).join(" ");
  const sectionLinks = [
    { href: "#informations", label: "Informations", icon: UserRound },
    ...(professional ? [{ href: "#documents", label: "Vérification", icon: ShieldCheck }, { href: "#horaires", label: "Horaires", icon: Clock3 }, { href: "#equipe", label: "Équipe", icon: UsersRound }] : []),
  ];

  return <div className={`admin-page ${styles.page}`}>
    <nav className={styles.breadcrumb} aria-label="Fil d’Ariane"><Link href={`${BACK_OFFICE_PATH}/users${professional ? "" : "?tab=clients"}`}><ArrowLeft size={13} />Utilisateurs</Link><ChevronRight size={12} /><span>{displayName}</span></nav>
    <header className={styles.identityHeader}>
      <div className={styles.identity}>
        <div className={styles.avatar}>{salon.profileImage || salon.image ? <Image src={(salon.profileImage || salon.image)!} alt={displayName} fill sizes="72px" className="object-cover" /> : <span>{displayName.charAt(0).toUpperCase()}</span>}</div>
        <div className="min-w-0"><p className={styles.eyebrow}>Fiche utilisateur</p><h1>{displayName}</h1><div className={styles.identityMeta}><span>{roleLabel}</span>{professional && <span className={styles.badge} data-tone={salon.verifiedSalon ? "success" : "neutral"}><ShieldCheck size={11} />{salon.verifiedSalon ? "Compte vérifié" : "Non vérifié"}</span>}{profileLocation && <span><MapPin size={12} />{profileLocation}</span>}</div></div>
      </div>
      <div className={styles.headerActions}><ContactUser userId={salon.id} clientId={clientIdForContact} userEmail={salon.email} userLabel={displayName} className={styles.contactButton} /></div>
    </header>
    {salon.redeemedInvitation && <div className={styles.invitationBanner}><Gift size={17} /><div><strong>Compte créé sur invitation</strong><p>Invitation utilisée le {formatDate(salon.redeemedInvitation.redeemedAt)}.</p></div><Link href={`${BACK_OFFICE_PATH}/users?tab=invitations`}>Gérer l’offre<ArrowUpRight size={13} /></Link></div>}
    <nav className={styles.sectionNav} aria-label="Sections de la fiche">{sectionLinks.map(({ href, label, icon: Icon }) => <a href={href} key={href}><Icon size={14} />{label}{href === "#documents" && <span>{verificationDocs.length}</span>}{href === "#equipe" && <span>{tattooers.length}</span>}</a>)}</nav>
    <div className={styles.layout}>
      <div className={styles.mainColumn}>
        {professional && <UserPublicVisibility key={salon.id + (salon.publicVisibility || "VISIBLE")} userId={salon.id} initialValue={salon.publicVisibility || "VISIBLE"} />}
        <section id="informations" className={styles.section} aria-labelledby="information-title">
          <header className={styles.sectionHeading}><span className={styles.sectionIcon}><UserRound size={16} /></span><div><h2 id="information-title">Informations du compte</h2><p>Identité, coordonnées et localisation.</p></div></header>
          <dl className={styles.infoGrid}>
            <div><dt>Nom complet</dt><dd>{[salon.firstName, salon.lastName].filter(Boolean).join(" ") || "Non renseigné"}</dd></div>
            <div><dt><Mail size={12} />Adresse e-mail</dt><dd>{salon.email ? <a href={`mailto:${salon.email}`}>{salon.email}</a> : "Non renseignée"}</dd></div>
            <div><dt><Phone size={12} />Téléphone</dt><dd>{salon.phone ? <a href={`tel:${salon.phone}`}>{salon.phone}</a> : "Non renseigné"}</dd></div>
            <div><dt><MapPin size={12} />Adresse</dt><dd>{[salon.address, profileLocation].filter(Boolean).join(", ") || "Non renseignée"}</dd></div>
            {salon.nickname && <div><dt>Pseudo public</dt><dd>{salon.nickname}</dd></div>}
            {clientProfile?.pseudo && <div><dt>Pseudonyme</dt><dd>{clientProfile.pseudo}</dd></div>}
            {clientProfile?.birthDate && <div><dt>Date de naissance</dt><dd>{formatDate(clientProfile.birthDate)}</dd></div>}
          </dl>
          {salon.description && <div className={styles.description}><h3>Présentation</h3><p>{salon.description}</p></div>}
          {salon.image && salon.image !== salon.profileImage && <details className={styles.profileImage}><summary>Voir l’image du profil public</summary><div><Image src={salon.image} alt={`Image de ${displayName}`} fill sizes="(max-width: 760px) 100vw, 700px" className="object-cover" /></div></details>}
        </section>
        {professional && <>
          <section id="documents" className={styles.section} aria-labelledby="documents-title">
            <header className={styles.sectionHeading}><span className={styles.sectionIcon}><ShieldCheck size={16} /></span><div><h2 id="documents-title">Vérification du compte</h2><p>Consultez les justificatifs et validez chaque fichier.</p></div><span className={styles.badge} data-tone={pendingDocsCount ? "warning" : "neutral"}>{pendingDocsCount ? `${pendingDocsCount} à examiner` : `${verificationDocs.length} document${verificationDocs.length > 1 ? "s" : ""}`}</span></header>
            <VerificationDocumentsSection documents={verificationDocs} verifiedSalon={salon.verifiedSalon} compact />
          </section>
          <section id="horaires" className={styles.section} aria-labelledby="hours-title">
            <header className={styles.sectionHeading}><span className={styles.sectionIcon}><Clock3 size={16} /></span><div><h2 id="hours-title">Horaires du profil</h2><p>Les disponibilités renseignées par le professionnel.</p></div></header>
            {Object.keys(salonHoursObj).length ? renderHours(salonHoursObj) : <p className={styles.emptyInline}>Aucun horaire renseigné.</p>}
          </section>
          <section id="equipe" className={styles.section} aria-labelledby="team-title">
            <header className={styles.sectionHeading}><span className={styles.sectionIcon}><UsersRound size={16} /></span><div><h2 id="team-title">Équipe et profils artistes</h2><p>Les artistes associés à ce compte.</p></div><span className={styles.badge}>{tattooers.length} artiste{tattooers.length > 1 ? "s" : ""}</span></header>
            {tattooers.length ? <div className={styles.teamList}>{tattooers.map(t => <article key={t.id} className={styles.teamMember}>
              <div className={styles.memberHeader}><span className={styles.memberAvatar}>{t.img ? <Image src={t.img} alt={t.name || "Artiste"} fill sizes="38px" className="object-cover" /> : (t.name || "A").charAt(0)}</span><div><h3>{t.name || "Artiste sans nom"}</h3><p>{t.createdAt ? `Profil créé le ${formatDate(t.createdAt)}` : "Artiste associé"}{t.updatedAt && ` · Mis à jour le ${formatDate(t.updatedAt)}`}</p></div></div>
              {t.description && <p className={styles.memberDescription}>{t.description}</p>}
              <div className={styles.memberContact}>{t.phone && <a href={`tel:${t.phone}`}><Phone size={12} />{t.phone}</a>}{t.instagram && <a href={t.instagram} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={12} />Instagram</a>}</div>
              {((t.skills?.length || 0) > 0 || (t.style?.length || 0) > 0) && <dl className={styles.artistTags}>{t.skills?.length ? <div><dt>Compétences</dt><dd>{t.skills.map(skill => <span key={skill}>{skill}</span>)}</dd></div> : null}{t.style?.length ? <div><dt>Styles</dt><dd>{t.style.map(style => <span key={style}>{style}</span>)}</dd></div> : null}</dl>}
              {t.hours && <details className={styles.memberHours}><summary>Voir les horaires de l’artiste</summary>{renderHours(parseHours(t.hours))}</details>}
            </article>)}</div> : <div className={styles.empty}><UsersRound size={22} /><p>Aucun artiste associé à ce compte.</p></div>}
          </section>
        </>}
      </div>
      <aside className={styles.sideColumn} aria-label="Résumé administratif">
        <section className={styles.summary}><header><CreditCard size={15} /><h2>{professional ? "Abonnement" : "Compte utilisateur"}</h2>{professional && <UserSubscriptionEditor userId={salon.id} role={salon.role as "user_salon" | "user_tatoueur"} hasStripeSubscription={!!salon.hasStripeSubscription} />}</header><div className={styles.plan}><strong>{professional ? salon.saasPlan || "Non renseigné" : roleLabel}</strong>{salon.saasPlanDetails?.paymentMethod === "STRIPE_GIFT" && salon.saasPlanDetails.planStatus === "TRIAL" ? <span className={styles.badge} data-tone="success">Offre avec reprise automatique</span> : salon.saasPlanDetails?.paymentMethod === "ADMIN_GIFT" ? <span className={styles.badge} data-tone="success">Offre accordée en admin</span> : salon.redeemedInvitation && <span className={styles.badge} data-tone="success">Offre sur invitation</span>}</div><dl className={styles.summaryRows}><div><dt>Type de compte</dt><dd>{roleLabel}</dd></div>{professional && <><div><dt>Début de l’abonnement</dt><dd>{formatDate(salon.saasPlanDetails?.startDate)}</dd></div><div><dt>Fin de l’offre</dt><dd>{formatDate(salon.saasPlanDetails?.endDate || salon.saasPlanUntil || salon.saasPlanDetails?.trialEndDate || undefined)}</dd></div></>}<div><dt>Inscription</dt><dd>{formatDate(salon.createdAt)}</dd></div><div><dt>Dernière mise à jour</dt><dd>{formatDate(salon.updatedAt)}</dd></div></dl><div className={styles.membership}><CalendarDays size={15} /><div><span>Ancienneté sur Inkera</span><AccountAge createdAt={salon.createdAt} /></div></div></section>
        {professional && <section className={styles.summary}><header><ShieldCheck size={15} /><h2>Suivi des justificatifs</h2></header><div className={styles.documentStats}><div><strong>{approvedDocsCount}</strong><span>validé{approvedDocsCount > 1 ? "s" : ""}</span></div><div><strong>{pendingDocsCount}</strong><span>à examiner</span></div><div><strong>{verificationDocs.length}</strong><span>reçu{verificationDocs.length > 1 ? "s" : ""}</span></div></div><div className={styles.progress} role="progressbar" aria-label="Part des documents validés" aria-valuenow={completionRate} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${completionRate}%` }} /></div><p className={styles.progressNote}>{approvedDocsCount} / {verificationDocs.length} justificatifs validés</p><a className={styles.summaryLink} href="#documents">Examiner les documents<ArrowUpRight size={13} /></a></section>}
        <section className={styles.technical}><h2>Référence du compte</h2><code>{salon.id}</code><p>Identifiant utilisé pour le suivi administratif.</p></section>
        <section className={styles.dangerZone}><header><TriangleAlert size={15} /><h2>Suppression du compte</h2></header><p>Cette action supprime l’utilisateur et ses données associées. Une confirmation sera demandée.</p><DeleteUser userId={salon.id} userLabel={displayName} className={styles.deleteButton} /></section>
      </aside>
    </div>
  </div>;
}
