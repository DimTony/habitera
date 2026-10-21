import { apiClient } from './client';
import type { OperationResult } from './types';

const CHAT = '/api/Chat';

export type ConversationSummary = {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPhoto?: string | null;
  propertyId?: string | null;
  propertyTitle?: string | null;
  propertyImageUrl?: string | null;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  otherUserOnline: boolean;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  deliveredAt?: string | null;
  readAt?: string | null;
  status: 'sent' | 'delivered' | 'read' | string;
};

export async function startConversation(payload: { agentId: string; propertyId?: string | null }) {
  const { data } = await apiClient.post<OperationResult<ConversationSummary>>(
    `${CHAT}/Conversations`,
    payload
  );
  return data;
}

export async function getConversations() {
  const { data } = await apiClient.get<OperationResult<ConversationSummary[]>>(
    `${CHAT}/Conversations`
  );
  return data;
}

export async function getMessages(conversationId: string, take = 50, before?: string) {
  const { data } = await apiClient.get<OperationResult<ChatMessage[]>>(
    `${CHAT}/Conversations/${conversationId}/Messages`,
    { params: { take, before } }
  );
  return data;
}
