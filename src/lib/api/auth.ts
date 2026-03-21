import { api } from './client';
import type { JwtAuthResponse, LoginDto, RegisterDto } from '@/types/auth';

export const authApi = {
  login: (dto: LoginDto): Promise<JwtAuthResponse> =>
    api.post<JwtAuthResponse>('/auth/login', dto),

  register: (dto: RegisterDto): Promise<JwtAuthResponse> =>
    api.post<JwtAuthResponse>('/auth/register', dto),

  validateToken: (): Promise<{ valid: boolean }> =>
    api.post<{ valid: boolean }>('/auth/validate-token'),
};
