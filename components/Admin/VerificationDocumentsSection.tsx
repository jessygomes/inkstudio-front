"use client";

import { documentLabel, documentStatus } from "@/lib/admin-verification";
import { useState } from "react";
import { FiCheckCircle, FiClock, FiExternalLink, FiEye, FiXCircle } from "react-icons/fi";
import DocumentReviewActions from "./DocumentReviewActions";
import VerificationDocumentsTable from "./VerificationDocumentsTable";

export type VerificationDoc = {
  id?: string;
  type?: string;
  name?: string;
  fileUrl?: string;
  url?: string;
  status?: string;
  createdAt?: string;
  uploadedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
};

interface VerificationDocumentsSectionProps {
  documents: VerificationDoc[];
  verifiedSalon?: boolean;
  compact?: boolean;
  onDocumentReviewed?: () => void;
}

export default function VerificationDocumentsSection({
  documents,
  verifiedSalon,
  compact = false,
  onDocumentReviewed,
}: VerificationDocumentsSectionProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerLabel, setViewerLabel] = useState("");

  const openViewer = (url: string, label: string) => {
    setViewerUrl(url);
    setViewerLabel(label);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerUrl("");
    setViewerLabel("");
  };

  const normalizeStatus = documentStatus;

  const statusChip = (status?: string) => {
    const s = normalizeStatus(status);
    const base =
      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-one tracking-wide";
    if (s === "approved")
      return `${base} text-green-300 border-green-400/40 bg-green-500/10`;
    if (s === "rejected")
      return `${base} text-red-300 border-red-400/40 bg-red-500/10`;
    return `${base} text-amber-300 border-amber-400/40 bg-amber-500/10`;
  };

  const statusLabel = (status?: string) => {
    const s = normalizeStatus(status);
    if (s === "approved") return "Consulté et vérifié";
    if (s === "rejected") return "Rejeté";
    return "À examiner";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const approvedCount = documents.filter(
    (doc) => normalizeStatus(doc?.status) === "approved"
  ).length;
  const rejectedCount = documents.filter(
    (doc) => normalizeStatus(doc?.status) === "rejected"
  ).length;
  const pendingCount = documents.length - approvedCount - rejectedCount;
  const orderedDocuments = compact
    ? [...documents].sort((a, b) => {
        const priority = { pending: 0, rejected: 1, approved: 2 };
        return priority[normalizeStatus(a.status)] - priority[normalizeStatus(b.status)];
      })
    : documents;

  return (
    <>
      <div className={compact ? "space-y-2" : "space-y-4"}>
        {verifiedSalon && !compact && <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4"><p className="flex items-center gap-2 text-sm font-medium text-emerald-300"><FiCheckCircle /> Compte professionnel vérifié</p><p className="mt-1 text-xs leading-relaxed text-white/60">Le justificatif obligatoire a été validé. Les fichiers approuvés ont été consultés et vérifiés ; vous pouvez les dévalider pour corriger une erreur.</p></div>}
        {!compact && <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-one font-semibold uppercase tracking-wider text-white sm:text-base">
            Justificatifs reçus
          </h3>
          <span className="rounded-xl border border-white/15 bg-white/8 px-2 py-0.5 text-xs text-white/75 font-one">
            {documents.length} document{documents.length > 1 ? "s" : ""}
          </span>
        </div>}

        {!compact && documents.length > 0 && <p className="text-xs text-white/55">{approvedCount} vérifié{approvedCount > 1 ? "s" : ""} · {pendingCount} à examiner{rejectedCount > 0 && ` · ${rejectedCount} refusé${rejectedCount > 1 ? "s" : ""}`}</p>}

        {compact ? <VerificationDocumentsTable documents={documents} onPreview={openViewer} onReviewed={onDocumentReviewed} /> : documents && documents.length > 0 ? (
          <div className="space-y-2">
            {orderedDocuments.map((doc: VerificationDoc, index) => {
              const url = doc?.fileUrl || doc?.url || null;
              const label =
                documentLabel(doc?.type || doc?.name);
              const normalized = normalizeStatus(doc?.status);
              return (
                <div
                  key={doc?.id ?? `${label}-${index}`}
                  className={compact ? "border-t border-white/10 pt-3 pb-1" : "rounded-2xl border border-white/10 bg-white/5 p-2.5"}
                >
                  <div className={compact ? "space-y-2" : "grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"}>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm text-white font-one font-medium">
                          {label}
                        </p>
                        <span className={statusChip(doc?.status)}>
                          {normalized === "approved" && <FiCheckCircle size={10} />}
                          {normalized === "rejected" && <FiXCircle size={10} />}
                          {normalized === "pending" && <FiClock size={10} />}
                          {statusLabel(doc?.status)}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50 font-one">
                        {compact ? <span>{doc.reviewedAt ? "Examiné" : "Reçu"} le {formatDate(doc.reviewedAt || doc.uploadedAt || doc.createdAt)}</span> : <><span>Ajouté le {formatDate(doc?.uploadedAt || doc?.createdAt)}</span>{doc.reviewedAt && <span>Examiné le {formatDate(doc.reviewedAt)}</span>}</>}
                      </div>
                    </div>

                    <div className={compact ? "flex flex-wrap items-center gap-2" : "flex flex-col gap-2 lg:w-[220px]"}>
                      {url && (
                        <button
                          onClick={() => openViewer(url, label)}
                          className={`cursor-pointer inline-flex ${compact ? "rounded-lg" : "w-full rounded-2xl"} items-center justify-center gap-1 border border-tertiary-400/35 bg-tertiary-500/15 min-h-9 px-3 py-2 text-xs text-tertiary-500 transition-colors hover:bg-tertiary-500/25 font-one`}
                          title="Voir le document"
                        >
                          <FiEye size={12} />
                          {compact ? "Consulter" : "Aperçu du document"}
                        </button>
                      )}

                      {doc?.id && (
                        <DocumentReviewActions
                          documentId={doc.id}
                          compact={compact}
                          documentType={label}
                          documentStatus={doc?.status}
                          onReviewed={onDocumentReviewed}
                        />
                      )}
                    </div>
                  </div>
                  {doc.rejectionReason && <p className="mt-2 text-xs text-red-300">Motif : {doc.rejectionReason}</p>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 py-6 text-center">
            <p className="mb-1 text-xs text-white/60 font-one">
              Aucun document de vérification disponible
            </p>
            <p className="text-white/40 text-xs">
              Ce professionnel n&apos;a pas encore soumis de documents
            </p>
          </div>
        )}
      </div>

      {/* Viewer Modal */}
      {viewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" onClick={closeViewer} />
          <div className="relative z-10 w-[95vw] max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-noir-700 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <div className="truncate pr-2 text-xs text-white/80 font-one">
                {viewerLabel}
              </div>
              <button
                onClick={closeViewer}
                className="rounded-lg bg-white/10 min-h-9 px-3 py-2 text-xs text-white transition-colors hover:bg-white/20"
              >
                Fermer
              </button>
            </div>

            <div className="relative h-[72vh] w-full bg-black">
              <iframe
                src={viewerUrl}
                title="Document"
                className="w-full h-full"
                referrerPolicy="no-referrer"
                allow="fullscreen"
              />
              <div className="absolute bottom-2 right-2">
                <a
                  href={viewerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-white/10 min-h-9 px-3 py-2 text-xs text-white transition-colors hover:bg-white/20"
                >
                  <FiExternalLink size={12} />
                  Ouvrir dans un nouvel onglet
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
