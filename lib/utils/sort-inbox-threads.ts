import type { InboxThread } from "@/lib/queries/inbox.types";

/** Unread conversations first, then the latest message (incoming or outgoing). */
export function sortInboxThreads(threads: InboxThread[]): InboxThread[] {
  const timestamp = (value?: string | null) => {
    const parsed = Date.parse(value || "");
    return Number.isFinite(parsed) ? parsed : 0;
  };
  return [...threads].sort((a, b) =>
    Number((b.unreadCount || 0) > 0) - Number((a.unreadCount || 0) > 0)
    || timestamp(b.lastMessageAt) - timestamp(a.lastMessageAt)
    || a.id.localeCompare(b.id),
  );
}
