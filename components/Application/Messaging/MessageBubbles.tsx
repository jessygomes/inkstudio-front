import React from "react";
import Image from "next/image";
import { MdOutlineMessage } from "react-icons/md";
import { ConversationMessageDto } from "@/lib/queries/conversation.action";
import MessageOptionsMenu from "./MessageOptionsMenu";

interface MessageBubblesProps {
  messages: ConversationMessageDto[];
  currentUserId?: string;
  onDeleteMessage?: (messageId: string) => void;
}

export default function MessageBubbles({
  messages,
  currentUserId,
  onDeleteMessage,
}: MessageBubblesProps) {
  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MdOutlineMessage className="w-10 h-10 text-white/20 mx-auto mb-2" />
          <p className="text-white/40 font-one text-xs">Aucun message</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {messages.map((message) => {
        const isOwnMessage = message.sender.id === currentUserId;

        const sender = message.sender;

        return (
          <div
            key={message.id}
            className={`flex gap-2 group ${
              isOwnMessage ? "justify-end" : "justify-start"
            }`}
          >
            {!isOwnMessage && (
              <Image
                src={sender?.image || "/images/default-avatar.png"}
                width={28}
                height={28}
                alt={sender?.firstName || "User"}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-tertiary-400/20"
              />
            )}

            <div
              className={`flex flex-col ${
                isOwnMessage ? "items-end" : "items-start"
              } max-w-xs`}
            >
              <div className="flex items-start gap-1">
                <div
                  className={`px-3 py-2 rounded text-xs ${
                    isOwnMessage
                      ? "bg-linear-to-l from-secondary-500/80 to-secondary-600/80 text-white/90 rounded-br-none"
                      : "bg-linear-to-l from-tertiary-400/80 to-tertiary-500/80 text-white rounded-bl-none"
                  }`}
                >
                  <p className="break-words font-one leading-tight">
                    {message.content}
                  </p>

                  {/* Images attachées */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments
                        .filter((att) => att.fileType.startsWith("image/"))
                        .map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative rounded overflow-hidden hover:opacity-80 transition-opacity"
                          >
                            <Image
                              src={attachment.fileUrl}
                              alt={attachment.fileName}
                              width={200}
                              height={200}
                              className="w-full h-auto max-w-[180px] rounded"
                            />
                          </a>
                        ))}
                    </div>
                  )}

                  {/* Autres fichiers attachés */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {message.attachments
                        .filter((att) => !att.fileType.startsWith("image/"))
                        .map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] hover:underline opacity-90"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M8 16.5a1 1 0 11-2 0 1 1 0 012 0zM15 7a2 2 0 11-4 0 2 2 0 014 0zM12.5 20H2a2 2 0 01-2-2V4a2 2 0 012-2h7l5.495 5.495a1 1 0 010 1.414L9.414 16.5a1 1 0 001.414 1.414l8.485-8.485A2 2 0 0120 6V4a2 2 0 01-2-2h-5.5A1.5 1.5 0 0012 4v16a1.5 1.5 0 00.5 1z" />
                            </svg>
                            {attachment.fileName}
                          </a>
                        ))}
                    </div>
                  )}
                </div>

                <MessageOptionsMenu
                  messageId={message.id}
                  conversationId={message.conversationId}
                  messageContent={message.content}
                  attachments={message.attachments}
                  onDelete={onDeleteMessage}
                  isOwnMessage={isOwnMessage}
                />
              </div>

              <span className="text-[10px] text-white/40 mt-0.5 px-1">
                {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              {message.type && message.type === "SYSTEM" && (
                <span className="text-[9px] text-gray-500/50 mt-0.5">
                  Message système
                </span>
              )}
            </div>

            {isOwnMessage && (
              <Image
                src={sender?.image || "/images/default-avatar.png"}
                width={28}
                height={28}
                alt={sender?.firstName || "You"}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-tertiary-400/20"
              />
            )}
          </div>
        );
      })}
    </>
  );
}
