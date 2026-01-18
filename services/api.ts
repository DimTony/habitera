import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BaseUrl, SubscriptionKey } from '../constants/Colors';
import { useUnifiedStore } from '../stores/useUnifiedStore';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userType: 'user' | 'agent';
}

export interface PropertyRequest {
  propertyName: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  currency: string;
  priceUnit: string;
  description?: string;
  amenities?: string[];
  images?: string[];
}

export interface AlertRequest {
  propertyType: string;
  location: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': SubscriptionKey,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = useUnifiedStore.getState().auth.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          useUnifiedStore.getState().logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth API
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: any; token: string }>> {
    try {
      const response = await this.api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: any; token: string }>> {
    try {
      const response = await this.api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Properties API
  async getProperties(params?: {
    page?: number;
    limit?: number;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
  }): Promise<PaginatedResponse<any>> {
    try {
      const response = await this.api.get('/properties', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProperty(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createProperty(property: PropertyRequest): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/properties', property);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProperty(id: string, property: Partial<PropertyRequest>): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.put(`/properties/${id}`, property);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteProperty(id: string): Promise<ApiResponse> {
    try {
      const response = await this.api.delete(`/properties/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bookmarks API
  async getBookmarks(): Promise<ApiResponse<string[]>> {
    try {
      const response = await this.api.get('/bookmarks');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggleBookmark(propertyId: string): Promise<ApiResponse> {
    try {
      const response = await this.api.post(`/bookmarks/${propertyId}/toggle`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Alerts API
  async getAlerts(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.get('/alerts');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAlert(alert: AlertRequest): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/alerts', alert);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAlert(id: string, alert: Partial<AlertRequest>): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.put(`/alerts/${id}`, alert);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAlert(id: string): Promise<ApiResponse> {
    try {
      const response = await this.api.delete(`/alerts/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Chats API
  async getChats(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.get('/chats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getChat(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/chats/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendMessage(chatId: string, message: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post(`/chats/${chatId}/messages`, { message });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Profile API
  async getProfile(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(profile: Partial<any>): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.put('/profile', profile);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await this.api.put('/profile/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility methods
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.request(config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
