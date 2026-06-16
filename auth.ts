import NextAuth from "next-auth";
import authConfig from "./auth.config";

/**
 * Décode un JWT sans vérification de signature pour extraire l'expiry (exp)
 */
function decodeJwtExpiry(token: string): number | null {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;
    const payload = JSON.parse(
      Buffer.from(base64Payload, "base64url").toString("utf-8"),
    );
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Configuration principale de NextAuth
 * Gère l'authentification avec JWT et les callbacks
 */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/connexion",
    error: "/connexion",
  },
  callbacks: {
    /**
     * Callback JWT - Ajoute les données personnalisées au token JWT
     * Appelé quand le token est créé ou mis à jour
     */
    async jwt({ token, user, trigger, session }) {
      // Lors de la connexion initiale, ajouter les données utilisateur au token
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id as string;
        token.role = user.role;
        token.email = user.email as string;
        token.name = user.name as string;
        token.salonName = user.salonName;
        token.saasPlan = user.saasPlan;
        token.phone = user.phone;
        token.address = user.address;
        token.verifiedSalon = user.verifiedSalon;
        token.agendaMode =
          (user as unknown as { agendaMode?: string | null }).agendaMode ??
          null;
        token.profileImage =
          (user as unknown as { profileImage?: string | null }).profileImage ??
          null;
        const rawHoursUnknown = (user as unknown as { salonHours?: unknown })
          .salonHours;
        token.salonHours =
          typeof rawHoursUnknown === "string"
            ? rawHoursUnknown
            : rawHoursUnknown
              ? JSON.stringify(rawHoursUnknown)
              : null;
        // Stocker l'expiry du backend token
        token.accessTokenExpiry = decodeJwtExpiry(user.accessToken);
        token.error = undefined;
      }

      // Vérifier si le backend access token est expiré
      const accessTokenExpiry =
        typeof token.accessTokenExpiry === "number"
          ? token.accessTokenExpiry
          : null;

      if (accessTokenExpiry && Date.now() > accessTokenExpiry) {
        console.warn("⚠️ [JWT Callback] Backend access token expiré");
        return { ...token, error: "AccessTokenExpired" as const };
      }

      // Support pour la mise à jour de session
      if (trigger === "update" && session) {
        console.log("🔄 [JWT Callback] Mise à jour du token JWT via trigger");
        token = { ...token, ...session.user };
      }

      return token;
    },

    /**
     * Callback Session - Expose les données du token à la session client
     * Ces données seront disponibles via useSession()
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.salonName = token.salonName as string;
        session.user.saasPlan = token.saasPlan as string;
        session.user.phone = token.phone as string;
        session.user.address = token.address as string;
        session.user.verifiedSalon = token.verifiedSalon as boolean;
        session.user.agendaMode =
          (token as unknown as { agendaMode?: string | null }).agendaMode ??
          null;
        session.user.profileImage =
          (token as unknown as { profileImage?: string | null }).profileImage ??
          null;
        session.accessToken = token.accessToken as string;
        const tokenHours = (token as unknown as { salonHours?: unknown })
          .salonHours;
        session.user.salonHours =
          typeof tokenHours === "string"
            ? tokenHours
            : tokenHours
              ? JSON.stringify(tokenHours)
              : null;
        // Propager l'erreur d'expiration vers le client
        if (token.error === "AccessTokenExpired") {
          session.error = token.error;
        }
      } else {
        console.warn("⚠️  [Session Callback] Token non disponible");
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
});
