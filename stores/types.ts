// User Types
export type UserType = 'user' | 'agent' | null;

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userType: UserType;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Error Types
export interface ErrorState {
  [key: string]: {
    hasError: boolean;
    message: string;
  };
}

// Toast Types
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

// Property Types
export interface Property {
  id: string;
  propertyName: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  currency: string;
  priceUnit: string;
  imageSource: any;
  images: string[];
  description?: string;
  amenities?: string[];
  isBookmarked?: boolean;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

// Chat Types
export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Alert Types
export interface Alert {
  id: string;
  userId: string;
  propertyType: string;
  location: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Theme Types
export interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  bgColor: (opacity: number) => string;
  accentBgColor: (opacity: number) => string;
}

// App State Interface
export interface AppState {
  // Auth
  auth: AuthState;
  
  // App State
  hasCompletedOnboarding: boolean;
  userType: UserType;
  themeColors: ThemeColors;
  isAuthenticated: boolean;
  
  // Data
  properties: Property[];
  bookmarks: string[];
  chats: Chat[];
  alerts: Alert[];
  
  // UI State
  loading: boolean;
  errors: ErrorState;
  toasts: Toast[];
  
  // Actions
  // Auth Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string, userType?: UserType) => Promise<void>;
  logout: () => void;
  
  // App Actions
  setOnboardingComplete: (completed: boolean) => void;
  setUserType: (userType: UserType) => void;
  
  // Data Actions
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  
  setBookmarks: (bookmarks: string[]) => void;
  toggleBookmark: (propertyId: string) => void;
  
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  deleteAlert: (id: string) => void;
  
  // Error Actions
  setError: (field: string, hasError: boolean, message?: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  
  // Toast Actions
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
  
  // Reset
  resetState: () => void;
}
