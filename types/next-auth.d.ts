import { DefaultSession, DefaultUser } from "next-auth";

/**
 * Extension des types NextAuth pour inclure les propriétés personnalisées
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
      name: string;
      salonName: string;
      saasPlan: string;
      phone: string;
      address: string;
      verifiedSalon: boolean;
      salonHours?: string | null;
    } & DefaultSession["user"];
    accessToken: string;
  }

  interface User extends DefaultUser {
    role: string;
    accessToken: string;
    salonName: string;
    saasPlan: string;
    phone: string;
    address: string;
    verifiedSalon: boolean;
    salonHours?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    accessToken: string;
    salonName: string;
    saasPlan: string;
    phone: string;
    address: string;
    verifiedSalon: boolean;
    salonHours?: string | null;
  }
}
