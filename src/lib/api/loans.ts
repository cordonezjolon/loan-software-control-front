import { api } from './client';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type {
  CreateLoanDto,
  EarlyPayoffCalculationDto,
  EarlyPayoffResultDto,
  EarlySettlementPreviewDto,
  Loan,
  LoanBalance,
  LoanCalculationDto,
  LoanCalculationResultDto,
  LoanPurpose,
  LoanStatistics,
  LoanStatus,
  LoanType,
  PaymentSchedulePreview,
  PaymentSchedulePreviewParams,
  ProcessEarlySettlementDto,
  UpdateLoanDto,
} from '@/types/loan';

export interface LoansQuery extends PaginationParams {
  [key: string]: unknown;
  clientId?: string;
  status?: LoanStatus;
  loanType?: LoanType;
  loanPurpose?: LoanPurpose;
  startDateFrom?: string;
  startDateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  loanOfficerId?: string;
  search?: string;
}

export const loansApi = {
  findAll: (params?: LoansQuery): Promise<PaginatedResponse<Loan>> =>
    api.get<PaginatedResponse<Loan>>('/loans', { params }),

  findOne: (id: string): Promise<Loan> =>
    api.get<Loan>(`/loans/${id}`),

  create: (dto: CreateLoanDto): Promise<Loan> =>
    api.post<Loan>('/loans', dto),

  update: (id: string, dto: UpdateLoanDto): Promise<Loan> =>
    api.patch<Loan>(`/loans/${id}`, dto),

  remove: (id: string): Promise<void> =>
    api.delete<void>(`/loans/${id}`),

  getStatistics: (loanOfficerId?: string): Promise<LoanStatistics> =>
    api.get<LoanStatistics>('/loans/statistics', {
      params: loanOfficerId ? { loanOfficerId } : undefined,
    }),

  getCurrentBalance: (id: string): Promise<LoanBalance> =>
    api.get<LoanBalance>(`/loans/${id}/balance`),

  approve: (id: string): Promise<Loan> =>
    api.post<Loan>(`/loans/${id}/approve`),

  reject: (id: string, reason: string): Promise<Loan> =>
    api.post<Loan>(`/loans/${id}/reject`, { reason }),

  activate: (id: string): Promise<Loan> =>
    api.post<Loan>(`/loans/${id}/activate`),

  previewEarlySettlement: (id: string): Promise<EarlySettlementPreviewDto> =>
    api.get<EarlySettlementPreviewDto>(`/loans/${id}/early-settlement/preview`),

  settleEarly: (id: string, dto: ProcessEarlySettlementDto): Promise<Loan> =>
    api.post<Loan>(`/loans/${id}/early-settlement/settle`, dto),
};

export const calculationsApi = {
  calculate: (dto: LoanCalculationDto): Promise<LoanCalculationResultDto> =>
    api.post<LoanCalculationResultDto>('/loan-calculations/calculate', dto),

  earlyPayoff: (dto: EarlyPayoffCalculationDto): Promise<EarlyPayoffResultDto> =>
    api.post<EarlyPayoffResultDto>('/loan-calculations/early-payoff', dto),

  previewSchedule: (params: PaymentSchedulePreviewParams): Promise<PaymentSchedulePreview> =>
    api.get<PaymentSchedulePreview>('/loan-calculations/payment-schedule-preview', {
      params,
    }),
};
