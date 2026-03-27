export enum InstallmentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Overdue = 'overdue',
  Partial = 'partial',
}

/** Partial client info returned inside installment relations */
export interface InstallmentClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

/** Partial loan info returned inside installment relations */
export interface InstallmentLoan {
  id: string;
  loanType: string;
  principal: number;
  client?: InstallmentClient;
}

export interface LoanInstallment {
  id: string;
  installmentNumber: number;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  remainingBalance: number;
  dueDate: string;
  lateFee: number;
  status: InstallmentStatus;
  payments: string[];
  /** Populated when fetched via findAll or findOne */
  loan?: InstallmentLoan;
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentStatistics {
  totalInstallments: number;
  paidInstallments: number;
  overdueInstallments: number;
  pendingAmount: number;
  overdueAmount: number;
  totalLateFees: number;
  nextDueDate: string;
  averageDaysOverdue: number;
}

export interface RemainingBalance {
  remainingBalance: number;
  principalBalance: number;
  lateFeesBalance: number;
}

export interface RescheduleEntry {
  installmentNumber: number;
  totalAmount: number;
  dueDate: string;
}

export interface PaymentHistoryEntry {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  reference: string;
}
