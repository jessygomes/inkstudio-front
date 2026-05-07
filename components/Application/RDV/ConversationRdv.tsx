"use client";

interface ConversationRdvProps {
  conversationId: string;
}

export default function ConversationRdv({ conversationId }: ConversationRdvProps) {
  return (
    <button
      onClick={() => {
        window.location.href = `/messagerie/${conversationId}`;
      }}
      className="w-full cursor-pointer px-2 py-2.5 text-teal-300 hover:text-teal-200 text-xs font-one font-medium transition-colors duration-200 flex items-center justify-center gap-1.5 hover:bg-white/6"
      title="Rejoindre la conversation"
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
      <span>Messagerie</span>
    </button>
  );
}
