import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  
  showToast: (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 4000, // Default 4 seconds
      ...toast,
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    // Auto-hide toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().hideToast(id);
      }, newToast.duration);
    }
  },
  
  hideToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  clearAllToasts: () => {
    set({ toasts: [] });
  },
}));