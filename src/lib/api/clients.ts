import { api } from './client';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type { Client, ClientStats, CreateClientDto, RiskProfile, UpdateClientDto } from '@/types/client';

export interface ClientsQuery extends PaginationParams {
  search?: string;
  minCreditScore?: number;
  minMonthlyIncome?: number;
}

export const clientsApi = {
  findAll: (params?: ClientsQuery): Promise<PaginatedResponse<Client>> =>
    api.get<PaginatedResponse<Client>>('/clients', { params }),

  findOne: (id: string): Promise<Client> =>
    api.get<Client>(`/clients/${id}`),

  create: (dto: CreateClientDto): Promise<Client> =>
    api.post<Client>('/clients', dto),

  update: (id: string, dto: UpdateClientDto): Promise<Client> =>
    api.patch<Client>(`/clients/${id}`, dto),

  remove: (id: string): Promise<void> =>
    api.delete<void>(`/clients/${id}`),

  getStats: (): Promise<ClientStats> =>
    api.get<ClientStats>('/clients/stats'),

  getEligible: (): Promise<Client[]> =>
    api.get<Client[]>('/clients/eligible'),

  search: (term: string): Promise<Client[]> =>
    api.get<Client[]>('/clients/search', { params: { term } }),

  getRiskProfile: (id: string): Promise<RiskProfile> =>
    api.get<RiskProfile>(`/clients/${id}/risk-profile`),
};
