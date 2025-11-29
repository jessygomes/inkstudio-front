/* eslint-disable react/no-unescaped-entities */
"use client";
import { useUser } from "@/components/Auth/Context/UserContext";
import { ClientProps, PaginationInfo } from "@/lib/type";
import React, { useEffect, useState } from "react";

import CreateOrUpdateClient from "./CreateOrUpdateClient";
import DeleteClient from "./DeleteClient";
import InfoClient from "./InfoClient";

import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { RiFileUserLine } from "react-icons/ri";
import Link from "next/link";
import { getSalonClientsAction } from "@/lib/queries/client";

export default function ClientList() {
  const user = useUser();

  // Vérifier si l'utilisateur a un plan Free
  const isFreeAccount = user?.saasPlan === "FREE";

  const [loading, setLoading] = useState(true);

  //! State pour les clients et pagination
  const [clients, setClients] = useState<ClientProps[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientProps | null>(
    null
  );
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
  const ITEMS_PER_PAGE = 10;

  //! Filtre
  const [searchTerm, setSearchTerm] = useState("");

  //! Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isFullInfoModalOpen, setIsFullInfoModalOpen] = useState(false);
  const [clientForInfos, setClientForInfos] = useState<ClientProps | null>(
    null
  );

  //! Nouveau state pour les suivis non répondus
  const [unansweredFollowUpsCount, setUnansweredFollowUpsCount] = useState(0);

  //! Récupère les clients avec pagination
  const fetchClients = async (
    page: number = currentPage,
    search: string = searchTerm
  ) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getSalonClientsAction(page, search);

      if (data.error) {
        throw new Error(
          data.message || "Erreur lors de la récupération des clients"
        );
      }

      if (Array.isArray(data.clients)) {
        setClients(data.clients);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        console.error("Les données reçues ne sont pas un tableau:", data);
        setClients([]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des clients :", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  //! Nouvelle fonction pour récupérer le nombre de suivis non répondus
  const fetchUnansweredFollowUpsCount = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/follow-up/unanswered/${user.id}/number`,
        {
          cache: "no-store",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnansweredFollowUpsCount(data.count || 0);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre de suivis non répondus:",
        error
      );
    }
  };

  // Effet pour charger les clients au changement de page ou de recherche
  useEffect(() => {
    if (user.id) {
      fetchClients(currentPage, searchTerm);
      fetchUnansweredFollowUpsCount(); // Ajouter ici
    }
  }, [user.id, currentPage]);

  // Effet pour la recherche avec debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (user.id) {
        setCurrentPage(1); // Reset à la page 1 lors d'une nouvelle recherche
        fetchClients(1, searchTerm);
        fetchUnansweredFollowUpsCount(); // Ajouter ici aussi
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, user.id]);

  //! Handler pour afficher les réservations
  const handleShowReservations = (client: ClientProps) => {
    setClientForInfos(client);
    setIsFullInfoModalOpen(true);
  };

  //! Handlers pour les actions
  const handleCreate = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: ClientProps) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = (client: ClientProps) => {
    setSelectedClient(client);
    setIsModalDeleteOpen(true);
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

  return (
    <section>
      {/* Header responsive */}
      <div className="mb-6  flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
        <div className="w-full flex items-center gap-3 sm:gap-4 mb-4 md:mb-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center">
            <RiFileUserLine
              size={20}
              className="sm:w-7 sm:h-7 text-tertiary-400 animate-pulse"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-white font-one tracking-wide uppercase">
              Clients
            </h1>
            <p className="text-white/70 text-xs font-one mt-1">
              Gérez les informations de vos clients et consultez leur
              historique.
            </p>
          </div>
        </div>

        {/* Boutons d'action responsive */}
        {!isFreeAccount && (
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button
              onClick={handleCreate}
              className="cursor-pointer flex justify-center items-center gap-2 py-2 px-4 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nouveau client
            </button>

            <div className="relative">
              <Link
                href="/clients/suivi"
                className="cursor-pointer text-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs flex items-center justify-center gap-2"
              >
                <span className="hidden sm:inline">Suivi de cicatrisation</span>
                <span className="sm:hidden">Suivi cicatrisation</span>
                {unansweredFollowUpsCount > 0 && (
                  <span className="bg-gradient-to-br from-tertiary-400 to-tertiary-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                    {unansweredFollowUpsCount > 99
                      ? "99+"
                      : unansweredFollowUpsCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        )}
      </div>

      <div>
        {/* Barre de recherche responsive */}
        {!isFreeAccount && (
          <div className="flex gap-2 items-center mb-4 sm:mb-6 mt-4 sm:mt-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par client"
              className="w-full text-sm text-white bg-white/10 placeholder:text-white/30 placeholder:text-xs py-2 sm:py-1 px-4 font-one border-[1px] rounded-lg border-white/20 focus:outline-none focus:border-tertiary-400 transition-colors"
            />
          </div>
        )}

        {/* Informations de pagination responsive */}
        {!isFreeAccount && !loading && !error && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div className="text-white/70 text-xs font-one">
              Affichage de{" "}
              {Math.min(
                (currentPage - 1) * ITEMS_PER_PAGE + 1,
                pagination.totalClients
              )}{" "}
              à{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, pagination.totalClients)}{" "}
              sur {pagination.totalClients} client
              {pagination.totalClients > 1 ? "s" : ""}
              {searchTerm && (
                <span className="block sm:inline sm:ml-2 text-tertiary-400 mt-1 sm:mt-0">
                  (recherche: "{searchTerm}")
                </span>
              )}
            </div>
            <div className="text-white/70 text-xs font-one">
              Page {currentPage} sur {pagination.totalPages}
            </div>
          </div>
        )}

        {isFreeAccount ? (
          /* Message pour les comptes Free */
          <div className="bg-gradient-to-r from-orange-500/10 to-tertiary-500/10 border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <h2 className="text-white font-semibold font-one mb-2">
                  👥 Gestion des clients disponible avec un abonnement
                </h2>

                <p className="text-white/70 text-sm font-one mb-4">
                  Accédez à la gestion complète de votre base clients : création
                  de fiches, historique des rendez-vous, suivi de cicatrisation
                  et bien plus.
                </p>

                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      👤 Fiches clients complètes
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      📞 Coordonnées & contacts
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      📅 Historique des RDV
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      🩹 Suivi de cicatrisation
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      🔍 Recherche & filtres
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      📊 Statistiques clients
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => (window.location.href = "/parametres")}
                    className="cursor-pointer px-4 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg text-sm font-one font-medium transition-all duration-300"
                  >
                    🚀 Passer à PRO
                  </button>

                  <button
                    onClick={() => (window.location.href = "/parametres")}
                    className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 text-sm font-one font-medium transition-colors"
                  >
                    Voir les plans
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Header de tableau - masqué sur mobile */}
            <div className="hidden sm:grid grid-cols-6 gap-2 px-4 py-2 mb-2 bg-white/10 rounded-lg text-white font-one text-xs font-semibold tracking-widest">
              <p>Nom & Prénom</p>
              <p>Email</p>
              <p>Téléphone</p>
              <p>Rendez-vous</p>
              <p className="text-center">Actions</p>
              <p></p>
            </div>

            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="w-full rounded-2xl p-10 flex flex-col items-center justify-center gap-6 mx-auto">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
                  <p className="text-white/60 font-two text-xs text-center">
                    Chargement des clients...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="h-full w-full flex">
                <div className="mt-4 w-full rounded-2xl shadow-xl border border-white/10 p-6 sm:p-10 flex flex-col items-center justify-center gap-6 mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 rounded-full flex items-center justify-center mb-2">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-tertiary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3H8a2 2 0 00-2 2v0a2 2 0 002 2h8a2 2 0 002-2v0a2 2 0 00-2-2zM8 21h8"
                      />
                    </svg>
                  </div>
                  <p className="text-white font-one text-lg sm:text-xl text-center">
                    {error}
                  </p>
                  <button
                    onClick={() => fetchClients(currentPage, searchTerm)}
                    className="cursor-pointer mt-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg font-medium font-one text-xs shadow-lg transition-all"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            ) : clients.length === 0 ? (
              <div className="h-full w-full flex">
                <div className="w-full rounded-2xl shadow-xl border border-white/10 p-6 sm:p-10 flex flex-col items-center justify-center gap-6 mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 rounded-full flex items-center justify-center mb-2">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-tertiary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3H8a2 2 0 00-2 2v0a2 2 0 002 2h8a2 2 0 002-2v0a2 2 0 00-2-2zM8 21h8"
                      />
                    </svg>
                  </div>
                  <p className="text-white/70 font-one text-base sm:text-lg text-center">
                    {searchTerm ? "Aucun client trouvé" : "Aucun client"}
                  </p>
                  <p className="text-white/50 text-sm font-one text-center">
                    {searchTerm
                      ? `Aucun client ne correspond à "${searchTerm}"`
                      : "Commencez par ajouter votre premier client"}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {/* Liste des clients responsive */}
                <div className="space-y-2 mb-6">
                  {clients.map((client) => (
                    <div key={client.id}>
                      {/* Vue desktop - grille */}
                      <div className="hidden lg:grid grid-cols-6 gap-2 px-4 py-3 items-center mb-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-tertiary-400/30 transition-all duration-300">
                        <p className="text-white font-one text-xs">
                          {client.lastName} {client.firstName}
                        </p>
                        <p className="text-white font-one text-xs break-all">
                          {client.email}
                        </p>
                        <p className="text-white font-one text-xs">
                          {client.phone ? client.phone : "Non renseigné"}
                        </p>
                        <p className="text-white font-one text-xs text-left">
                          {client.appointments.length} rendez-vous
                        </p>
                        <button
                          onClick={() => handleShowReservations(client)}
                          className="cursor-pointer text-white font-one text-xs mx-auto border w-[60px] hover:underline hover:bg-white/10 duration-200 px-2 py-1 rounded-3xl"
                        >
                          <p>Infos</p>
                        </button>
                        <div className="flex gap-8 text-xs items-center justify-center">
                          <button
                            className="cursor-pointer text-black"
                            onClick={() => handleEdit(client)}
                          >
                            <IoCreateOutline
                              size={25}
                              className="p-1 text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-tertiary-400/50 transition-all duration-200"
                            />
                          </button>
                          <button
                            className="cursor-pointer text-black"
                            onClick={() => handleDelete(client)}
                          >
                            <AiOutlineDelete
                              size={25}
                              className="p-1 text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-tertiary-400/50 transition-all duration-200"
                            />
                          </button>
                        </div>
                      </div>

                      {/* Vue mobile - format carte */}
                      <div className="lg:hidden bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 hover:border-tertiary-400/30 transition-all duration-300 mb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0 pr-3">
                            <h3 className="text-white font-one font-semibold text-sm mb-1">
                              {client.firstName} {client.lastName}
                            </h3>
                            <p className="text-white/80 font-one text-sm break-all mb-1">
                              {client.email}
                            </p>
                            <p className="text-white/70 font-one text-sm">
                              {client.phone
                                ? client.phone
                                : "Tel. non renseigné"}
                            </p>
                            <p className="text-white/70 font-one text-sm mt-2">
                              {client.appointments.length} rendez-vous
                            </p>
                          </div>
                        </div>

                        {/* Actions mobiles - maintenant en bas avec plus d'espace */}
                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                          <button
                            onClick={() => handleShowReservations(client)}
                            className="cursor-pointer flex-1 text-white font-one text-sm font-medium border border-white/30 px-4 py-2.5 rounded-lg hover:bg-white/10 hover:border-tertiary-400/50 duration-200 transition-all"
                          >
                            Voir les infos
                          </button>

                          <div className="flex gap-3">
                            <button
                              className="cursor-pointer p-2.5 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-tertiary-400/50 transition-all duration-200"
                              onClick={() => handleEdit(client)}
                            >
                              <IoCreateOutline
                                size={20}
                                className="text-white hover:text-tertiary-400 duration-200"
                              />
                            </button>
                            <button
                              className="cursor-pointer p-2.5 bg-white/10 hover:bg-red-500/20 rounded-lg border border-white/20 hover:border-red-400/50 transition-all duration-200"
                              onClick={() => handleDelete(client)}
                            >
                              <AiOutlineDelete
                                size={20}
                                className="text-white hover:text-red-400 duration-200"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination responsive */}
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
                          } else if (
                            currentPage <=
                            Math.floor(maxButtons / 2) + 1
                          ) {
                            pageNumber = i + 1;
                          } else if (
                            currentPage >=
                            pagination.totalPages - Math.floor(maxButtons / 2)
                          ) {
                            pageNumber =
                              pagination.totalPages - maxButtons + 1 + i;
                          } else {
                            pageNumber =
                              currentPage - Math.floor(maxButtons / 2) + i;
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
            )}
          </div>
        )}

        {/* Modal INFOS CLIENT - Utilisation du composant séparé - Seulement pour les comptes payants */}
        {!isFreeAccount && (
          <InfoClient
            client={clientForInfos!}
            isOpen={isFullInfoModalOpen}
            onClose={() => setIsFullInfoModalOpen(false)}
          />
        )}
      </div>

      {!isFreeAccount && isModalOpen && (
        <CreateOrUpdateClient
          onCreate={() => {
            fetchClients(currentPage, searchTerm);
            setIsModalOpen(false);
          }}
          setIsOpen={setIsModalOpen}
          existingClient={selectedClient ?? undefined}
        />
      )}

      {!isFreeAccount && isModalDeleteOpen && (
        <DeleteClient
          onDelete={() => {
            fetchClients(currentPage, searchTerm);
            setIsModalDeleteOpen(false);
          }}
          setIsOpen={setIsModalDeleteOpen}
          client={selectedClient ?? undefined}
        />
      )}
    </section>
  );
}
