import { api } from './client';
import type { JwtAuthResponse, LoginDto, RegisterDto } from '@/types/auth';

export const authApi = {
  login: (dto: LoginDto): Promise<JwtAuthResponse> =>
    api.post<JwtAuthResponse>('/auth/login', dto),

  register: (dto: RegisterDto): Promise<JwtAuthResponse> =>
    api.post<JwtAuthResponse>('/auth/register', dto),

  validateToken: (token: string): Promise<{ valid: boolean; user?: JwtAuthResponse['user'] }> =>
    api.post<{ valid: boolean; user?: JwtAuthResponse['user'] }>('/auth/validate-token', { token }),
};
