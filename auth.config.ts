import type { NextAuthConfig } from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { userLoginSchema } from "@/lib/zod/validator.schema";

class EmailNotVerifiedSigninError extends CredentialsSignin {
  constructor(message: string) {
    super();
    this.code = message;
  }
}

type BackendLoginResponse = {
  id?: string | number;
  email?: string;
  salonName?: string;
  image?: string | null;
  role?: string;
  access_token?: string;
  saasPlan?: string;
  phone?: string;
  address?: string;
  verifiedSalon?: boolean;
  salonHours?: unknown;
  error?: boolean | string;
  message?: string;
};

const getBackendAuthMessage = (
  payload: BackendLoginResponse | null,
): string => {
  if (!payload) {
    return "";
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error.trim();
  }

  if (
    payload.error === true &&
    typeof payload.message === "string" &&
    payload.message.trim()
  ) {
    return payload.message.trim();
  }

  return "";
};

/**
 * Configuration NextAuth pour l'authentification
 * Utilise un provider Credentials pour se connecter au backend existant
 */
export default {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        // Validation des credentials avec Zod
        const validatedFields = userLoginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });

        if (!validatedFields.success) {
          console.error(
            "❌ Validation des credentials échouée:",
            validatedFields.error,
          );
          return null;
        }

        const { email, password } = validatedFields.data;

        try {
          // Appel à votre API backend existante
          const backendUrl = process.env.NEXT_PUBLIC_BACK_URL;

          const response = await fetch(`${backendUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const payload = (await response
            .json()
            .catch(() => null)) as BackendLoginResponse | null;
          const backendErrorMessage = getBackendAuthMessage(payload);

          if (!response.ok) {
            if (backendErrorMessage) {
              throw new EmailNotVerifiedSigninError(backendErrorMessage);
            }

            console.error(
              "❌ Échec de l'authentification - Status:",
              response.status,
            );
            if (backendErrorMessage) {
              console.error("❌ Message d'erreur:", backendErrorMessage);
            }
            return null;
          }

          if (backendErrorMessage) {
            throw new EmailNotVerifiedSigninError(backendErrorMessage);
          }

          if (!payload) {
            console.error("❌ Réponse backend invalide: payload JSON manquant");
            return null;
          }

          const data = payload;

          if (!data.access_token || !data.id) {
            console.error("❌ Token ou id manquant dans la réponse");
            console.error("Données reçues:", data);
            return null;
          }

          // Normaliser salonHours en string JSON si backend renvoie un objet
          const normalizedSalonHours =
            typeof data.salonHours === "string"
              ? data.salonHours
              : data.salonHours
                ? JSON.stringify(data.salonHours)
                : null;

          // Le backend retourne maintenant toutes les données nécessaires
          const userObject = {
            id: String(data.id),
            email: data.email || email,
            name: data.salonName || email,
            image: data.image || null,
            role: data.role || "user",
            accessToken: data.access_token,
            salonName: data.salonName || "",
            saasPlan: data.saasPlan || "FREE",
            phone: data.phone || "",
            address: data.address || "",
            verifiedSalon: data.verifiedSalon || false,
            salonHours: normalizedSalonHours,
          };

          // Retourner l'objet utilisateur avec toutes les données
          return userObject;
        } catch (error) {
          if (error instanceof CredentialsSignin) {
            throw error;
          }

          console.error("❌ Erreur lors de l'authentification:", error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
