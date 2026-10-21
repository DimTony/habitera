import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';

import { API_BASE_URL } from 'lib/api/config';
import { getConversations, type ChatMessage } from 'lib/api/chat';
import { getAccessToken } from 'lib/auth/session';
import { useChatStore } from 'stores/useChatStore';

export async function refreshInbox() {
  const result = await getConversations();
  if (result.success && result.data) {
    useChatStore.getState().setConversations(result.data);
  }
  return result;
}


let connection: HubConnection | null = null;
let starting: Promise<HubConnection> | null = null;
const reconnectedListeners = new Set<() => void>();

function applyMessage(message: ChatMessage) {
  const known = useChatStore
    .getState()
    .conversations.some((item) => item.id === message.conversationId);
  useChatStore.getState().addMessage(message);
  if (!known) {
    void refreshInbox();
  }
}

export function onChatReconnected(listener: () => void) {
  reconnectedListeners.add(listener);
  return () => {
    reconnectedListeners.delete(listener);
  };
}

export async function ensureChatConnection() {
  if (connection && connection.state === HubConnectionState.Connected) {
    return connection;
  }

  if (starting) return starting;

  starting = (async () => {
    if (!connection) {
      connection = new HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/hubs/chat`, {
          accessTokenFactory: async () => (await getAccessToken()) ?? '',
        })
        .withAutomaticReconnect()
        .configureLogging(__DEV__ ? LogLevel.Information : LogLevel.Warning)
        .build();

      connection.on('MessageReceived', (message: ChatMessage) => {
        applyMessage(message);
      });

      connection.on(
        'MessageDelivered',
        (payload: { conversationId: string; messageIds: string[]; deliveredAt: string }) => {
          useChatStore
            .getState()
            .applyDelivery(payload.conversationId, payload.messageIds, payload.deliveredAt);
        }
      );

      connection.on(
        'MessageRead',
        (payload: { conversationId: string; messageIds: string[]; readAt: string }) => {
          useChatStore
            .getState()
            .applyRead(payload.conversationId, payload.messageIds, payload.readAt);
        }
      );

      connection.on(
        'Typing',
        (payload: { conversationId: string; isTyping: boolean }) => {
          useChatStore.getState().setTyping(payload.conversationId, payload.isTyping);
        }
      );

      connection.on('PresenceChanged', (payload: { userId: string; online: boolean }) => {
        useChatStore.getState().setPresence(payload.userId, payload.online);
      });

      connection.onreconnected(async () => {
        await refreshInbox();
        reconnectedListeners.forEach((listener) => listener());
      });
    }

    if (connection.state === HubConnectionState.Disconnected) {
      await connection.start();
    }

    return connection;
  })();

  try {
    return await starting;
  } finally {
    starting = null;
  }
}

export async function joinConversation(conversationId: string) {
  const hub = await ensureChatConnection();
  await hub.invoke('JoinConversation', conversationId);
}

export async function sendChatMessage(conversationId: string, body: string) {
  const hub = await ensureChatConnection();
  const message = (await hub.invoke('SendMessage', conversationId, body)) as ChatMessage;
  if (message?.id) {
    applyMessage(message);
  }
  return message;
}

export async function setTyping(conversationId: string, isTyping: boolean) {
  const hub = await ensureChatConnection();
  if (hub.state !== HubConnectionState.Connected) return;
  await hub.invoke('Typing', conversationId, isTyping);
}

export async function markConversationRead(conversationId: string, upToMessageId?: string) {
  const hub = await ensureChatConnection();
  await hub.invoke('MarkRead', conversationId, upToMessageId ?? null);
  useChatStore.getState().markConversationReadLocally(conversationId);
}

export async function stopChatConnection() {
  if (connection && connection.state !== HubConnectionState.Disconnected) {
    await connection.stop();
  }
}

export async function disconnectChat() {
  useChatStore.getState().reset();
  await stopChatConnection();
}
