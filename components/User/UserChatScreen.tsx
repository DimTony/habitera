import { useFocusEffect, useRouter } from 'expo-router';
import { getErrorMessage } from 'lib/api/errors';
import { ensureChatConnection, refreshInbox } from 'lib/chat/hub';
import { formatUTCTo12Hour } from 'lib/helpers';
import { listingImageSource } from 'lib/properties/mapProperty';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { useChatStore } from 'stores/useChatStore';
import { useToastStore } from 'stores/useToastStore';

import TabsLayout from './TabsLayout';

const UserChatScreen = () => {
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

  return (
    <TabsLayout tabName="Chats">
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#111" />
      ) : conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 pb-28">
          <Text className="text-sm font-medium">No Conversations Found</Text>
          <Text className="max-w-[70%] text-center text-xs font-light">
            Chat history will be available when a conversation with an agent has been started
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(user)/conversation',
                  params: { conversationId: item.id },
                })
              }
              className="mb-2 flex-row items-center rounded-2xl border border-neutral-300 bg-white px-3 py-3">
              <Image
                source={listingImageSource(item.propertyImageUrl)}
                className="mr-3 h-14 w-14 rounded-xl"
              />
              <View className="flex-1 gap-1">
                <Text numberOfLines={1} className="text-base font-semibold">
                  {item.propertyTitle || 'Listing'}
                </Text>
                <Text numberOfLines={1} className="text-xs text-neutral-500">
                  {item.otherUserName}
                </Text>
                <Text numberOfLines={2} className="text-sm font-light text-neutral-600">
                  {item.lastMessagePreview || 'No messages yet'}
                </Text>
              </View>
              <View className="items-end justify-between self-stretch">
                {item.lastMessageAt ? (
                  <Text className="text-xs text-neutral-500">
                    {formatUTCTo12Hour(item.lastMessageAt)}
                  </Text>
                ) : null}
                {item.unreadCount > 0 ? (
                  <View className="mt-2 h-5 min-w-5 items-center justify-center rounded-full bg-black px-1">
                    <Text className="text-xs font-semibold text-white">{item.unreadCount}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </TabsLayout>
  );
};

export default UserChatScreen;
