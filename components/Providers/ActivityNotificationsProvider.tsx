"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import NotificationBadge from "@/components/Shared/NotificationBadge";
import { getActivityNotifications, type ActivityKind, type ActivityItem } from "@/lib/queries/activity-notifications";

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

  const appointments = useQuery({ queryKey: ["activity", userId, "appointments"], queryFn: () => getActivityNotifications("appointments"), enabled, refetchInterval: 60000, refetchOnWindowFocus: true });
  const followUps = useQuery({ queryKey: ["activity", userId, "followUps"], queryFn: () => getActivityNotifications("followUps"), enabled, refetchInterval: 60000, refetchOnWindowFocus: true });
  const reviews = useQuery({ queryKey: ["activity", userId, "reviews"], queryFn: () => getActivityNotifications("reviews"), enabled, refetchInterval: 60000, refetchOnWindowFocus: true });
  const data: Record<ActivityKind, ActivityItem[]> = { appointments: appointments.data || [], followUps: followUps.data || [], reviews: reviews.data || [] };
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
