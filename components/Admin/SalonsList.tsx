"use client";
import { BACK_OFFICE_PATH } from "@/lib/back-office";

import { useState, useEffect } from "react";
import { getAllRegisteredSalons } from "@/lib/queries/admin";
import { FiSearch } from "react-icons/fi";
import { Building2, LoaderCircle } from "lucide-react";
import UsersPagination from "./UsersPagination";
import styles from "./UsersWorkspace.module.css";
import Image from "next/image";
import AccountAge from "./AccountAge";
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
  redeemedInvitation?: { id: string; durationMonths: number; redeemedAt: string } | null;
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
    <div className={styles.list}>
      <header className={styles.viewHeading}><div><h2>Comptes professionnels</h2><p>Retrouvez les salons et les artistes inscrits sur Inkera.</p></div></header>
      {/* Search + Filters */}
      <form role="search" onSubmit={handleSearch} className={styles.toolbar}>
        <div className={styles.search}>
          <FiSearch
            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/50"
            size={14}
          />
          <input
            type="search"
            aria-label="Rechercher un compte"
            placeholder="Rechercher un salon (nom, email, ville)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <select
          aria-label="Filtrer par abonnement"
          value={plan}
          onChange={(e) => setPlan(e.target.value as typeof plan)}
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
          aria-label="Filtrer par vérification"
          value={verified}
          onChange={(e) => setVerified(e.target.value as typeof verified)}
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

        <div className={styles.roleFilters} aria-label="Type de compte">
          {[
            { value: "ALL", label: "Tous les rôles" },
            { value: "user_salon", label: "Salons" },
            { value: "user_tatoueur", label: "Indépendants" },
          ].map((item) => {
            const isActive = role === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setRole(item.value as "ALL" | "user_salon" | "user_tatoueur")}
                aria-pressed={isActive}
              >
                {item.label}
              </button>
            );
          })}
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
          {pagination.totalSalons} compte{pagination.totalSalons > 1 ? "s" : ""}{" "}
          trouvé
          {pagination.totalSalons > 1 ? "s" : ""}
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

      {/* Salons Table */}
      {!loading && !error && salons.length > 0 && (
        <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead className="bg-white/[0.03]">
                <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-white/45 font-one">
                  <th scope="col" className="px-4 py-3">Compte professionnel</th>
                  <th scope="col" className="px-4 py-3">Contact</th>
                  <th scope="col" className="px-4 py-3">Localisation</th>
                  <th scope="col" className="px-4 py-3">Rôle</th>
                  <th scope="col" className="px-4 py-3">Plan</th>
                  <th scope="col" className="px-4 py-3">Statut</th>
                  <th scope="col" className="px-4 py-3">Ancienneté</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
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
                          <div className={styles.avatar}>
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
                              <p className={styles.accountName}>
                                {displayName}
                              </p>
                              {salon.redeemedInvitation && <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs text-emerald-300" title={`Abonnement offert pendant ${salon.redeemedInvitation.durationMonths} mois`}>Invité</span>}
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
                          {salon.role === "user_tatoueur" ? "Indépendant" : salon.role === "user_salon" ? "Salon" : "Professionnel"}
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
                        <AccountAge createdAt={salon.createdAt} />
                      </td>

                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`${BACK_OFFICE_PATH}/users/${salon.id}`}
                          className={styles.rowLink}
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
      )}

      {/* Empty State */}
      {!loading && !error && salons.length === 0 && (
        <div className={styles.state}>
          <Building2 size={23} /><p className="text-white/50 font-one">Aucun compte professionnel trouvé</p>
        </div>
      )}

      {!loading && !error && <UsersPagination page={pagination.currentPage} pages={pagination.totalPages} onChange={handlePageChange} />}
    </div>
  );
}
