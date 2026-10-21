import React, { useCallback, useState } from 'react';
import { BackArrow } from 'components/Svg';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { FLOATING_BUTTON_SPACE } from './AgentHomeScreen';
import { formatUTCTo12Hour } from 'lib/helpers';
import { listingImageSource } from 'lib/properties/mapProperty';
import { getErrorMessage } from 'lib/api/errors';
import type { ConversationSummary } from 'lib/api/chat';
import { ensureChatConnection, refreshInbox } from 'lib/chat/hub';
import { useChatStore } from 'stores/useChatStore';
import { useToastStore } from 'stores/useToastStore';

const AgentChatScreen = () => {
  const router = useRouter();
  const conversations = useChatStore((state) => state.conversations);
  const { showToast } = useToastStore();
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        try {
          await ensureChatConnection();
          const result = await refreshInbox();
          if (!active) return;
          if (!result.success) {
            showToast({
              type: 'error',
              message: result.message || 'Unable to load conversations.',
            });
          }
        } catch (error) {
          if (!active) return;
          showToast({
            type: 'error',
            message: getErrorMessage(error, 'Unable to load conversations.'),
          });
        } finally {
          if (active) setIsLoading(false);
        }
      })();

      return () => {
        active = false;
      };
    }, [showToast])
  );

  const handleChatPress = (chat: ConversationSummary) => {
    router.push({ pathname: '/(agent)/conversation', params: { conversationId: chat.id } });
  };

  const renderChatItem = ({ item }: { item: ConversationSummary }) => {
    const unread = item.unreadCount > 0;
    return (
      <TouchableOpacity
        onPress={() => handleChatPress(item)}
        style={[styles.chatItem, unread && styles.unreadChatItem]}>
        <Image source={listingImageSource(item.propertyImageUrl)} style={styles.listingImage} />

        <View style={styles.chatContent}>
          <Text numberOfLines={1} style={styles.chatName}>
            {item.propertyTitle || 'Listing'}
          </Text>
          <Text numberOfLines={1} style={styles.chatPerson}>
            {item.otherUserName}
          </Text>
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.chatPreview}>
            {item.lastMessagePreview || 'No messages yet'}
          </Text>
        </View>

        <View style={styles.chatMeta}>
          {item.lastMessageAt ? (
            <Text style={styles.chatTime}>{formatUTCTo12Hour(item.lastMessageAt)}</Text>
          ) : (
            <View />
          )}
          {unread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator style={{ marginTop: 40 }} color="#111" />;
    }

    if (conversations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <LottieView
            source={require('../../assets/animations/Chat.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.emptyTitle}>No Conversations Found</Text>
          <Text style={styles.emptySubtitle}>
            Chat history will be available when a conversation has been started by a user
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.chatListContainer}>
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          contentInset={{ bottom: FLOATING_BUTTON_SPACE }}
          contentInsetAdjustmentBehavior="never"
          ListFooterComponent={() => <View style={{ height: FLOATING_BUTTON_SPACE }} />}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackArrow />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
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
    backgroundColor: 'transparent',
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Bahnschrift',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Bahnschrift',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  chatListContainer: {
    flex: 1,
    paddingTop: 16,
  },
  flatListContent: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    borderColor: '#BFBFBF',
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 2,
  },
  unreadChatItem: {
    backgroundColor: '#E6E6E6',
  },
  listingImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#eee',
  },
  chatContent: {
    flex: 1,
    gap: 6,
  },
  chatName: {
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  chatPerson: {
    fontFamily: 'Bahnschrift',
    fontSize: 12,
    color: '#678B83',
  },
  chatPreview: {
    fontFamily: 'Bahnschrift',
    fontSize: 14,
    fontWeight: '300',
    color: '#666',
    lineHeight: 18,
  },
  chatMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 50,
  },
  chatTime: {
    fontFamily: 'Bahnschrift',
    fontSize: 12,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#000',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#fff',
    fontFamily: 'Bahnschrift',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AgentChatScreen;
