/* eslint-disable react/no-unescaped-entities */
"use client";
import { useSession } from "next-auth/react";
import {
  getConversationsAction,
  ConversationDto,
  PaginatedConversationsDto,
  ConversationStatus,
} from "@/lib/queries/conversation.action";
import ConversationCard from "./ConversationCard";
import React, { useEffect, useState, useCallback } from "react";
import { MdOutlineMessage } from "react-icons/md";
import { useMessagingContext } from "@/components/Providers/MessagingProvider";
import Link from "next/link";

export default function MessageList() {
  const { data: session } = useSession();

  // Vérifier si c'est un compte Free
  const isFreeAccount = session?.user?.saasPlan === "FREE";

  // Utiliser le contexte global au lieu du state local
  const { conversations, setConversations, unreadCount } =
    useMessagingContext();

  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<ConversationStatus>("ACTIVE");

  //! Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  //! Fetch conversations
  const fetchConversations = useCallback(
    async (page: number = 1, status?: ConversationStatus) => {
      try {
        setLoading(true);
        setError(null);
        const result: PaginatedConversationsDto = await getConversationsAction(
          page,
          20,
          status,
        );

        // Simplement remplacer par les données du serveur (source de vérité)
        // Le refetch après avoir quitté une conversation doit refléter l'état actuel du serveur
        setConversations(result.data);

        setCurrentPage(result.page);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    },
    [setConversations],
  );

  //! Load conversations on mount
  useEffect(() => {
    fetchConversations(1, statusFilter);
  }, [fetchConversations, statusFilter]);

  // Écouter l'événement conversationLeft pour refetch
  useEffect(() => {
    const handleConversationLeft = () => {
      fetchConversations(currentPage, statusFilter);
    };

    window.addEventListener("conversationLeft", handleConversationLeft);

    return () => {
      window.removeEventListener("conversationLeft", handleConversationLeft);
    };
  }, [currentPage, statusFilter, fetchConversations]);

  return (
    <section className="space-y-4">
      {/* Header responsive */}
      <div className="dashboard-hero flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:py-3">
        <div className="w-full min-w-0 flex items-center gap-3 sm:gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-tertiary-400/30 rounded-full flex items-center justify-center shrink-0">
            <MdOutlineMessage
              size={20}
              className="sm:w-7 sm:h-7 text-tertiary-400 animate-pulse"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold text-white font-one tracking-wide uppercase">
                Messagerie
              </h1>
              {unreadCount > 0 && (
                <span className="dashboard-count-pill border border-tertiary-400/40 bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white text-xs font-one px-3 py-1 rounded-full">
                  {unreadCount} message{unreadCount > 1 ? "s" : ""} non lu
                </span>
              )}
            </div>
            <p className="hidden sm:block text-white/70 text-xs font-one mt-1">
              Gérez vos conversations avec les clients et l'équipe interne.
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto flex items-center gap-3">
          <label
            className="text-white/70 text-xs font-one"
            htmlFor="status-filter"
          >
            Statut
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              const next = e.target.value as ConversationStatus;
              setStatusFilter(next);
              setCurrentPage(1);
              fetchConversations(1, next);
            }}
            className="cursor-pointer rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs text-white focus:border-tertiary-400 focus:outline-none focus:ring-2 focus:ring-tertiary-400/20"
          >
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
        </div>
      </div>

      {/* Message pour les comptes Free */}
      {isFreeAccount && (
        <div>
          <div className="dashboard-embedded-section bg-gradient-to-r from-orange-500/10 to-tertiary-500/10 border border-orange-500/30 rounded-2xl p-6">
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
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <h2 className="text-white font-semibold font-one mb-2">
                  💬 Messagerie améliorée disponible avec un abonnement
                </h2>

                <p className="text-white/70 text-sm font-one mb-4">
                  Débloquez des fonctionnalités avancées de messagerie :
                  notifications en temps réel, messagerie interne illimitée,
                  pièces jointes et bien plus.
                </p>

                <div className="flex flex-wrap gap-3">
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      💼 Messagerie interne illimitée
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      📎 Pièces jointes
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xs font-one">
                      ⭐ Réponses automatiques
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Link
                    href="/parametres"
                    className="cursor-pointer px-4 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg text-sm font-one font-medium transition-all duration-300"
                  >
                    🚀 Passer à PRO
                  </Link>

                  <Link
                    href="/parametres"
                    className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 text-sm font-one font-medium transition-colors"
                  >
                    Voir les plans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversations list - Seulement pour les comptes non-Free */}
      {!isFreeAccount && (
        <div className="dashboard-embedded-panel p-3 sm:p-4 lg:p-5 space-y-4">
          {loading && (
            <div className="dashboard-embedded-section rounded-xl border border-white/20 p-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
                <h2 className="text-xl font-bold text-white font-one">
                  Chargement des conversations...
                </h2>
              </div>
            </div>
          )}

          {error && (
            <div className="dashboard-empty-state rounded-xl p-6">
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
                  onClick={() => fetchConversations(1, statusFilter)}
                  className="rdv-btn-primary cursor-pointer px-4 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white rounded-lg hover:from-tertiary-500 hover:to-tertiary-600 transition-colors text-sm font-medium"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {!loading && !error && conversations.length === 0 && (
            <div className="dashboard-empty-state rounded-xl p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-tertiary-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdOutlineMessage className="w-8 h-8 text-tertiary-400" />
                </div>
                <h3 className="text-white font-one font-semibold mb-2 text-lg">
                  Aucune conversation
                </h3>
                <p className="text-white/70 text-sm">
                  Vous n'avez pas de conversations pour le moment.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && conversations.length > 0 && (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedConversation?.id === conversation.id}
                  onSelect={setSelectedConversation}
                  currentUserId={session?.user?.id ?? undefined}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && conversations.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => fetchConversations(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="dashboard-nav-button px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => fetchConversations(pageNum, statusFilter)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                          : "bg-white/10 border border-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  fetchConversations(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="dashboard-nav-button px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}

          {/* Total conversations count */}
          {!loading && !error && conversations.length > 0 && (
            <div className="text-center text-xs text-white/60 mt-6">
              {total} conversation{total > 1 ? "s" : ""} •{" "}
              {currentPage > 1 && `Page ${currentPage}/{totalPages}`}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
