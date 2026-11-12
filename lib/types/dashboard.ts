/** Blocs du résumé `GET /dashboard/summary` (voir `docs/dashboard-summary.md` du backend). */
export type DashboardBlockName =
  | "today"
  | "pending"
  | "conversations"
  | "followUps"
  | "drawingCards"
  | "fillRate"
  | "cancelRate"
  | "newClients"
  | "paid"
  | "recentReviews";

/** Un bloc réussit ou échoue seul (ex. plan FREE sur les statistiques). */
export type DashboardSection<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

export type DashboardSummary = Partial<Record<DashboardBlockName, DashboardSection>>;

export type DashboardSummaryParams = {
  /** Jour des rendez-vous (YYYY-MM-DD, heure locale). */
  date: string;
  /** Période du taux de remplissage (ISO). */
  fillStart: string;
  fillEnd: string;
  month: number;
  year: number;
};
