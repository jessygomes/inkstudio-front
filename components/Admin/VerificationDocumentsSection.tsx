"use client";

import { useState } from "react";
import { FiExternalLink, FiEye } from "react-icons/fi";
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

  const statusChip = (status?: string) => {
    const s = (status || "").toLowerCase();
    const base =
      "px-2 py-0.5 rounded-md border text-[11px] font-one tracking-wide";
    if (
      s === "approved" ||
      s === "approuve" ||
      s === "validé" ||
      s === "valide"
    )
      return `${base} text-green-300 border-green-400/40 bg-green-500/10`;
    if (s === "rejected" || s === "refuse" || s === "refusé")
      return `${base} text-red-300 border-red-400/40 bg-red-500/10`;
    return `${base} text-amber-300 border-amber-400/40 bg-amber-500/10`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-lg">
        <h3 className="text-base font-one font-bold text-white mb-3 flex items-center gap-2">
          📄 Documents de vérification
          {documents && documents.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/30 text-amber-200 text-[10px] font-one">
              {documents.length}
            </span>
          )}
        </h3>
        {documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {documents.map((doc: VerificationDoc) => {
              const url = doc?.fileUrl || doc?.url || null;
              const label =
                doc?.type || doc?.name || `Document #${doc?.id ?? ""}`;
              return (
                <div
                  key={doc?.id ?? label}
                  className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-one text-xs truncate">
                        {label}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] mt-0.5">
                        <span className={statusChip(doc?.status)}>
                          {doc?.status || "En attente"}
                        </span>
                        {doc?.createdAt && (
                          <span className="text-white/50">
                            {formatDate(doc.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    {url && (
                      <button
                        onClick={() => openViewer(url, label)}
                        className="flex-shrink-0 p-1.5 bg-tertiary-500/20 hover:bg-tertiary-500/30 border border-tertiary-400/30 hover:border-tertiary-400/50 text-tertiary-400 rounded transition-all duration-300"
                        title="Voir le document"
                      >
                        <FiEye size={14} />
                      </button>
                    )}
                  </div>

                  {/* Action buttons */}
                  {doc?.id && url && (
                    <DocumentReviewActions
                      documentId={doc.id}
                      documentType={label}
                      documentStatus={doc?.status}
                      onReviewed={onDocumentReviewed}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-white/60 text-xs font-one mb-1">
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
          <div className="absolute inset-0 bg-black/70" onClick={closeViewer} />
          <div className="relative z-10 w-[95vw] max-w-4xl bg-noir-700 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <div className="text-white/80 text-xs font-one">
                {viewerLabel}
              </div>
              <button
                onClick={closeViewer}
                className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-md"
              >
                Fermer
              </button>
            </div>

            <div className="relative w-full h-[70vh] bg-black">
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
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs"
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
