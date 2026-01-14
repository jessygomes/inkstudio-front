/* eslint-disable react/no-unescaped-entities */
"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useParams } from "next/navigation";
import {
  AttachmentDto,
  ConversationDto,
  ConversationMessageDto,
  getConversationByIdAction,
} from "@/lib/queries/conversation.action";
import { useSession } from "next-auth/react";
import Image from "next/image";
import ConversationRDVDetails from "./ConversationRDVDetails";
import MessageBubbles from "./MessageBubbles";
import MessageInput from "./MessageInput";
import ConversationRDVModal from "./ConversationRDVModal";
import { MessagingMessage, useMessaging } from "@/lib/hook/useMessaging";
import ArchiveBtn from "./ArchiveBtn";
import DeleteConversationBtn from "./DeleteConversationBtn";

export default function Conversation() {
  const params = useParams();
  const id = params?.id as string;
  const { data: session } = useSession();

  console.log("User dans Conversation.tsx :", session);

  const [conversation, setConversation] = useState<ConversationDto | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRDVDetails, setShowRDVDetails] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [deletedMessageIds, setDeletedMessageIds] = useState<Set<string>>(
    new Set()
  );
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialMessages = useMemo(
    () => conversation?.messages?.data || [],
    [conversation?.messages?.data]
  );

  const fetchConversation = useCallback(async () => {
    if (!id) {
      setError("ID manquant");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getConversationByIdAction(id);
      setConversation(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error("Erreur lors du chargement de la conversation:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  const {
    isConnected,
    messages: liveMessages,
    typingUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
  } = useMessaging(session?.accessToken);

  // Rejoindre la conversation une fois chargée et socket connecté
  useEffect(() => {
    if (!conversation?.id || !isConnected) return;

    joinConversation(conversation.id);

    return () => {
      leaveConversation(conversation.id);
    };
  }, [conversation?.id, isConnected, joinConversation, leaveConversation]);

  // Marquer les messages comme lus lorsque reçus
  useEffect(() => {
    if (!conversation?.id || !isConnected) return;

    const messagesToCheck = liveMessages.length
      ? liveMessages
      : initialMessages;

    messagesToCheck.forEach(
      (msg: MessagingMessage | ConversationMessageDto) => {
        const senderId = "sender" in msg ? msg.sender.id : undefined;
        const isAlreadyRead = "isRead" in msg ? msg.isRead : false;

        if (!isAlreadyRead && senderId && senderId !== session?.user?.id) {
          markAsRead(msg.id);
        }
      }
    );
  }, [
    conversation?.id,
    liveMessages,
    initialMessages,
    session?.user?.id,
    markAsRead,
    isConnected,
  ]);

  // Nettoyer le typing indicator au démontage
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (conversation?.id) {
        stopTyping(conversation.id);
      }
    };
  }, [conversation?.id, stopTyping]);

  const otherUser =
    conversation?.salonId === session?.user?.id
      ? conversation?.client
      : conversation?.salon;

  const handleSendMessage = async (
    message: string,
    attachments?: AttachmentDto[]
  ) => {
    if (!conversation?.id) return;

    // Envoyer le message au serveur
    sendMessage(conversation.id, message, attachments);

    if (isTyping) {
      stopTyping(conversation.id);
      setIsTyping(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleInputChange = (value: string) => {
    if (!conversation?.id) return;

    if (!isTyping) {
      startTyping(conversation.id);
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversation.id);
      setIsTyping(false);
    }, 2000);
  };

  const liveMessagesAsDto: ConversationMessageDto[] = liveMessages.map(
    (msg) => ({
      id: msg.id,
      content: msg.content,
      createdAt:
        typeof msg.createdAt === "string"
          ? msg.createdAt
          : msg.createdAt.toISOString(),
      conversationId: conversation?.id || "",
      type: msg.type,
      isRead: msg.isRead,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attachments: "attachments" in msg ? (msg as any).attachments : [],
      sender: {
        id: msg.sender.id,
        firstName: msg.sender.firstName || "",
        lastName: msg.sender.lastName || "",
        email: msg.sender.email || "",
        image: msg.sender.image,
        salonName: msg.sender.salonName,
        role: msg.sender.role,
      },
    })
  );

  const handleDeleteMessage = useCallback((messageId: string) => {
    setDeletedMessageIds((prev) => new Set(prev).add(messageId));
  }, []);

  const displayedMessages = (
    liveMessagesAsDto.length > 0 ? liveMessagesAsDto : initialMessages
  ).filter((msg) => !deletedMessageIds.has(msg.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
          <p className="text-white font-one">
            Chargement de la conversation...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-noir-700 rounded-xl border border-white/20 p-6">
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
            onClick={fetchConversation}
            className="cursor-pointer px-4 py-2 bg-tertiary-600 text-white rounded-lg hover:bg-tertiary-700 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="w-full bg-noir-700 rounded-xl border border-white/20 p-6">
        <div className="text-center py-8">
          <p className="text-white/70 font-one">Aucune conversation trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Version Mobile */}
      <div className="lg:hidden w-full flex flex-col h-[calc(100vh-64px)]">
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col gap-2 bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-3 rounded-lg shadow-lg border border-white/10">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <Image
                src={otherUser?.image || "/images/default-avatar.png"}
                width={40}
                height={40}
                alt={
                  otherUser?.salonName ||
                  `${otherUser?.firstName} ${otherUser?.lastName}`
                }
                className="w-10 h-10 rounded-full object-cover border border-tertiary-400/30"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-white font-one truncate">
                {otherUser?.salonName ||
                  `${otherUser?.firstName} ${otherUser?.lastName}`}
              </h1>
              <p className="text-white/60 text-xs font-one truncate">
                {conversation.subject}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                conversation.status === "ACTIVE"
                  ? "bg-green-900/40 text-green-300"
                  : conversation.status === "ARCHIVED"
                  ? "bg-yellow-900/40 text-yellow-300"
                  : "bg-red-900/40 text-red-300"
              }`}
            >
              {conversation.status}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium ${
                isConnected
                  ? "bg-green-900/40 text-green-300"
                  : "bg-red-900/40 text-red-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-300" : "bg-red-400"
                } animate-pulse`}
              />
              {isConnected ? "Connecté" : "Déconnecté"}
            </span>

            <ArchiveBtn
              conversationId={conversation.id}
              status={conversation.status}
            />

            <DeleteConversationBtn conversationId={conversation.id} />

            {/* Bouton pour voir les détails RDV (mobile uniquement) */}
            {conversation.appointmentId && (
              <button
                onClick={() => setShowRDVDetails(true)}
                className="lg:hidden cursor-pointer p-2 bg-tertiary-500/20 hover:bg-tertiary-500/30 text-tertiary-400 rounded-lg transition-colors border border-tertiary-400/30"
                title="Voir les détails du rendez-vous"
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Messages List - Scrollable avec padding bas pour l'input fixe */}
        <div className="flex-1 overflow-y-auto p-3 pb-20 space-y-2 scrollbar-thin scrollbar-thumb-tertiary-500/30 scrollbar-track-transparent bg-noir-700/50">
          <MessageBubbles
            messages={displayedMessages}
            currentUserId={session?.user?.id ?? undefined}
            onDeleteMessage={handleDeleteMessage}
          />

          {typingUsers.size > 0 && (
            <div className="flex items-center gap-2 text-white/60 text-[11px] px-1">
              <span>Quelqu'un est en train d'écrire...</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area Mobile - Fixed au dessus de la navbar */}
        <MessageInput
          onSendMessage={handleSendMessage}
          onInputChange={handleInputChange}
          disabled={!isConnected}
          className="fixed bottom-18 left-0 right-0 border-t border-white/10 bg-noir-800/95 backdrop-blur-md p-3 z-40"
        />
      </div>

      {/* Version Desktop */}
      <div className="hidden lg:flex w-full flex-row gap-3 h-[600px]">
        {/* Messages Section - Gauche */}
        <div className="w-3/5 flex flex-col gap-3 h-full">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-3 rounded-lg shadow-lg border border-white/10">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Image
                  src={otherUser?.image || "/images/default-avatar.png"}
                  width={40}
                  height={40}
                  alt={
                    otherUser?.salonName ||
                    `${otherUser?.firstName} ${otherUser?.lastName}`
                  }
                  className="w-10 h-10 rounded-full object-cover border border-tertiary-400/30"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-bold text-white font-one truncate">
                  {otherUser?.salonName ||
                    `${otherUser?.firstName} ${otherUser?.lastName}`}
                </h1>
                <p className="text-white/60 text-xs font-one truncate">
                  {conversation.subject}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  conversation.status === "ACTIVE"
                    ? "bg-green-900/40 text-green-300"
                    : conversation.status === "ARCHIVED"
                    ? "bg-yellow-900/40 text-yellow-300"
                    : "bg-red-900/40 text-red-300"
                }`}
              >
                {conversation.status}
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium ${
                  isConnected
                    ? "bg-green-900/40 text-green-300"
                    : "bg-red-900/40 text-red-300"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-300" : "bg-red-400"
                  } animate-pulse`}
                />
                {isConnected ? "Connecté" : "Déconnecté"}
              </span>

              <ArchiveBtn
                conversationId={conversation.id}
                status={conversation.status}
              />

              <DeleteConversationBtn conversationId={conversation.id} />
            </div>
          </div>

          {/* Messages Container */}
          <div className="bg-noir-700/50 border border-white/10 rounded-lg overflow-hidden flex flex-col flex-1 min-h-0">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-tertiary-500/30 scrollbar-track-transparent">
              <MessageBubbles
                messages={displayedMessages}
                currentUserId={session?.user?.id ?? undefined}
                onDeleteMessage={handleDeleteMessage}
              />

              {typingUsers.size > 0 && (
                <div className="flex items-center gap-2 text-white/60 text-[11px] px-1">
                  <span>Quelqu'un est en train d'écrire...</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area Desktop */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onInputChange={handleInputChange}
              disabled={!isConnected}
              className="flex-shrink-0 border-t border-white/10 bg-noir-800/95 backdrop-blur-sm p-2"
            />
          </div>
        </div>

        {/* RDV Details Section - Droite */}
        <div className="w-2/5">
          <ConversationRDVDetails conversation={conversation} />
        </div>
      </div>

      {/* Modal RDV Details (Mobile uniquement) */}
      {showRDVDetails && (
        <ConversationRDVModal
          conversation={conversation}
          onClose={() => setShowRDVDetails(false)}
        />
      )}
    </>
  );
}
