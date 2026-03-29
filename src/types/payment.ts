export enum PaymentMethod {
  Cash = 'cash',
  BankTransfer = 'bank_transfer',
  CreditCard = 'credit_card',
  Check = 'check',
}

export enum PaymentStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export enum PaymentType {
  Installment = 'installment',
  Prepayment = 'prepayment',
  Settlement = 'settlement',
}

export interface LoanPayment {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  installment?: {
    id: string;
    installmentNumber: number;
    totalAmount: number;
    loan?: {
      id: string;
      client?: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
  };
}

export interface CreatePaymentDto {
  installmentId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}

export interface CreateAdvancePaymentDto {
  loanId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}

export interface CreatePrepaymentDto {
  loanId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  prepaymentAction?: string;
  referenceNumber?: string;
  notes?: string;
}

export interface PrepaymentInstallmentDto {
  installmentNumber: number;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  remainingBalance: number;
  dueDate: string;
}

export interface PrepaymentResultDto {
  loanId: string;
  prepaidAmount: number;
  previousBalance: number;
  newRemainingBalance: number;
  prepaymentAction: string;
  previousRemainingInstallments: number;
  newRemainingInstallments: number;
  monthsSaved?: number;
  newMonthlyPayment?: number;
  newSchedule: PrepaymentInstallmentDto[];
}

export interface AdvancePaymentAllocation {
  installmentId: string;
  installmentNumber: number;
  allocatedAmount: number;
  installmentStatus: string;
  remainingInstallmentBalance: number;
}

export interface AdvancePaymentResult {
  loanId: string;
  requestedAmount: number;
  allocatedAmount: number;
  remainingLoanBalance: number;
  fullyPaidOff: boolean;
  allocations: AdvancePaymentAllocation[];
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: 'Cash',
  [PaymentMethod.BankTransfer]: 'Bank Transfer',
  [PaymentMethod.CreditCard]: 'Credit Card',
  [PaymentMethod.Check]: 'Check',
};

export const PAYMENT_STATUS_CONFIG: Record<PaymentMethod | PaymentStatus, { label: string; color: string; bg: string }> = {
  [PaymentStatus.Pending]:   { label: 'Pending',   color: 'text-yellow-700', bg: 'bg-yellow-100' },
  [PaymentStatus.Completed]: { label: 'Completed', color: 'text-green-700',  bg: 'bg-green-100' },
  [PaymentStatus.Failed]:    { label: 'Failed',    color: 'text-red-700',    bg: 'bg-red-100' },
  [PaymentStatus.Cancelled]: { label: 'Cancelled', color: 'text-gray-600',   bg: 'bg-gray-100' },
  [PaymentMethod.Cash]:        { label: 'Cash',          color: 'text-slate-700', bg: 'bg-slate-100' },
  [PaymentMethod.BankTransfer]:{ label: 'Bank Transfer', color: 'text-blue-700',  bg: 'bg-blue-100' },
  [PaymentMethod.CreditCard]:  { label: 'Credit Card',   color: 'text-purple-700',bg: 'bg-purple-100' },
  [PaymentMethod.Check]:       { label: 'Check',         color: 'text-orange-700',bg: 'bg-orange-100' },
};
