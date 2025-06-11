import { View, Text } from 'react-native';

import TabsLayout from './TabsLayout';

const UserChatScreen = () => {
  return (
    <TabsLayout tabName="Chats">
      <View className="flex-1 items-center justify-center gap-3 pb-28">
        <Text className="text-sm font-medium">No Conversations Found</Text>
        <Text className="max-w-[70%] text-center text-xs font-light">
          Chat history will be available when a conversation with an agent has been started
        </Text>
      </View>
    </TabsLayout>
  );
};

export default UserChatScreen;
