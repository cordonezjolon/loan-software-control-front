'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, type PaymentsQuery } from '@/lib/api/payments';
import { INSTALLMENTS_KEY } from './useInstallments';
import { QUERY_STALE_TIME } from '@/lib/constants';
import { LOANS_KEY } from './useLoans';export const PAYMENTS_KEY = 'payments';

export function usePayments(params?: PaymentsQuery) {
  return useQuery({
    queryKey: [PAYMENTS_KEY, params],
    queryFn: () => paymentsApi.findAll(params),
    staleTime: QUERY_STALE_TIME,
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: [PAYMENTS_KEY, id],
    queryFn: () => paymentsApi.findOne(id),
    enabled: Boolean(id),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [INSTALLMENTS_KEY] });
    },
  });
}

export function useCreateAdvancePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.createAdvancePayment,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [INSTALLMENTS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [INSTALLMENTS_KEY, 'balance', variables.loanId] });
      void queryClient.invalidateQueries({ queryKey: [LOANS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [LOANS_KEY, variables.loanId] });
    },
  });
}

export function useCancelPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      paymentsApi.cancel(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [INSTALLMENTS_KEY] });
    },
  });
}

export function useCreatePrepayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.createPrepayment,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [INSTALLMENTS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [INSTALLMENTS_KEY, 'balance', variables.loanId] });
      void queryClient.invalidateQueries({ queryKey: [LOANS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [LOANS_KEY, variables.loanId] });
    },
  });
}
