// Inline summary to avoid circular dep with loan.ts
export interface LoanSummary {
  id: string;
  principal: number;
  interestRate: number;
  termInMonths: number;
  monthlyPayment: number;
  totalAmount: number;
  loanType: string;
  loanPurpose: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: Address;
  occupation?: string;
  monthlyIncome?: number;
  creditScore?: number;
  employmentYears?: number;
  debtToIncomeRatio?: number;
  isActive: boolean;
  notes?: string;
  loans: LoanSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientStats {
  totalClients: number;
  newClientsThisMonth: number;
  averageCreditScore: number;
  averageMonthlyIncome: number;
}

export interface RiskProfile {
  creditScore: number;
  debtToIncomeRatio: number;
  employmentYears: number;
  monthlyIncome: number;
}

export interface CreateClientDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: Address;
  occupation?: string;
  monthlyIncome?: number;
  creditScore?: number;
  employmentYears?: number;
  notes?: string;
}

export type UpdateClientDto = Partial<CreateClientDto>;
