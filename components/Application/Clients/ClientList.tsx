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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalClients: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ClientsResponse {
  error: boolean;
  clients: ClientProps[];
  pagination?: PaginationInfo;
  message?: string;
}

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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/clients/salon/${
          user.id
        }?page=${page}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(
          search
        )}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: ClientsResponse = await response.json();

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
      <div className="mb-6 mt-23 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center ">
            <RiFileUserLine
              size={28}
              className="text-tertiary-400 animate-pulse"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-one tracking-wide uppercase">
              Clients
            </h1>
            <p className="text-white/70 text-xs font-one mt-1">
              Gérez les informations de vos clients. Accédez à leurs données,
              gérez les rendez-vous et consultez l&apos;historique de leurs
              visites.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            className="cursor-pointer w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
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
              className="cursor-pointer text-center px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs flex items-center justify-center gap-2"
            >
              Suivi de cicatrisation
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
        <div className="flex gap-2 items-center mb-6 mt-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par client"
            className="w-full text-sm text-white bg-white/10 placeholder:text-white/30 placeholder:text-xs py-1 px-4 font-one border-[1px] rounded-lg border-white/20 focus:outline-none focus:border-tertiary-400 transition-colors"
          />
        </div>

        {/* Informations de pagination */}
        {!loading && !error && (
          <div className="flex justify-between items-center mb-4">
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
                <span className="ml-2 text-tertiary-400">
                  (recherche: "{searchTerm}")
                </span>
              )}
            </div>
            <div className="text-white/70 text-xs font-one">
              Page {currentPage} sur {pagination.totalPages}
            </div>
          </div>
        )}

        <div className="grid grid-cols-6 gap-2 px-4 py-2 mb-2 bg-white/10 rounded-lg text-white font-one text-xs font-semibold tracking-widest">
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
            <div className="mt-4 w-full rounded-2xl shadow-xl border border-white/10 p-10 flex flex-col items-center justify-center gap-6 mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-10 h-10 text-tertiary-400"
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
              <p className="text-white font-one text-xl text-center">{error}</p>
              <button
                onClick={() => fetchClients(currentPage, searchTerm)}
                className="cursor-pointer mt-2 px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg font-medium font-one text-xs shadow-lg transition-all"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : clients.length === 0 ? (
          <div className="h-full w-full flex">
            <div className=" w-full rounded-2xl shadow-xl border border-white/10 p-10 flex flex-col items-center justify-center gap-6 mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-10 h-10 text-tertiary-400"
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
              <p className="text-white/70 font-one">
                {searchTerm ? "Aucun client trouvé" : "Aucun client"}
              </p>
              <p className="text-white/50 text-sm font-one">
                {searchTerm
                  ? `Aucun client ne correspond à "${searchTerm}"`
                  : "Commencez par ajouter votre premier client"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Liste des clients */}
            <div className="space-y-2 mb-6">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="grid grid-cols-6 gap-2 px-4 py-3 items-center mb-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-tertiary-400/30 transition-all duration-300"
                >
                  <p className="text-white font-one text-xs">
                    {client.lastName} {client.firstName}
                  </p>
                  <p className="text-white font-one text-xs">{client.email}</p>
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
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-4">
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPreviousPage}
                  className="cursor-pointer px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
                >
                  Précédent
                </button>

                <div className="flex items-center gap-2">
                  {Array.from(
                    { length: Math.min(pagination.totalPages, 5) },
                    (_, i) => {
                      let pageNumber;
                      if (pagination.totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNumber = pagination.totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`cursor-pointer w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 font-one ${
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
                  className="cursor-pointer px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal INFOS CLIENT */}
        {isFullInfoModalOpen && clientForInfos && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-noir-500 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 shadow-2xl">
              {/* Header fixe */}
              <div className="p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white font-one tracking-wide">
                    {clientForInfos.firstName} {clientForInfos.lastName}
                  </h2>
                  <button
                    onClick={() => setIsFullInfoModalOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <span className="cursor-pointer text-white text-xl">×</span>
                  </button>
                </div>
                <p className="text-white/70 mt-2 text-sm">
                  Informations détaillées du client
                </p>
              </div>

              {/* Contenu scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  {/* Informations de base */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide mb-2">
                      <CiUser size={20} /> Informations personnelles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-white/70 font-one">Email</p>
                        <p className="text-white font-two text-sm">
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
                        <p className="text-white font-two text-sm">
                          {clientForInfos.address || "Non renseignée"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section Rendez-vous */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <button
                      onClick={() => setShowAppointments(!showAppointments)}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                        <CiCalendarDate size={20} /> Rendez-vous (
                        {clientForInfos.appointments.length})
                      </h3>
                      {showAppointments ? (
                        <IoChevronUp className="text-white/70" />
                      ) : (
                        <IoChevronDown className="text-white/70" />
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                    <p className="text-white font-two text-sm">
                                      {rdv.title}
                                    </p>
                                  </div>
                                </div>
                                {rdv.description && (
                                  <div className="space-y-1 mt-3">
                                    <p className="text-xs text-white/70 font-one">
                                      Description
                                    </p>
                                    <p className="text-tertiary-300 font-two text-sm">
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
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <button
                      onClick={() => setShowTattooHistory(!showTattooHistory)}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                        <FaFilePen size={20} /> Historique des tatouages (0)
                      </h3>
                      {showTattooHistory ? (
                        <IoChevronUp className="text-white/70" />
                      ) : (
                        <IoChevronDown className="text-white/70" />
                      )}
                    </button>

                    {showTattooHistory && (
                      <div className="space-y-3">
                        <p className="text-white/60 text-sm">
                          Aucun historique de tatouage disponible
                        </p>
                        {/* TODO: Ajouter la logique pour afficher les tatouages */}
                      </div>
                    )}
                  </div>

                  {/* Section Historique médical */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <button
                      onClick={() => setShowTattooCare(!showTattooCare)}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                        <RiHealthBookLine size={20} /> Historique médical
                      </h3>
                      {showTattooCare ? (
                        <IoChevronUp className="text-white/70" />
                      ) : (
                        <IoChevronDown className="text-white/70" />
                      )}
                    </button>

                    {showTattooCare && (
                      <div className="space-y-4">
                        {clientForInfos.medicalHistory ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                                <p className="text-xs text-white/70 font-one mb-1">
                                  Allergies
                                </p>
                                <p className="text-white font-two text-sm">
                                  {clientForInfos.medicalHistory.allergies ||
                                    "Aucune allergie connue"}
                                </p>
                              </div>

                              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                                <p className="text-xs text-white/70 font-one mb-1">
                                  Problèmes de santé
                                </p>
                                <p className="text-white font-two text-sm">
                                  {clientForInfos.medicalHistory.healthIssues ||
                                    "Aucun problème de santé signalé"}
                                </p>
                              </div>

                              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                                <p className="text-xs text-white/70 font-one mb-1">
                                  Médicaments
                                </p>
                                <p className="text-white font-two text-sm">
                                  {clientForInfos.medicalHistory.medications ||
                                    "Aucun médicament"}
                                </p>
                              </div>

                              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                                <p className="text-xs text-white/70 font-one mb-1">
                                  Historique tatouages
                                </p>
                                <p className="text-white font-two text-sm">
                                  {clientForInfos.medicalHistory
                                    .tattooHistory ||
                                    "Aucun historique de tatouage"}
                                </p>
                              </div>
                            </div>

                            {/* Grossesse - affiché séparément avec style différent */}
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

                  {/* Section Soins reçus */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <button
                      onClick={() => setShowTattooHistory(!showTattooHistory)}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                        <RiHealthBookLine size={20} /> Soins reçus (0)
                      </h3>
                      {showTattooHistory ? (
                        <IoChevronUp className="text-white/70" />
                      ) : (
                        <IoChevronDown className="text-white/70" />
                      )}
                    </button>

                    {showTattooHistory && (
                      <div className="space-y-3">
                        <p className="text-white/60 text-sm">
                          Aucun soin reçu disponible
                        </p>
                        {/* TODO: Ajouter la logique pour afficher les soins */}
                      </div>
                    )}
                  </div>

                  {/* Section Suivis de cicatrisation */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <button
                      onClick={() =>
                        setShowFollowUpSubmissions(!showFollowUpSubmissions)
                      }
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                        <MdOutlineRateReview size={20} /> Suivis de
                        cicatrisation (
                        {clientForInfos.FollowUpSubmission?.length || 0})
                      </h3>
                      {showFollowUpSubmissions ? (
                        <IoChevronUp className="text-white/70" />
                      ) : (
                        <IoChevronDown className="text-white/70" />
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
                                className="bg-white/10 p-4 rounded-lg border border-white/20"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 border border-white/20">
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
                                    <div>
                                      <div className="flex items-center gap-3 mb-1">
                                        <p className="text-white font-one text-sm font-semibold">
                                          Suivi #{index + 1}
                                        </p>
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium border ${
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Évaluation */}
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

                                  {/* Visibilité de la photo */}
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

                                {/* Avis du client */}
                                {followUp.review && (
                                  <div className="mt-4 space-y-2">
                                    <p className="text-xs text-white/70 font-one">
                                      Avis du client
                                    </p>
                                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                      <p className="text-white/90 text-sm font-one italic">
                                        "{followUp.review}"
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Rendez-vous associé */}
                                <div className="mt-4 pt-3 border-t border-white/10">
                                  <p className="text-xs text-white/50 font-one">
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

              {/* Footer fixe */}
              <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
                <button
                  onClick={() => setIsFullInfoModalOpen(false)}
                  className="cursor-pointer px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs"
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
          userId={user.id ?? ""}
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
