"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { reviewSalonDocument } from "@/lib/queries/admin";
import { documentStatus as normalizeStatus } from "@/lib/admin-verification";
import styles from "./AdminShell.module.css";

export default function DocumentReviewActions({ documentId, documentType, documentStatus, onReviewed, compact = false }: {
  documentId: string; documentType: string; documentStatus?: string; onReviewed?: () => void; compact?: boolean;
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const reasonId = useId();
  const titleId = useId();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const isApproved = normalizeStatus(documentStatus) === "approved";
  const isRejected = normalizeStatus(documentStatus) === "rejected";
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);

  async function review(status: "APPROVED" | "REJECTED") {
    if (loading || (status === "REJECTED" && !reason.trim())) return;
    setLoading(true); setError("");
    try {
      const result = await reviewSalonDocument(documentId, status, status === "REJECTED" ? reason.trim() : undefined);
      if (!result.ok) throw new Error(result.message || "Impossible de modifier ce fichier.");
      toast.success(status === "APPROVED" ? "Document consulté et vérifié" : isApproved ? "Validation du document retirée" : "Document refusé");
      setOpen(false); setReason("");
      router.refresh(); onReviewed?.();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Impossible de modifier ce fichier.";
      setError(message); toast.error(message);
    } finally { setLoading(false); }
  }
  return <>
    <div className={`flex flex-wrap gap-2 ${compact ? styles.compactReviewActions : ""}`}>
      {!isApproved && <button className="admin-button flex-1 justify-center gap-1 text-emerald-300" disabled={loading} onClick={() => void review("APPROVED")}><FiCheck />{loading ? "En cours…" : compact ? "Valider" : "Valider le fichier"}</button>}
      {!isRejected && <button className={`admin-button flex-1 justify-center gap-1 ${isApproved ? "text-white/60" : "text-red-300"}`} disabled={loading} onClick={() => { setReason(""); setError(""); setOpen(true); }}><FiX />{isApproved ? compact ? "Dévalider" : "Dévalider le fichier" : "Rejeter"}</button>}
    </div>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); if (!loading) setOpen(false); }}>
      <h2 id={titleId}>{isApproved ? "Dévalider le fichier" : "Rejeter le fichier"}</h2>
      <p className="mt-3 text-sm text-white/65">{documentType}</p>
      {isApproved && <p className="mt-3 text-sm leading-relaxed text-amber-200/85">Cette correction peut retirer la vérification du compte si le justificatif obligatoire n’est plus valide.</p>}
      <p className="mt-2 text-xs leading-relaxed text-white/50">Le motif sera visible par le professionnel.</p>
      <div className="mt-5 flex flex-wrap gap-2">{["Document illisible", "Document expiré", "Mauvais justificatif", "Validation effectuée par erreur"].map(preset => <button key={preset} className="admin-button text-xs" disabled={loading} aria-pressed={reason === preset} onClick={() => setReason(preset)}>{preset}</button>)}</div>
      <label className="mt-5 block text-sm text-white/80" htmlFor={reasonId}>Motif de la décision *</label>
      <textarea id={reasonId} className="mt-2 w-full" rows={3} required maxLength={1000} value={reason} disabled={loading} onChange={event => setReason(event.target.value)} />
      {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
      <div className={styles.dialogActions}><button autoFocus className="admin-button" disabled={loading} onClick={() => setOpen(false)}>Annuler</button><button className="admin-button admin-button-danger" disabled={loading || !reason.trim()} onClick={() => void review("REJECTED")}>{loading ? "Enregistrement…" : isApproved ? "Confirmer la dévalidation" : "Confirmer le rejet"}</button></div>
    </dialog>
  </>;
}
