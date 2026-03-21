export enum InstallmentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Overdue = 'overdue',
  Partial = 'partial',
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
