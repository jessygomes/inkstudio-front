// Contrat API « liens de réservation personnalisés » et « période souhaitée » (backend inkstudio-back).
// Ne contient que des types et des fonctions pures : utilisable côté client comme côté serveur.

export type DesiredTattooPeriod = "ASAP" | "EXACT_DATE" | "DATE_RANGE" | "FLEXIBLE" | "UNDECIDED";
export type BookingLinkMode = "FIXED_START" | "AUTOMATIC";
export type BookingLinkStatus = "ACTIVE" | "USED" | "EXPIRED" | "REVOKED";
export type BookingLinkPrestation = "TATTOO" | "RETOUCHE";

export interface DesiredTattooPeriodInput {
  desiredTattooPeriod: DesiredTattooPeriod | null;
  desiredTattooDate?: string | null; // YYYY-MM-DD
  desiredTattooStartDate?: string | null; // YYYY-MM-DD
  desiredTattooEndDate?: string | null; // YYYY-MM-DD, borne incluse
}

/** Champs renvoyés par les endpoints RDV (dates sérialisées à minuit UTC). */
export interface DesiredTattooPeriodFields {
  desiredTattooPeriod?: DesiredTattooPeriod | null;
  desiredTattooDate?: string | null;
  desiredTattooStartDate?: string | null;
  desiredTattooEndDate?: string | null;
}

export interface CreateBookingLinkRequest {
  userId?: string;
  tatoueurId?: string;
  venueSalonId?: string;
  prestation: BookingLinkPrestation;
  durationMinutes: number;
  mode: BookingLinkMode;
  fixedStartTime?: string;
  allowedFrom: string;
  allowedTo: string;
  expiresAt?: string;
  clientId?: string;
  projectAppointmentId?: string;
  conversationId?: string;
  inboxThreadId?: string;
}

export interface BookingLink {
  id: string;
  userId: string;
  createdByUserId: string;
  tatoueurId: string | null;
  performerUserId: string | null;
  venueSalonId: string | null;
  prestation: BookingLinkPrestation;
  durationMinutes: number;
  mode: BookingLinkMode;
  fixedStartTime: string | null;
  allowedFrom: string;
  allowedTo: string;
  expiresAt: string | null;
  status: BookingLinkStatus;
  clientId: string | null;
  clientUserId: string | null;
  projectAppointmentId: string | null;
  conversationId: string | null;
  inboxThreadId: string | null;
  appointmentId: string | null;
  createdAt: string;
  usedAt: string | null;
  revokedAt: string | null;
}

export interface CreateBookingLinkResponse {
  error: false;
  link: BookingLink;
  bookingUrl: string;
  publicSlug: string;
}

export interface BookingLinkListResponse {
  data: BookingLink[];
  page: number;
  limit: number;
  hasMore: boolean;
}

export type ApiFailure = {
  ok: false;
  status: number;
  code?: string;
  message: string;
  messages?: string[];
  retryAfterSeconds?: number;
};
export type ApiResult<T> = { ok: true; data: T } | ApiFailure;

// ---------------------------------------------------------------------------
// Libellés
// ---------------------------------------------------------------------------

export const BOOKING_PRESTATION_LABELS: Record<string, string> = {
  TATTOO: "Tatouage",
  RETOUCHE: "Retouche",
  PROJET: "Projet",
  PIERCING: "Piercing",
};

export const DESIRED_PERIOD_OPTIONS: Array<{ value: DesiredTattooPeriod; label: string; hint: string }> = [
  { value: "ASAP", label: "Dès que possible", hint: "Le client souhaite être tatoué au plus tôt." },
  { value: "EXACT_DATE", label: "À une date précise", hint: "Le client vise un jour en particulier." },
  { value: "DATE_RANGE", label: "Sur une période", hint: "Le client indique une fenêtre de dates." },
  { value: "FLEXIBLE", label: "Flexible", hint: "Le client s’adapte à vos disponibilités." },
  { value: "UNDECIDED", label: "Pas encore décidé", hint: "Le client n’a pas encore de préférence." },
];

export const BOOKING_LINK_STATUS_META: Record<BookingLinkStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" },
  USED: { label: "Utilisé", className: "border-blue-400/25 bg-blue-400/10 text-blue-300" },
  EXPIRED: { label: "Expiré", className: "border-amber-400/25 bg-amber-400/10 text-amber-300" },
  REVOKED: { label: "Révoqué", className: "border-red-400/25 bg-red-400/10 text-red-300" },
};

// ---------------------------------------------------------------------------
// Dates civiles (YYYY-MM-DD) — jamais de conversion de fuseau à l'affichage
// ---------------------------------------------------------------------------

export const PARIS_TIME_ZONE = "Europe/Paris";
const CIVIL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Partie YYYY-MM-DD d'une date renvoyée par le backend (ISO à minuit UTC ou date civile). */
export function civilDatePart(value?: string | null): string | null {
  if (!value) return null;
  const part = value.slice(0, 10);
  return CIVIL_DATE.test(part) ? part : null;
}

export function isValidCivilDate(value?: string | null): value is string {
  const match = value ? CIVIL_DATE.exec(value) : null;
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** 2030-04-10 → « 10 avril 2030 » sans passer par le fuseau du navigateur. */
export function formatCivilDate(value?: string | null, style: "long" | "short" = "long"): string {
  const part = civilDatePart(value);
  if (!part) return "—";
  const [y, m, d] = part.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("fr-FR", {
    timeZone: "UTC",
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  });
}

/** Date civile du jour à Paris. */
export function parisToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: PARIS_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function addDaysToCivilDate(value: string, days: number): string {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/** Nombre de jours entre deux dates civiles (to - from). */
export function civilDateDiff(from: string, to: string): number {
  const toUtc = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fr-FR", { timeZone: PARIS_TIME_ZONE, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

export function describeDesiredPeriod(fields: DesiredTattooPeriodFields): string | null {
  switch (fields.desiredTattooPeriod) {
    case "ASAP": return "Dès que possible";
    case "FLEXIBLE": return "Flexible";
    case "UNDECIDED": return "Pas encore décidé";
    case "EXACT_DATE": return `Le ${formatCivilDate(fields.desiredTattooDate)}`;
    case "DATE_RANGE": return `Du ${formatCivilDate(fields.desiredTattooStartDate)} au ${formatCivilDate(fields.desiredTattooEndDate)}`;
    default: return null;
  }
}

/** Valide une préférence avant envoi ; renvoie un message d'erreur ou null. */
export function validateDesiredPeriod(input: DesiredTattooPeriodInput): string | null {
  if (input.desiredTattooPeriod === "EXACT_DATE" && !isValidCivilDate(input.desiredTattooDate)) return "Indiquez la date souhaitée.";
  if (input.desiredTattooPeriod === "DATE_RANGE") {
    if (!isValidCivilDate(input.desiredTattooStartDate) || !isValidCivilDate(input.desiredTattooEndDate)) return "Indiquez le début et la fin de la période.";
    if (input.desiredTattooStartDate! > input.desiredTattooEndDate!) return "La date de début doit précéder la date de fin.";
  }
  return null;
}

/** Préférence → body exact attendu par le backend (aucune date superflue). */
export function toDesiredPeriodPayload(input: DesiredTattooPeriodInput): DesiredTattooPeriodInput {
  switch (input.desiredTattooPeriod) {
    case "EXACT_DATE": return { desiredTattooPeriod: "EXACT_DATE", desiredTattooDate: input.desiredTattooDate };
    case "DATE_RANGE": return { desiredTattooPeriod: "DATE_RANGE", desiredTattooStartDate: input.desiredTattooStartDate, desiredTattooEndDate: input.desiredTattooEndDate };
    default: return { desiredTattooPeriod: input.desiredTattooPeriod ?? null };
  }
}

// ---------------------------------------------------------------------------
// Liens
// ---------------------------------------------------------------------------

/** Statut affiché : l'expiration est effective même si le backend n'a pas encore persisté EXPIRED. */
export function effectiveBookingLinkStatus(link: Pick<BookingLink, "status" | "expiresAt" | "allowedTo">, now = new Date()): BookingLinkStatus {
  if (link.status !== "ACTIVE") return link.status;
  if (link.expiresAt && new Date(link.expiresAt).getTime() <= now.getTime()) return "EXPIRED";
  const lastDay = civilDatePart(link.allowedTo);
  if (lastDay && lastDay < parisToday(now)) return "EXPIRED";
  return "ACTIVE";
}

export function describeBookingRules(link: Pick<BookingLink, "mode" | "fixedStartTime" | "durationMinutes">): string {
  return link.mode === "FIXED_START"
    ? `Début fixé à ${link.fixedStartTime ?? "—"} (heure de Paris) pour ${formatDuration(link.durationMinutes)} : le client choisit uniquement une date disponible.`
    : `Créneaux calculés automatiquement pour ${formatDuration(link.durationMinutes)} : le client choisit une date et une heure compatibles.`;
}

/** N'accepte qu'une URL http(s) renvoyée par le backend — aucune reconstruction locale. */
export function isUsableBookingUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Erreurs
// ---------------------------------------------------------------------------

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_DATE: "Une des dates saisies est invalide.",
  INVALID_DESIRED_PERIOD: "La période souhaitée est incohérente : vérifiez le choix et les dates.",
  INVALID_PROJECT_CLIENT_INFO: "Budget ou indication « premier tatouage » invalide (le minimum doit être inférieur au maximum).",
  SAME_DAY_BOOKING_DISABLED: "Ce professionnel n’autorise pas les réservations client le jour même.",
  INVALID_BOOKING_WINDOW: "La période autorisée est invalide (début avant la fin, 366 jours maximum).",
  INVALID_AVAILABILITY_WINDOW: "La période de disponibilités demandée est invalide.",
  INVALID_BOOKING_MODE: "Le mode horaire est incomplet : indiquez une heure de début valide.",
  INVALID_EXPIRATION: "La date d’expiration doit être située dans le futur.",
  INVALID_PROJECT: "Ce rendez-vous Projet ne permet pas de générer un lien.",
  INVALID_ARTIST: "Ce tatoueur ne peut pas être proposé pour ce lien.",
  ASSOCIATION_MISMATCH: "Le tatoueur ou la fiche client ne correspond pas au contexte d’origine.",
  VENUE_REQUIRED: "Choisissez le salon dans lequel le rendez-vous aura lieu.",
  PUBLIC_SLUG_REQUIRED: "Votre profil public doit avoir un nom de salon pour générer un lien. Complétez-le dans Mon compte.",
  ASSOCIATION_CHANGED: "Le contexte de ce lien a changé : vérifiez-le puis générez un nouveau lien.",
  BOOKING_LINK_FORBIDDEN: "Vous n’avez pas les droits nécessaires pour cette action.",
  BOOKING_PROFILE_UNAVAILABLE: "Ce profil n’est pas disponible à la réservation pour le moment.",
  BOOKING_CLIENT_MISMATCH: "Ce lien est réservé à un autre destinataire.",
  BOOKING_LINK_NOT_FOUND: "Ce lien est introuvable.",
  BOOKING_LINK_USED: "Ce lien a déjà été utilisé.",
  SLOT_UNAVAILABLE: "Ce créneau n’est plus disponible.",
  CLIENT_LINK_REQUIRED: "Une fiche client existe mais n’est pas reliée au compte du client : confirmez la liaison ou ciblez explicitement cette fiche.",
  BOOKING_LINK_EXPIRED: "Ce lien a expiré.",
  BOOKING_LINK_REVOKED: "Ce lien a été révoqué.",
};

/** Champ du formulaire de création à mettre en évidence selon le code d'erreur. */
export const ERROR_FIELDS: Record<string, string> = {
  INVALID_DATE: "window",
  INVALID_BOOKING_WINDOW: "window",
  INVALID_BOOKING_MODE: "fixedStartTime",
  INVALID_EXPIRATION: "expiresAt",
  VENUE_REQUIRED: "venue",
  INVALID_ARTIST: "tatoueur",
};

export function describeApiError(error: ApiFailure, fallback = "Une erreur est survenue. Réessayez."): string {
  if (error.code === "RATE_LIMIT_EXCEEDED" || error.status === 429) {
    return error.retryAfterSeconds
      ? `Trop de tentatives. Réessayez dans ${error.retryAfterSeconds} seconde${error.retryAfterSeconds > 1 ? "s" : ""}.`
      : "Trop de tentatives. Réessayez dans quelques instants.";
  }
  if (error.code && ERROR_MESSAGES[error.code]) return ERROR_MESSAGES[error.code];
  if (error.status === 401) return "Votre session a expiré. Reconnectez-vous puis réessayez.";
  if (error.status === 403) return error.message && !/forbidden/i.test(error.message) ? error.message : "Vous n’avez pas les droits nécessaires pour cette action.";
  if (error.status === 404) return "Élément introuvable.";
  if (error.status === 503) return "Service momentanément indisponible. Réessayez plus tard.";
  if (error.status === 0) return error.message || "Impossible de joindre le serveur.";
  return error.message || fallback;
}
