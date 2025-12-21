"use client";

import { useState, useEffect } from "react";
import { getAllClients } from "@/lib/queries/admin";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import UserCard from "./UserCard";

interface Client {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  city: string | null;
  postalCode: string | null;
  image: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  limit: number;
  totalClients: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    limit: 10,
    totalClients: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async (page: number = 1, searchQuery: string = "") => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllClients(page, 10, searchQuery);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setClients(result.clients || []);
      setPagination(result.pagination || pagination);
    } catch (err) {
      setError("Une erreur est survenue lors du chargement des clients");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(1, search);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients(1, search);
  };

  const handlePageChange = (newPage: number) => {
    fetchClients(newPage, search);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Rechercher un client (nom, prénom, email, ville)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-tertiary-400/50 transition-colors font-one"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-one font-medium"
        >
          Rechercher
        </button>
      </form>

      {/* Results Info */}
      <div className="flex items-center justify-between text-white/70 text-sm font-one">
        <p>
          {pagination.totalClients} client
          {pagination.totalClients > 1 ? "s" : ""} trouvé
          {pagination.totalClients > 1 ? "s" : ""}
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

      {/* Clients Grid */}
      {!loading && !error && clients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <UserCard key={client.id} user={client} type="client" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && clients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/50 font-one">Aucun client trouvé</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
            className="p-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <FiChevronLeft size={20} />
          </button>

          <div className="flex gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg font-one font-medium transition-colors ${
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
            className="p-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
