import React from "react";
import Image from "next/image";
import { ConversationDto } from "@/lib/queries/conversation.action";
import ConversationRDVDetails from "./ConversationRDVDetails";

interface ConversationRDVModalProps {
  conversation: ConversationDto;
  onClose: () => void;
}

export default function ConversationRDVModal({
  conversation,
  onClose,
}: ConversationRDVModalProps) {
  return (
    <div
      className="lg:hidden fixed inset-0 z-50 bg-noir-700 overflow-hidden"
      style={{
        height: "100dvh",
        width: "100vw",
      }}
    >
      <div className="w-full h-full">
        <div className="w-full h-full bg-gradient-to-br from-noir-500 to-noir-600 overflow-hidden flex flex-col min-h-0">
          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <ConversationRDVDetails conversation={conversation} />
          </div>

          {/* Footer mobile */}
          <div className="p-4 border-t border-white/10 bg-white/5 flex-shrink-0">
            <button
              onClick={onClose}
              className="cursor-pointer w-full py-3 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
