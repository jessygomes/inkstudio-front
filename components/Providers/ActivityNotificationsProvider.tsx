"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationCenter } from "@/components/Providers/NotificationCenterProvider";
import NotificationBadge from "@/components/Shared/NotificationBadge";
import { getRecentActivity, type ActivityKind, type ActivityItem } from "@/lib/queries/activity-notifications";

// Événements qui changent les pastilles « nouveau » (rendez-vous pris ou annulé par un client, avis, suivi de cicatrisation).
const ACTIVITY_EVENTS = new Set(["appointment.created", "appointment.cancelled_by_client", "review.new", "followup.reply"]);

type ReadState = { since: number; read: Record<string, true> };
const Context = createContext<{
  count: (kind: ActivityKind) => number;
  isNew: (kind: ActivityKind, id: string) => boolean;
  markRead: (kind: ActivityKind, id: string) => void;
} | null>(null);
export function useActivityNotifications() {
  const context = useContext(Context);
  if (!context) throw new Error("ActivityNotificationsProvider manquant");
  return context;
}

export function ActivityNotificationsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  // Remount on account changes, so one account never inherits another's badges.
  return <AccountNotifications key={session?.user?.id || "anonymous"} userId={session?.user?.id} enabled={!!session?.user?.id && !session.error}>{children}</AccountNotifications>;
}

function AccountNotifications({ children, userId, enabled }: { children: React.ReactNode; userId?: string; enabled: boolean }) {
  const key = `inkera:activity:v1:${userId}`;
  const queryClient = useQueryClient();
  const { live, subscribe } = useNotificationCenter();
  const [state, setState] = useState<ReadState | null>(null);
  useEffect(() => {
    const read = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(key) || "null");
        if (saved && typeof saved.since === "number" && saved.read && typeof saved.read === "object") { setState(saved); return; }
      } catch { /* Storage may be unavailable. Keep the state in memory. */ }
      const initial = { since: Date.now() - 7 * 86400000, read: {} };
      setState(initial);
      try { localStorage.setItem(key, JSON.stringify(initial)); } catch {}
    };
    read();
    const sync = (event: StorageEvent) => { if (event.key === key) read(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key]);

  // Une seule requête légère (id et date des nouveautés depuis `since`, 30 jours au plus) pour les trois types de pastilles.
  const since = state?.since;
  const activity = useQuery({ queryKey: ["activity", userId, since], queryFn: () => getRecentActivity(since!), enabled: enabled && since !== undefined, refetchInterval: live ? 300000 : 60000, refetchOnWindowFocus: true });
  // Temps réel : un nouveau rendez-vous client, une annulation par le client, un avis ou un suivi relit tout de suite les pastilles ;
  // le polling n'est plus qu'un filet de sécurité (5 min tant que la socket est connectée, 1 min sinon).
  useEffect(() => subscribe((notification) => {
    if (notification.type && ACTIVITY_EVENTS.has(notification.type)) void queryClient.invalidateQueries({ queryKey: ["activity", userId] });
  }), [subscribe, queryClient, userId]);
  const data: Record<ActivityKind, ActivityItem[]> = { appointments: activity.data?.appointments || [], followUps: activity.data?.followUps || [], reviews: activity.data?.reviews || [] };
  const unread = Object.fromEntries(Object.entries(data).map(([kind, items]) => [kind,
    new Set(items.filter(item => state && !state.read[`${kind}:${item.id}`] && Date.parse(item.createdAt) >= state.since).map(item => item.id)),
  ])) as Record<ActivityKind, Set<string>>;
  const isNew = (kind: ActivityKind, id: string) => unread[kind].has(id);
  const markRead = useCallback((kind: ActivityKind, id: string) => {
    setState(current => {
      if (!current) return current;
      let latest = current;
      try { const saved = JSON.parse(localStorage.getItem(key) || "null"); if (saved?.since === current.since && saved.read) latest = saved; } catch {}
      const next = { ...current, read: { ...current.read, ...latest.read, [`${kind}:${id}`]: true as const } };
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  const count = (kind: ActivityKind) => unread[kind].size;
  return <Context.Provider value={{ count, isNew, markRead }}>{children}</Context.Provider>;
}

export function ActivityBadge({ kind }: { kind: ActivityKind }) {
  const { count } = useActivityNotifications();
  const value = count(kind);
  return <NotificationBadge count={value} />;
}

export function activityKindForHref(href: string): ActivityKind | undefined {
  return href === "/mes-rendez-vous" ? "appointments" : href === "/clients" ? "followUps" : href === "/review" ? "reviews" : undefined;
}
