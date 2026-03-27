'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { calculationsApi } from '@/lib/api/loans';
import type { LoanCalculationDto, EarlyPayoffCalculationDto, PaymentSchedulePreviewParams } from '@/types/loan';
import { QUERY_STALE_REALTIME } from '@/lib/constants';

export const CALCULATIONS_KEY = 'calculations';

export function useCalculateLoan(dto: LoanCalculationDto | null) {
  return useQuery({
    queryKey: [CALCULATIONS_KEY, dto],
    queryFn: () => calculationsApi.calculate(dto!),
    enabled: dto !== null,
    staleTime: QUERY_STALE_REALTIME,
  });
}

export function useCalculateLoanMutation() {
  return useMutation({
    mutationFn: (dto: LoanCalculationDto) => calculationsApi.calculate(dto),
  });
}

export function useEarlyPayoffMutation() {
  return useMutation({
    mutationFn: (dto: EarlyPayoffCalculationDto) => calculationsApi.earlyPayoff(dto),
  });
}

export function usePaymentSchedulePreview(params: PaymentSchedulePreviewParams | null) {
  return useQuery({
    queryKey: [CALCULATIONS_KEY, 'preview', params],
    queryFn: () => calculationsApi.previewSchedule(params!),
    enabled: params !== null,
    staleTime: QUERY_STALE_REALTIME,
  });
}
