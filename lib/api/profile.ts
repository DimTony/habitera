import { apiClient } from './client';
import type {
  AuthUser,
  OperationResult,
  ProfileCompletionStatus,
  UpdateAgentProfileRequest,
  UpdateUserProfileRequest,
} from './types';

const PROFILE = '/api/Profile';

export async function getMyProfile() {
  const { data } = await apiClient.get<OperationResult<AuthUser>>(`${PROFILE}/Me`);
  return data;
}

export async function getProfileCompletionStatus() {
  const { data } = await apiClient.get<OperationResult<ProfileCompletionStatus>>(
    `${PROFILE}/Status`
  );
  return data;
}

export async function updateUserProfile(payload: UpdateUserProfileRequest) {
  const { data } = await apiClient.put<OperationResult<AuthUser>>(
    `${PROFILE}/Update/User`,
    payload
  );
  return data;
}

export async function updateAgentProfile(payload: UpdateAgentProfileRequest) {
  const { data } = await apiClient.put<OperationResult<AuthUser>>(
    `${PROFILE}/Update/Agent`,
    payload
  );
  return data;
}

export async function updateProfilePhoto(profilePhoto: string) {
  const { data } = await apiClient.put<OperationResult<AuthUser>>(`${PROFILE}/Photo`, {
    profilePhoto,
  });
  return data;
}

export async function uploadProfilePhoto(localUri: string) {
  const form = new FormData();
  const fileName = localUri.split('/').pop() || 'avatar.jpg';
  const lower = fileName.toLowerCase();
  const type = lower.endsWith('.png')
    ? 'image/png'
    : lower.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg';

  form.append('file', {
    uri: localUri,
    name: fileName,
    type,
  } as unknown as Blob);

  const { data } = await apiClient.post<OperationResult<AuthUser>>(`${PROFILE}/Photo`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000,
  });
  return data;
}
