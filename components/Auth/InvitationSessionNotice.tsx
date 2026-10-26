"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { LoaderCircle, LogOut } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import { FormError } from "@/components/Shared/FormError";

export default function InvitationSessionNotice({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div className="mt-5 space-y-3">
    <FormError message={error} />
    <DashboardButton className="w-full !min-w-0" disabled={busy} onClick={async () => {
      setBusy(true); setError("");
      try { await signOut({ redirectTo: `/invitation?token=${encodeURIComponent(token)}` }); }
      catch { setError("La déconnexion a échoué. Veuillez réessayer."); setBusy(false); }
    }}>{busy ? <LoaderCircle size={14} className="animate-spin" /> : <LogOut size={14} />}{busy ? "Déconnexion…" : "Me déconnecter pour utiliser l’invitation"}</DashboardButton>
  </div>;
}
