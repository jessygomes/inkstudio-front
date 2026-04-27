"use client";
import { useSession } from "next-auth/react";
import { getfacturesSalonAction } from "@/lib/queries/user";
import { FactureProps, PaginationInfo, FactureStatistics } from "@/lib/type";
import React, { useEffect, useState, useCallback } from "react";
import { PiInvoiceDuotone } from "react-icons/pi";
import FactureDetailsModal from "./FactureDetailsModal";
import Link from "next/link";

export default function FactureList() {
  const { data: session } = useSession();
  const isFreeAccount = session?.user?.saasPlan === "FREE";

  const [loading, setLoading] = useState(true);

  //! State pour les factures et pagination
  const [factures, setFactures] = useState<FactureProps[]>([]);
  const [selectedFacture, setSelectedFacture] = useState<FactureProps | null>(
    null,
  );
  const [statistics, setStatistics] = useState<FactureStatistics | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalClients: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [error, setError] = useState<string | null>(null);

  //! Pagination
  const [currentPage, setCurrentPage] = useState(1);

  //! Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">(
    "all",
  );

  //! Récupère les factures avec pagination et filtres
  const fetchFactures = useCallback(
    async (
      page: number = currentPage,
      search: string = searchTerm,
      filter: "all" | "paid" | "unpaid" = paymentFilter,
    ) => {
      try {
        setLoading(true);
        setError(null);

        // Convertir le filtre en booléen ou undefined
        let isPayed: boolean | undefined = undefined;
        if (filter === "paid") isPayed = true;
        if (filter === "unpaid") isPayed = false;

        const data = await getfacturesSalonAction(page, search, isPayed);

        console.log("Données des factures reçues :", data);

        if (data.error) {
          throw new Error(
            data.message || "Erreur lors de la récupération des factures",
          );
        }

        // Les données sont dans data.data selon votre structure d'API
        const responseData = data.data;

        if (Array.isArray(responseData.factures)) {
          setFactures(responseData.factures);
          if (responseData.statistics) {
            setStatistics(responseData.statistics);
          }
          if (responseData.pagination) {
            setPagination(responseData.pagination);
          }
        } else {
          console.error(
            "Les données reçues ne sont pas un tableau:",
            responseData,
          );
          setFactures([]);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des factures :", err);
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
        setFactures([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (session?.user?.id) {
      fetchFactures();
    }
  }, [session?.user?.id, currentPage, paymentFilter, fetchFactures]);

  // Effet pour la recherche avec debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (session?.user?.id) {
        setCurrentPage(1); // Reset à la page 1 lors d'une nouvelle recherche
        fetchFactures(1, searchTerm, paymentFilter);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, session?.user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Gérer la mise à jour d'une facture
  const handleFactureUpdate = (updatedFacture: FactureProps) => {
    setFactures((prevFactures) =>
      prevFactures.map((facture) =>
        facture.id === updatedFacture.id ? updatedFacture : facture,
      ),
    );

    // Mettre à jour la facture sélectionnée si c'est celle qui a été modifiée
    if (selectedFacture && selectedFacture.id === updatedFacture.id) {
      setSelectedFacture(updatedFacture);
    }
  };

  const maxButtons = 5;
  const pageButtons = Array.from(
    { length: Math.min(pagination.totalPages, maxButtons) },
    (_, index) => {
      if (pagination.totalPages <= maxButtons) {
        return index + 1;
      }

      if (currentPage <= Math.floor(maxButtons / 2) + 1) {
        return index + 1;
      }

      if (currentPage >= pagination.totalPages - Math.floor(maxButtons / 2)) {
        return pagination.totalPages - maxButtons + 1 + index;
      }

      return currentPage - Math.floor(maxButtons / 2) + index;
    },
  );

  return (
    <section className="w-full space-y-3">
      <div className="dashboard-hero flex flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-5 lg:py-2.5">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-400/30">
            <PiInvoiceDuotone
              size={18}
              className="text-tertiary-400 animate-pulse"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-bold text-white font-one tracking-wide uppercase">
              Factures
            </h1>
            <p className="mt-0.5 text-[11px] text-white/70 font-one">
              Gérez les informations de vos clients et consultez leur
              historique.
            </p>
          </div>
        </div>
      </div>

      {/* Message pour les comptes Free */}
      {isFreeAccount && (
        <div className="mb-6">
          <div className="dashboard-panel p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/12">
                <svg
                  className="w-6 h-6 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <h2 className="text-white font-semibold font-one mb-2">
                  Gestion de factures avancée disponible avec un abonnement
                </h2>

                <p className="text-white/70 text-sm font-one mb-4">
                  Débloquez la gestion complète de vos factures : création
                  automatique, suivi des paiements, statistiques détaillées et
                  exports.
                </p>

                <div className="flex flex-wrap gap-2.5">
                  <div className="dashboard-chip">Statistiques détaillées</div>
                  <div className="dashboard-chip">Suivi des paiements</div>
                  <div className="dashboard-chip">Exports PDF</div>
                  <div className="dashboard-chip">Factures illimitées</div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Link
                    href="/parametres"
                    className="cursor-pointer rounded-[14px] bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-4 py-2 text-sm font-one font-medium text-white transition-all duration-300 hover:from-tertiary-500 hover:to-tertiary-600"
                  >
                    Passer à PRO
                  </Link>

                  <Link
                    href="/parametres"
                    className="cursor-pointer rounded-[14px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-one font-medium text-white transition-colors hover:bg-white/20"
                  >
                    Voir les plans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isFreeAccount && (
        <div className="space-y-4">
          {/* États de chargement et erreur */}
          {loading && (
            <div className="space-y-3">
              {/* Vue Desktop - skeletons */}
              <div className="hidden md:block bg-noir-700 rounded-xl border border-white/20 overflow-hidden">
                <div className="divide-y divide-white/10">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse flex-shrink-0"></div>
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="h-4 bg-white/10 rounded-lg flex-1 max-w-xs animate-pulse"></div>
                              <div className="h-6 bg-white/10 rounded w-20 animate-pulse"></div>
                            </div>
                            <div className="h-3 bg-white/10 rounded-lg w-2/3 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 space-y-2">
                          <div className="h-5 bg-white/10 rounded-lg w-20 animate-pulse ml-auto"></div>
                          <div className="h-6 bg-white/10 rounded-lg w-24 animate-pulse ml-auto"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vue Mobile - skeletons */}
              <div className="md:hidden space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`mobile-${i}`}
                    className="bg-noir-700 rounded-xl border border-white/20 p-4"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex-shrink-0 animate-pulse"></div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 bg-white/10 rounded-lg w-32 animate-pulse"></div>
                        <div className="h-3 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="h-6 bg-white/10 rounded w-16 animate-pulse"></div>
                      <div className="h-3 bg-white/10 rounded-lg w-20 animate-pulse"></div>
                    </div>

                    <div className="mb-3 pb-3 border-b border-white/10">
                      <div className="h-3 bg-white/10 rounded-lg w-28 animate-pulse"></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-3 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                        <div className="h-5 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                      </div>
                      <div className="h-8 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-noir-700 rounded-xl border border-white/20 p-6">
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-white font-one font-semibold mb-2">
                  Erreur de chargement
                </h3>
                <p className="text-red-400 mb-4 text-sm">{error}</p>
                <button
                  onClick={() => fetchFactures()}
                  className="cursor-pointer px-4 py-2 bg-tertiary-600 text-white rounded-lg hover:bg-tertiary-700 transition-colors text-sm font-medium"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {/* Statistiques - seulement si pas de loading/error */}
          {!loading && !error && statistics && (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-4">
              {/* Total Factures */}
              <div className="dashboard-stat-card p-2.5 lg:p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20">
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-one">
                      Total Factures
                    </p>
                    <p className="text-white font-bold text-base font-one">
                      {statistics.totalFactures}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chiffre d'affaires */}
              <div className="dashboard-stat-card p-2.5 lg:p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/20">
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-one">
                      Chiffre d&apos;affaires
                    </p>
                    <p className="text-white font-bold text-base font-one">
                      {formatPrice(statistics.totalChiffreAffaires)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Factures payées */}
              <div className="dashboard-stat-card p-2.5 lg:p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-tertiary-500/20">
                    <svg
                      className="w-5 h-5 text-tertiary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-one">Payées</p>
                    <p className="text-white font-bold text-base font-one">
                      {statistics.nombreFacturesPaye}
                    </p>
                  </div>
                </div>
              </div>

              {/* Taux de paiement */}
              <div className="dashboard-stat-card p-2.5 lg:p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20">
                    <svg
                      className="w-5 h-5 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-one">
                      Taux paiement
                    </p>
                    <p className="text-white font-bold text-base font-one">
                      {statistics.tauxPaiement}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isFreeAccount && (
            <div className="dashboard-embedded-panel p-3.5 sm:p-4 lg:p-5 space-y-3 mt-2">
              <div className="dashboard-embedded-section p-3">
                <div className="flex flex-col md:flex-row gap-2 items-center">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une facture (par client, titre, etc.)"
                  className="w-full rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400 focus:outline-none focus:ring-2 focus:ring-tertiary-400/20 font-one"
                />
                <div className="w-full md:w-fit flex gap-2 items-center">
                  <div className="flex gap-1 w-full whitespace-nowrap">
                    <button
                      onClick={() => setPaymentFilter("all")}
                      className={`cursor-pointer rounded-[14px] border px-3 py-1.5 text-[11px] font-medium font-one transition-colors flex-1 ${
                        paymentFilter === "all"
                          ? "border-tertiary-500/40 bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                          : "border-white/20 bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      Toutes
                    </button>
                    <button
                      onClick={() => setPaymentFilter("paid")}
                      className={`cursor-pointer rounded-[14px] border px-3 py-1.5 text-[11px] font-medium font-one transition-colors flex-1 ${
                        paymentFilter === "paid"
                          ? "border-green-500/40 bg-green-500/80 text-white"
                          : "border-white/20 bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      Payées
                    </button>
                    <button
                      onClick={() => setPaymentFilter("unpaid")}
                      className={`cursor-pointer rounded-[14px] border px-3 py-1.5 text-[11px] font-medium font-one transition-colors flex-1 ${
                        paymentFilter === "unpaid"
                          ? "border-orange-500/40 bg-orange-500/80 text-white"
                          : "border-white/20 bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      En attente
                    </button>
                  </div>
                </div>
              </div>
              </div>
            </div>
          )}

          {/* Liste des factures - seulement si pas de loading/error */}
          {!loading && !error && (
            <div className="space-y-2.5">
              <div className="px-1 py-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white font-one">
                    Liste des factures
                  </h2>
                  <div className="rounded-[14px] border border-tertiary-500/50 bg-tertiary-500/20 px-3 py-1 text-xs font-medium text-tertiary-400 font-one">
                    {factures.length} facture{factures.length > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {factures.length === 0 ? (
                <div className="text-center py-12 bg-noir-700 rounded-xl border border-white/20">
                  <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-lg font-one">
                    Aucune facture
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Vos factures apparaîtront ici
                  </p>
                </div>
              ) : (
                <>
                  {/* Vue Desktop */}
                  <div className="hidden md:block dashboard-embedded-panel overflow-hidden p-0">
                    <div className="divide-y divide-white/10">
                      {factures.map((facture) => (
                        <div
                          key={facture.id}
                          className="p-3 hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => setSelectedFacture(facture)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              {/* Avatar client */}
                              <div className="h-11 w-11 bg-gradient-to-r from-tertiary-500 to-tertiary-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-sm">
                                  {facture.client.firstName
                                    .charAt(0)
                                    .toUpperCase()}
                                  {facture.client.lastName
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>

                              {/* Infos facture */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2.5 mb-1">
                                  <h3 className="font-semibold text-white text-[13px] font-one truncate">
                                    {facture.title}
                                  </h3>
                                  <span
                                    className={`rounded-[12px] border px-2 py-0.5 text-[10px] font-medium font-one whitespace-nowrap ${
                                      facture.prestation === "TATTOO"
                                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                        : facture.prestation === "PIERCING"
                                          ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                    }`}
                                  >
                                    {facture.prestation}
                                  </span>
                                </div>
                                <p className="text-white/70 text-xs font-one">
                                  {facture.client.firstName}{" "}
                                  {facture.client.lastName} •{" "}
                                  {formatDate(facture.dateRdv)} •{" "}
                                  {facture.tatoueur}
                                </p>
                              </div>
                            </div>

                            {/* Prix et statut */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-white font-bold text-base font-one mb-1">
                                {formatPrice(facture.price)}
                              </p>
                              <div className="flex items-center justify-end gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    facture.isPayed
                                      ? "bg-green-400"
                                      : "bg-orange-400"
                                  }`}
                                ></div>
                                <span
                                  className={`text-xs font-one ${
                                    facture.isPayed
                                      ? "text-green-400"
                                      : "text-orange-400"
                                  }`}
                                >
                                  {facture.isPayed ? "Payé" : "En attente"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vue Mobile */}
                  <div className="md:hidden space-y-2.5">
                    {factures.map((facture) => (
                      <div
                        key={facture.id}
                        className="dashboard-list-item p-3 hover:border-tertiary-400/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedFacture(facture)}
                      >
                        {/* Header: Avatar + Titre */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="h-11 w-11 bg-gradient-to-r from-tertiary-500 to-tertiary-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {facture.client.firstName.charAt(0).toUpperCase()}
                              {facture.client.lastName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-[13px] font-one truncate mb-1">
                              {facture.title}
                            </h3>
                            <p className="text-white/70 text-xs font-one">
                              {facture.client.firstName}{" "}
                              {facture.client.lastName}
                            </p>
                          </div>
                        </div>

                        {/* Info ligne 1: Prestation + Date */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`rounded-[12px] border px-2 py-0.5 text-[10px] font-medium font-one ${
                              facture.prestation === "TATTOO"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : facture.prestation === "PIERCING"
                                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {facture.prestation}
                          </span>
                          <p className="text-white/70 text-xs font-one text-right">
                            {formatDate(facture.dateRdv)}
                          </p>
                        </div>

                        {/* Info ligne 2: Tatoueur */}
                        <div className="mb-3 pb-3 border-b border-white/10">
                          <p className="text-white/70 text-xs font-one">
                            Tatoueur: {facture.tatoueur}
                          </p>
                        </div>

                        {/* Footer: Prix + Statut */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/60 text-xs font-one mb-1">
                              Montant
                            </p>
                            <p className="text-white font-bold text-base font-one">
                              {formatPrice(facture.price)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div
                              className={`rounded-[14px] border px-3 py-1 text-[11px] font-medium font-one flex items-center gap-2 ${
                                facture.isPayed
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  facture.isPayed
                                    ? "bg-green-400"
                                    : "bg-orange-400"
                                }`}
                              ></div>
                              {facture.isPayed ? "Payé" : "En attente"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Pagination responsive */}
            </div>
          )}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 py-3">
              <button
                onClick={handlePreviousPage}
                disabled={!pagination.hasPreviousPage}
                className="cursor-pointer w-full sm:w-auto rounded-[14px] border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-one font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>

              <div className="flex items-center gap-1 sm:gap-2 order-first sm:order-none">
                {pageButtons.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`cursor-pointer h-7 w-7 rounded-[12px] text-[11px] font-medium transition-all duration-200 font-one ${
                      currentPage === pageNumber
                        ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={!pagination.hasNextPage}
                className="cursor-pointer w-full sm:w-auto rounded-[14px] border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-one font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de détails */}
      <FactureDetailsModal
        facture={selectedFacture}
        onClose={() => setSelectedFacture(null)}
        onUpdate={handleFactureUpdate}
      />
    </section>
  );
}
