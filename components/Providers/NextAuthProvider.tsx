"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Provider NextAuth pour envelopper l'application
 * Permet d'utiliser useSession() dans les composants clients
 */
export function NextAuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
