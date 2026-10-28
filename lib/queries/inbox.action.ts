"use server";

import { getAuthHeaders } from "../session";
import { sortInboxThreads } from "../utils/sort-inbox-threads";
import type {
  InboxAppointmentResponse, InboxChannel, InboxFilters, InboxListResponse, InboxMessage,
  InboxMessagesResponse, InboxNote, InboxSavedReply, InboxStatus, InboxThread,
  InstagramConnection,
} from "./inbox.types";

const ROOT = "/messaging/inbox";

async function instagramRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) throw new Error("Connectez-vous à Inkera Studio.");
  if (!process.env.NEXT_PUBLIC_BACK_URL) throw new Error("L'URL du backend Inkera n'est pas configurée.");
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/messaging/instagram${path}`, {
    ...init, headers: { ...headers, ...(init.headers || {}) }, cache: "no-store",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    throw new Error(Array.isArray(body?.message) ? body.message.join(" · ") : body?.message || `Instagram (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function getInstagramConnectionsAction(): Promise<InstagramConnection[]> {
  return instagramRequest<InstagramConnection[]>("/connections");
}

export async function connectInstagramAction(): Promise<{ authorizationUrl: string }> {
  return instagramRequest<{ authorizationUrl: string }>("/connect");
}

export async function disconnectInstagramAction(connectionId: string): Promise<{ disconnected: true }> {
  return instagramRequest<{ disconnected: true }>(`/connections/${encodeURIComponent(connectionId)}`, { method: "DELETE" });
}

async function inboxRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) throw new Error("Connectez-vous à Inkera Studio pour accéder aux messages.");
  if (!process.env.NEXT_PUBLIC_BACK_URL) throw new Error("L'URL de l'API Inkera n'est pas configurée.");

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}${ROOT}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as T | { message?: string | string[] } | null;
  if (!response.ok) {
    const message = result && typeof result === "object" && "message" in result ? result.message : undefined;
    throw new Error(Array.isArray(message) ? message.join(" · ") : message || `Erreur Inbox (${response.status})`);
  }
  return result as T;
}

function body(value: object): RequestInit {
  return { method: "POST", body: JSON.stringify(value) };
}

export async function getInboxThreadsAction(filters: InboxFilters = {}): Promise<InboxListResponse> {
  const fetchPage = (values: InboxFilters) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && value !== "") query.set(key, String(value));
    }
    return inboxRequest<InboxListResponse>(`?${query.toString()}`);
  };
  const page = Math.max(1, Math.floor(filters.page || 1));
  const limit = Math.max(1, Math.min(100, Math.floor(filters.limit || 20)));
  if (filters.unreadOnly) {
    const result = await fetchPage({ ...filters, page, limit });
    return { ...result, data: sortInboxThreads(result.data) };
  }

  // Sort before pagination: an older unread thread can be beyond the first API page.
  // The API already orders each page by lastMessageAt, including sent replies.
  const [recent, unread] = await Promise.all([
    fetchPage({ ...filters, page: 1, limit: 100 }),
    fetchPage({ ...filters, unreadOnly: true, page: 1, limit: 100 }),
  ]);
  const end = page * limit;
  const recentPages = Math.min(recent.totalPages, Math.ceil(end / 100));
  const extraRecent = await Promise.all(Array.from({ length: Math.max(0, recentPages - 1) }, (_, i) => fetchPage({ ...filters, page: i + 2, limit: 100 })));
  const extraUnread = await Promise.all(Array.from({ length: Math.max(0, unread.totalPages - 1) }, (_, i) => fetchPage({ ...filters, unreadOnly: true, page: i + 2, limit: 100 })));
  const unique = new Map([recent, ...extraRecent, unread, ...extraUnread].flatMap(result => result.data).map(item => [item.id, item]));
  return {
    data: sortInboxThreads([...unique.values()]).slice((page - 1) * limit, end),
    total: recent.total, page, limit, totalPages: Math.ceil(recent.total / limit),
  };
}

export async function getInboxThreadAction(id: string): Promise<InboxThread> {
  return inboxRequest<InboxThread>(`/${encodeURIComponent(id)}`);
}

export async function getInboxMessagesAction(id: string, page = 1): Promise<InboxMessagesResponse> {
  return inboxRequest<InboxMessagesResponse>(`/${encodeURIComponent(id)}/messages?page=${page}&limit=100`);
}

export type InboxImageAttachment = {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadThingKey?: string;
};

export async function sendInboxReplyAction(id: string, content: string, attachments?: InboxImageAttachment[]): Promise<InboxMessage> {
  return inboxRequest<InboxMessage>(`/${encodeURIComponent(id)}/reply`, body({ content, ...(attachments?.length && { attachments }) }));
}

export async function setInboxStatusAction(id: string, status: InboxStatus): Promise<InboxThread> {
  return inboxRequest<InboxThread>(`/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export async function setInboxAssignmentAction(id: string, assignment: { assignedUserId?: string; assignedTatoueurId?: string }): Promise<InboxThread> {
  return inboxRequest<InboxThread>(`/${encodeURIComponent(id)}/assignment`, { method: "PATCH", body: JSON.stringify(assignment) });
}

export async function setInboxMemberPermissionAction(memberId: string): Promise<void> {
  return inboxRequest<void>(`/members/${encodeURIComponent(memberId)}/permissions`, {
    method: "PUT", body: JSON.stringify({ canView: true, canReply: true, canAssign: false }),
  });
}

export async function linkInboxClientAction(id: string, clientId: string): Promise<InboxThread> {
  return inboxRequest<InboxThread>(`/${encodeURIComponent(id)}/client`, { method: "PUT", body: JSON.stringify({ clientId }) });
}

export async function unlinkInboxClientAction(id: string): Promise<InboxThread> {
  return inboxRequest<InboxThread>(`/${encodeURIComponent(id)}/client`, { method: "DELETE" });
}

export async function getInboxAppointmentsAction(id: string, page = 1): Promise<InboxAppointmentResponse> {
  return inboxRequest<InboxAppointmentResponse>(`/${encodeURIComponent(id)}/appointments?page=${page}&limit=5`);
}

export async function createInboxClientAction(id: string, client: { firstName: string; lastName: string; email: string; phone: string }): Promise<InboxPersonId> {
  return inboxRequest<InboxPersonId>(`/${encodeURIComponent(id)}/client`, body(client));
}

type InboxPersonId = { id: string };

export async function linkInboxAppointmentAction(id: string, appointmentId: string): Promise<{ appointmentId: string }> {
  return inboxRequest<{ appointmentId: string }>(`/${encodeURIComponent(id)}/appointments`, body({ appointmentId }));
}

export async function getInboxNotesAction(id: string): Promise<InboxNote[]> {
  return inboxRequest<InboxNote[]>(`/${encodeURIComponent(id)}/notes`);
}

export async function addInboxNoteAction(id: string, content: string): Promise<InboxNote> {
  return inboxRequest<InboxNote>(`/${encodeURIComponent(id)}/notes`, body({ content }));
}

export async function setInboxReadStateAction(id: string, forceUnread: boolean): Promise<void> {
  return inboxRequest<void>(`/${encodeURIComponent(id)}/read-state`, { method: "PATCH", body: JSON.stringify({ forceUnread }) });
}

export async function getInboxSavedRepliesAction(): Promise<InboxSavedReply[]> {
  return inboxRequest<InboxSavedReply[]>("/replies");
}

export async function createInboxSavedReplyAction(title: string, content: string, channel?: InboxChannel): Promise<InboxSavedReply> {
  return inboxRequest<InboxSavedReply>("/replies", body({ title, content, ...(channel && { channel }) }));
}
