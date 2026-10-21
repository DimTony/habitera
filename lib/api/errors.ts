import axios from 'axios';

import { API_BASE_URL } from './config';
import type { OperationResult } from './types';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as OperationResult<unknown> | string | undefined;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }

      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
      }
    }

    if (!error.response) {
      return `Cannot reach API at ${API_BASE_URL}. Is the backend running and reachable from this device?`;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function getStatusCode(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}
