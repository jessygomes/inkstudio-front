"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ConversationDto } from "@/lib/queries/conversation.action";

interface MessagingContextType {
  unreadCount: number;
  conversations: ConversationDto[];
  updateConversationUnreadCount: (
    conversationId: string,
    unreadCount: number
  ) => void;
  setConversations: React.Dispatch<React.SetStateAction<ConversationDto[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(
  undefined
);

export const useMessagingContext = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error(
      "useMessagingContext must be used within MessagingProvider"
    );
  }
  return context;
};

interface MessagingProviderProps {
  children: ReactNode;
}

export const MessagingProvider = ({ children }: MessagingProviderProps) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [conversations, setConversations] = useState<ConversationDto[]>([]);

  // Fonction pour mettre à jour le unreadCount d'une conversation spécifique
  const updateConversationUnreadCount = useCallback(
    (conversationId: string, newUnreadCount: number) => {
      setConversations((prev) => {
        const updatedConversations = prev.map((convo) =>
          convo.id === conversationId
            ? { ...convo, unreadCount: newUnreadCount }
            : convo
        );

        // Recalculer le compteur total UNIQUEMENT quand on met à jour une conversation
        // (pour les mises à jour temps réel)
        // const totalUnread = updatedConversations.reduce(
        //   (count, convo) => count + (convo.unreadCount || 0),
        //   0
        // );

        return updatedConversations;
      });
    },
    [] // setConversations est stable, pas besoin de le mettre en dépendance
  );

  // Recalculer automatiquement le total quand conversations change
  // (mais seulement si elle n'est pas vide, pour éviter d'écraser avec 0)
  useEffect(() => {
    if (conversations.length > 0) {
      const totalUnread = conversations.reduce(
        (count, convo) => count + (convo.unreadCount || 0),
        0
      );
      setUnreadCount(totalUnread);
    }
  }, [conversations]);

  // Écouter les événements globaux - une seule fois au montage
  useEffect(() => {
    const handleUnreadCountChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ count: number }>;
      setUnreadCount(customEvent.detail.count);
    };

    const handleConversationUnreadUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        conversationId: string;
        unreadCount: number;
      }>;
      const { conversationId, unreadCount: newUnreadCount } =
        customEvent.detail;
      updateConversationUnreadCount(conversationId, newUnreadCount);
    };

    window.addEventListener("unreadCountChanged", handleUnreadCountChange);
    window.addEventListener(
      "conversationUnreadUpdated",
      handleConversationUnreadUpdated
    );

    return () => {
      window.removeEventListener("unreadCountChanged", handleUnreadCountChange);
      window.removeEventListener(
        "conversationUnreadUpdated",
        handleConversationUnreadUpdated
      );
    };
  }, [updateConversationUnreadCount]); // Ajouter la dépendance (stable grâce à useCallback)

  return (
    <MessagingContext.Provider
      value={{
        unreadCount,
        conversations,
        updateConversationUnreadCount,
        setConversations,
        setUnreadCount,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};
