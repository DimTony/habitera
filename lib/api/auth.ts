import { apiClient } from './client';
import type {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  OperationResult,
  RegisterRequest,
  ResendCodeRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from './types';

const AUTH = '/api/Authentication';

export async function login(payload: LoginRequest) {
  const { data } = await apiClient.post<OperationResult<AuthResponse>>(`${AUTH}/Login`, payload);
  return data;
}

export async function register(payload: RegisterRequest) {
  const { data } = await apiClient.post<OperationResult<AuthResponse>>(`${AUTH}/Register`, payload);
  return data;
}

export async function verifyEmail(payload: VerifyEmailRequest) {
  const { data } = await apiClient.post<OperationResult<AuthResponse>>(
    `${AUTH}/VerifyEmail`,
    payload
  );
  return data;
}

export async function resendVerification(payload: ResendCodeRequest) {
  const { data } = await apiClient.post<OperationResult<AuthResponse>>(
    `${AUTH}/ResendVerification`,
    payload
  );
  return data;
}

export async function forgotPassword(payload: ForgotPasswordRequest) {
  const { data } = await apiClient.post<OperationResult<string>>(`${AUTH}/ForgotPassword`, payload);
  return data;
}

export async function resetPassword(payload: ResetPasswordRequest) {
  const { data } = await apiClient.post<OperationResult<string>>(`${AUTH}/ResetPassword`, payload);
  return data;
}

export async function changePassword(payload: ChangePasswordRequest) {
  const { data } = await apiClient.post<OperationResult<string>>(`${AUTH}/ChangePassword`, payload);
  return data;
}
