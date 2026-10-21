import axios from 'axios';

import { getAccessToken } from 'lib/auth/session';

import { API_BASE_URL } from './config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (__DEV__) {
    const method = (config.method ?? 'get').toUpperCase();
    const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
    console.log(`[API] ${method} ${url}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (__DEV__) {
      if (axios.isAxiosError(error)) {
        const method = (error.config?.method ?? 'get').toUpperCase();
        const url = `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`;
        console.log(
          `[API] FAIL ${method} ${url}`,
          error.response?.status ?? error.code ?? error.message
        );
      } else {
        console.log('[API] FAIL', error);
      }
    }
    return Promise.reject(error);
  }
);
