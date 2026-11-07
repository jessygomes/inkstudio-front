"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { getAppNotificationsUnreadCount } from "@/lib/queries/notification-center";

interface NotificationCenterContextType {
  unread: number;
  setUnread: (count: number) => void;
  refresh: () => Promise<void>;
  /** Incrémenté à chaque rafraîchissement : le panneau ouvert relit sa liste quand il change. */
  version: number;
}

const NotificationCenterContext = createContext<NotificationCenterContextType | undefined>(undefined);

export function useNotificationCenter() {
  const ctx = useContext(NotificationCenterContext);
  if (!ctx) throw new Error("useNotificationCenter must be used within NotificationCenterProvider");
  return ctx;
}

const POLL_MS = 15000;

/** Compteur de notifications non lues : relu toutes les 15 s, au retour sur l'onglet et à la demande. */
export function NotificationCenterProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [unread, setUnread] = useState(0);
  const [version, setVersion] = useState(0);

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
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, POLL_MS);
    const onVisible = () => { if (!document.hidden) void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [userId, refresh]);

  const value = useMemo(() => ({ unread, setUnread, refresh, version }), [unread, refresh, version]);
  return <NotificationCenterContext.Provider value={value}>{children}</NotificationCenterContext.Provider>;
}
