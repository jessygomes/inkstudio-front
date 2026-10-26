"use client";

import { useState } from "react";
import { LoaderCircle, Unlink } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import styles from "./ResidencyPermissions.module.css";

export default function ResidencyEnd({ name, busy, onConfirm }: { name: string; busy: boolean; onConfirm: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  return <section className={styles.endSection} aria-labelledby="end-residency-title">
    <header className={styles.sectionHeading}><Unlink size={16} /><div><h3 id="end-residency-title">Terminer le rattachement</h3><p>Mettre fin au lien avec {name}.</p></div></header>
    <p className={styles.endDescription}>Cette action met fin au rattachement entre le salon et le tatoueur. Elle ne supprime pas le compte du tatoueur. Les rendez-vous à venir doivent être traités avant le départ ; l’historique est conservé.</p>
    {confirming ? <div className={styles.endConfirmation}><p>Confirmer la fin de ce rattachement ?</p><span>Vérifiez les rendez-vous à venir avant de continuer.</span><div><DashboardButton variant="secondary" disabled={busy} onClick={() => setConfirming(false)}>Annuler</DashboardButton><DashboardButton variant="danger" disabled={busy} onClick={() => void onConfirm()}>{busy ? <LoaderCircle size={14} className="animate-spin" /> : <Unlink size={14} />}{busy ? "Retrait en cours…" : "Confirmer la fin du lien"}</DashboardButton></div></div> : <DashboardButton variant="danger" disabled={busy} onClick={() => setConfirming(true)}><Unlink size={14} />Terminer le rattachement</DashboardButton>}
  </section>;
}
