import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { refreshSessionProfile, withBackendTokenStatus } from "./lib/auth-security";

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
    async jwt({ token, user, trigger }) {
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
        token.error = undefined;
      }

      // Vérifier si le backend access token est expiré
      token = withBackendTokenStatus(token);
      if (token.error === "AccessTokenExpired") return token;
      if (trigger === "update") {
        token = await refreshSessionProfile(token, "professional");
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
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-inkera_pro_session_v2" : "inkera_pro_session_v2",
      options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
    },
  },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
});
