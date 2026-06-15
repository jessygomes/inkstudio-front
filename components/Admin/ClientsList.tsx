"use client";

import { useState, useEffect } from "react";
import { getAllClients } from "@/lib/queries/admin";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Image from "next/image";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients(1, search);
  };

  const handlePageChange = (newPage: number) => {
    fetchClients(newPage, search);
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <FiSearch
            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/50"
            size={14}
          />
          <input
            type="text"
            placeholder="Rechercher un client (nom, prénom, email, ville)..."
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

      {/* Clients Table */}
      {!loading && !error && clients.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/[0.03]">
                <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-white/45 font-one">
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Localisation</th>
                  <th className="px-4 py-3">Créé le</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {clients.map((client) => {
                  const displayName =
                    `${client.firstName || ""} ${client.lastName || ""}`.trim() ||
                    "Sans nom";

                  return (
                    <tr key={client.id} className="align-middle hover:bg-white/[0.025]">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                            {client.image ? (
                              <Image
                                src={client.image}
                                alt={displayName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white/50 font-one">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white font-one">
                              {displayName}
                            </p>
                            <p className="truncate text-[11px] text-white/50 font-one">
                              Compte client
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs text-white/75 font-one">
                        <div className="space-y-0.5">
                          <p className="truncate">{client.email}</p>
                          {client.phone && <p className="truncate text-white/55">{client.phone}</p>}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs text-white/75 font-one">
                        {client.postalCode || client.city ? (
                          <p className="truncate">
                            {client.postalCode && `${client.postalCode} `}
                            {client.city || "-"}
                          </p>
                        ) : (
                          <span className="text-white/45">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-xs text-white/70 font-one">
                        {new Date(client.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <a
                          href={`mailto:${client.email}`}
                          className="inline-flex rounded-2xl border border-white/15 bg-white/8 px-3 py-1.5 text-[11px] font-medium text-white/85 transition-colors hover:bg-white/15 font-one"
                        >
                          Contacter
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
