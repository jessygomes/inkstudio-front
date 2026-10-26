"use client";

import { useRouter } from "next/navigation";
import ResidencyEnd from "./ResidencyEnd";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { residencyRequest } from "@/lib/residencies-client";
import DashboardButton from "@/components/Shared/DashboardButton";
import ResidencyPermissionsDrawer from "./ResidencyPermissionsDrawer";
import ResidencySchedule from "./ResidencySchedule";
import type { Residency } from "./ResidenciesManager";

export default function LinkedTatoueurManagement({ artistId, salonId, name, bookingEnabled, updating, onToggleBooking, onClose, onDetached, onRemove }: {
  artistId?: string; salonId: string; name: string; bookingEnabled: boolean; updating: boolean;
  onToggleBooking: () => void; onClose: () => void; onDetached: () => void; onRemove: () => void;
}) {
  const router = useRouter();
  const [member, setMember] = useState<Residency | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    residencyRequest().then(result => {
      if (active) setMember((result.residencies as Residency[]).find(r => r.artistId === artistId && r.salonId === salonId) ?? null);
    }).catch(e => { if (active) setError((e as Error).message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [artistId, salonId, retry]);
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      const result = await residencyRequest();
      setMember((result.residencies as Residency[]).find(r => r.id === member?.id) ?? null);
      window.dispatchEvent(new Event("inkera:residencies-updated"));
      toast.success("Modification enregistrée.");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };
  return <ResidencyPermissionsDrawer permissions={member} artist={false} profileName={name} salonName={member?.salon.salonName || ""} busy={busy || updating} onClose={onClose}
    onChange={(key, checked) => member ? run(() => residencyRequest(`/${member.id}/permissions`, "PATCH", { [key]: checked })) : Promise.resolve()}
    notice={<section className="space-y-3 border-b border-white/10 pb-5"><h3 className="text-sm font-semibold">Réservation de rendez-vous</h3><p className="text-xs leading-5 opacity-60">Activez la prise de rendez-vous pour ce tatoueur lié. Les droits du rattachement et le planning de présence restent nécessaires pour réserver dans ce salon.</p><DashboardButton variant="secondary" disabled={busy || updating || loading} onClick={onToggleBooking}>{updating ? "Mise à jour…" : bookingEnabled ? "Désactiver les RDV" : "Activer les RDV"}</DashboardButton></section>}
    extra={loading ? <p role="status" className="text-sm opacity-60">Chargement des autorisations et du planning…</p> : error ? <div role="alert" className="space-y-3 text-sm"><p>{error}</p><DashboardButton variant="secondary" onClick={() => setRetry(value => value + 1)}>Réessayer</DashboardButton></div> : member ? <><ResidencySchedule member={member} artist={false} busy={busy || updating} run={run} /><ResidencyEnd name={name} busy={busy || updating} onConfirm={async () => {
      if (busy || updating) return;
      setBusy(true);
      try {
        await residencyRequest(`/${member.id}`, "DELETE");
        window.dispatchEvent(new Event("inkera:residencies-updated"));
        toast.success("Rattachement termin\u00e9.");
        onDetached();
        onClose();
        router.refresh();
      } catch (e) { toast.error((e as Error).message); }
      finally { setBusy(false); }
    }} /></> : <><p className="text-xs leading-5 opacity-60">Aucun rattachement de résidence actif n’est associé à ce compte dans ce salon. Les autorisations détaillées et la proposition de planning seront disponibles une fois ce rattachement établi.</p><ResidencyEnd name={name} busy={updating || busy} onConfirm={async () => { onRemove(); }} /></>}
  />;
}
