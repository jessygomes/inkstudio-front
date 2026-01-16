/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface MessagingMessage {
  id: string;
  content: string;
  senderId: string;
  type: "USER" | "SYSTEM";
  isRead: boolean;
  readAt?: Date;
  createdAt: Date | string;
  attachments?: Array<{
    id: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadThingKey?: string;
  }>;
  sender: {
    id: string;
    firstName?: string;
    lastName?: string;
    salonName?: string;
    image?: string;
    role: string;
    email?: string;
  };
}

interface NewMessageEvent {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  type: "USER" | "SYSTEM";
  isRead: boolean;
  createdAt: Date;
  attachments?: Array<{
    id: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadThingKey?: string;
  }>;
  sender: any;
}

interface UserTypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
}

interface UnreadCountEvent {
  totalUnread: number;
}

export const useMessaging = (token?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MessagingMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const currentConversationIdRef = useRef<string | null>(null);

  // Initialiser la connexion Socket.IO
  useEffect(() => {
    // Ne pas initialiser tant qu'on n'a pas de token pour éviter les déconnexions "missing auth"
    if (!token || socketRef.current) return;

    const apiBase =
      process.env.NEXT_PUBLIC_BACK_URL || process.env.NEXT_PUBLIC_API_URL;
    const baseUrl = apiBase
      ? `${apiBase}/messaging`
      : "http://localhost:3000/messaging";

    const socket = io(baseUrl, {
      // Le gateway attend le JWT brut dans auth.token (pas de prefix Bearer)
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Événements de connexion
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion:", error?.message || error);
    });

    // Événement: compteur de messages non lus
    socket.on("unread-count-updated", (data: UnreadCountEvent) => {
      setUnreadCount(data.totalUnread);
    });

    // Événement: historique de la conversation
    socket.on(
      "conversation-history",
      (data: { conversationId: string; messages: MessagingMessage[] }) => {
        setMessages(data.messages.reverse()); // Inverser pour avoir les plus anciens d'abord
      }
    );

    // Événement: nouveau message
    socket.on("new-message", (message: NewMessageEvent) => {
      setMessages((prev) => [...prev, message]);

      // Si on est dans la conversation active et que le message est déjà marqué comme lu
      // (car on est présent), notifier le MessageList pour mettre à jour le compteur à 0
      if (
        currentConversationIdRef.current === message.conversationId &&
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(
          new CustomEvent("conversationUnreadUpdated", {
            detail: {
              conversationId: message.conversationId,
              unreadCount: 0,
            },
          })
        );
      }
    });

    // Événement: utilisateur en train d'écrire
    socket.on("user-typing", (data: UserTypingEvent) => {
      if (data.conversationId === currentConversationIdRef.current) {
        setTypingUsers((prev) => new Set([...prev, data.userId]));
      }
    });

    // Événement: utilisateur arrête d'écrire
    socket.on(
      "user-stopped-typing",
      (data: { conversationId: string; userId: string }) => {
        if (data.conversationId === currentConversationIdRef.current) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      }
    );

    // Événement: message marqué comme lu
    socket.on("message-read", (data: { messageId: string; readAt: Date }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        )
      );

      // Optimistic decrement of unread count locally + propagation
      setUnreadCount((prev) => {
        const next = Math.max(0, prev - 1);

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("unreadCountChanged", {
              detail: { count: next },
            })
          );
        }

        return next;
      });

      // Propager un événement global pour mettre à jour via refetch si besoin
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("messagesMarkedAsRead", {
            detail: { messageId: data.messageId },
          })
        );
      }
    });

    // Événement: compteur global de non lus mis à jour
    socket.on("unread-count-updated", (data: { totalUnread: number }) => {
      setUnreadCount(data.totalUnread);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("unreadCountChanged", {
            detail: { count: data.totalUnread },
          })
        );
      }
    });

    // Événement: compteur de non lus mis à jour pour une conversation spécifique
    socket.on(
      "conversation-unread-updated",
      (data: { conversationId: string; unreadCount: number }) => {
        // Mettre à jour localement la conversation spécifique
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("conversationUnreadUpdated", {
              detail: {
                conversationId: data.conversationId,
                unreadCount: data.unreadCount,
              },
            })
          );
        }
      }
    );

    // Événement: erreur
    socket.on("error", (data: { message: string }) => {
      console.error("❌ Erreur serveur:", data.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Mettre à jour le token d'authentification si disponible après l'initialisation
  useEffect(() => {
    // Si le token arrive après coup, met à jour l'auth puis reconnecte
    if (!socketRef.current || !token) return;

    socketRef.current.auth = { token };

    if (!socketRef.current.connected) {
      socketRef.current.connect();
    }
  }, [token]);

  // Rejoindre une conversation
  const joinConversation = useCallback((conversationId: string) => {
    if (!socketRef.current) return;
    setCurrentConversationId(conversationId);
    currentConversationIdRef.current = conversationId;
    setMessages([]); // Réinitialiser les messages
    setTypingUsers(new Set()); // Réinitialiser les typing indicators
    socketRef.current.emit("join-conversation", { conversationId });
  }, []);

  // Quitter une conversation
  const leaveConversation = useCallback((conversationId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("leave-conversation", { conversationId });
    setCurrentConversationId(null);
    currentConversationIdRef.current = null;
    setMessages([]);
    setTypingUsers(new Set());
  }, []);

  // Envoyer un message
  const sendMessage = useCallback(
    (conversationId: string, content: string, attachments: any[] = []) => {
      if (!socketRef.current || !isConnected) {
        console.error("❌ Socket non connecté");
        return;
      }
      socketRef.current.emit("send-message", {
        conversationId,
        content,
        attachments,
      });
    },
    [isConnected]
  );

  // Marquer un message comme lu
  const markAsRead = useCallback((messageId: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit("mark-as-read", { messageId });
  }, []);

  // Marquer toute une conversation comme lue
  const markConversationAsRead = useCallback((conversationId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("mark-conversation-as-read", { conversationId });
  }, []);

  // Indiquer que l'utilisateur tape (typing indicator)
  const startTyping = useCallback((conversationId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("user-typing", { conversationId });
  }, []);

  // Indiquer que l'utilisateur arrête de taper
  const stopTyping = useCallback((conversationId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("user-stopped-typing", { conversationId });
  }, []);

  return {
    isConnected,
    messages,
    typingUsers,
    unreadCount,
    currentConversationId,
    joinConversation,
    leaveConversation,
    sendMessage,
    markAsRead,
    markConversationAsRead,
    startTyping,
    stopTyping,
  };
};
