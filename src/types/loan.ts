import type { LoanInstallment } from './installment';

export enum InterestCalculationMethod {
  FlatRate = 'flat_rate',
  DecliningBalance = 'declining_balance',
}

export enum PrepaymentAction {
  ReduceTerm = 'reduce_term',
  ReduceInstallment = 'reduce_installment',
}

// Inline summary to avoid circular dep with client.ts
export interface ClientSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export enum LoanType {
  Personal = 'personal',
  Auto = 'auto',
  Mortgage = 'mortgage',
  Business = 'business',
  Student = 'student',
  CreditLine = 'credit_line',
}

export enum LoanPurpose {
  HomePurchase = 'home_purchase',
  Refinance = 'refinance',
  HomeImprovement = 'home_improvement',
  DebtConsolidation = 'debt_consolidation',
  AutoPurchase = 'auto_purchase',
  BusinessExpansion = 'business_expansion',
  EquipmentPurchase = 'equipment_purchase',
  WorkingCapital = 'working_capital',
  Education = 'education',
  MedicalExpenses = 'medical_expenses',
  Vacation = 'vacation',
  Other = 'other',
}

export enum LoanStatus {
  Pending = 'pending',
  UnderReview = 'under_review',
  Approved = 'approved',
  Rejected = 'rejected',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Defaulted = 'defaulted',
  Closed = 'closed',
}

export interface Loan {
  id: string;
  principal: number;
  interestRate: number;
  termInMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  loanType: LoanType;
  loanPurpose: LoanPurpose;
  status: LoanStatus;
  interestCalculationMethod: InterestCalculationMethod;
  earlySettlementRebatePercentage?: number;
  prepaymentAction?: PrepaymentAction;
  riskAdjustment?: number;
  downPayment?: number;
  loanOfficerId?: string;
  notes?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  client?: ClientSummary;
  installments?: LoanInstallment[];
}

export interface LoanBalance {
  currentBalance: number;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  remainingPayments: number;
}

export interface LoanStatistics {
  totalLoans: number;
  totalPrincipal: number;
  averageLoanAmount: number;
  loansByStatus: Record<string, number>;
  loansByType: Record<string, number>;
  averageInterestRate: number;
  approvalRate: number;
}

export interface CreateLoanDto {
  clientId: string;
  principal: number;
  interestRate: number;
  termInMonths: number;
  loanType: LoanType;
  loanPurpose: LoanPurpose;
  startDate: string;
  interestCalculationMethod?: InterestCalculationMethod;
  earlySettlementRebatePercentage?: number;
  prepaymentAction?: PrepaymentAction;
  riskAdjustment?: number;
  downPayment?: number;
  loanOfficerId?: string;
  notes?: string;
}

export interface ProcessEarlySettlementDto {
  paymentMethod: string;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}

export interface EarlySettlementPreviewDto {
  loanId: string;
  interestCalculationMethod: InterestCalculationMethod;
  paidInstallments: number;
  remainingInstallments: number;
  remainingPrincipal: number;
  scheduledRemainingInterest: number;
  rebatePercentage: number;
  rebateAmount: number;
  settlementAmount: number;
  previewDate: string;
}

export type UpdateLoanDto = Partial<Omit<CreateLoanDto, 'clientId'>>;

export interface LoanCalculationDto {
  principal: number;
  interestRate: number;
  termInMonths: number;
  loanType?: LoanType;
  downPayment?: number;
  riskAdjustment?: number;
  extraPayment?: number;
}

export interface AmortizationEntry {
  installmentNumber: number;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  remainingBalance: number;
  dueDate: string;
}

export interface LoanCalculationSummary {
  totalPayments: number;
  firstPaymentDate: string;
  lastPaymentDate: string;
  interestPercentage: number;
}

export interface LoanCalculationResultDto {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  effectiveRate: number;
  loanToValueRatio?: number;
  debtToIncomeImpact: number;
  amortizationSchedule: AmortizationEntry[];
  summary: LoanCalculationSummary;
}

export interface EarlyPayoffCalculationDto {
  loanId: string;
  extraMonthlyPayment?: number;
  lumpSumPayment?: number;
}

export interface EarlyPayoffResultDto {
  originalPayoffDate: string;
  newPayoffDate: string;
  monthsSaved: number;
  interestSaved: number;
  totalExtraPayments: number;
  netSavings: number;
}

export interface PaymentSchedulePreviewParams {
  [key: string]: unknown;
  principal: number;
  interestRate: number;
  termInMonths: number;
  loanType?: LoanType;
  downPayment?: number;
  riskAdjustment?: number;
  extraPayment?: number;
}

export interface PaymentScheduleEntry {
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  date: string;
}

export interface PaymentSchedulePreview {
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  schedule: PaymentScheduleEntry[];
}
