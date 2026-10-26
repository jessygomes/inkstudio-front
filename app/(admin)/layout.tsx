import { UserProvider } from "@/components/Auth/Context/UserContext";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import React from "react";
import AdminShell from "@/components/Admin/AdminShell";

export const metadata: Metadata = { robots: { index: false, follow: false, noarchive: true }, referrer: "no-referrer" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // ✅ Si pas de session, redirection (normalement géré par le middleware)
  if (!session?.user || session.error === "AccessTokenExpired") {
    notFound();
  }

  // ✅ Si l'utilisateur n'est pas admin, masquer la route admin
  if (session.user.role !== "admin") {
    notFound();
  }

  // ✅ Création de l'objet user pour le UserProvider
  const user = {
    id: session.user.id,
    salonName: session.user.salonName,
    role: session.user.role,
    email: session.user.email,
    saasPlan: session.user.saasPlan,
    phone: session.user.phone || "",
    address: session.user.address || "",
    verifiedSalon: session.user.verifiedSalon || false,
  };

  return (
    <UserProvider user={user}>
      <AdminShell email={session.user.email}>{children}</AdminShell>
    </UserProvider>
  );
}
