/* eslint-disable react/no-unescaped-entities */
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getRecentUnreadConversationsAction,
  UnreadConversationResponseDto,
} from "@/lib/queries/conversation.action";

export default function LastMessage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<
    UnreadConversationResponseDto[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getRecentUnreadConversationsAction();
      setConversations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadConversations();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Vérifier si c'est aujourd'hui
    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui ${date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Vérifier si c'est hier
    if (date.toDateString() === yesterday.toDateString()) {
      return `Hier ${date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Sinon afficher la date complète
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const handleConversationClick = (conversationId: string) => {
    router.push(`/messagerie/${conversationId}`);
  };

  const getClientInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "?";
  };

  //! CHARGEMENT
  if (loading) {
    return (
      <div className="dashboard-panel dashboard-panel-featured p-4 lg:p-5">
        <div className="dashboard-panel-content">
          <div className="dashboard-card-header mb-4">
            <div>
              <span className="dashboard-card-kicker">Messagerie</span>
              <h3 className="dashboard-card-title mt-3">Messages non lus</h3>
            </div>
            <div className="w-4 h-4 border-2 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-slate-300/10 rounded-[22px]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  //! ERREUR
  if (error) {
    return (
      <div className="dashboard-panel dashboard-panel-featured p-4 lg:p-5">
        <div className="dashboard-panel-content">
          <div className="dashboard-card-header mb-4">
            <div>
              <span className="dashboard-card-kicker">Messagerie</span>
              <h3 className="dashboard-card-title mt-3">Messages non lus</h3>
            </div>
          </div>
          <div className="dashboard-empty-state px-4 py-8 text-center">
          <div className="w-10 h-10 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-5 h-5 text-red-400"
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
          <p className="text-red-400 mb-3 text-sm font-medium">{error}</p>
          <button
            onClick={fetchUnreadConversations}
            className="cursor-pointer rounded-xl bg-tertiary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-tertiary-700"
          >
            Réessayer
          </button>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-panel dashboard-panel-featured h-[550px] overflow-y-auto custom-scrollbar p-4 lg:p-5">
      <div className="dashboard-panel-content">
        <div className="dashboard-card-header mb-5">
          <div>
            <span className="dashboard-card-kicker">Messagerie</span>
            <h3 className="dashboard-card-title mt-3">Messages non lus</h3>
            <p className="dashboard-card-subtitle">
              Les conversations qui demandent votre attention immédiatement.
            </p>
          </div>
          <div className="dashboard-count-pill">{conversations.length}</div>
        </div>

      {conversations.length === 0 ? (
        <div className="dashboard-empty-state px-4 py-10 text-center">
          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Aucun message non lu</p>
          <p className="text-gray-500 text-xs mt-1">
            Vous êtes à jour avec tous vos clients
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.conversationId}
              onClick={() =>
                handleConversationClick(conversation.conversationId)
              }
              className="dashboard-list-item cursor-pointer p-3.5 hover:border-tertiary-400/40"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {conversation.clientImage ? (
                    <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-tertiary-400/20">
                      <Image
                        src={conversation.clientImage}
                        alt={`${conversation.clientFirstName} ${conversation.clientLastName}`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 bg-gradient-to-br from-tertiary-400 to-tertiary-600 rounded-2xl flex items-center justify-center ring-2 ring-tertiary-400/20 shadow-lg shadow-tertiary-500/20">
                      <span className="text-white text-sm font-bold font-one">
                        {getClientInitials(
                          conversation.clientFirstName,
                          conversation.clientLastName,
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-white font-one font-semibold text-sm truncate">
                      {conversation.clientFirstName}{" "}
                      {conversation.clientLastName}
                    </h4>
                    {conversation.unreadCount > 0 && (
                      <span className="flex-shrink-0 rounded-full border border-tertiary-400/25 bg-tertiary-500/85 px-2.5 py-1 text-[10px] font-bold text-white font-one">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  {conversation.subject && (
                    <p className="text-white/60 text-[11px] font-one mb-1 italic truncate">
                      {conversation.subject}
                    </p>
                  )}

                  <p className="mb-1 line-clamp-2 rounded-xl bg-white/6 px-2.5 py-2 text-xs text-white/74 font-one">
                    {conversation.lastMessage?.content
                      ? truncateMessage(conversation.lastMessage.content)
                      : "Aucun message"}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-white/50 font-one">
                    <span>{formatDate(conversation.lastMessageAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
