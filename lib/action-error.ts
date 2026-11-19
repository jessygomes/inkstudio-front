import { ACTION_DIGEST_PREFIX, NETWORK_MESSAGE, isNetworkError } from "./user-error";

/**
 * Erreur à lever dans une Server Action. En production, Next.js remplace le message d'une erreur levée côté serveur
 * par « Minified React error #441 », mais il transmet son `digest` au navigateur : le message y voyage, et
 * `userErrorMessage` (lib/user-error.ts) le retrouve.
 */
export function actionError(message: string): Error {
  const error = new Error(message) as Error & { digest?: string };
  error.digest = ACTION_DIGEST_PREFIX + encodeURIComponent(message.slice(0, 500));
  return error;
}

/**
 * Côté serveur : une panne réseau vers le backend (« fetch failed ») devient une erreur au message compréhensible,
 * transmis au navigateur. Appelé une fois au démarrage du serveur (instrumentation.ts).
 */
export function installFriendlyServerFetch() {
  const g = globalThis as typeof globalThis & { __inkeraFetchWrapped?: boolean };
  if (g.__inkeraFetchWrapped || typeof g.fetch !== "function") return;
  const original = g.fetch;
  g.fetch = (async (...args: Parameters<typeof fetch>) => {
    try {
      return await original(...args);
    } catch (error) {
      if (isNetworkError(error)) throw actionError(NETWORK_MESSAGE);
      throw error;
    }
  }) as typeof fetch;
  g.__inkeraFetchWrapped = true;
}
