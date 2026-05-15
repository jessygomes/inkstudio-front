"use client";

import { useEffect, useMemo, useState } from "react";
import { getSalonsPendingVerification } from "@/lib/queries/admin";
import Link from "next/link";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiFile,
  FiClock,
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

  const openViewer = (urls: string[]) => {
    setViewerDocs(urls);
    setViewerIndex(0);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);

  return (
    <div className="space-y-3">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
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
            className="w-full pl-9 pr-3 py-1 text-xs bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-tertiary-400/50 transition-colors font-one"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-1 text-xs bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-2xl transition-all duration-300 font-one font-medium"
        >
          Rechercher
        </button>
      </form>

      {/* Results Info */}
      <div className="flex items-center justify-between text-white/70 text-xs font-one">
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tertiary-400" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-red-400 font-one text-xs">{error}</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && salons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {salons.map((salon) => {
            const displayName =
              salon.salonName ||
              `${salon.firstName || ""} ${salon.lastName || ""}`.trim() ||
              "Sans nom";

            return (
              <div
                key={salon.id}
                className="flex flex-col bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-tertiary-400/40 transition-all duration-300 p-3 shadow-lg gap-2.5"
              >
                {/* Header */}
                <div className="flex items-center gap-2.5">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0 border border-white/10">
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
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-one font-bold text-sm truncate">
                      {displayName}
                    </h3>
                    <p className="text-white/50 text-[11px] font-one truncate">
                      {salon.email}
                    </p>
                    {(salon.city || salon.postalCode) && (
                      <p className="text-white/40 text-[10px] font-one truncate">
                        {salon.postalCode ? `${salon.postalCode} ` : ""}{salon.city || ""}
                      </p>
                    )}
                  </div>
                  <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-one font-semibold px-2 py-0.5 rounded-full border border-amber-400/30 text-amber-400 bg-amber-400/10">
                    <FiClock size={10} />
                    En attente
                  </span>
                </div>

                {/* Documents */}
                {Array.isArray(salon.SalonVerificationDocument) && salon.SalonVerificationDocument.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-white/50 text-[10px] font-one uppercase tracking-wider">
                      Documents ({salon.SalonVerificationDocument.length})
                    </p>
                    <div className="space-y-1.5">
                      {salon.SalonVerificationDocument.map((doc) => (
                        <div
                          key={doc.id}
                          className="rounded-xl border border-white/10 bg-white/5 p-2"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <FiFile size={11} className="text-white/40 flex-shrink-0" />
                              <span className="text-[10px] font-one text-white/70 truncate">
                                {doc.type.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => openViewer([doc.fileUrl])}
                                className="p-1 rounded-md bg-tertiary-500/10 hover:bg-tertiary-500/20 text-tertiary-400 transition-colors text-[10px] font-one px-2"
                              >
                                Voir
                              </button>
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-colors"
                              >
                                <FiExternalLink size={11} />
                              </a>
                            </div>
                          </div>
                          <DocumentReviewActions
                            documentId={doc.id}
                            documentType={doc.type}
                            onReviewed={() => fetchPending(pagination.currentPage, search)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-white/30 text-[11px] font-one">
                    Aucun document disponible
                  </p>
                )}

                {/* Footer */}
                <div className="pt-2 border-t border-white/10 mt-auto">
                  <Link
                    href={`/admin/users/${salon.id}`}
                    className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 bg-white/8 hover:bg-white/15 border border-white/15 text-white rounded-xl transition-all duration-200 text-[11px] font-one font-medium"
                  >
                    Voir le profil complet
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && salons.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-dashed border-white/15">
          <p className="text-white/40 font-one text-sm">Aucun salon à vérifier</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
            className="p-1.5 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <FiChevronLeft size={16} />
          </button>

          <div className="flex gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-one font-medium transition-colors ${
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
            className="p-1.5 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Viewer Modal */}
      {viewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={closeViewer} />
          <div className="relative z-10 w-[95vw] max-w-4xl bg-noir-700 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
              <div className="text-white/70 text-xs font-one">
                Document {viewerIndex + 1} / {viewerDocs.length}
              </div>
              <button
                onClick={closeViewer}
                className="px-2.5 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg font-one transition-colors"
              >
                Fermer
              </button>
            </div>
            <div className="relative w-full h-[70vh] bg-black">
              <iframe
                src={viewerDocs[viewerIndex]}
                title="Document"
                className="w-full h-full"
                referrerPolicy="no-referrer"
                allow="fullscreen"
              />
              <div className="absolute bottom-2 right-2">
                <a
                  href={viewerDocs[viewerIndex]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-[10px] bg-white/10 hover:bg-white/20 text-white rounded-lg font-one"
                >
                  Ouvrir dans un onglet
                </a>
              </div>
            </div>
            {viewerDocs.length > 1 && (
              <div className="flex items-center justify-center gap-2 p-2 border-t border-white/10">
                {viewerDocs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setViewerIndex(i)}
                    className={`w-6 h-1.5 rounded-full transition-colors ${
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
