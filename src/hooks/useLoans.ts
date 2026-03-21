'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loansApi, type LoansQuery } from '@/lib/api/loans';
import type { CreateLoanDto, UpdateLoanDto } from '@/types/loan';

export const LOANS_KEY = 'loans';

export function useLoans(params?: LoansQuery) {
  return useQuery({
    queryKey: [LOANS_KEY, params],
    queryFn: () => loansApi.findAll(params),
    staleTime: 30_000,
  });
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: [LOANS_KEY, id],
    queryFn: () => loansApi.findOne(id),
    enabled: Boolean(id),
  });
}

export function useLoanStatistics(loanOfficerId?: string) {
  return useQuery({
    queryKey: [LOANS_KEY, 'statistics', loanOfficerId],
    queryFn: () => loansApi.getStatistics(loanOfficerId),
    staleTime: 60_000,
  });
}

export function useLoanBalance(id: string) {
  return useQuery({
    queryKey: [LOANS_KEY, id, 'balance'],
    queryFn: () => loansApi.getCurrentBalance(id),
    enabled: Boolean(id),
  });
}

export function useCreateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLoanDto) => loansApi.create(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [LOANS_KEY] });
    },
  });
}

export function useUpdateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateLoanDto }) => loansApi.update(id, dto),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [LOANS_KEY] });
      void qc.invalidateQueries({ queryKey: [LOANS_KEY, id] });
    },
  });
}

export function useApproveLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => loansApi.approve(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: [LOANS_KEY] });
      void qc.invalidateQueries({ queryKey: [LOANS_KEY, id] });
    },
  });
}

export function useRejectLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => loansApi.reject(id, reason),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [LOANS_KEY] });
      void qc.invalidateQueries({ queryKey: [LOANS_KEY, id] });
    },
  });
}

export function useActivateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => loansApi.activate(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: [LOANS_KEY] });
      void qc.invalidateQueries({ queryKey: [LOANS_KEY, id] });
    },
  });
}

export function useDeleteLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => loansApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [LOANS_KEY] });
    },
  });
}
