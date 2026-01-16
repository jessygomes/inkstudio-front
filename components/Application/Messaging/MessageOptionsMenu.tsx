"use client";

import React, { useState, useRef, useEffect } from "react";
import { MdMoreVert, MdContentCopy } from "react-icons/md";
import DeleteMessageButton from "./DeleteMessageButton";

interface AttachmentDto {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

interface MessageOptionsMenuProps {
  messageId: string;
  conversationId: string;
  messageContent: string;
  attachments?: AttachmentDto[];
  onDelete?: (messageId: string) => void;
  isOwnMessage?: boolean;
}

export default function MessageOptionsMenu({
  messageId,
  conversationId,
  messageContent,
  attachments,
  onDelete,
  isOwnMessage,
}: MessageOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageContent);
    setIsOpen(false);
    // TODO: Ajouter un toast de confirmation
    console.log("Message copié");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer p-1 rounded-full hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Options du message"
      >
        <MdMoreVert className="w-4 h-4 text-white/60" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-6 z-50 min-w-[140px] bg-noir-700 border border-white/10 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={handleCopy}
            className="cursor-pointer flex items-center gap-2 w-full px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5 transition-colors"
          >
            <MdContentCopy className="w-4 h-4" />
            <span>Copier</span>
          </button>

          {isOwnMessage && (
            <DeleteMessageButton
              messageId={messageId}
              conversationId={conversationId}
              attachments={attachments}
              onDelete={onDelete}
            />
          )}
        </div>
      )}
    </div>
  );
}
