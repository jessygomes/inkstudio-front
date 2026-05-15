"use client";

import { useState } from "react";
import { FiCheckCircle, FiClock, FiExternalLink, FiEye, FiXCircle } from "react-icons/fi";
import DocumentReviewActions from "./DocumentReviewActions";

type VerificationDoc = {
  id?: string;
  type?: string;
  name?: string;
  fileUrl?: string;
  url?: string;
  status?: string;
  createdAt?: string;
};

interface VerificationDocumentsSectionProps {
  documents: VerificationDoc[];
  onDocumentReviewed?: () => void;
}

export default function VerificationDocumentsSection({
  documents,
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

  const normalizeStatus = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (
      s === "approved" ||
      s === "approuve" ||
      s === "validé" ||
      s === "valide"
    ) {
      return "approved";
    }
    if (s === "rejected" || s === "refuse" || s === "refusé") {
      return "rejected";
    }
    return "pending";
  };

  const statusChip = (status?: string) => {
    const s = normalizeStatus(status);
    const base =
      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-one tracking-wide";
    if (s === "approved")
      return `${base} text-green-300 border-green-400/40 bg-green-500/10`;
    if (s === "rejected")
      return `${base} text-red-300 border-red-400/40 bg-red-500/10`;
    return `${base} text-amber-300 border-amber-400/40 bg-amber-500/10`;
  };

  const statusLabel = (status?: string) => {
    const s = normalizeStatus(status);
    if (s === "approved") return "Validé";
    if (s === "rejected") return "Rejeté";
    return "En attente";
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

  return (
    <>
      <div className="dashboard-embedded-panel p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-one font-semibold uppercase tracking-wider text-white sm:text-base">
            Documents De Vérification
          </h3>
          <span className="rounded-xl border border-white/15 bg-white/8 px-2 py-0.5 text-[10px] text-white/75 font-one">
            {documents.length} document{documents.length > 1 ? "s" : ""}
          </span>
        </div>

        {documents.length > 0 && (
          <div className="mb-3 grid grid-cols-2 gap-1.5 md:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45 font-one">Total</p>
              <p className="mt-0.5 text-sm text-white font-one">{documents.length}</p>
            </div>
            <div className="rounded-xl border border-green-400/25 bg-green-500/10 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-green-200/80 font-one">Validés</p>
              <p className="mt-0.5 text-sm text-green-300 font-one">{approvedCount}</p>
            </div>
            <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-amber-200/80 font-one">En attente</p>
              <p className="mt-0.5 text-sm text-amber-300 font-one">{pendingCount}</p>
            </div>
            <div className="rounded-xl border border-red-400/25 bg-red-500/10 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-red-200/80 font-one">Rejetés</p>
              <p className="mt-0.5 text-sm text-red-300 font-one">{rejectedCount}</p>
            </div>
          </div>
        )}

        {documents && documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc: VerificationDoc, index) => {
              const url = doc?.fileUrl || doc?.url || null;
              const label =
                doc?.type || doc?.name || `Document #${doc?.id ?? ""}`;
              const normalized = normalizeStatus(doc?.status);
              return (
                <div
                  key={doc?.id ?? `${label}-${index}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-2.5"
                >
                  <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-xs text-white font-one font-medium">
                          {label}
                        </p>
                        <span className={statusChip(doc?.status)}>
                          {normalized === "approved" && <FiCheckCircle size={10} />}
                          {normalized === "rejected" && <FiXCircle size={10} />}
                          {normalized === "pending" && <FiClock size={10} />}
                          {statusLabel(doc?.status)}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-white/50 font-one">
                        <span>Ajouté le {formatDate(doc?.createdAt)}</span>
                        {doc?.id && <span className="text-white/35">ID: {doc.id}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 lg:w-[270px]">
                      {url && (
                        <button
                          onClick={() => openViewer(url, label)}
                          className="cursor-pointer inline-flex w-full items-center justify-center gap-1 rounded-2xl border border-tertiary-400/35 bg-tertiary-500/15 px-2 py-1 text-[10px] text-tertiary-500 transition-colors hover:bg-tertiary-500/25 font-one"
                          title="Voir le document"
                        >
                          <FiEye size={12} />
                          Aperçu du document
                        </button>
                      )}

                      {doc?.id && url && (
                        <DocumentReviewActions
                          documentId={doc.id}
                          documentType={label}
                          documentStatus={doc?.status}
                          onReviewed={onDocumentReviewed}
                        />
                      )}
                    </div>
                  </div>
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
              Le salon n&apos;a pas encore soumis de documents
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
                className="rounded-lg bg-white/10 px-2 py-1 text-xs text-white transition-colors hover:bg-white/20"
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
                  className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-xs text-white transition-colors hover:bg-white/20"
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
