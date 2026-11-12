"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";
import { getAppNotificationsUnreadCount } from "@/lib/queries/notification-center";

/** Notification reçue en temps réel (extrait de ce que le backend envoie). */
export type IncomingNotification = { type?: string; category?: string };

interface NotificationCenterContextType {
  unread: number;
  setUnread: (count: number) => void;
  refresh: () => Promise<void>;
  /** Incrémenté à chaque rafraîchissement : le panneau ouvert relit sa liste quand il change. */
  version: number;
  /** La socket temps réel est connectée. */
  live: boolean;
  /** Être prévenu de chaque notification reçue en temps réel (retourne la fonction de désabonnement). */
  subscribe: (listener: (notification: IncomingNotification) => void) => () => void;
}

const NotificationCenterContext = createContext<NotificationCenterContextType | undefined>(undefined);

export function useNotificationCenter() {
  const ctx = useContext(NotificationCenterContext);
  if (!ctx) throw new Error("useNotificationCenter must be used within NotificationCenterProvider");
  return ctx;
}

const POLL_MS = 15000;
// Quand la socket est connectée le polling n'est plus qu'un filet de sécurité.
const POLL_CONNECTED_MS = 60000;

/** Compteur de notifications non lues : temps réel (socket.io), avec relecture de secours, au retour sur l'onglet et à la demande. */
export function NotificationCenterProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  const [live, setLive] = useState(false);
  const [unread, setUnread] = useState(0);
  const [version, setVersion] = useState(0);
  const listeners = useRef(new Set<(notification: IncomingNotification) => void>());
  const subscribe = useCallback((listener: (notification: IncomingNotification) => void) => {
    listeners.current.add(listener);
    return () => { listeners.current.delete(listener); };
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const count = await getAppNotificationsUnreadCount();
      setUnread((previous) => {
        if (previous !== count) setVersion((v) => v + 1);
        return count;
      });
    } catch {
      /* le prochain passage réessaiera */
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    void refresh();
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, live ? POLL_CONNECTED_MS : POLL_MS);
    const onVisible = () => { if (!document.hidden) void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [userId, refresh, live]);

  // Temps réel : le backend pousse chaque notification dans la salle de l'utilisateur.
  useEffect(() => {
    if (!userId || !accessToken) return;
    const apiBase = process.env.NEXT_PUBLIC_BACK_URL || process.env.NEXT_PUBLIC_API_URL;
    const socket = io(apiBase ? `${apiBase}/messaging` : "http://localhost:3000/messaging", {
      auth: { token: accessToken },
      withCredentials: true,
      transports: ["websocket", "polling"],
      tryAllTransports: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });
    socket.on("connect", () => { setLive(true); void refresh(); });
    socket.on("disconnect", () => setLive(false));
    socket.on("connect_error", () => setLive(false));
    // Nouvelle notification : le compteur est relu (et le panneau ouvert recharge sa liste via `version`).
    socket.on("notification-created", (notification: IncomingNotification) => {
      void refresh();
      setVersion((v) => v + 1);
      listeners.current.forEach((listener) => { try { listener(notification); } catch { /* un abonné défaillant ne bloque pas les autres */ } });
    });
    socket.on("notification-unread-count", (e: { unreadCount?: number }) => {
      if (typeof e?.unreadCount !== "number") return;
      setUnread((previous) => {
        if (previous !== e.unreadCount) setVersion((v) => v + 1);
        return e.unreadCount as number;
      });
    });
    return () => { socket.removeAllListeners(); socket.disconnect(); setLive(false); };
  }, [userId, accessToken, refresh]);

  const value = useMemo(() => ({ unread, setUnread, refresh, version, live, subscribe }), [unread, refresh, version, live, subscribe]);
  return <NotificationCenterContext.Provider value={value}>{children}</NotificationCenterContext.Provider>;
}
