// Messages d'erreur lisibles par les utilisateurs, à la place des messages techniques (« Failed to fetch »,
// « Minified React error #441 », « Erreur HTTP 404: Not Found »…). Utilisable côté client comme côté serveur.

export const NETWORK_MESSAGE = "Connexion au serveur impossible. Vérifiez votre connexion internet, puis réessayez.";
export const GENERIC_MESSAGE = "Une erreur est survenue. Réessayez dans un instant.";

/** Préfixe du `digest` des erreurs levées par nos Server Actions : il transporte le message jusqu'au navigateur. */
export const ACTION_DIGEST_PREFIX = "ink:";

const NETWORK = /failed to fetch|fetch failed|networkerror|network request failed|network error|load failed|econnrefused|econnreset|etimedout|enotfound|eai_again|socket hang up|und_err|connect timeout|the operation was aborted due to timeout/i;
// Erreur levée côté serveur dont Next.js masque le message en production.
const MASKED = /minified react error|server components render|an error occurred in the server|digest property is included/i;
// Messages techniques (anglais, JSON, code) qui n'apprennent rien à l'utilisateur.
const TECHNICAL = /^(failed to |network response was not ok|request failed|unexpected (token|end of json)|json\.parse|typeerror|referenceerror|syntaxerror|cannot read propert|undefined is not|null is not|an unknown error occurred|internal error|unknown error)/i;
const HTTP_ONLY = /^(erreur http\s*)?(\d{3})?\s*:?\s*(not found|unauthorized|forbidden|bad request|internal server error|bad gateway|service unavailable|gateway timeout|too many requests|conflict|unprocessable entity)?\.?$/i;

function fromStatus(text: string, fallback: string): string | null {
  const http = /(?:erreur http|http|status|statut)\s*:?\s*(\d{3})|^(\d{3})\b/i.exec(text);
  const code = Number(http?.[1] ?? http?.[2]);
  const word = text.toLowerCase();
  if (code === 401 || /\bunauthorized\b/.test(word)) return "Votre session a expiré. Reconnectez-vous pour continuer.";
  if (code === 403 || /\bforbidden\b/.test(word)) return "Vous n'avez pas accès à cette fonctionnalité avec votre compte.";
  if (code === 429 || /too many requests/.test(word)) return "Trop de tentatives. Patientez un instant, puis réessayez.";
  if (code >= 500 || /internal server error|bad gateway|service unavailable|gateway timeout/.test(word)) return "Le serveur rencontre un problème. Réessayez dans un instant.";
  if (code === 404 || /\bnot found\b/.test(word)) return fallback;
  if (code || HTTP_ONLY.test(text)) return fallback;
  return null;
}

/** Message lisible à partir d'un texte d'erreur (garde tel quel un message déjà compréhensible). */
export function friendlyMessage(raw: string | null | undefined, fallback: string = GENERIC_MESSAGE): string {
  const text = (raw ?? "").trim();
  if (!text) return fallback;
  if (NETWORK.test(text)) return NETWORK_MESSAGE;
  if (MASKED.test(text)) return fallback;
  if (/erreur http|^http\s*\d{3}|^\d{3}\b/i.test(text) || HTTP_ONLY.test(text)) return fromStatus(text, fallback) ?? fallback;
  if (TECHNICAL.test(text)) return fallback;
  return text;
}

/** Message lisible pour une erreur attrapée (`catch (error)`), avec le message transporté par une Server Action. */
export function userErrorMessage(error: unknown, fallback: string = GENERIC_MESSAGE): string {
  if (error && typeof error === "object" && "digest" in error) {
    const digest = (error as { digest?: unknown }).digest;
    if (typeof digest === "string" && digest.startsWith(ACTION_DIGEST_PREFIX)) {
      try { return friendlyMessage(decodeURIComponent(digest.slice(ACTION_DIGEST_PREFIX.length)), fallback); } catch { /* digest illisible */ }
    }
  }
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  // Panne réseau signalée par la cause (undici : « fetch failed » + code ECONNREFUSED…)
  const cause = error instanceof Error && error.cause && typeof error.cause === "object" ? String((error.cause as { code?: unknown }).code ?? "") : "";
  return friendlyMessage(cause && NETWORK.test(cause) ? cause : message, fallback);
}

export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error) || error.name === "AbortError") return false;
  const cause = error.cause && typeof error.cause === "object" ? String((error.cause as { code?: unknown }).code ?? "") : "";
  return NETWORK.test(`${error.message} ${cause}`);
}

/** Message lisible pour une réponse HTTP en échec (à la place de « Erreur HTTP 404: Not Found »). */
export function httpErrorMessage(status: number): string {
  if (status === 401) return "Votre session a expiré. Reconnectez-vous pour continuer.";
  if (status === 403) return "Vous n'avez pas accès à cette fonctionnalité avec votre compte.";
  if (status === 404) return "Ce contenu est introuvable ou n'est plus disponible.";
  if (status === 408 || status === 504) return "Le serveur met trop de temps à répondre. Réessayez dans un instant.";
  if (status === 429) return "Trop de tentatives. Patientez un instant, puis réessayez.";
  if (status >= 500) return "Le serveur rencontre un problème. Réessayez dans un instant.";
  return GENERIC_MESSAGE;
}
