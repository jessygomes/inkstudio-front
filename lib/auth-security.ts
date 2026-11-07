import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

/** Expiry hint for a backend token already obtained through authenticated login.
 * This does not verify a signature or authorize API access; the backend does that.
 */
export function backendTokenExpiry(accessToken: unknown): number | null {
  if (typeof accessToken !== "string") return null;
  const parts = accessToken.split(".");
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const payload: unknown = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (!payload || typeof payload !== "object" || !("exp" in payload)) return null;
    const exp = payload.exp;
    return typeof exp === "number" && Number.isFinite(exp * 1000) && exp > 0 ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function withBackendTokenStatus(token: JWT): JWT {
  const expiry = backendTokenExpiry(token.accessToken);
  if (!expiry || expiry <= Date.now() || token.error === "AccessTokenExpired") {
    return { ...token, accessTokenExpiry: expiry, error: "AccessTokenExpired" };
  }
  return { ...token, accessTokenExpiry: expiry };
}

// ---------- Renouvellement du jeton d'accès (jeton de rafraîchissement) ----------

/** Le jeton d'accès est renouvelé quand il lui reste moins que cela. */
const RENEW_MARGIN_MS = 2 * 60 * 1000;
type RenewResult = { accessToken: string; refreshToken: string } | "rejected" | null;
// Appels en cours (et récents) par jeton de rafraîchissement : plusieurs lectures de session simultanées partagent un seul renouvellement.
const renewals = new Map<string, Promise<RenewResult>>();

async function requestRenewal(refreshToken: string): Promise<RenewResult> {
  const base = process.env.NEXT_PUBLIC_BACK_URL?.trim();
  if (!base) return null;
  try {
    const response = await fetch(`${base.replace(/\/+$/, "")}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    // Refus explicite du backend : la session est terminée (jeton révoqué, expiré ou compte supprimé).
    if (response.status === 401 || response.status === 403) return "rejected";
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!data || typeof data !== "object") return null;
    const next = data as Record<string, unknown>;
    return typeof next.access_token === "string" && typeof next.refresh_token === "string"
      ? { accessToken: next.access_token, refreshToken: next.refresh_token } : null;
  } catch {
    // Erreur réseau passagère : on garde le jeton actuel et on réessaiera.
    return null;
  }
}

/**
 * Renouvelle le jeton d'accès avec le jeton de rafraîchissement quand il arrive à expiration. Sans jeton de rafraîchissement
 * (session ouverte avant cette fonction), le jeton est laissé tel quel. Un refus du backend termine la session.
 */
export async function renewBackendToken(token: JWT): Promise<JWT> {
  const refreshToken = token.refreshToken;
  if (typeof refreshToken !== "string" || !refreshToken || token.error === "AccessTokenExpired") return token;
  const expiry = backendTokenExpiry(token.accessToken);
  if (expiry && expiry - Date.now() > RENEW_MARGIN_MS) return token;
  let pending = renewals.get(refreshToken);
  if (!pending) {
    pending = requestRenewal(refreshToken);
    renewals.set(refreshToken, pending);
    const forget = setTimeout(() => renewals.delete(refreshToken), 15000);
    (forget as { unref?: () => void }).unref?.();
  }
  const result = await pending;
  if (result === "rejected") return { ...token, refreshToken: undefined, error: "AccessTokenExpired" };
  if (!result) return token;
  return { ...token, accessToken: result.accessToken, refreshToken: result.refreshToken, error: undefined };
}

/** Déconnexion : le backend révoque la session (jeton de rafraîchissement). Échec silencieux, la déconnexion locale a lieu de toute façon. */
export async function revokeBackendSession(refreshToken: unknown): Promise<void> {
  const base = process.env.NEXT_PUBLIC_BACK_URL?.trim();
  if (!base || typeof refreshToken !== "string" || !refreshToken) return;
  try {
    await fetch(`${base.replace(/\/+$/, "")}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Le jeton restera valide jusqu'à son expiration si le backend est injoignable.
  }
}

/** Reject absent sessions, Auth.js error objects and expired backend credentials. */
export function hasUsableSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const session = value as Record<string, unknown>;
  if (session.error || !session.user || typeof session.user !== "object") return false;
  const user = session.user as Record<string, unknown>;
  if (typeof user.id !== "string" || !user.id.trim() || typeof user.role !== "string" || !user.role.trim()) return false;
  const expiry = backendTokenExpiry(session.accessToken);
  const sessionExpiry = typeof session.expires === "string" ? Date.parse(session.expires) : NaN;
  return Boolean(expiry && expiry > Date.now() && Number.isFinite(sessionExpiry) && sessionExpiry > Date.now());
}

const text = (value: unknown): string => typeof value === "string" ? value : "";

/** Ignore all browser update fields; refresh only from the authenticated backend. */
export async function refreshSessionProfile(token: JWT, kind: "professional" | "client"): Promise<JWT> {
  const base = process.env.NEXT_PUBLIC_BACK_URL?.trim();
  if (!base || typeof token.id !== "string" || !token.id || typeof token.accessToken !== "string") return token;
  try {
    const response = await fetch(`${base.replace(/\/+$/, "")}/auth`, {
      headers: { Authorization: `Bearer ${token.accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (response.status === 401 || response.status === 403) {
      return { ...token, error: "AccessTokenExpired" };
    }
    if (!response.ok) return token;
    const data: unknown = await response.json();
    if (!data || typeof data !== "object") return token;
    const profile = data as Record<string, unknown>;
    if (profile.id !== token.id || profile.role !== token.role || typeof profile.email !== "string" || profile.error) return token;

    if (kind === "professional") {
      const hours = typeof profile.salonHours === "string" ? profile.salonHours : profile.salonHours ? JSON.stringify(profile.salonHours) : null;
      return {
        ...token,
        email: profile.email,
        name: text(profile.displayName) || text(profile.salonName) || profile.email,
        salonName: text(profile.salonName),
        saasPlan: ["FREE", "PRO", "BUSINESS"].includes(text(profile.saasPlan)) ? text(profile.saasPlan) : token.saasPlan,
        phone: text(profile.phone),
        address: text(profile.address),
        verifiedSalon: profile.verifiedSalon === true,
        profileImage: typeof profile.profileImage === "string" ? profile.profileImage : null,
        agendaMode: typeof profile.agendaMode === "string" ? profile.agendaMode : token.agendaMode,
        salonHours: hours,
      };
    }

    const clientProfile = profile.clientProfile && typeof profile.clientProfile === "object"
      ? profile.clientProfile as Record<string, unknown> : null;
    return {
      ...token,
      email: profile.email,
      name: text(clientProfile?.pseudo) || [text(profile.firstName), text(profile.lastName)].filter(Boolean).join(" ") || profile.email,
      firstName: text(profile.firstName),
      lastName: text(profile.lastName),
      phone: text(profile.phone),
      image: typeof profile.image === "string" ? profile.image : null,
      clientProfile: clientProfile ? { ...clientProfile, userId: token.id } : null,
    };
  } catch {
    // Transient network errors keep the previous trusted snapshot, never browser values.
    return token;
  }
}
