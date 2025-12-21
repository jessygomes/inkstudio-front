"use client";

import { useState, useEffect } from "react";
import { getAllRegisteredSalons } from "@/lib/queries/admin";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import UserCard from "./UserCard";

interface Salon {
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
  verifiedSalon: boolean;
  saasPlan: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  limit: number;
  totalSalons: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function SalonsList() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    limit: 10,
    totalSalons: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<"ALL" | "FREE" | "PRO" | "BUSINESS">("ALL");
  const [verified, setVerified] = useState<"ALL" | "true" | "false">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalons = async (
    page: number = 1,
    searchQuery: string = "",
    planFilter: "ALL" | "FREE" | "PRO" | "BUSINESS" = plan,
    verifiedFilter: "ALL" | "true" | "false" = verified
  ) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllRegisteredSalons(
        page,
        10,
        searchQuery,
        planFilter !== "ALL" ? planFilter : undefined,
        verifiedFilter !== "ALL" ? verifiedFilter === "true" : undefined
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setSalons(result.salons || []);
      setPagination(result.pagination || pagination);
    } catch (err) {
      setError("Une erreur est survenue lors du chargement des salons");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  console.log("Salons:", salons);

  useEffect(() => {
    fetchSalons(1, search, plan, verified);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, verified]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSalons(1, search, plan, verified);
  };

  const handlePageChange = (newPage: number) => {
    fetchSalons(newPage, search, plan, verified);
  };

  return (
    <div className="space-y-3">
      {/* Search + Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <FiSearch
            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/50"
            size={14}
          />
          <input
            type="text"
            placeholder="Rechercher un salon (nom, email, ville)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-tertiary-400/50 transition-colors font-one"
          />
        </div>

        <select
          value={plan}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e) => setPlan(e.target.value as any)}
          className="sm:w-44 px-3 py-2 text-xs bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-tertiary-400/50 font-one"
        >
          <option value="ALL" className="bg-noir-700">
            Tous les plans
          </option>
          <option value="FREE" className="bg-noir-700">
            FREE
          </option>
          <option value="PRO" className="bg-noir-700">
            PRO
          </option>
          <option value="BUSINESS" className="bg-noir-700">
            BUSINESS
          </option>
        </select>

        <select
          value={verified}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e) => setVerified(e.target.value as any)}
          className="sm:w-44 px-3 py-2 text-xs bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-tertiary-400/50 font-one"
        >
          <option value="ALL" className="bg-noir-700">
            Tous les statuts
          </option>
          <option value="true" className="bg-noir-700">
            Vérifiés
          </option>
          <option value="false" className="bg-noir-700">
            Non vérifiés
          </option>
        </select>

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
          {pagination.totalSalons} salon{pagination.totalSalons > 1 ? "s" : ""}{" "}
          trouvé
          {pagination.totalSalons > 1 ? "s" : ""}
        </p>
        <p>
          Page {pagination.currentPage} sur {pagination.totalPages}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 font-one">{error}</p>
        </div>
      )}

      {/* Salons Grid */}
      {!loading && !error && salons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {salons.map((salon) => (
            <UserCard key={salon.id} user={salon} type="salon" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && salons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/50 font-one">Aucun salon trouvé</p>
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
    </div>
  );
}
