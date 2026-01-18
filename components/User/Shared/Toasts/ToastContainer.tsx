// components/Toast/ToastContainer.tsx
import React from 'react';
import { View } from 'react-native';
import { useUnifiedStore } from '@/stores/useUnifiedStore';
import ToastComponent from './ToastComponent';

const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useUnifiedStore();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999 }}>
      <ToastComponent />
    </View>
  );
};

export default ToastContainer;
