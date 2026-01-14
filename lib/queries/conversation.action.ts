"use server";
import { getAuthHeaders } from "../session";

//! ============================================================================
//! TYPES
//! ============================================================================

export type ConversationStatus = "ACTIVE" | "ARCHIVED" | "CLOSED";
export type MessageType = "SYSTEM" | "USER" | "CLIENT";

export interface ConversationUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string | null;
  salonName?: string;
  role?: string;
}

export interface ConversationMessageDto {
  id: string;
  content: string;
  createdAt: string;
  conversationId: string;
  type?: MessageType;
  isRead: boolean;
  attachments?: Array<{
    id: string;
    url: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }>;
  sender: ConversationUserDto;
}

export interface AttachmentDto {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadThingKey?: string;
}

export interface MessagesResponseDto {
  data: ConversationMessageDto[];
  hasMore: boolean;
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface ConversationDto {
  id: string;
  salonId: string;
  clientUserId: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  subject?: string;
  appointmentId?: string;
  unreadCount?: number;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    type?: MessageType;
  };
  salon: ConversationUserDto;
  client: ConversationUserDto;
  messages?: MessagesResponseDto;
}

export interface PaginatedConversationsDto {
  data: ConversationDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

//! ============================================================================
//! RECUPERER LES CONVERSATIONS D'UN UTILISATEUR AVEC PAGINATION
//! ============================================================================

export const getConversationsAction = async (
  page: number = 1,
  limit: number = 20,
  status?: ConversationStatus
): Promise<PaginatedConversationsDto> => {
  const headers = await getAuthHeaders();

  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  if (status) {
    queryParams.append("status", status);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/messaging/conversations?${queryParams}`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch conversations: ${response.statusText}`);
  }

  return response.json();
};

//! ============================================================================
//! RECUPERER UNE CONVERSATION PAR SLUG (prenom_prestation)
//! ============================================================================
export type ConversationResponseDto = ConversationDto;

export const getConversationByIdAction = async (
  id: string
): Promise<ConversationResponseDto> => {
  const headers = await getAuthHeaders();

  if (!id) {
    throw new Error("Invalid conversation ID");
  }

  // Récupérer la conversation complète avec tous les messages
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/messaging/conversations/${id}`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  );

  const messageResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/messaging/conversations/${id}/messages`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch conversation: ${response.statusText}`);
  }

  if (!messageResponse.ok) {
    throw new Error(
      `Failed to fetch conversation messages: ${messageResponse.statusText}`
    );
  }

  const conversationData = await response.json();
  const messagesData = await messageResponse.json();

  return {
    ...conversationData,
    messages: messagesData,
  };
};

//! ============================================================================
//! ARCHIVER UNE CONVERSATION
//! ============================================================================
export const archiveConversationAction = async (
  conversationId: string
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/messaging/conversations/${conversationId}/archive`,
    {
      method: "PATCH",
      headers,
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to archive conversation: ${response.statusText}`);
  }
  return;
};

//! ============================================================================
//! DELETE UNE CONVERSATION
//! ============================================================================
export const deleteConversationAction = async (
  conversationId: string
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/messaging/conversations/${conversationId}`,
    {
      method: "DELETE",
      headers,
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to delete conversation: ${response.statusText}`);
  }
  return;
};

//! ============================================================================
//! DELETE UN MESSAGE
//! ============================================================================
export const deleteMessageAction = async (
  conversationId: string,
  messageId: string
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/messaging/messages/${messageId}`,
    {
      method: "DELETE",
      headers,
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to delete message: ${response.statusText}`);
  }
  return;
};
