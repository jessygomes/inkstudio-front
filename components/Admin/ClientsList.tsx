"use client";
import { BACK_OFFICE_PATH } from "@/lib/back-office";

import { useState, useEffect } from "react";
import { getAllClients } from "@/lib/queries/admin";
import { FiSearch } from "react-icons/fi";
import { LoaderCircle, UsersRound } from "lucide-react";
import UsersPagination from "./UsersPagination";
import styles from "./UsersWorkspace.module.css";
import Image from "next/image";
import Link from "next/link";
import AccountAge from "./AccountAge";

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
    <div className={styles.list}>
      <header className={styles.viewHeading}><div><h2>Comptes clients</h2><p>Consultez les coordonnées et les fiches des clients.</p></div></header>
      {/* Search Bar */}
      <form role="search" onSubmit={handleSearch} className={styles.toolbar}>
        <div className={styles.search}>
          <FiSearch
            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/50"
            size={14}
          />
          <input
            type="search"
            aria-label="Rechercher un compte"
            placeholder="Rechercher un client (nom, prénom, email, ville)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={styles.primaryButton}
        >
          Rechercher
        </button>
      </form>

      {/* Results Info */}
      <div className={styles.results}>
        <p>
          {pagination.totalClients} client
          {pagination.totalClients > 1 ? "s" : ""} trouvé
          {pagination.totalClients > 1 ? "s" : ""}
        </p>
        <p>
          Page {pagination.currentPage} sur {Math.max(1, pagination.totalPages)}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.state} role="status"><LoaderCircle size={21} className="animate-spin" /><span>Chargement des comptes...</span></div>
      )}

      {/* Error State */}
      {error && (
        <div role="alert" className={styles.error}>
          <p className="text-red-400 font-one">{error}</p>
        </div>
      )}

      {/* Clients Table */}
      {!loading && !error && clients.length > 0 && (
        <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead className="bg-white/[0.03]">
                <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-white/45 font-one">
                  <th scope="col" className="px-4 py-3">Client</th>
                  <th scope="col" className="px-4 py-3">Contact</th>
                  <th scope="col" className="px-4 py-3">Localisation</th>
                  <th scope="col" className="px-4 py-3">Ancienneté</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
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
                          <div className={styles.avatar}>
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
                            <p className={styles.accountName}>
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
                        <AccountAge createdAt={client.createdAt} />
                      </td>

                      <td className="px-4 py-4 text-right"><div className={styles.rowActions}><Link className={styles.rowLink} href={`${BACK_OFFICE_PATH}/users/${client.id}`}>Voir la fiche</Link>
                        <a
                          href={`mailto:${client.email}`}
                          className={styles.button}
                        >
                          Contacter
                        </a></div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && clients.length === 0 && (
        <div className={styles.state}>
          <UsersRound size={23} /><p className="text-white/50 font-one">Aucun client trouvé</p>
        </div>
      )}

      {!loading && !error && <UsersPagination page={pagination.currentPage} pages={pagination.totalPages} onChange={handlePageChange} />}
    </div>
  );
}
