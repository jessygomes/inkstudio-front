import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { userLoginSchema } from "@/lib/zod/validator.schema";

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
            validatedFields.error
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

          if (!response.ok) {
            console.error(
              "❌ Échec de l'authentification - Status:",
              response.status
            );
            const errorText = await response.text();
            console.error("❌ Message d'erreur:", errorText);
            return null;
          }

          const data = await response.json();

          if (!data.access_token || !data.id) {
            console.error("❌ Token ou id manquant dans la réponse");
            console.error("Données reçues:", data);
            return null;
          }

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
          };

          // Retourner l'objet utilisateur avec toutes les données
          return userObject;
        } catch (error) {
          console.error("❌ Erreur lors de l'authentification:", error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
