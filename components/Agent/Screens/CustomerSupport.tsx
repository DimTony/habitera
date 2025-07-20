import { BackArrow } from 'components/Svg';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgentRootStackParamList } from 'components/User/types/navigation';
import { StyleSheet } from 'react-native';

type ScreenNavigationProp = NativeStackNavigationProp<AgentRootStackParamList, 'Profile'>;

const CustomerSupport = () => {
  const navigation = useNavigation<ScreenNavigationProp>();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <BackArrow />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Support</Text>
        </View>
      </View>
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
});

export default CustomerSupport;
