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

  const hasUnread = !!(conversation.unreadCount && conversation.unreadCount > 0);

  return (
    <div
      onClick={handleSelect}
      className={`group relative cursor-pointer rounded-2xl border transition-all duration-200 overflow-hidden
        ${isLoading ? "pointer-events-none opacity-50" : ""}
        ${isSelected
          ? "border-tertiary-400/40 bg-tertiary-400/10 shadow-lg shadow-tertiary-500/10"
          : hasUnread
          ? "border-tertiary-400/50 bg-tertiary-400/5 hover:border-tertiary-400/70 hover:bg-tertiary-400/8"
          : "border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/6"
        }`}
    >
      {/* Unread accent line */}
      {hasUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-tertiary-400 to-tertiary-500 rounded-l-2xl" />
      )}

      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Image
            src={otherUser?.image || "/images/default-avatar.png"}
            width={36}
            height={36}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-tertiary-400/30 transition-all duration-200"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-tertiary-400/40 border-t-tertiary-400" />
            </div>
          )}
          {hasUnread && !isLoading && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-tertiary-400 to-tertiary-500 ring-1 ring-noir-700" />
          )}
        </div>

        {/* Centre — nom + aperçu */}
        <div className="min-w-0 flex-1 font-one">
          <div className="flex items-baseline gap-2">
            <h3 className={`truncate text-xs font-semibold ${hasUnread ? "text-white" : "text-white/75"}`}>
              {displayName}
            </h3>
            {conversation.subject && (
              <span className="flex-shrink-0 whitespace-nowrap text-[12px] text-tertiary-500/90">
                {conversation.subject}
              </span>
            )}
          </div>
          <p className={`truncate text-[12px] leading-snug ${hasUnread ? "text-white/60" : "text-white/35"}`}>
            {lastMessagePreview}
          </p>
        </div>

        {/* Droite — time + badges + actions */}
        <div className="flex flex-shrink-0 gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/35">{timeString}</span>
            {hasUnread && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-1 text-[9px] font-bold text-white">
                {conversation.unreadCount! > 99 ? "99+" : conversation.unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Status dot */}
            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
              localStatus === "ACTIVE" ? "bg-emerald-400" : localStatus === "ARCHIVED" ? "bg-amber-400" : "bg-red-400"
            }`} />
            <Link
              href={`/messagerie/${conversation.id}`}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl border border-tertiary-400/25 bg-tertiary-400/10 px-2 py-0.5 text-[10px] font-medium text-tertiary-500 transition-all duration-200 hover:bg-tertiary-400/20"
            >
              Ouvrir
            </Link>
            <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
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
