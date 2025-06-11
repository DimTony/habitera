import { View, Text } from 'react-native';
import TabsLayout from '../TabsLayout';
import { useAppStore } from 'stores/useAppStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type ProfileNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const { themeColors } = useAppStore();
  const navigation = useNavigation<ProfileNavigationProp>();

  return (
    <TabsLayout tabName="Profile" onBack={() => navigation.goBack()}>
      <View>
        <Text>ProfileScreen</Text>
      </View>
    </TabsLayout>
  );
};

export default ProfileScreen;
