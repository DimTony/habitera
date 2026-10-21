export type ApiUserType = 'User' | 'Agent' | 'Admin';

export interface OperationResult<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  error?: unknown;
  timestamp?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phoneNumber: string;
  profilePhoto?: string | null;
  /** Polymorphic discriminator from API (`user` | `agent`). */
  kind?: 'user' | 'agent' | string;
  userType: ApiUserType;
  status: string;
  profileCompleted: boolean;
  completionPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  preferredLanguage?: string;
  licenseNumber?: string | null;
  agencyName?: string | null;
  averageRating?: number;
  totalReviews?: number;
}

export interface ProfileCompletionStatus {
  isProfileCompleted: boolean;
  userType: ApiUserType;
  missingFields: string[];
  completionPercentage: number;
}

export interface AuthResponse {
  token?: string | null;
  refreshToken?: string | null;
  user?: AuthUser | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userType: ApiUserType;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendCodeRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  preferredLanguage?: string;
}

export interface UpdateAgentProfileRequest {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  country: string;
  phoneNumber?: string;
  licenseNumber?: string;
  agencyName?: string;
}

export interface AgentPublicProfile {
  id: string;
  fullName: string;
  profilePhoto?: string | null;
  agencyName?: string | null;
  licenseNumber?: string | null;
  averageRating: number;
  totalReviews: number;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  memberSince: string;
  listingCount: number;
  listings: PropertyDto[];
}

export interface PropertyImageDto {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface PropertyDto {
  id: string;
  agentId: string;
  agentName?: string;
  title: string;
  description: string;
  propertyType?: string;
  listingType?: string;
  tenor?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number | null;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  price: number;
  currency?: string;
  status?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  isFavorited?: boolean;
  viewCount?: number;
  favoriteCount?: number;
  contactCount?: number;
  images?: PropertyImageDto[];
  primaryImageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  reviewSubmittedAt?: string | null;
  rejectionReason?: string | null;
}

export interface LocationSuggestion {
  id: string;
  label: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude: number;
  longitude: number;
}

export interface LocationListings {
  selected: LocationSuggestion;
  local: PropertyDto[];
  nearby: PropertyDto[];
}

export interface PaginatedResult<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T[] | null;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  error?: unknown;
}
