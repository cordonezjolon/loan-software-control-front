'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { installmentsApi, type InstallmentsQuery } from '@/lib/api/installments';

export const INSTALLMENTS_KEY = 'installments';

export function useInstallments(params?: InstallmentsQuery) {
  return useQuery({
    queryKey: [INSTALLMENTS_KEY, params],
    queryFn: () => installmentsApi.findAll(params),
    staleTime: 30_000,
  });
}

export function useInstallment(id: string) {
  return useQuery({
    queryKey: [INSTALLMENTS_KEY, id],
    queryFn: () => installmentsApi.findOne(id),
    enabled: Boolean(id),
  });
}

export function useInstallmentsByLoan(loanId: string) {
  return useQuery({
    queryKey: [INSTALLMENTS_KEY, 'loan', loanId],
    queryFn: () => installmentsApi.findByLoanId(loanId),
    enabled: Boolean(loanId),
  });
}

export function useOverdueInstallments() {
  return useQuery({
    queryKey: [INSTALLMENTS_KEY, 'overdue'],
    queryFn: () => installmentsApi.getOverdue(),
    staleTime: 30_000,
  });
}

export function useUpcomingInstallments(days: number) {
  return useQuery({
    queryKey: [INSTALLMENTS_KEY, 'upcoming', days],
    queryFn: () => installmentsApi.getUpcoming(days),
    staleTime: 30_000,
  });
}

export function useInstallmentStatistics(loanId?: string) {
  return useQuery({
    queryKey: [INSTALLMENTS_KEY, 'statistics', loanId],
    queryFn: () => installmentsApi.getStatistics(loanId),
    staleTime: 60_000,
  });
}

export function useRemainingBalance(loanId: string) {
  return useQuery({
    queryKey: [INSTALLMENTS_KEY, 'balance', loanId],
    queryFn: () => installmentsApi.getRemainingBalance(loanId),
    enabled: Boolean(loanId),
  });
}

export function useInstallmentPaymentHistory(id: string) {
  return useQuery({
    queryKey: [INSTALLMENTS_KEY, id, 'payment-history'],
    queryFn: () => installmentsApi.getPaymentHistory(id),
    enabled: Boolean(id),
  });
}

export function useApplyLateFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason?: string }) =>
      installmentsApi.applyLateFee(id, amount, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [INSTALLMENTS_KEY] });
    },
  });
}
