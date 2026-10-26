import { BACK_OFFICE_PATH } from "@/lib/back-office";
import Link from "next/link";
import { getAuthHeaders } from "@/lib/session";
import { ArrowUpRight, Building2, ChevronDown, ChevronLeft, ChevronRight, Clock3, Flag, FolderOpen, MessageSquare, RotateCw, ShieldCheck, TriangleAlert, UserRound } from "lucide-react";
import styles from "@/components/Admin/ReportsWorkspace.module.css";

type Report = {
  id: string;
  reason: string;
  createdAt: string;
  client: { id: string; email: string };
  professional: { id: string; salonName?: string; email: string };
  proposal?: { message: string; moodboard: { name: string } };
};
type ReportsResponse = { data: Report[]; total: number; page: number; totalPages: number };

export default async function ProjectReportsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  let result: ReportsResponse | null = null;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/admin/project-reports?page=${page}`, { headers: await getAuthHeaders(), cache: "no-store" });
    if (response.ok) result = await response.json();
  } catch { /* The error state below keeps the navigation available. */ }
  const currentPage = result?.page || page;
  const formatDate = (value: string) => new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Paris" });
  const formatTime = (value: string) => new Date(value).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });

  return <div className={`admin-page ${styles.page}`}>
    <header className={styles.heading}>
      <div className={styles.headingTitle}><span className={styles.headingIcon}><Flag size={18} aria-hidden="true" /></span><div><h1>Signalements</h1><p>Examinez les retours des clients sur les propositions de projets.</p></div></div>
      {result && <span className={styles.count}><strong>{result.total}</strong>signalement{result.total > 1 ? "s" : ""}</span>}
    </header>
    {!result ? <div className={styles.state} role="alert"><span className={styles.stateIcon}><TriangleAlert size={23} /></span><h2>Les signalements ne sont pas disponibles</h2><p>Le chargement a échoué. Vous pouvez réessayer dans quelques instants.</p><a href={`${BACK_OFFICE_PATH}/signalements?page=${page}`} className={styles.button}><RotateCw size={13} />Réessayer</a></div> : !result.data.length ? <div className={styles.state}><span className={styles.stateIcon}><ShieldCheck size={23} /></span><h2>{page > 1 ? "Aucun signalement sur cette page" : "Aucun signalement pour le moment"}</h2><p>{page > 1 ? "Revenez à la première page pour consulter les signalements disponibles." : "Les signalements reçus apparaîtront ici avec leur motif et le contexte du projet."}</p>{page > 1 && <Link href={`${BACK_OFFICE_PATH}/signalements`} className={styles.button}><ChevronLeft size={13} />Première page</Link>}</div> : <div>
      <div className={styles.intro}><span><MessageSquare size={13} />{result.data.length} signalement{result.data.length > 1 ? "s" : ""} sur cette page</span><span>Page {currentPage} sur {Math.max(1, result.totalPages)}</span></div>
      <div className={styles.list}>{result.data.map(report => <article key={report.id} className={styles.report} aria-labelledby={`report-${report.id}`}>
        <header className={styles.reportHeader}>
          <div className={styles.professional}><span className={styles.professionalIcon}><Building2 size={16} aria-hidden="true" /></span><div><p className={styles.contextLabel}>Professionnel concerné</p><h2 id={`report-${report.id}`}><Link href={`${BACK_OFFICE_PATH}/users/${report.professional.id}`}>{report.professional.salonName || report.professional.email}<ArrowUpRight size={12} aria-hidden="true" /></Link></h2></div></div>
          <time className={styles.timestamp} dateTime={report.createdAt}><Clock3 size={12} aria-hidden="true" /><div>{formatDate(report.createdAt)}<span>{formatTime(report.createdAt)}</span></div></time>
        </header>
        <div className={styles.reportBody}>
          <p className={styles.reporter}><UserRound size={12} aria-hidden="true" /><span>Signalé par <Link href={`${BACK_OFFICE_PATH}/users/${report.client.id}`}>{report.client.email}</Link></span></p>
          <div className={styles.reason}><h3>Motif du signalement</h3><p>{report.reason || "Aucun motif renseigné."}</p></div>
          {report.proposal && <details className={styles.proposal}><summary><FolderOpen size={13} aria-hidden="true" /><span>Voir le contexte du projet{report.proposal.moodboard?.name ? ` · ${report.proposal.moodboard.name}` : ""}</span><ChevronDown size={13} aria-hidden="true" /></summary><div className={styles.proposalBody}><h3>Proposition du professionnel</h3><p>{report.proposal.message || "Aucun message associé à cette proposition."}</p></div></details>}
        </div>
      </article>)}</div>
      {result.totalPages > 1 && <nav className={styles.pagination} aria-label="Pagination des signalements"><span>Page {currentPage} sur {result.totalPages}</span><div>{currentPage > 1 && <Link href={`?page=${currentPage - 1}`} className={styles.button}><ChevronLeft size={13} />Précédent</Link>}{currentPage < result.totalPages && <Link href={`?page=${currentPage + 1}`} className={styles.button}>Suivant<ChevronRight size={13} /></Link>}</div></nav>}
    </div>}
  </div>;
}