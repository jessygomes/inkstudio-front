"use server";
import { getAuthHeaders } from "../session";

export type NotificationCategory = "appointments" | "messages" | "stock" | "followups" | "aftercare" | "salons" | "explorer" | "reviews" | "team" | "account";
export interface AppNotification {
  id: string;
  type: string;
  category: NotificationCategory;
  title: string;
  body: string;
  /** Identifiants pour ouvrir le bon écran (appointmentId, conversationId, ...). */
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}
export interface AppNotificationsPage { items: AppNotification[]; nextCursor: string | null; unreadCount: number }
export interface NotificationCategoryPrefs { categories: { category: NotificationCategory; inApp: boolean; push: boolean }[] }

const base = () => `${process.env.NEXT_PUBLIC_BACK_URL}/notifications`;

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${base()}${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) throw new Error("Notifications indisponibles");
  return res.json() as Promise<T>;
}

export async function listAppNotifications(opts: { cursor?: string | null; unreadOnly?: boolean } = {}): Promise<AppNotificationsPage> {
  const q = new URLSearchParams({ limit: "20" });
  if (opts.cursor) q.set("cursor", opts.cursor);
  if (opts.unreadOnly) q.set("unreadOnly", "true");
  return call(`?${q}`);
}
export async function getAppNotificationsUnreadCount(): Promise<number> {
  return (await call<{ unreadCount: number }>("/unread-count")).unreadCount;
}
export async function markAppNotificationRead(id: string) { return call<{ unreadCount: number }>(`/${encodeURIComponent(id)}/read`, { method: "PATCH" }); }
export async function markAllAppNotificationsRead() { return call<{ unreadCount: number }>("/read-all", { method: "POST" }); }
export async function removeAppNotification(id: string) { return call<{ unreadCount: number }>(`/${encodeURIComponent(id)}`, { method: "DELETE" }); }
export async function getNotificationCategoryPrefs() { return call<NotificationCategoryPrefs>("/preferences"); }
export async function setNotificationCategoryPref(category: NotificationCategory, patch: { inApp?: boolean; push?: boolean }) {
  return call<NotificationCategoryPrefs>("/preferences", { method: "PATCH", body: JSON.stringify({ category, ...patch }) });
}
