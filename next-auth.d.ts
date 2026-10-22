import type { DefaultSession } from "next-auth";

/** Complète les types JWT utilisés par le frontend SaaS (comme dans Inkera People). */
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      email: string | null;
      role: string;
      salonName: string;
      saasPlan: string;
      phone: string;
      address: string;
      verifiedSalon: boolean;
      agendaMode?: string | null;
      profileImage?: string | null;
      salonHours?: string | null;
    };
    accessToken: string;
    error?: string;
  }

  interface User {
    id: string;
    role: string;
    accessToken: string;
    salonName: string;
    saasPlan: string;
    phone: string;
    address: string;
    verifiedSalon: boolean;
    agendaMode?: string | null;
    profileImage?: string | null;
    salonHours?: string | null;
  }
}
