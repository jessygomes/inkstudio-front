"use client";

import { useEffect, useMemo, useState } from "react";
import { getSalonsPendingVerification } from "@/lib/queries/admin";
import Link from "next/link";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
} from "react-icons/fi";
import DocumentReviewActions from "./DocumentReviewActions";

type DocItem = {
  url?: string;
  type?: string;
  name?: string;
};

type PendingSalon = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  salonName: string | null;
  phone: string | null;
  city: string | null;
  postalCode: string | null;
  image: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  // documents shape can vary; we keep it flexible
  documents?: DocItem[];
  verificationDocuments?: DocItem[];
  documentUrl?: string;
  // Backend-specific field containing verification docs array
  SalonVerificationDocument?: Array<{
    id: string;
    userId: string;
    type: string; // e.g., HYGIENE_SALUBRITE
    fileUrl: string;
    status: string; // e.g., PENDING
  }>;
};

type Pagination = {
  currentPage: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  // backend might return totalSalons or totalItems
  totalSalons?: number;
  totalItems?: number;
};

function extractDocumentUrls(salon: PendingSalon): string[] {
  const urls: string[] = [];
  const push = (u?: string) => {
    if (u && typeof u === "string") urls.push(u);
  };
  (salon.verificationDocuments || salon.documents || []).forEach((d) =>
    push(d.url)
  );
  push(salon.documentUrl);
  // Handle backend-specific array of documents with `fileUrl`
  const svd = salon.SalonVerificationDocument;
  if (Array.isArray(svd)) {
    svd.forEach((d) =>
      push(typeof d.fileUrl === "string" ? d.fileUrl : undefined)
    );
  }
  // Sometimes documents are inline on the object under other keys; attempt common patterns
  const salonObj = salon as Record<string, unknown>;
  const possible = salonObj.documentsUrls ?? salonObj.docs ?? salonObj.files;
  if (Array.isArray(possible)) {
    possible.forEach((u: unknown) => {
      if (typeof u === "string") {
        urls.push(u);
      } else if (u && typeof u === "object") {
        const maybe = u as { url?: unknown; fileUrl?: unknown };
        if (typeof maybe.url === "string") push(maybe.url);
        else if (typeof maybe.fileUrl === "string") push(maybe.fileUrl);
      }
    });
  }
  return Array.from(new Set(urls));
}

function isImage(url: string) {
  return /(\.png|\.jpg|\.jpeg|\.gif|\.webp)(\?.*)?$/i.test(url);
}

export default function PendingVerificationList() {
  const [salons, setSalons] = useState<PendingSalon[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalLabel = useMemo(() => {
    return pagination.totalSalons ?? pagination.totalItems ?? salons.length;
  }, [pagination.totalItems, pagination.totalSalons, salons.length]);

  const fetchPending = async (page = 1, searchQuery = "") => {
    try {
      setLoading(true);
      setError(null);
      const result = await getSalonsPendingVerification(page, 10, searchQuery);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSalons(result.salons || []);
      setPagination(result.pagination || pagination);
    } catch (e) {
      console.error(e);
      setError(
        "Une erreur est survenue lors du chargement des salons à vérifier"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending(1, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPending(1, search);
  };

  const handlePageChange = (newPage: number) => {
    fetchPending(newPage, search);
  };

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDocs, setViewerDocs] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const openViewer = (docs: string[], index = 0) => {
    setViewerDocs(docs);
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);

  return (
    <div className="space-y-3">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <FiSearch
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/50"
            size={14}
          />
          <input
            type="text"
            placeholder="Rechercher (nom, email, ville)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-tertiary-400/50 transition-colors font-one"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-xs bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-one font-medium"
        >
          Rechercher
        </button>
      </form>

      {/* Results Info */}
      <div className="flex items-center justify-between text-white/70 text-sm font-one">
        <p>
          {totalLabel} salon{(totalLabel ?? 0) > 1 ? "s" : ""} à vérifier
        </p>
        <p>
          Page {pagination.currentPage} sur {pagination.totalPages}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 font-one">{error}</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && salons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {salons.map((salon) => {
            const docs = extractDocumentUrls(salon);
            const displayName =
              salon.salonName ||
              `${salon.firstName || ""} ${salon.lastName || ""}`.trim() ||
              "Sans nom";

            return (
              <div
                key={salon.id}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-tertiary-400/50 hover:from-white/15 transition-all duration-300 p-3 shadow-lg"
              >
                {/* Header with Image */}
                <div className="flex items-start gap-2 mb-2">
                  {/* Salon Image */}
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                    {salon.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={salon.image}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50 font-bold font-one text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-one font-bold text-sm truncate">
                          {displayName}
                        </h3>
                        <p className="text-white/60 text-[11px] font-one truncate">
                          {salon.email}
                        </p>
                        {(salon.city || salon.postalCode) && (
                          <p className="text-white/50 text-xs font-one truncate">
                            {salon.postalCode ? `${salon.postalCode} ` : ""}
                            {salon.city || ""}
                          </p>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[11px] font-one font-semibold px-2 py-0.5 rounded-full border text-white/70 border-white/20 bg-white/5">
                          À vérifier
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-1.5">
                  <h4 className="text-white/80 text-[11px] font-one">
                    Documents soumis
                  </h4>

                  {docs.length === 0 ? (
                    <p className="text-white/40 text-xs font-one">
                      Aucun document disponible
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {salon.SalonVerificationDocument?.map((doc) => {
                        const docLabel = doc.type;
                        const docUrl = doc.fileUrl;

                        return (
                          <div key={doc.id} className="space-y-1">
                            <button
                              onClick={() => openViewer([docUrl], 0)}
                              className="group relative w-full rounded-md overflow-hidden border border-white/10 bg-white/5 hover:border-tertiary-400/50"
                              title={docLabel}
                            >
                              {/* Tiny preview */}
                              {isImage(docUrl) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={docUrl}
                                  alt="document"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/60 text-[10px] font-one p-1 text-center">
                                  {docLabel}
                                </div>
                              )}
                              {/* Hover overlay */}
                              <div className="cursor-pointer absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-[10px] font-one">
                                  Voir
                                </span>
                              </div>
                            </button>

                            {/* Review actions below each document */}
                            <DocumentReviewActions
                              documentId={doc.id}
                              documentType={doc.type}
                              onReviewed={() =>
                                fetchPending(pagination.currentPage, search)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Document status chips below if available */}
                  {Array.isArray(salon.SalonVerificationDocument) &&
                    salon.SalonVerificationDocument.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 my-2">
                        {salon.SalonVerificationDocument!.map((d, i) => (
                          <span
                            key={(d.id ?? d.fileUrl ?? i) + "-meta"}
                            className="text-[10px] font-one px-2 py-0.5 rounded-full border border-white/15 text-white/70 bg-white/5"
                          >
                            Statut: {d.status}
                          </span>
                        ))}
                      </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-1.5 pt-2 mt-2 border-t border-white/10">
                  <Link
                    href={`/admin/users/${salon.id}`}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded transition-all duration-300 text-[10px] font-one font-medium"
                  >
                    Voir le salon
                  </Link>

                  <div className="flex items-center gap-1.5">
                    {docs.length > 0 && (
                      <button
                        onClick={() => openViewer(docs, 0)}
                        className="cursor-pointer px-2 py-1 bg-tertiary-500/20 hover:bg-tertiary-500/30 border border-tertiary-400/30 hover:border-tertiary-400/50 text-tertiary-400 rounded transition-all duration-300 text-[10px] font-one font-medium"
                      >
                        Voir doc(s)
                      </button>
                    )}
                    {docs.length > 0 && (
                      <a
                        href={docs[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded transition-all duration-300 text-[10px] font-one"
                      >
                        <FiExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && salons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/50 font-one">Aucun salon à vérifier</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
            className="p-1.5 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded transition-colors disabled:cursor-not-allowed"
          >
            <FiChevronLeft size={16} />
          </button>

          <div className="flex gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1.5 text-sm rounded font-one font-medium transition-colors ${
                    page === pagination.currentPage
                      ? "bg-tertiary-500 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="p-1.5 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded transition-colors disabled:cursor-not-allowed"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Viewer Modal */}
      {viewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={closeViewer} />
          <div className="relative z-10 w-[95vw] max-w-4xl bg-noir-700 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <div className="text-white/80 text-xs font-one">
                Document {viewerIndex + 1} / {viewerDocs.length}
              </div>
              <button
                onClick={closeViewer}
                className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-md"
              >
                Fermer
              </button>
            </div>

            <div className="relative w-full h-[70vh] bg-black">
              {/* Use iframe for broad compatibility (images, PDFs, many docs) */}
              <iframe
                src={viewerDocs[viewerIndex]}
                title="Document"
                className="w-full h-full"
                referrerPolicy="no-referrer"
                allow="fullscreen"
              />
              {/* Fallback link always available below in case iframe fails */}
              <div className="absolute bottom-2 right-2">
                <a
                  href={viewerDocs[viewerIndex]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 text-[10px] bg-white/10 hover:bg-white/20 text-white rounded"
                >
                  Ouvrir dans un onglet
                </a>
              </div>
            </div>

            {viewerDocs.length > 1 && (
              <div className="flex items-center justify-center gap-2 p-2 border-t border-white/10 bg-noir-700">
                {viewerDocs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setViewerIndex(i)}
                    className={`w-6 h-1.5 rounded-full ${
                      i === viewerIndex ? "bg-tertiary-500" : "bg-white/20"
                    }`}
                    aria-label={`Aller au document ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
