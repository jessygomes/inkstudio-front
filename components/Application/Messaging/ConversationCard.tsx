import Image from "next/image";
import {
  ConversationDto,
  getConversationByIdAction,
} from "@/lib/queries/conversation.action";
import { useState } from "react";
import Link from "next/link";

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
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
        isLoading ? "opacity-50" : ""
      } ${
        isSelected
          ? "bg-noir-700/80 border-tertiary-400/50 shadow-lg shadow-tertiary-400/20"
          : "bg-noir-700/40 border-white/10 hover:bg-noir-700/60 hover:border-white/20"
      }`}
    >
      <div className="flex gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          <Image
            src={otherUser?.image || "/images/default-avatar.png"}
            width={56}
            height={56}
            alt={displayName}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-tertiary-400/30"
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
            <h3 className="text-sm sm:text-base font-semibold text-white truncate">
              {displayName}
            </h3>
            <span className="text-xs text-white/60 whitespace-nowrap">
              {timeString}
            </span>
          </div>

          {/* Subject */}
          {conversation.subject && (
            <p className="text-xs sm:text-sm text-tertiary-400 truncate mt-1">
              {conversation.subject}
            </p>
          )}

          {/* Last message preview */}
          <p className="text-xs sm:text-sm text-white/70 line-clamp-2 mt-2">
            {lastMessagePreview}
          </p>

          {/* Status badge */}
          <div className="flex items-center gap-2 mt-2">
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

            {/* Unread indicator */}
            {conversation.unreadCount && conversation.unreadCount > 0 && (
              <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-tertiary-500 text-white">
                {conversation.unreadCount}
              </span>
            )}

            <Link href={`/messagerie/${conversation.id}`}>
              Voir la conversation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
