import { create } from 'zustand';

import type { ChatMessage, ConversationSummary } from 'lib/api/chat';
import { useAppStore } from 'stores/useAppStore';

type ChatState = {
  conversations: ConversationSummary[];
  messagesByConversation: Record<string, ChatMessage[]>;
  typingByConversation: Record<string, boolean>;
  activeConversationId: string | null;
  setConversations: (conversations: ConversationSummary[]) => void;
  upsertConversation: (conversation: ConversationSummary) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  applyDelivery: (conversationId: string, messageIds: string[], deliveredAt: string) => void;
  applyRead: (conversationId: string, messageIds: string[], readAt: string) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  setPresence: (userId: string, online: boolean) => void;
  markConversationReadLocally: (conversationId: string) => void;
  setActiveConversationId: (conversationId: string | null) => void;
  reset: () => void;
};

function sortConversations(items: ConversationSummary[]) {
  return [...items].sort((a, b) => {
    const aTime = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
    const bTime = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
    return bTime - aTime;
  });
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  messagesByConversation: {},
  typingByConversation: {},
  activeConversationId: null,

  setConversations: (conversations) => set({ conversations: sortConversations(conversations) }),

  upsertConversation: (conversation) =>
    set((state) => {
      const exists = state.conversations.some((item) => item.id === conversation.id);
      const next = exists
        ? state.conversations.map((item) => (item.id === conversation.id ? { ...item, ...conversation } : item))
        : [conversation, ...state.conversations];
      return { conversations: sortConversations(next) };
    }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages,
      },
    })),

  addMessage: (message) =>
    set((state) => {
      const current = state.messagesByConversation[message.conversationId] ?? [];
      if (current.some((item) => item.id === message.id)) {
        return state;
      }

      const me = String(useAppStore.getState().user?.id ?? useAppStore.getState().user?._id ?? '').toLowerCase();
      const incoming =
        Boolean(me) &&
        String(message.senderId).toLowerCase() !== me &&
        state.activeConversationId !== message.conversationId;

      const conversations = state.conversations.map((item) =>
        item.id === message.conversationId
          ? {
              ...item,
              lastMessagePreview: message.body,
              lastMessageAt: message.createdAt,
              unreadCount: incoming ? item.unreadCount + 1 : item.unreadCount,
            }
          : item
      );

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: [...current, message],
        },
        conversations: sortConversations(conversations),
      };
    }),

  applyDelivery: (conversationId, messageIds, deliveredAt) =>
    set((state) => {
      const current = state.messagesByConversation[conversationId];
      if (!current) return state;
      const ids = new Set(messageIds);
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: current.map((message) =>
            ids.has(message.id) && message.status !== 'read'
              ? { ...message, deliveredAt, status: 'delivered' }
              : message
          ),
        },
      };
    }),

  applyRead: (conversationId, messageIds, readAt) =>
    set((state) => {
      const current = state.messagesByConversation[conversationId];
      if (!current) return state;
      const ids = new Set(messageIds);
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: current.map((message) =>
            ids.has(message.id) ? { ...message, deliveredAt: message.deliveredAt ?? readAt, readAt, status: 'read' } : message
          ),
        },
      };
    }),

  setTyping: (conversationId, isTyping) =>
    set((state) => ({
      typingByConversation: {
        ...state.typingByConversation,
        [conversationId]: isTyping,
      },
    })),

  setPresence: (userId, online) =>
    set((state) => ({
      conversations: state.conversations.map((item) =>
        item.otherUserId === userId ? { ...item, otherUserOnline: online } : item
      ),
    })),

  markConversationReadLocally: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((item) =>
        item.id === conversationId ? { ...item, unreadCount: 0 } : item
      ),
    })),

  setActiveConversationId: (conversationId) => set({ activeConversationId: conversationId }),

  reset: () =>
    set({
      conversations: [],
      messagesByConversation: {},
      typingByConversation: {},
      activeConversationId: null,
    }),
}));
