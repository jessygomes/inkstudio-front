"use client";

import { FiCheckCircle, FiClock, FiEye, FiMinusCircle, FiXCircle } from "react-icons/fi";
import { documentLabel, documentStatus, verificationDocumentTypes } from "@/lib/admin-verification";
import type { VerificationDoc } from "./VerificationDocumentsSection";
import DocumentReviewActions from "./DocumentReviewActions";
import styles from "./AdminShell.module.css";

export default function VerificationDocumentsTable({ documents, onPreview, onReviewed }: {
  documents: VerificationDoc[];
  onPreview: (url: string, label: string) => void;
  onReviewed?: () => void;
}) {
  // Keep a stable checklist, including missing pieces and any extra legacy type.
  const types = [...new Set<string>([...verificationDocumentTypes, ...documents.map(doc => doc.type || doc.name || "AUTRE_JUSTIFICATIF")])];
  return <div className={styles.verificationTableContainer}>
    <table className={styles.verificationTable}>
      <caption className="sr-only">Justificatifs du compte professionnel et état de vérification</caption>
      <thead><tr><th scope="col">Justificatif</th><th scope="col">Statut</th><th scope="col">Actions</th></tr></thead>
      <tbody>{types.flatMap(type => {
        const matching = documents.filter(doc => (doc.type || doc.name || "AUTRE_JUSTIFICATIF") === type);
        return (matching.length ? matching : [undefined]).map((doc, index) => {
          const url = doc?.fileUrl || doc?.url;
          const state = doc ? documentStatus(doc.status) : "missing";
          const label = documentLabel(type);
          const status = state === "approved" ? "Vérifié" : state === "rejected" ? "Refusé" : state === "missing" ? "Non reçu" : "À examiner";
          const Icon = state === "approved" ? FiCheckCircle : state === "rejected" ? FiXCircle : state === "missing" ? FiMinusCircle : FiClock;
          return <tr key={doc?.id || `${type}-${index}`} data-state={state}>
            <th scope="row"><span className={styles.verificationFileName}>{label}</span>{doc?.rejectionReason && <span className="mt-1 block text-xs font-normal text-red-300">{doc.rejectionReason}</span>}</th>
            <td><span className={styles.verificationStatus} title={state === "approved" ? "Fichier consulté et vérifié" : undefined}><Icon aria-hidden size={12} />{status}</span></td>
            <td className={styles.verificationRowActions}>
              {doc ? <>
                {url && <button type="button" className={styles.verificationPreview} aria-label={`Consulter : ${label}`} onClick={() => onPreview(url, label)}><FiEye aria-hidden size={13} />Consulter</button>}
                {doc.id && <DocumentReviewActions compact documentId={doc.id} documentType={label} documentStatus={doc.status} onReviewed={onReviewed} />}
              </> : <span className="text-xs text-white/40">En attente de dépôt</span>}
            </td>
          </tr>;
        });
      })}</tbody>
    </table>
  </div>;
}
