import { api } from './client';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type {
  InstallmentStatistics,
  InstallmentStatus,
  LoanInstallment,
  PaymentHistoryEntry,
  RemainingBalance,
  RescheduleEntry,
} from '@/types/installment';

export interface InstallmentsQuery extends PaginationParams {
  [key: string]: unknown;
  loanId?: string;
  clientId?: string;
  status?: InstallmentStatus;
  dueDateFrom?: string;
  dueDateTo?: string;
  overdueDaysMin?: number;
  overdueOnly?: boolean;
}

export const installmentsApi = {
  findAll: (params?: InstallmentsQuery): Promise<PaginatedResponse<LoanInstallment>> =>
    api.get<PaginatedResponse<LoanInstallment>>('/installments', { params }),

  findOne: (id: string): Promise<LoanInstallment> =>
    api.get<LoanInstallment>(`/installments/${id}`),

  findByLoanId: (loanId: string): Promise<LoanInstallment[]> =>
    api.get<LoanInstallment[]>(`/installments/loan/${loanId}`),

  getOverdue: (): Promise<LoanInstallment[]> =>
    api.get<LoanInstallment[]>('/installments/overdue'),

  getUpcoming: (days: number): Promise<LoanInstallment[]> =>
    api.get<LoanInstallment[]>(`/installments/upcoming/${days}`),

  getStatistics: (loanId?: string): Promise<InstallmentStatistics> =>
    api.get<InstallmentStatistics>('/installments/statistics', {
      params: loanId ? { loanId } : undefined,
    }),

  getRemainingBalance: (loanId: string): Promise<RemainingBalance> =>
    api.get<RemainingBalance>(`/installments/loan/${loanId}/balance`),

  applyLateFee: (id: string, amount: number, reason?: string): Promise<LoanInstallment> =>
    api.post<LoanInstallment>(`/installments/${id}/apply-late-fee`, { amount, reason }),

  reschedule: (loanId: string, newSchedule: RescheduleEntry[]): Promise<LoanInstallment[]> =>
    api.patch<LoanInstallment[]>(`/installments/loan/${loanId}/reschedule`, {
      newSchedule,
    }),

  getPaymentHistory: (id: string): Promise<PaymentHistoryEntry[]> =>
    api.get<PaymentHistoryEntry[]>(`/installments/${id}/payment-history`),
};
