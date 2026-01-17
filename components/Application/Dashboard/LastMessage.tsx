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
      <div className="bg-noir-700 rounded-xl border border-white/20 p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white font-one">
            Messages non lus
          </h3>
          <div className="w-4 h-4 border-2 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-slate-300/10 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  //! ERREUR
  if (error) {
    return (
      <div className="bg-noir-700 rounded-xl border border-white/20 p-4 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4 font-one">
          Messages non lus
        </h3>
        <div className="text-center py-6">
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
            className="cursor-pointer px-4 py-2 bg-tertiary-600 text-white rounded-lg hover:bg-tertiary-700 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[550px] bg-noir-700 rounded-xl border border-white/20 p-4 overflow-y-auto custom-scrollbar shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white font-one">
          Messages non lus
        </h3>
        <div className="px-2 py-1 bg-tertiary-500/20 text-tertiary-400 rounded-lg text-xs font-medium border border-tertiary-500/50">
          {conversations.length}
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-8">
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
              className="cursor-pointer border border-white/20 rounded-lg p-3 hover:bg-slate-400/10 transition-all duration-200 bg-slate-300/10 hover:border-tertiary-400/40"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {conversation.clientImage ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-tertiary-400/30">
                      <Image
                        src={conversation.clientImage}
                        alt={`${conversation.clientFirstName} ${conversation.clientLastName}`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-tertiary-400 to-tertiary-600 rounded-full flex items-center justify-center ring-2 ring-tertiary-400/30">
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
                      <span className="flex-shrink-0 px-2 py-0.5 bg-tertiary-500 text-white rounded-full text-[10px] font-bold font-one">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  {conversation.subject && (
                    <p className="text-white/60 text-[11px] font-one mb-1 italic truncate">
                      {conversation.subject}
                    </p>
                  )}

                  <p className="text-white/70 text-xs font-one mb-1 line-clamp-2 bg-gray-500/15 p-1 rounded-md">
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
  );
}
