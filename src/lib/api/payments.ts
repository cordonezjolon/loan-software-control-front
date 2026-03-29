import { api } from './client';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type {
  AdvancePaymentResult,
  CreateAdvancePaymentDto,
  CreatePaymentDto,
  CreatePrepaymentDto,
  LoanPayment,
  PaymentMethod,
  PaymentStatus,
  PrepaymentResultDto,
} from '@/types/payment';

export interface PaymentsQuery extends PaginationParams {
  [key: string]: unknown;
  installmentId?: string;
  loanId?: string;
  clientId?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentDateFrom?: string;
  paymentDateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export const paymentsApi = {
  create: (dto: CreatePaymentDto): Promise<LoanPayment> =>
    api.post<LoanPayment>('/payments', dto),

  createAdvancePayment: (dto: CreateAdvancePaymentDto): Promise<AdvancePaymentResult> =>
    api.post<AdvancePaymentResult>('/payments/advance', dto),

  createPrepayment: (dto: CreatePrepaymentDto): Promise<PrepaymentResultDto> =>
    api.post<PrepaymentResultDto>('/payments/prepayment', dto),

  findAll: (params?: PaymentsQuery): Promise<PaginatedResponse<LoanPayment>> =>
    api.get<PaginatedResponse<LoanPayment>>('/payments', { params }),

  findOne: (id: string): Promise<LoanPayment> =>
    api.get<LoanPayment>(`/payments/${id}`),

  cancel: (id: string, reason?: string): Promise<LoanPayment> =>
    api.delete<LoanPayment>(`/payments/${id}/cancel`, { body: reason ? JSON.stringify({ reason }) : undefined }),
};
