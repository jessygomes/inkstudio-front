import Image from "next/image";
import {
  ConversationDto,
  getConversationByIdAction,
} from "@/lib/queries/conversation.action";
import { useEffect, useState } from "react";
import Link from "next/link";
import ArchiveBtn from "./ArchiveBtn";
import DeleteConversationBtn from "./DeleteConversationBtn";

interface ConversationCardProps {
  conversation: ConversationDto;
  isSelected: boolean;
  onSelect: (conversation: ConversationDto) => void;
  currentUserId?: string;
}

export default function ConversationCard({
  conversation,
  isSelected,
  onSelect,
  currentUserId,
}: ConversationCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(conversation.status);

  // Sync local status if conversation prop changes (e.g., refetch)
  useEffect(() => {
    setLocalStatus(conversation.status);
  }, [conversation.status]);

  const handleSelect = async () => {
    try {
      setIsLoading(true);
      const fullConversation = await getConversationByIdAction(conversation.id);
      onSelect(fullConversation);
    } catch (error) {
      console.error("Erreur lors du chargement de la conversation:", error);
      // En cas d'erreur, on sélectionne quand même la conversation avec les données actuelles
      onSelect(conversation);
    } finally {
      setIsLoading(false);
    }
  };

  const otherUser =
    conversation.salonId === currentUserId
      ? conversation.client
      : conversation.salon;

  const displayName =
    otherUser?.salonName ||
    `${otherUser?.firstName || "Unknown"} ${otherUser?.lastName || ""}`.trim();

  const lastMessagePreview = conversation.lastMessage?.content
    ? conversation.lastMessage.content.substring(0, 100) +
      (conversation.lastMessage.content.length > 100 ? "..." : "")
    : "Aucun message";

  const lastMessageTime = new Date(conversation.lastMessageAt);
  const isToday = lastMessageTime.toDateString() === new Date().toDateString();
  const timeString = isToday
    ? lastMessageTime.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : lastMessageTime.toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
      });

  return (
    <div
      onClick={handleSelect}
      className={`p-3 sm:p-3 rounded-lg border transition-all duration-150 ${
        isLoading ? "opacity-50" : ""
      } ${
        isSelected
          ? "bg-noir-700/80 border-tertiary-400/20 shadow-md "
          : "bg-noir-700/30 border-white/10 hover:bg-noir-700/50 hover:border-white/15"
      }`}
    >
      <div className="flex gap-3 sm:gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          <Image
            src={otherUser?.image || "/images/default-avatar.png"}
            width={56}
            height={56}
            alt={displayName}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-tertiary-400/30"
          />
          {isLoading && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-tertiary-400/50 rounded-full animate-spin border-t-tertiary-400"></div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 font-one">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
            <h3 className="text-sm sm:text-sm font-semibold text-white truncate">
              {displayName}
            </h3>
            <span className="text-xs text-white/60 whitespace-nowrap">
              {timeString}
            </span>
          </div>

          {/* Subject */}
          {conversation.subject && (
            <p className="text-xs text-tertiary-400 truncate mt-1">
              {conversation.subject}
            </p>
          )}

          {/* Last message preview */}
          <div className="w-full flex gap-2 items-center mt-2">
            <p
              className={`flex-1 text-xs text-white/70 truncate p-2 rounded-md ${
                conversation.unreadCount && conversation.unreadCount > 0
                  ? "bg-tertiary-500/15"
                  : "bg-primary-500/5"
              }`}
            >
              {lastMessagePreview}
            </p>
            {conversation.unreadCount && conversation.unreadCount > 0 && (
              <span className="flex-shrink-0 px-2 py-1 rounded-md text-[10px] bg-linear-to-r from-tertiary-500 to-tertiary-400 text-white whitespace-nowrap">
                {conversation.unreadCount} non lu
                {conversation.unreadCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Status badge */}
          <div className="flex justify-between items-center gap-2 mt-2">
            <div className="flex gap-2 items-center">
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  localStatus === "ACTIVE"
                    ? "bg-green-900/40 text-green-300"
                    : localStatus === "ARCHIVED"
                    ? "bg-yellow-900/40 text-yellow-300"
                    : "bg-red-900/40 text-red-300"
                }`}
              >
                {localStatus}
              </span>

              <Link href={`/messagerie/${conversation.id}`}>
                <span className="inline-block px-2 py-1 rounded-sm text-xs bg-linear-to-l from-tertiary-400 to-tertiary-500 text-white">
                  Voir la conversation
                </span>
              </Link>

              {/* Unread indicator */}
              {/* {conversation.unreadCount && conversation.unreadCount > 0 && (
                <span className="inline-block px-2 py-1 rounded-md text-xs bg-tertiary-500 text-white">
                  {conversation.unreadCount}
                </span>
              )} */}
            </div>

            <div className="flex gap-2 items-center">
              <ArchiveBtn
                conversationId={conversation.id}
                status={localStatus}
                onStatusChange={(next) => setLocalStatus(next)}
              />
              <DeleteConversationBtn conversationId={conversation.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
