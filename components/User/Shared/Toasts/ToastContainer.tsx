// components/Toast/ToastContainer.tsx
import React from 'react';
import { View } from 'react-native';
import { useToastStore } from 'stores/useToastStore';
import ToastComponent from './ToastComponent';

const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useToastStore();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999 }}>
      {toasts.map((toast: any, index: any) => (
        <ToastComponent key={toast.id} toast={toast} onHide={hideToast} index={index} />
      ))}
    </View>
  );
};

export default ToastContainer;
