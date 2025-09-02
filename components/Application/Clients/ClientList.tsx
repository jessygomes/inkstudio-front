/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useUser } from "@/components/Auth/Context/UserContext";
import { AppointmentProps, ClientProps } from "@/lib/type";
import React, { useEffect, useState } from "react";

import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import CreateOrUpdateClient from "./CreateOrUpdateClient";
import DeleteClient from "./DeleteClient";

import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { RiHealthBookLine } from "react-icons/ri";
import { FaFilePen } from "react-icons/fa6";
import { CiCalendarDate, CiUser } from "react-icons/ci";
import { MdOutlineRateReview } from "react-icons/md";
import { RiFileUserLine } from "react-icons/ri";
import Image from "next/image";
import Link from "next/link";
import { getSalonClientsAction } from "@/lib/queries/client";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalClients: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// interface ClientsResponse {
//   error: boolean;
//   clients: ClientProps[];
//   pagination?: PaginationInfo;
//   message?: string;
// }

export default function ClientList() {
  const user = useUser();

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

  // États pour les sections dépliantes du modal
  const [showAppointments, setShowAppointments] = useState(false);
  const [showTattooHistory, setShowTattooHistory] = useState(false);
  const [showTattooCare, setShowTattooCare] = useState(false);
  const [showFollowUpSubmissions, setShowFollowUpSubmissions] = useState(false);

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

  const getRatingStars = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return "Très insatisfait";
      case 2:
        return "Insatisfait";
      case 3:
        return "Neutre";
      case 4:
        return "Satisfait";
      case 5:
        return "Très satisfait";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section>
      {/* Header responsive */}
      <div className="mb-6 mt-23 flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
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
      </div>

      <div>
        {/* Barre de recherche responsive */}
        <div className="flex gap-2 items-center mb-4 sm:mb-6 mt-4 sm:mt-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par client"
            className="w-full text-sm text-white bg-white/10 placeholder:text-white/30 placeholder:text-xs py-2 sm:py-1 px-4 font-one border-[1px] rounded-lg border-white/20 focus:outline-none focus:border-tertiary-400 transition-colors"
          />
        </div>

        {/* Informations de pagination responsive */}
        {!loading && !error && (
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
          <>
            {/* Liste des clients responsive */}
            <div className="space-y-2 mb-6">
              {clients.map((client) => (
                <div key={client.id}>
                  {/* Vue desktop - grille */}
                  <div className="hidden sm:grid grid-cols-6 gap-2 px-4 py-3 items-center mb-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-tertiary-400/30 transition-all duration-300">
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
                          size={20}
                          className="text-white hover:text-secondary-500 duration-200"
                        />
                      </button>
                      <button
                        className="cursor-pointer text-black"
                        onClick={() => handleDelete(client)}
                      >
                        <AiOutlineDelete
                          size={20}
                          className="text-white hover:text-secondary-500 duration-200"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Vue mobile - format carte */}
                  <div className="sm:hidden bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 hover:border-tertiary-400/30 transition-all duration-300 mb-2">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-one font-semibold text-sm mb-1">
                          {client.firstName} {client.lastName}
                        </h3>
                        <p className="text-white/80 font-one text-xs break-all mb-1">
                          {client.email}
                        </p>
                        <p className="text-white/70 font-one text-xs">
                          {client.phone ? client.phone : "Tel. non renseigné"}
                        </p>
                        <p className="text-white/70 font-one text-xs mt-2">
                          {client.appointments.length} rendez-vous
                        </p>
                      </div>

                      {/* Actions mobiles */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleShowReservations(client)}
                          className="cursor-pointer text-white font-one text-xs border px-3 py-1 rounded-lg hover:bg-white/10 duration-200"
                        >
                          Infos
                        </button>
                        <div className="flex gap-3 justify-center">
                          <button
                            className="cursor-pointer"
                            onClick={() => handleEdit(client)}
                          >
                            <IoCreateOutline
                              size={18}
                              className="text-white hover:text-secondary-500 duration-200"
                            />
                          </button>
                          <button
                            className="cursor-pointer"
                            onClick={() => handleDelete(client)}
                          >
                            <AiOutlineDelete
                              size={18}
                              className="text-white hover:text-secondary-500 duration-200"
                            />
                          </button>
                        </div>
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
                        pageNumber = pagination.totalPages - maxButtons + 1 + i;
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
          </>
        )}

        {/* Modal INFOS CLIENT responsive */}
        {isFullInfoModalOpen && clientForInfos && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
            <div className="bg-noir-500 rounded-2xl sm:rounded-3xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col border border-white/20 shadow-2xl">
              {/* Header fixe responsive */}
              <div className="p-3 sm:p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-white font-one tracking-wide truncate">
                      {clientForInfos.firstName} {clientForInfos.lastName}
                    </h2>
                    <p className="text-white/70 mt-1 sm:mt-2 text-xs sm:text-sm">
                      Informations détaillées du client
                    </p>
                  </div>
                  <button
                    onClick={() => setIsFullInfoModalOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors ml-2"
                  >
                    <span className="cursor-pointer text-white text-xl">×</span>
                  </button>
                </div>
              </div>

              {/* Contenu scrollable responsive */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                <div className="space-y-4 sm:space-y-6">
                  {/* Informations de base responsive */}
                  <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide mb-3">
                      <CiUser size={18} className="sm:w-5 sm:h-5" />{" "}
                      Informations personnelles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-white/70 font-one">Email</p>
                        <p className="text-white font-two text-sm break-all">
                          {clientForInfos.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-white/70 font-one">
                          Téléphone
                        </p>
                        <p className="text-white font-two text-sm">
                          {clientForInfos.phone || "Non renseigné"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-white/70 font-one">
                          Date de naissance
                        </p>
                        <p className="text-white font-two text-sm">
                          {clientForInfos.birthDate
                            ? new Date(
                                clientForInfos.birthDate
                              ).toLocaleDateString("fr-FR")
                            : "Non renseignée"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-white/70 font-one">
                          Adresse
                        </p>
                        <p className="text-white font-two text-sm break-words">
                          {clientForInfos.address || "Non renseignée"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section Rendez-vous responsive */}
                  <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                    <button
                      onClick={() => setShowAppointments(!showAppointments)}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                        <CiCalendarDate size={18} className="sm:w-5 sm:h-5" />
                        <span className="truncate">
                          Rendez-vous ({clientForInfos.appointments.length})
                        </span>
                      </h3>
                      {showAppointments ? (
                        <IoChevronUp className="text-white/70 flex-shrink-0" />
                      ) : (
                        <IoChevronDown className="text-white/70 flex-shrink-0" />
                      )}
                    </button>

                    {showAppointments && (
                      <div className="space-y-3">
                        {clientForInfos.appointments.length === 0 ? (
                          <p className="text-white/60 text-sm">
                            Aucun rendez-vous
                          </p>
                        ) : (
                          clientForInfos.appointments.map(
                            (rdv: AppointmentProps, index: number) => (
                              <div
                                key={index}
                                className="bg-white/10 p-3 rounded-lg border border-white/20"
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <p className="text-xs text-white/70 font-one">
                                      Date
                                    </p>
                                    <p className="text-white font-two text-sm">
                                      {new Date(rdv.start).toLocaleDateString(
                                        "fr-FR"
                                      )}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-white/70 font-one">
                                      Heure
                                    </p>
                                    <p className="text-white font-two text-sm">
                                      {new Date(rdv.start).toLocaleTimeString(
                                        [],
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )}{" "}
                                      -{" "}
                                      {new Date(rdv.end).toLocaleTimeString(
                                        [],
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-white/70 font-one">
                                      Prestation
                                    </p>
                                    <p className="text-white font-two text-sm">
                                      {rdv.prestation}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-white/70 font-one">
                                      Titre
                                    </p>
                                    <p className="text-white font-two text-sm break-words">
                                      {rdv.title}
                                    </p>
                                  </div>
                                </div>
                                {rdv.description && (
                                  <div className="space-y-1 mt-3">
                                    <p className="text-xs text-white/70 font-one">
                                      Description
                                    </p>
                                    <p className="text-tertiary-300 font-two text-sm break-words">
                                      {rdv.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section Historique des tatouages */}
                  <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                    <button
                      onClick={() => setShowTattooHistory(!showTattooHistory)}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                        <FaFilePen size={16} className="sm:w-5 sm:h-5" />
                        <span className="truncate">
                          Historique tatouages (0)
                        </span>
                      </h3>
                      {showTattooHistory ? (
                        <IoChevronUp className="text-white/70 flex-shrink-0" />
                      ) : (
                        <IoChevronDown className="text-white/70 flex-shrink-0" />
                      )}
                    </button>

                    {showTattooHistory && (
                      <div className="space-y-3">
                        <p className="text-white/60 text-sm">
                          Aucun historique de tatouage disponible
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Section Historique médical responsive */}
                  <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                    <button
                      onClick={() => setShowTattooCare(!showTattooCare)}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                        <RiHealthBookLine size={16} className="sm:w-5 sm:h-5" />
                        <span className="truncate">Historique médical</span>
                      </h3>
                      {showTattooCare ? (
                        <IoChevronUp className="text-white/70 flex-shrink-0" />
                      ) : (
                        <IoChevronDown className="text-white/70 flex-shrink-0" />
                      )}
                    </button>

                    {showTattooCare && (
                      <div className="space-y-4">
                        {clientForInfos.medicalHistory ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                                <p className="text-xs text-white/70 font-one mb-1">
                                  Allergies
                                </p>
                                <p className="text-white font-two text-sm break-words">
                                  {clientForInfos.medicalHistory.allergies ||
                                    "Aucune allergie connue"}
                                </p>
                              </div>

                              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                                <p className="text-xs text-white/70 font-one mb-1">
                                  Problèmes de santé
                                </p>
                                <p className="text-white font-two text-sm break-words">
                                  {clientForInfos.medicalHistory.healthIssues ||
                                    "Aucun problème de santé signalé"}
                                </p>
                              </div>

                              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                                <p className="text-xs text-white/70 font-one mb-1">
                                  Médicaments
                                </p>
                                <p className="text-white font-two text-sm break-words">
                                  {clientForInfos.medicalHistory.medications ||
                                    "Aucun médicament"}
                                </p>
                              </div>

                              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                                <p className="text-xs text-white/70 font-one mb-1">
                                  Historique tatouages
                                </p>
                                <p className="text-white font-two text-sm break-words">
                                  {clientForInfos.medicalHistory
                                    .tattooHistory ||
                                    "Aucun historique de tatouage"}
                                </p>
                              </div>
                            </div>

                            <div
                              className={`p-3 rounded-lg border ${
                                clientForInfos.medicalHistory.pregnancy
                                  ? "border-yellow-400/50 bg-yellow-400/10"
                                  : "border-green-400/50 bg-green-400/10"
                              }`}
                            >
                              <p className="text-xs text-white/70 font-one mb-1">
                                Grossesse / Allaitement
                              </p>
                              <p
                                className={`text-sm font-semibold ${
                                  clientForInfos.medicalHistory.pregnancy
                                    ? "text-yellow-300"
                                    : "text-green-300"
                                }`}
                              >
                                {clientForInfos.medicalHistory.pregnancy
                                  ? "⚠️ Enceinte ou allaite actuellement"
                                  : "✅ Non enceinte / n'allaite pas"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-white/60 text-sm">
                            Aucune information médicale disponible
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section Suivis de cicatrisation responsive */}
                  <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                    <button
                      onClick={() =>
                        setShowFollowUpSubmissions(!showFollowUpSubmissions)
                      }
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                        <MdOutlineRateReview
                          size={16}
                          className="sm:w-5 sm:h-5"
                        />
                        <span className="truncate">
                          Suivis cicatrisation (
                          {clientForInfos.FollowUpSubmission?.length || 0})
                        </span>
                      </h3>
                      {showFollowUpSubmissions ? (
                        <IoChevronUp className="text-white/70 flex-shrink-0" />
                      ) : (
                        <IoChevronDown className="text-white/70 flex-shrink-0" />
                      )}
                    </button>

                    {showFollowUpSubmissions && (
                      <div className="space-y-4">
                        {clientForInfos.FollowUpSubmission &&
                        clientForInfos.FollowUpSubmission.length > 0 ? (
                          clientForInfos.FollowUpSubmission.map(
                            (followUp: any, index: number) => (
                              <div
                                key={followUp.id}
                                className="bg-white/10 p-3 sm:p-4 rounded-lg border border-white/20"
                              >
                                <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 border border-white/20 flex-shrink-0">
                                      {followUp.photoUrl ? (
                                        <Image
                                          width={48}
                                          height={48}
                                          src={followUp.photoUrl}
                                          alt="Photo de cicatrisation"
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <svg
                                            className="w-5 h-5 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                                        <p className="text-white font-one text-sm font-semibold">
                                          Suivi #{index + 1}
                                        </p>
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium border w-fit ${
                                            followUp.isAnswered
                                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                                              : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                          }`}
                                        >
                                          {followUp.isAnswered
                                            ? "Répondu"
                                            : "En attente"}
                                        </span>
                                      </div>
                                      <p className="text-white/70 text-xs font-one">
                                        {formatDate(followUp.createdAt)}
                                      </p>
                                    </div>
                                  </div>

                                  {followUp.photoUrl && (
                                    <button
                                      onClick={() =>
                                        window.open(followUp.photoUrl, "_blank")
                                      }
                                      className="cursor-pointer text-tertiary-400 hover:text-tertiary-300 text-xs font-one"
                                    >
                                      Voir photo →
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <p className="text-xs text-white/70 font-one">
                                      Satisfaction
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-yellow-400 text-sm">
                                        {getRatingStars(followUp.rating)}
                                      </span>
                                      <span className="text-white/80 text-xs font-one">
                                        {getRatingLabel(followUp.rating)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <p className="text-xs text-white/70 font-one">
                                      Visibilité photo
                                    </p>
                                    <span
                                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
                                        followUp.isPhotoPublic
                                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                      }`}
                                    >
                                      {followUp.isPhotoPublic
                                        ? "Publique"
                                        : "Privée"}
                                    </span>
                                  </div>
                                </div>

                                {followUp.review && (
                                  <div className="mt-4 space-y-2">
                                    <p className="text-xs text-white/70 font-one">
                                      Avis du client
                                    </p>
                                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                      <p className="text-white/90 text-sm font-one italic break-words">
                                        "{followUp.review}"
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="mt-4 pt-3 border-t border-white/10">
                                  <p className="text-xs text-white/50 font-one break-all">
                                    Rendez-vous associé:{" "}
                                    {followUp.appointmentId}
                                  </p>
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="text-center py-6">
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                              <MdOutlineRateReview className="w-6 h-6 text-gray-500" />
                            </div>
                            <p className="text-white/60 text-sm">
                              Aucun suivi de cicatrisation
                            </p>
                            <p className="text-white/40 text-xs mt-1">
                              Le client n'a pas encore envoyé de suivi
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer fixe responsive */}
              <div className="p-3 sm:p-4 border-t border-white/10 bg-white/5 flex justify-end">
                <button
                  onClick={() => setIsFullInfoModalOpen(false)}
                  className="cursor-pointer px-4 sm:px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateOrUpdateClient
          onCreate={() => {
            fetchClients(currentPage, searchTerm);
            setIsModalOpen(false);
          }}
          setIsOpen={setIsModalOpen}
          existingClient={selectedClient ?? undefined}
        />
      )}

      {isModalDeleteOpen && (
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
