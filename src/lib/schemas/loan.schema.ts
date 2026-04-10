import { z } from 'zod';
import { LoanType, LoanPurpose, InterestCalculationMethod, PrepaymentAction } from '@/types/loan';
import { formatCurrency } from '@/lib/formatters';

export const createLoanSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  principal: z
    .number()
    .min(1000, `Minimum ${formatCurrency(1000)}`)
    .max(5_000_000, `Maximum ${formatCurrency(5_000_000)}`),
  interestRate: z
    .number()
    .min(0.005, 'Minimum 0.5%')
    .max(2, 'Maximum 200%'),
  termInMonths: z
    .number()
    .int()
    .min(6, 'Minimum 6 months')
    .max(480, 'Maximum 480 months'),
  loanType: z.nativeEnum(LoanType),
  loanPurpose: z.nativeEnum(LoanPurpose),
  startDate: z.string().min(1, 'Start date is required'),
  riskAdjustment: z.number().min(0).max(0.1).optional(),
  downPayment: z.number().min(0).optional(),
  loanOfficerId: z.string().uuid().optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
  interestCalculationMethod: z.nativeEnum(InterestCalculationMethod).optional(),
  earlySettlementRebatePercentage: z.number().min(0).max(1).optional(),
  prepaymentAction: z.nativeEnum(PrepaymentAction).optional(),
});

export type CreateLoanFormValues = z.infer<typeof createLoanSchema>;

export const updateLoanSchema = createLoanSchema.partial();
export type UpdateLoanFormValues = z.infer<typeof updateLoanSchema>;

export const loanCalculationSchema = z.object({
  principal: z
    .number()
    .min(1000, `Minimum ${formatCurrency(1000)}`)
    .max(10_000_000, `Maximum ${formatCurrency(10_000_000)}`),
  interestRate: z
    .number()
    .min(0.001, 'Minimum 0.1%')
    .max(2, 'Maximum 200%'),
  termInMonths: z
    .number()
    .int()
    .min(1, 'Minimum 1 month')
    .max(480, 'Maximum 480 months'),
  interestCalculationMethod: z.nativeEnum(InterestCalculationMethod).optional(),
  loanType: z.nativeEnum(LoanType).optional(),
  downPayment: z.number().min(0).optional(),
  riskAdjustment: z.number().min(0).max(0.1).optional(),
});

export type LoanCalculationFormValues = z.infer<typeof loanCalculationSchema>;

export const rejectLoanSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason (at least 10 characters)'),
});

export type RejectLoanFormValues = z.infer<typeof rejectLoanSchema>;
