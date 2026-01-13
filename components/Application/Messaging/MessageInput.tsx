import React, { useState } from "react";
import { MdSend } from "react-icons/md";

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  className?: string;
  onInputChange?: (value: string) => void;
  disabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  className = "",
  onInputChange,
  disabled = false,
}: MessageInputProps) {
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setSendingMessage(true);
    try {
      await onSendMessage(messageInput.trim());
      setMessageInput("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => {
            setMessageInput(e.target.value);
            onInputChange?.(e.target.value);
          }}
          placeholder="Message..."
          className="flex-1 bg-noir-700 border border-white/20 rounded px-3 py-1.5 text-white placeholder-white/50 focus:outline-none focus:border-tertiary-400/50 transition-colors text-xs"
          disabled={sendingMessage || disabled}
        />
        <button
          type="submit"
          disabled={sendingMessage || disabled || !messageInput.trim()}
          className="cursor-pointer bg-tertiary-500 hover:bg-tertiary-600 disabled:bg-tertiary-500/50 text-white px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1 text-xs flex-shrink-0"
        >
          {sendingMessage ? (
            <div className="w-3 h-3 border-2 border-white/50 rounded-full animate-spin border-t-white"></div>
          ) : (
            <MdSend className="w-3 h-3" />
          )}
        </button>
      </form>
    </div>
  );
}
