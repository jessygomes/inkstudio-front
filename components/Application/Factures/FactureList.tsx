"use client";
import { useUser } from "@/components/Auth/Context/UserContext";
import { getfacturesSalonAction } from "@/lib/queries/user";
import { FactureProps, PaginationInfo, FactureStatistics } from "@/lib/type";
import React, { useEffect, useState, useCallback } from "react";
import { PiInvoiceDuotone } from "react-icons/pi";
import FactureDetailsModal from "./FactureDetailsModal";

export default function FactureList() {
  const user = useUser();
  const isFreeAccount = user?.saasPlan === "FREE";

  const [loading, setLoading] = useState(true);

  //! State pour les factures et pagination
  const [factures, setFactures] = useState<FactureProps[]>([]);
  const [selectedFacture, setSelectedFacture] = useState<FactureProps | null>(
    null
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
    "all"
  );

  //! Récupère les factures avec pagination et filtres
  const fetchFactures = useCallback(
    async (
      page: number = currentPage,
      search: string = searchTerm,
      filter: "all" | "paid" | "unpaid" = paymentFilter
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
            data.message || "Erreur lors de la récupération des factures"
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
            responseData
          );
          setFactures([]);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des factures :", err);
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        setFactures([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (user.id) {
      fetchFactures();
    }
  }, [user.id, currentPage, paymentFilter, fetchFactures]);

  // Effet pour la recherche avec debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (user.id) {
        setCurrentPage(1); // Reset à la page 1 lors d'une nouvelle recherche
        fetchFactures(1, searchTerm, paymentFilter);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, user.id]);

  console.log("Factures dans le state :", factures);
  console.log("Statistiques dans le state :", statistics);

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
        facture.id === updatedFacture.id ? updatedFacture : facture
      )
    );

    // Mettre à jour la facture sélectionnée si c'est celle qui a été modifiée
    if (selectedFacture && selectedFacture.id === updatedFacture.id) {
      setSelectedFacture(updatedFacture);
    }
  };

  return (
    <section>
      {/* Header responsive */}
      <div className="mb-6  flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
        <div className="w-full flex items-center gap-3 sm:gap-4 mb-4 md:mb-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center">
            <PiInvoiceDuotone
              size={20}
              className="sm:w-7 sm:h-7 text-tertiary-400 animate-pulse"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-white font-one tracking-wide uppercase">
              Factures
            </h1>
            <p className="text-white/70 text-xs font-one mt-1">
              Gérez les informations de vos clients et consultez leur
              historique.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* États de chargement et erreur */}
        {loading && (
          <div className="bg-noir-700 rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
              <h2 className="text-xl font-bold text-white font-one">
                Chargement des factures...
              </h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Factures */}
            <div className="bg-noir-700 rounded-xl border border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
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
                  <p className="text-white font-bold text-lg font-one">
                    {statistics.totalFactures}
                  </p>
                </div>
              </div>
            </div>

            {/* Chiffre d'affaires */}
            <div className="bg-noir-700 rounded-xl border border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
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
                  <p className="text-white font-bold text-lg font-one">
                    {formatPrice(statistics.totalChiffreAffaires)}
                  </p>
                </div>
              </div>
            </div>

            {/* Factures payées */}
            <div className="bg-noir-700 rounded-xl border border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tertiary-500/20 rounded-lg flex items-center justify-center">
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
                  <p className="text-white font-bold text-lg font-one">
                    {statistics.nombreFacturesPaye}
                  </p>
                </div>
              </div>
            </div>

            {/* Taux de paiement */}
            <div className="bg-noir-700 rounded-xl border border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
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
                  <p className="text-white font-bold text-lg font-one">
                    {statistics.tauxPaiement}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isFreeAccount && (
          <div className="space-y-3 mb-4 sm:mb-6 mt-4 sm:mt-6">
            {/* Barre de recherche */}
            <div className="flex flex-col md:flex-row gap-2 items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une facture (par client, titre, etc.)"
                className="w-full text-sm text-white bg-white/10 placeholder:text-white/30 placeholder:text-xs py-2 sm:py-1 px-4 font-one border-[1px] rounded-lg border-white/20 focus:outline-none focus:border-tertiary-400 transition-colors"
              />
              {/* Filtre par statut de paiement */}
              <div className="w-full md:w-fit flex gap-2 items-center">
                {/* <span className="text-white/70 text-sm font-one whitespace-nowrap">
                  Statut:
                </span> */}
                <div className="flex gap-1 w-full whitespace-nowrap">
                  <button
                    onClick={() => setPaymentFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium font-one transition-colors flex-1 ${
                      paymentFilter === "all"
                        ? "bg-tertiary-500 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    Toutes
                  </button>
                  <button
                    onClick={() => setPaymentFilter("paid")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium font-one transition-colors flex-1 ${
                      paymentFilter === "paid"
                        ? "bg-green-500 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    Payées
                  </button>
                  <button
                    onClick={() => setPaymentFilter("unpaid")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium font-one transition-colors flex-1 ${
                      paymentFilter === "unpaid"
                        ? "bg-orange-500 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    En attente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des factures - seulement si pas de loading/error */}
        {!loading && !error && (
          <div className="space-y-3">
            <div className="px-4 py-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white font-one">
                  Liste des factures
                </h2>
                <div className="px-3 py-1 bg-tertiary-500/20 text-tertiary-400 rounded-lg text-sm font-medium border border-tertiary-500/50">
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
                <p className="text-gray-400 text-lg font-one">Aucune facture</p>
                <p className="text-gray-500 text-sm mt-1">
                  Vos factures apparaîtront ici
                </p>
              </div>
            ) : (
              <>
                {/* Vue Desktop */}
                <div className="hidden md:block bg-noir-700 rounded-xl border border-white/20 overflow-hidden">
                  <div className="divide-y divide-white/10">
                    {factures.map((facture) => (
                      <div
                        key={facture.id}
                        className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedFacture(facture)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {/* Avatar client */}
                            <div className="w-12 h-12 bg-gradient-to-r from-tertiary-500 to-tertiary-400 rounded-full flex items-center justify-center flex-shrink-0">
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
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-white text-sm font-one truncate">
                                  {facture.title}
                                </h3>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium font-one whitespace-nowrap ${
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
                            <p className="text-white font-bold text-lg font-one mb-1">
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
                <div className="md:hidden space-y-3">
                  {factures.map((facture) => (
                    <div
                      key={facture.id}
                      className="bg-noir-700 rounded-xl border border-white/20 p-4 hover:border-tertiary-400/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedFacture(facture)}
                    >
                      {/* Header: Avatar + Titre */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-tertiary-500 to-tertiary-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {facture.client.firstName.charAt(0).toUpperCase()}
                            {facture.client.lastName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm font-one truncate mb-1">
                            {facture.title}
                          </h3>
                          <p className="text-white/70 text-xs font-one">
                            {facture.client.firstName} {facture.client.lastName}
                          </p>
                        </div>
                      </div>

                      {/* Info ligne 1: Prestation + Date */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium font-one ${
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
                          <p className="text-white font-bold text-lg font-one">
                            {formatPrice(facture.price)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-one flex items-center gap-2 ${
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
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 py-4">
            <button
              onClick={handlePreviousPage}
              disabled={!pagination.hasPreviousPage}
              className="cursor-pointer px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs w-full sm:w-auto"
            >
              Précédent
            </button>

            <div className="flex items-center gap-1 sm:gap-2 order-first sm:order-none">
              {Array.from(
                {
                  length: Math.min(
                    pagination.totalPages,
                    window.innerWidth < 640 ? 3 : 5
                  ),
                },
                (_, i) => {
                  const maxButtons = window.innerWidth < 640 ? 3 : 5;
                  let pageNumber;
                  if (pagination.totalPages <= maxButtons) {
                    pageNumber = i + 1;
                  } else if (currentPage <= Math.floor(maxButtons / 2) + 1) {
                    pageNumber = i + 1;
                  } else if (
                    currentPage >=
                    pagination.totalPages - Math.floor(maxButtons / 2)
                  ) {
                    pageNumber = pagination.totalPages - maxButtons + 1 + i;
                  } else {
                    pageNumber = currentPage - Math.floor(maxButtons / 2) + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`cursor-pointer w-6 h-6 sm:w-8 sm:h-8 rounded-lg text-xs font-medium transition-all duration-200 font-one ${
                        currentPage === pageNumber
                          ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                          : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage}
              className="cursor-pointer px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs w-full sm:w-auto"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Modal de détails */}
      <FactureDetailsModal
        facture={selectedFacture}
        onClose={() => setSelectedFacture(null)}
        onUpdate={handleFactureUpdate}
      />
    </section>
  );
}
