export type InboxChannel = "INKERA" | "INSTAGRAM" | "FACEBOOK" | "EMAIL";
export type InboxStatus = "NEW" | "IN_PROGRESS" | "WAITING_CLIENT" | "DONE";

export type InboxPerson = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  image?: string | null;
  salonName?: string | null;
};

export type InboxThread = {
  contactBlocked?: boolean;
  id: string;
  ownerUserId: string;
  channel: InboxChannel;
  status: InboxStatus;
  lastMessageAt?: string | null;
  unreadCount?: number;
  conversationId?: string | null;
  linkedClientId?: string | null;
  assignedUserId?: string | null;
  assignedTatoueurId?: string | null;
  conversation?: {
    projectContactPending?: boolean;
    id: string;
    subject?: string | null;
    clientUserId: string;
    clientUser?: InboxPerson | null;
  } | null;
  externalConversation?: {
    subject?: string | null;
    contact?: { displayName?: string | null; username?: string | null; email?: string | null } | null;
    connection?: { id: string; provider: string; status?: string; displayName?: string | null; emailAddress?: string | null } | null;
  } | null;
  linkedClient?: InboxPerson & { phone?: string | null } | null;
  assignedUser?: InboxPerson | null;
  assignedTatoueur?: { id: string; name: string } | null;
  appointments?: Array<{ appointmentId: string }>;
};

export type InboxMessage = {
  id: string;
  content?: string | null;
  contentText?: string | null;
  createdAt: string;
  type?: string;
  direction?: "INBOUND" | "OUTBOUND";
  sender?: InboxPerson | null;
  attachments?: Array<{ id: string; fileUrl?: string; url?: string; fileName?: string; fileType?: string | null; mimeType?: string | null }>;
};

export type InstagramConnection = {
  id: string;
  providerAccountId: string;
  displayName?: string | null;
  status: "ACTIVE" | "ERROR" | "REAUTH_REQUIRED" | "DISCONNECTED";
  lastError?: string | null;
  tokenExpiresAt?: string | null;
};

export type InboxAppointment = {
  id: string;
  title: string;
  prestation: string;
  start: string;
  end: string;
  status: string;
  clientId?: string | null;
  client?: { firstName: string; lastName: string } | null;
  clientUser?: { firstName?: string | null; lastName?: string | null } | null;
};

export type InboxAppointmentResponse = {
  data: InboxAppointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type InboxListResponse = {
  data: InboxThread[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type InboxMessagesResponse = {
  data: InboxMessage[];
  hasMore: boolean;
  page: number;
  limit: number;
  total: number;
};

export type InboxNote = {
  id: string;
  content: string;
  createdAt: string;
  author?: InboxPerson;
};

export type InboxSavedReply = {
  id: string;
  title: string;
  content: string;
  channel?: InboxChannel | null;
};

export type InboxFilters = {
  channel?: InboxChannel;
  status?: InboxStatus;
  assignedUserId?: string;
  assignedTatoueurId?: string;
  search?: string;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
};
