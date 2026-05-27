import api from './axios';
import type { ApiResponse } from '../types';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export const userApi = {
  forgotPassword: async (req: ForgotPasswordRequest): Promise<void> => {
    await api.post<ApiResponse<null>>('/api/public/users/forgot-password', req);
  },

  resetPassword: async (req: ResetPasswordRequest): Promise<void> => {
    await api.post<ApiResponse<null>>('/api/public/users/reset-password', req);
  }
};
