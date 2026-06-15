"use client";

import { useState, useEffect } from "react";
import { getAllRegisteredSalons } from "@/lib/queries/admin";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { LuShieldCheck } from "react-icons/lu";

interface Salon {
  id: string;
  role: string;
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
  const [role, setRole] = useState<"ALL" | "user_salon" | "user_tatoueur">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalons = async (
    page: number = 1,
    searchQuery: string = "",
    planFilter: "ALL" | "FREE" | "PRO" | "BUSINESS" = plan,
    verifiedFilter: "ALL" | "true" | "false" = verified,
    roleFilter: "ALL" | "user_salon" | "user_tatoueur" = role
  ) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllRegisteredSalons(
        page,
        10,
        searchQuery,
        planFilter !== "ALL" ? planFilter : undefined,
        verifiedFilter !== "ALL" ? verifiedFilter === "true" : undefined,
        roleFilter !== "ALL" ? roleFilter : undefined
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
    fetchSalons(1, search, plan, verified, role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, verified, role]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSalons(1, search, plan, verified, role);
  };

  const handlePageChange = (newPage: number) => {
    fetchSalons(newPage, search, plan, verified, role);
  };

  return (
    <div className="space-y-3">
      {/* Search + Filters */}
      <form onSubmit={handleSearch} className="flex flex-col gap-2 lg:flex-row">
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
            className="w-full pl-9 pr-3 py-1 text-xs bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-tertiary-400/50 transition-colors font-one"
          />
        </div>

        <select
          value={plan}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e) => setPlan(e.target.value as any)}
          className="sm:w-44 px-3 py-1 text-xs bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-tertiary-400/50 font-one"
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
          className="sm:w-44 px-3 py-1 text-xs bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-tertiary-400/50 font-one"
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

        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5">
          {[
            { value: "ALL", label: "Tous les rôles" },
            { value: "user_salon", label: "user_salon" },
            { value: "user_tatoueur", label: "user_tatoueur" },
          ].map((item) => {
            const isActive = role === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setRole(item.value as "ALL" | "user_salon" | "user_tatoueur")}
                className={`cursor-pointer rounded-2xl px-3 py-1 text-xs font-one transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white shadow-lg"
                    : "bg-transparent text-white/65 hover:bg-white/8 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
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

      {/* Salons Table */}
      {!loading && !error && salons.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/[0.03]">
                <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-white/45 font-one">
                  <th className="px-4 py-3">Salon</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Localisation</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Créé le</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {salons.map((salon) => {
                  const displayName =
                    salon.salonName ||
                    `${salon.firstName || ""} ${salon.lastName || ""}`.trim() ||
                    "Sans nom";

                  return (
                    <tr key={salon.id} className="align-middle hover:bg-white/[0.025]">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                            {salon.image ? (
                              <Image
                                src={salon.image}
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
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-sm font-semibold text-white font-one">
                                {displayName}
                              </p>
                              {salon.verifiedSalon && (
                                <LuShieldCheck size={14} className="text-tertiary-400" title="Salon vérifié" />
                              )}
                            </div>
                            <p className="truncate text-[11px] text-white/50 font-one">
                              {salon.role === "user_tatoueur"
                                ? "Compte tatoueur"
                                : "Compte salon"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs text-white/75 font-one">
                        <div className="space-y-0.5">
                          <p className="truncate">{salon.email}</p>
                          {salon.phone && <p className="truncate text-white/55">{salon.phone}</p>}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs text-white/75 font-one">
                        {salon.postalCode || salon.city ? (
                          <div>
                            <p className="truncate">
                              {salon.postalCode && `${salon.postalCode} `}
                              {salon.city || "-"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-white/45">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-2 py-0.5 text-[10px] uppercase text-white/70 font-one">
                          {salon.role || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase font-one ${salon.saasPlan?.toUpperCase() === "FREE" ? "border-white/15 bg-white/8 text-white/75" : salon.saasPlan?.toUpperCase() === "BUSINESS" ? "border-tertiary-400/35 bg-tertiary-500/15 text-tertiary-400" : "border-primary-400/35 bg-primary-500/15 text-primary-400"}`}>
                          {salon.saasPlan || "FREE"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium font-one ${salon.verifiedSalon ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-200" : "border-white/15 bg-white/8 text-white/60"}`}>
                          {salon.verifiedSalon ? "Vérifié" : "Non vérifié"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs text-white/70 font-one">
                        {new Date(salon.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/admin/users/${salon.id}`}
                          className="inline-flex rounded-2xl border border-tertiary-400/35 bg-tertiary-500/15 px-3 py-1.5 text-[11px] font-medium text-tertiary-400 transition-colors hover:bg-tertiary-500/25 font-one"
                        >
                          Détails
                        </Link>
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
