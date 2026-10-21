import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Feather from '@expo/vector-icons/Feather';
import { BackArrow } from 'components/Svg';
import { getMessages, type ChatMessage } from 'lib/api/chat';
import { getErrorMessage } from 'lib/api/errors';
import { resolveAvatarSource } from 'lib/avatars';
import { listingImageSource } from 'lib/properties/mapProperty';
import {
  joinConversation,
  markConversationRead,
  onChatReconnected,
  refreshInbox,
  sendChatMessage,
  setTyping,
} from 'lib/chat/hub';
import { formatUTCTo12Hour } from 'lib/helpers';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppStore } from 'stores/useAppStore';
import { useChatStore } from 'stores/useChatStore';
import { useToastStore } from 'stores/useToastStore';

const EMPTY_MESSAGES: ChatMessage[] = [];

function receiptLabel(status?: string) {
  if (status === 'read') return 'Read';
  if (status === 'delivered') return 'Delivered';
  return 'Sent';
}

const ConversationScreen = () => {
  const router = useRouter();
  const { conversationId } = useLocalSearchParams<{ conversationId?: string }>();
  const { user, userType } = useAppStore();
  const { showToast } = useToastStore();
  const messages = useChatStore((state) =>
    (conversationId && state.messagesByConversation[conversationId]) || EMPTY_MESSAGES
  );
  const conversation = useChatStore((state) =>
    state.conversations.find((item) => item.id === conversationId)
  );
  const isTyping = useChatStore((state) =>
    conversationId ? Boolean(state.typingByConversation[conversationId]) : false
  );
  const setMessages = useChatStore((state) => state.setMessages);
  const markConversationReadLocally = useChatStore((state) => state.markConversationReadLocally);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);

  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMarkedId = useRef<string | null>(null);
  const myId = String(user?.id ?? user?._id ?? '').toLowerCase();

  useEffect(() => {
    setActiveConversationId(conversationId ?? null);
    return () => {
      setActiveConversationId(null);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (conversationId) void setTyping(conversationId, false);
    };
  }, [conversationId, setActiveConversationId]);

  const load = useCallback(async () => {
    if (!conversationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      if (!useChatStore.getState().conversations.some((item) => item.id === conversationId)) {
        await refreshInbox();
      }
      await joinConversation(conversationId);
      const result = await getMessages(conversationId);
      if (!result.success) {
        showToast({ type: 'error', message: result.message || 'Unable to load messages.' });
        return;
      }
      const next = result.data ?? [];
      setMessages(conversationId, next);
      const lastIncoming = [...next].reverse().find(
        (item) => String(item.senderId).toLowerCase() !== myId
      );
      if (lastIncoming && lastIncoming.id !== lastMarkedId.current) {
        lastMarkedId.current = lastIncoming.id;
        await markConversationRead(conversationId, lastIncoming.id);
      }
      markConversationReadLocally(conversationId);
    } catch (error) {
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Unable to load messages.'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, markConversationReadLocally, myId, setMessages, showToast]);

  useEffect(() => {
    void load();
    return onChatReconnected(() => {
      void load();
    });
  }, [load]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!conversationId || messages.length === 0) return;
    const lastIncoming = [...messages].reverse().find(
      (item) => String(item.senderId).toLowerCase() !== myId
    );
    if (!lastIncoming || lastIncoming.readAt || lastIncoming.id === lastMarkedId.current) return;
    lastMarkedId.current = lastIncoming.id;
    void markConversationRead(conversationId, lastIncoming.id);
    markConversationReadLocally(conversationId);
  }, [conversationId, markConversationReadLocally, messages, myId]);

  const handleChangeText = (value: string) => {
    setDraft(value);
    if (!conversationId) return;
    void setTyping(conversationId, true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      void setTyping(conversationId, false);
    }, 1200);
  };

  const handleSend = async () => {
    const body = draft.trim();
    if (!conversationId || !body || isSending) return;

    try {
      setIsSending(true);
      setDraft('');
      if (typingTimer.current) clearTimeout(typingTimer.current);
      await setTyping(conversationId, false);
      await sendChatMessage(conversationId, body);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (error) {
      setDraft(body);
      showToast({
        type: 'error',
        message: getErrorMessage(error, 'Unable to send message.'),
      });
    } finally {
      setIsSending(false);
    }
  };

  const title = conversation?.otherUserName || 'Chat';
  const presence = conversation?.otherUserOnline ? 'Online' : 'Offline';
  const canViewAgent = userType === 'user' && Boolean(conversation?.otherUserId);

  const openAgentProfile = () => {
    if (!conversation?.otherUserId) return;
    router.push(
      `/(user)/agent/${conversation.otherUserId}?propertyId=${conversation.propertyId ?? ''}`
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackArrow />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.agentInfo}
        onPress={openAgentProfile}
        disabled={!canViewAgent}
        activeOpacity={canViewAgent ? 0.7 : 1}>
        <Image source={resolveAvatarSource(conversation?.otherUserPhoto)} style={styles.avatar} />
        <View style={styles.agentText}>
          <Text style={styles.agentName}>{title}</Text>
          <Text style={styles.presence}>{isTyping ? 'typing…' : presence}</Text>
          {conversation?.propertyTitle ? (
            <View style={styles.listingRow}>
              <Image
                source={listingImageSource(conversation.propertyImageUrl)}
                style={styles.listingThumb}
              />
              <Text style={styles.propertyTitle} numberOfLines={1}>
                {conversation.propertyTitle}
              </Text>
            </View>
          ) : null}
          {canViewAgent ? <Text style={styles.viewProfile}>View profile</Text> : null}
        </View>
        {canViewAgent ? <Feather name="chevron-right" size={18} color="#999" /> : null}
      </TouchableOpacity>

      <View style={styles.messagesContainer}>
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color="#000" />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const mine = String(item.senderId).toLowerCase() === myId && myId.length > 0;
              return (
                <View
                  style={[
                    styles.messageContainer,
                    mine ? styles.userMessageContainer : styles.agentMessageContainer,
                  ]}>
                  <View
                    style={[
                      styles.messageBubble,
                      mine ? styles.userMessageBubble : styles.agentMessageBubble,
                    ]}>
                    <Text
                      style={[
                        styles.messageText,
                        mine ? styles.userMessageText : styles.agentMessageText,
                      ]}>
                      {item.body}
                    </Text>
                  </View>
                  <Text style={styles.messageTime}>
                    {formatUTCTo12Hour(item.createdAt)}
                    {mine ? ` · ${receiptLabel(item.status)}` : ''}
                  </Text>
                </View>
              );
            }}
            contentContainerStyle={[
              styles.messagesList,
              { paddingBottom: 50 + (keyboardHeight > 0 ? 20 : 0) },
            ]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <Text style={styles.emptyThread}>Say hello to start the conversation.</Text>
            }
          />
        )}
      </View>

      <View style={[styles.inputContainer, { marginBottom: keyboardHeight > 0 ? 10 : 5 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter new message..."
            placeholderTextColor="#999"
            value={draft}
            onChangeText={handleChangeText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isSending}>
            {isSending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Feather name="send" size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#1a1a1a',
    paddingBottom: 30,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontFamily: 'Bahnschrift',
    fontSize: 20,
    fontWeight: '600',
  },
  agentInfo: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  agentName: {
    fontWeight: '600',
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    color: '#1a1a1a',
  },
  agentText: { flex: 1 },
  viewProfile: {
    marginTop: 2,
    fontFamily: 'Bahnschrift',
    fontSize: 12,
    color: '#678B83',
  },
  presence: { fontSize: 12, color: '#678B83', fontFamily: 'Bahnschrift' },
  propertyTitle: { fontSize: 11, color: '#888', fontFamily: 'Bahnschrift', maxWidth: 180 },
  listingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  listingThumb: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#eee' },
  messagesContainer: { flex: 1, backgroundColor: '#fff' },
  messagesList: { paddingHorizontal: 16, paddingVertical: 8, flexGrow: 1 },
  emptyThread: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontFamily: 'Bahnschrift',
  },
  messageContainer: { marginVertical: 4 },
  userMessageContainer: { alignItems: 'flex-end' },
  agentMessageContainer: { alignItems: 'flex-start' },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 4,
  },
  userMessageBubble: { backgroundColor: '#E6E6E6', borderBottomRightRadius: 4 },
  agentMessageBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: '#e6e6e6',
  },
  messageText: { fontFamily: 'Bahnschrift', fontSize: 14, lineHeight: 18 },
  userMessageText: { color: '#000' },
  agentMessageText: { color: '#1a1a1a' },
  messageTime: {
    fontFamily: 'Bahnschrift',
    fontSize: 11,
    color: '#999',
    marginHorizontal: 8,
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fafafa',
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontFamily: 'Bahnschrift',
    fontSize: 14,
    paddingVertical: 8,
    color: '#000',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default ConversationScreen;
