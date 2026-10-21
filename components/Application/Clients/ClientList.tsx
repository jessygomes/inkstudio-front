/* eslint-disable react/no-unescaped-entities */
"use client";
import { ClientProps, PaginationInfo } from "@/lib/type";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

import CreateOrUpdateClient from "./CreateOrUpdateClient";
import DeleteClient from "./DeleteClient";
import InfoClient from "./InfoClient";
import ConsentFormModal from "./ConsentFormModal";

import { IoCreateOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { RiFileUserLine } from "react-icons/ri";
import { FiFileText } from "react-icons/fi";
import { getSalonClientsAction } from "@/lib/queries/client";
import PageHeader from "@/components/Shared/PageHeader";
import DashboardButton from "@/components/Shared/DashboardButton";
import ApplicationToolbar from "@/components/Shared/ApplicationToolbar";
import LockedFeatureCard from "@/components/Shared/LockedFeatureCard";

export default function ClientList() {
  const { data: session } = useSession();

  // Vérifier si l'utilisateur a un plan Free
  const isFreeAccount = session?.user?.saasPlan === "FREE";

  const [loading, setLoading] = useState(true);

  //! State pour les clients et pagination
  const [clients, setClients] = useState<ClientProps[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientProps | null>(
    null,
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
    null,
  );

  //! Nouveau state pour les suivis non répondus
  const [unansweredFollowUpsCount, setUnansweredFollowUpsCount] = useState(0);

  //! State pour la modale consentement
  const [consentClient, setConsentClient] = useState<ClientProps | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  const handleOpenConsent = (client: ClientProps) => {
    setConsentClient(client);
    setIsConsentModalOpen(true);
  };

  const handleConsentSaved = (
    clientId: string,
    url: string,
    signedAt: string
  ) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              consentFileUrl: url,
              consentSigned: true,
              consentSignedAt: signedAt,
            }
          : c
      )
    );
  };

  //! Récupère les clients avec pagination
  const fetchClients = useCallback(
    async (page: number = currentPage, search: string = searchTerm) => {
      try {
        setLoading(true);
        setError(null);

        const data = await getSalonClientsAction(page, search);

        if (data.error) {
          throw new Error(
            data.message || "Erreur lors de la récupération des clients",
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
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
        setClients([]);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, searchTerm],
  );

  //! Nouvelle fonction pour récupérer le nombre de suivis non répondus
  const fetchUnansweredFollowUpsCount = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/follow-up/unanswered/${session?.user?.id}/number`,
        {
          cache: "no-store",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUnansweredFollowUpsCount(data.count || 0);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre de suivis non répondus:",
        error,
      );
    }
  }, [session?.user?.id]);

  // Effet pour charger les clients au changement de page ou de recherche
  useEffect(() => {
    if (session?.user?.id) {
      fetchClients(currentPage, searchTerm);
      fetchUnansweredFollowUpsCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, currentPage]);

  // Effet pour la recherche avec debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (session?.user?.id) {
        setCurrentPage(1); // Reset à la page 1 lors d'une nouvelle recherche
        fetchClients(1, searchTerm);
        fetchUnansweredFollowUpsCount();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, session?.user?.id]);

  //! Handler pour afficher les réservations
  const handleShowReservations = (client: ClientProps) => {
    setClientForInfos(client);
    setIsFullInfoModalOpen(true);
  };

  const handleClientCardKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    client: ClientProps,
  ) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleShowReservations(client);
    }
  };

  //! Handlers pour les actions
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
    <section className="w-full space-y-4">
      <PageHeader icon={<RiFileUserLine className="h-5 w-5 text-tertiary-400 lg:h-4 lg:w-4" />} title="Clients" />

      <div className="w-full">
        {/* Barre de recherche responsive */}
        {!isFreeAccount && (
          <ApplicationToolbar
            className="mb-4"
            search={
              <div className="flex w-full items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un client (nom, email, téléphone)"
                  className="h-10 w-full rounded-2xl border border-white/10 bg-black/15 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/35 font-one focus:border-tertiary-400 focus:outline-none focus:ring-2 focus:ring-tertiary-400/20 transition-colors"
                />
              </div>
              {!loading && !error && (
                <div className="inline-flex h-10 shrink-0 items-center justify-center px-2.5 text-[10px] text-white/65 font-one sm:px-3 sm:text-xs">
                  Page {currentPage} / {pagination.totalPages}
                </div>
              )}
              </div>
            }
            actions={
                <>
                  <DashboardButton href="/clients/creer" className="!min-w-0">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nouveau client
                  </DashboardButton>

                  <DashboardButton href="/clients/suivi" variant="secondary" className="!min-w-0">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Suivi cicatrisation
                    {unansweredFollowUpsCount > 0 && (
                      <span className="bg-gradient-to-br from-tertiary-400 to-tertiary-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                        {unansweredFollowUpsCount > 99 ? "99+" : unansweredFollowUpsCount}
                      </span>
                    )}
                  </DashboardButton>
                </>
            }
          />
        )}

        {isFreeAccount ? (
          <LockedFeatureCard
            className="dashboard-embedded-section"
            icon={
              <svg
                className="h-6 w-6"
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
            }
            title="Gestion des clients disponible avec un abonnement"
            description="Accédez à la gestion complète de votre base clients : création de fiches, historique des rendez-vous, suivi de cicatrisation et bien plus."
            features={[
              "Fiches clients complètes",
              "Coordonnées et contacts",
              "Historique des RDV",
              "Suivi de cicatrisation",
              "Recherche et filtres",
              "Statistiques clients",
            ]}
            primaryLabel="Passer à PRO"
          />
        ) : (
          <div className="client-list-surface rounded-[28px] p-2.5 sm:p-0">
            {loading ? (
              <div className="space-y-2.5 mb-5">
                {/* Vue desktop - skeletons */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="client-row-skeleton hidden lg:grid grid-cols-6 gap-4 rounded-2xl px-5 py-4 items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/10 rounded-lg w-24 animate-pulse"></div>
                        <div className="h-2 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-white/10 rounded-lg w-32 animate-pulse"></div>
                    <div className="h-3 bg-white/10 rounded-lg w-28 animate-pulse"></div>
                    <div className="h-6 bg-white/10 rounded-lg w-12 animate-pulse"></div>
                    <div className="h-8 bg-white/10 rounded-lg w-20 animate-pulse mx-auto"></div>
                    <div className="flex gap-2 justify-center">
                      <div className="h-8 w-8 bg-white/10 rounded-lg animate-pulse"></div>
                      <div className="h-8 w-8 bg-white/10 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                ))}

                {/* Vue mobile - skeletons */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`mobile-${i}`}
                    className="client-row-skeleton lg:hidden overflow-hidden rounded-2xl"
                  >
                    {/* En-tête avec avatar et nom */}
                    <div className="bg-gradient-to-r from-white/10 to-white/5 p-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse flex-shrink-0"></div>
                        <div className="flex justify-between items-center w-full gap-3">
                          <div className="h-4 bg-white/10 rounded-lg flex-1 animate-pulse"></div>
                          <div className="h-6 bg-white/10 rounded-lg w-16 animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    {/* Contenu principal */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-white/10 rounded mt-0.5 flex-shrink-0 animate-pulse"></div>
                        <div className="h-3 bg-white/10 rounded-lg flex-1 animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white/10 rounded flex-shrink-0 animate-pulse"></div>
                        <div className="h-3 bg-white/10 rounded-lg w-32 animate-pulse"></div>
                      </div>
                    </div>

                    {/* Actions - pied de carte */}
                    <div className="flex items-center gap-2 p-3 bg-white/5 border-t border-white/10">
                      <div className="flex-1 h-10 bg-white/10 rounded-lg animate-pulse"></div>
                      <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse"></div>
                      <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="h-full w-full flex">
                <div className="dashboard-empty-state mt-4 w-full p-6 sm:p-10 flex flex-col items-center justify-center gap-6 mx-auto">
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
                <div className="dashboard-empty-state w-full p-6 sm:p-10 flex flex-col items-center justify-center gap-6 mx-auto">
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
                <div className="space-y-3 mb-3">
                  {clients.map((client) => (
                    <div key={client.id}>
                      <div
                        className="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] sm:flex-row sm:items-center sm:gap-4"
                        role="button"
                        tabIndex={0}
                        aria-label={`Afficher les informations de ${client.firstName} ${client.lastName}`}
                        onClick={() => handleShowReservations(client)}
                        onKeyDown={(event) => handleClientCardKeyDown(event, client)}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/30 bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/60 transition-colors group-hover:border-tertiary-400/60">
                            <span className="font-one text-sm font-bold text-white">
                              {client.firstName.charAt(0)}
                              {client.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-one text-sm font-semibold text-white">
                                {client.firstName} {client.lastName}
                              </p>
                              <span className="shrink-0 rounded-full border border-tertiary-400/30 bg-tertiary-400/15 px-2 py-0.5 font-one text-[11px] text-tertiary-400">
                                {client.appointments.length} RDV
                              </span>
                            </div>
                            <p className="mt-1 truncate font-two text-xs text-white/60">
                              {client.email}
                              <span className="mx-1.5">·</span>
                              {client.phone || "Tél. non renseigné"}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenConsent(client);
                            }}
                            title="Formulaire de consentement"
                            className={`cursor-pointer rounded-xl border p-2 transition-all duration-200 ${
                              client.consentSigned
                                ? "border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
                                : "border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20"
                            }`}
                          >
                            <FiFileText
                              size={16}
                              className={client.consentSigned ? "text-green-400" : "text-orange-400"}
                            />
                          </button>
                          <button
                            title="Modifier"
                            className="group/btn cursor-pointer rounded-xl border border-white/15 bg-white/10 p-2 transition-all duration-200 hover:border-tertiary-400/50 hover:bg-tertiary-400/20"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleEdit(client);
                            }}
                          >
                            <IoCreateOutline
                              size={16}
                              className="text-white transition-colors group-hover/btn:text-tertiary-400"
                            />
                          </button>
                          <button
                            title="Supprimer"
                            className="group/btn cursor-pointer rounded-xl border border-white/15 bg-white/10 p-2 transition-all duration-200 hover:border-red-400/50 hover:bg-red-500/20"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(client);
                            }}
                          >
                            <AiOutlineDelete
                              size={16}
                              className="text-white transition-colors group-hover/btn:text-red-400"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Infos + pagination en bas de liste */}
                <div className="flex flex-col items-end gap-3 py-2 sm:flex-row sm:items-center sm:justify-end">
                  {pagination.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                      <button
                        onClick={handlePreviousPage}
                        disabled={!pagination.hasPreviousPage}
                        className="dashboard-nav-button cursor-pointer w-full sm:w-auto rounded-xl px-3 py-2 text-xs font-medium text-white font-one disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Précédent
                      </button>

                      <div className="flex items-center gap-1 sm:gap-2 order-first sm:order-none">
                        {(() => {
                          const maxButtons = 5;
                          return Array.from(
                            {
                              length: Math.min(pagination.totalPages, maxButtons),
                            },
                            (_, i) => {
                              let pageNumber;
                              if (pagination.totalPages <= maxButtons) {
                                pageNumber = i + 1;
                              } else if (currentPage <= Math.floor(maxButtons / 2) + 1) {
                                pageNumber = i + 1;
                              } else if (
                                currentPage >= pagination.totalPages - Math.floor(maxButtons / 2)
                              ) {
                                pageNumber = pagination.totalPages - maxButtons + 1 + i;
                              } else {
                                pageNumber = currentPage - Math.floor(maxButtons / 2) + i;
                              }

                              return (
                                <button
                                  key={pageNumber}
                                  onClick={() => handlePageChange(pageNumber)}
                                  className={`cursor-pointer h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition-all duration-200 font-one ${
                                    currentPage === pageNumber
                                      ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                                  }`}
                                >
                                  {pageNumber}
                                </button>
                              );
                            },
                          );
                        })()}
                      </div>

                      <button
                        onClick={handleNextPage}
                        disabled={!pagination.hasNextPage}
                        className="dashboard-nav-button cursor-pointer w-full sm:w-auto rounded-xl px-3 py-2 text-xs font-medium text-white font-one disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suivant
                      </button>
                    </div>
                  )}

                  <p className="text-right text-xs text-white/60 font-one">
                    {Math.min(
                      (currentPage - 1) * ITEMS_PER_PAGE + 1,
                      pagination.totalClients,
                    )}
                    –
                    {Math.min(currentPage * ITEMS_PER_PAGE, pagination.totalClients)}{" "}
                    sur {pagination.totalClients} client
                    {pagination.totalClients > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal INFOS CLIENT - Utilisation du composant séparé - Seulement pour les comptes payants */}
        {!isFreeAccount && clientForInfos && (
          <InfoClient
            client={clientForInfos}
            isOpen={isFullInfoModalOpen}
            onClose={() => setIsFullInfoModalOpen(false)}
            salonName={session?.user?.salonName ?? "Mon Salon"}
          />
        )}

        {/* Modal CONSENTEMENT */}
        {!isFreeAccount && consentClient && (
          <ConsentFormModal
            client={consentClient}
            salonName={session?.user?.salonName ?? "Mon Salon"}
            isOpen={isConsentModalOpen}
            onClose={() => setIsConsentModalOpen(false)}
            onConsentSaved={handleConsentSaved}
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
