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

export default function MessageList() {
  const { data: session } = useSession();
  // const isFreeAccount = session?.user?.saasPlan === "FREE";

  const [loading, setLoading] = useState(true);

  //! State pour les conversations
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
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
          status
        );
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
    []
  );

  //! Load conversations on mount
  useEffect(() => {
    fetchConversations(1, statusFilter);
  }, [fetchConversations, statusFilter]);

  return (
    <section>
      {/* Header responsive */}
      <div className="mb-6  flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
        <div className="w-full flex items-center gap-3 sm:gap-4 mb-4 md:mb-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center">
            <MdOutlineMessage
              size={20}
              className="sm:w-7 sm:h-7 text-tertiary-400 animate-pulse"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-white font-one tracking-wide uppercase">
              Messagerie
            </h1>
            <p className="text-white/70 text-xs font-one mt-1">
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
            className="cursor-pointer bg-noir-700 border border-white/15 text-white text-xs rounded-lg px-3 py-1 focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400"
          >
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {loading && (
          <div className="bg-noir-700 rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
              <h2 className="text-xl font-bold text-white font-one">
                Chargement des conversations...
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
                onClick={() => fetchConversations(1, statusFilter)}
                className="cursor-pointer px-4 py-2 bg-tertiary-600 text-white rounded-lg hover:bg-tertiary-700 transition-colors text-sm font-medium"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="bg-noir-700 rounded-xl border border-white/20 p-6">
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
              className="px-4 py-2 rounded-lg bg-noir-700/50 border border-white/10 text-white text-sm font-medium hover:bg-noir-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        ? "bg-tertiary-600 text-white"
                        : "bg-noir-700/50 border border-white/10 text-white hover:bg-noir-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() =>
                fetchConversations(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-noir-700/50 border border-white/10 text-white text-sm font-medium hover:bg-noir-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </section>
  );
}
