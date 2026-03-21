'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi, type ClientsQuery } from '@/lib/api/clients';
import type { CreateClientDto, UpdateClientDto } from '@/types/client';

export const CLIENTS_KEY = 'clients';

export function useClients(params?: ClientsQuery) {
  return useQuery({
    queryKey: [CLIENTS_KEY, params],
    queryFn: () => clientsApi.findAll(params),
    staleTime: 30_000,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: [CLIENTS_KEY, id],
    queryFn: () => clientsApi.findOne(id),
    enabled: Boolean(id),
  });
}

export function useClientStats() {
  return useQuery({
    queryKey: [CLIENTS_KEY, 'stats'],
    queryFn: () => clientsApi.getStats(),
    staleTime: 60_000,
  });
}

export function useEligibleClients() {
  return useQuery({
    queryKey: [CLIENTS_KEY, 'eligible'],
    queryFn: () => clientsApi.getEligible(),
    staleTime: 30_000,
  });
}

export function useClientRiskProfile(id: string) {
  return useQuery({
    queryKey: [CLIENTS_KEY, id, 'risk-profile'],
    queryFn: () => clientsApi.getRiskProfile(id),
    enabled: Boolean(id),
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateClientDto) => clientsApi.create(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateClientDto }) => clientsApi.update(id, dto),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [CLIENTS_KEY] });
      void qc.invalidateQueries({ queryKey: [CLIENTS_KEY, id] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
  });
}
