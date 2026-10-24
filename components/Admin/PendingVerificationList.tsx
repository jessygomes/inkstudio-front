"use client";

import { useEffect, useMemo, useState } from "react";
import { getSalonsPendingVerification } from "@/lib/queries/admin";
import Link from "next/link";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import VerificationDocumentsSection from "./VerificationDocumentsSection";

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
  verifiedSalon?: boolean;
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


  return (
    <div className="space-y-3">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/50"
            size={14}
          />
          <input
            type="text"
            aria-label="Rechercher un salon ou un indépendant"
            style={{ paddingLeft: "2.5rem" }}
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
          {totalLabel} salon{(totalLabel ?? 0) > 1 ? "s" : ""} avec des pièces à traiter
        </p>
        <p>
          Page {pagination.currentPage} sur {Math.max(1, pagination.totalPages)}
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
        <div className="grid w-full grid-cols-1 items-start gap-3">
          {salons.map((salon) => {
            const displayName =
              salon.salonName ||
              `${salon.firstName || ""} ${salon.lastName || ""}`.trim() ||
              "Sans nom";

            return (
              <div
                key={salon.id}
                className="flex min-w-0 flex-col rounded-xl border border-white/10 bg-[#191e20] p-3 gap-2"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 border border-white/10">
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
                  <div className="min-w-0 flex-1 basis-40">
                    <h3 title={displayName} className="text-white font-one font-medium text-sm break-words">
                      {displayName}
                    </h3>
                    <p className="text-white/50 text-xs font-one truncate">
                      {salon.email}
                    </p>
                    {(salon.city || salon.postalCode) && (
                      <p className="text-white/40 text-xs font-one truncate">
                        {salon.postalCode ? `${salon.postalCode} ` : ""}{salon.city || ""}
                      </p>
                    )}
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                  <span className={`admin-badge gap-1 ${salon.verifiedSalon ? "text-emerald-300" : "text-amber-300"}`}>
                    {salon.verifiedSalon ? <FiCheckCircle size={14} /> : <FiClock size={14} />}
                    {salon.verifiedSalon ? "Compte vérifié" : "À vérifier"}
                  </span>
                  <Link
                    href={`/admin/users/${salon.id}`}
                    className="inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-xs text-white/65 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    Voir la fiche <FiChevronRight aria-hidden size={14} />
                  </Link>
                  </div>
                </div>

                <VerificationDocumentsSection compact documents={salon.SalonVerificationDocument || []} verifiedSalon={salon.verifiedSalon} onDocumentReviewed={() => fetchPending(pagination.currentPage, search)} />

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


    </div>
  );
}
