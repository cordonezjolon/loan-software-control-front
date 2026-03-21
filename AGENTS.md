# Loan Management Frontend — Agent Specifications

## Agent: Next.js Loan Management Frontend Expert

### Description
A specialized agent for building a comprehensive, responsive, and beautiful loan management frontend using **Next.js 14+ (App Router)**, **TypeScript**, **React 18+**, and **Tailwind CSS**. This agent enforces SOLID principles, clean component architecture, and pixel-perfect UI patterns tailored for a financial management platform.

### Backend API
- **Base URL:** `http://localhost:3000`
- **API Prefix:** `/api/v1`
- **Auth:** JWT Bearer Token (header: `Authorization: Bearer <token>`)
- **Swagger Docs:** `http://localhost:3000/api/docs`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router, Server Components) |
| Language | TypeScript 5+ (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand (global) + TanStack Query (server state) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP Client | Native fetch (with custom wrapper) |
| Testing | Jest + React Testing Library + Playwright (E2E) |
| Code Quality | ESLint + Prettier + Husky |
| Formatting | Prettier with Tailwind plugin |

---

## Project Initialization

```bash
npx create-next-app@latest loan-software-control-front \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

# Install core dependencies
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install zustand
npm install react-hook-form @hookform/resolvers zod
npm install recharts
npm install lucide-react
npm install clsx tailwind-merge
npm install date-fns
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-toast
npm install @radix-ui/react-tabs @radix-ui/react-badge
npm install @radix-ui/react-avatar @radix-ui/react-separator
npm install next-themes

# Install shadcn/ui
npx shadcn-ui@latest init

# Dev dependencies
npm install -D @types/node prettier prettier-plugin-tailwindcss
npm install -D husky lint-staged @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test
```

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (no layout)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/              # Protected route group
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── clients/
│   │   │   ├── page.tsx          # Clients list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Client detail
│   │   │   └── new/
│   │   │       └── page.tsx      # Create client
│   │   ├── loans/
│   │   │   ├── page.tsx          # Loans list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Loan detail + schedule
│   │   │   └── new/
│   │   │       └── page.tsx      # Create loan
│   │   ├── installments/
│   │   │   └── page.tsx
│   │   ├── payments/
│   │   │   └── page.tsx
│   │   ├── calculations/
│   │   │   └── page.tsx          # Loan calculator
│   │   └── notifications/
│   │       └── page.tsx
│   ├── api/                      # Next.js API routes (BFF layer)
│   │   └── [...proxy]/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx                # Root layout
│   └── not-found.tsx
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── MobileSidebar.tsx
│   │   └── Breadcrumbs.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── LoanStatusChart.tsx
│   │   ├── RecentLoansTable.tsx
│   │   └── OverdueInstallmentsWidget.tsx
│   ├── clients/
│   │   ├── ClientCard.tsx
│   │   ├── ClientForm.tsx
│   │   ├── ClientsTable.tsx
│   │   ├── ClientSearch.tsx
│   │   └── RiskProfileBadge.tsx
│   ├── loans/
│   │   ├── LoanCard.tsx
│   │   ├── LoanForm.tsx
│   │   ├── LoansTable.tsx
│   │   ├── LoanStatusBadge.tsx
│   │   ├── AmortizationTable.tsx
│   │   └── LoanActions.tsx
│   ├── installments/
│   │   ├── InstallmentRow.tsx
│   │   ├── InstallmentsTable.tsx
│   │   └── OverdueAlert.tsx
│   ├── calculations/
│   │   ├── LoanCalculator.tsx
│   │   ├── EarlyPayoffCalculator.tsx
│   │   └── AmortizationChart.tsx
│   ├── notifications/
│   │   ├── NotificationItem.tsx
│   │   ├── NotificationsBell.tsx
│   │   └── NotificationsList.tsx
│   └── shared/
│       ├── DataTable.tsx
│       ├── Pagination.tsx
│       ├── SearchInput.tsx
│       ├── FilterPanel.tsx
│       ├── CurrencyDisplay.tsx
│       ├── DateDisplay.tsx
│       ├── EmptyState.tsx
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── ConfirmDialog.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useClients.ts
│   ├── useLoans.ts
│   ├── useInstallments.ts
│   ├── useCalculations.ts
│   ├── useNotifications.ts
│   └── useDebounce.ts
├── lib/
│   ├── api/
│   │   ├── client.ts             # Fetch wrapper with auth
│   │   ├── auth.ts
│   │   ├── clients.ts
│   │   ├── loans.ts
│   │   ├── installments.ts
│   │   ├── calculations.ts
│   │   └── notifications.ts
│   ├── utils.ts                  # clsx, formatters
│   ├── formatters.ts             # Currency, date, percentage
│   └── constants.ts
├── stores/
│   ├── authStore.ts
│   └── uiStore.ts
├── types/
│   ├── api.ts                    # All API response/request types
│   ├── auth.ts
│   ├── client.ts
│   ├── loan.ts
│   ├── installment.ts
│   └── notification.ts
└── middleware.ts                 # Route protection
```

---

## API Integration

### HTTP Client Wrapper

```typescript
// src/lib/api/client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('access_token')
    : null;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message ?? 'Request failed', errorData);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  get: <T>(endpoint: string, options?: ApiOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: ApiOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
```

---

## TypeScript Types (from API Schema)

```typescript
// src/types/api.ts

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// src/types/auth.ts
export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  role?: UserRole;
}

export enum UserRole {
  Admin = 'admin',
  LoanOfficer = 'loan_officer',
  Employee = 'employee',
}

export interface UserResponse {
  id: string;
  username: string;
  role: UserRole;
}

export interface JwtAuthResponse {
  accessToken: string;
  user: UserResponse;
}

// src/types/client.ts
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
  loans: Loan[];
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

// src/types/loan.ts
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
  riskAdjustment?: number;
  downPayment?: number;
  loanOfficerId?: string;
  notes?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  installments?: LoanInstallment[];
}

export interface LoanStatistics {
  totalLoans: number;
  totalPrincipal: number;
  averageLoanAmount: number;
  loansByStatus: Record<LoanStatus, number>;
  loansByType: Record<LoanType, number>;
  averageInterestRate: number;
  approvalRate: number;
}

// src/types/installment.ts
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

// src/types/notification.ts
export enum NotificationType {
  Email = 'email',
  SMS = 'sms',
  Push = 'push',
  InApp = 'in_app',
}

export enum NotificationCategory {
  PaymentReminder = 'payment_reminder',
  LoanApproval = 'loan_approval',
  LoanRejection = 'loan_rejection',
  PaymentReceived = 'payment_received',
  OverduePayment = 'overdue_payment',
  LoanCompletion = 'loan_completion',
  SystemAlert = 'system_alert',
  Promotional = 'promotional',
}

export enum NotificationPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Urgent = 'urgent',
}

export enum NotificationStatus {
  Pending = 'pending',
  Sent = 'sent',
  Delivered = 'delivered',
  Failed = 'failed',
  Read = 'read',
}

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  subject: string;
  message: string;
  metadata?: Record<string, unknown>;
  status: NotificationStatus;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  retryCount: number;
  nextRetryAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## API Modules

### Authentication API
```typescript
// src/lib/api/auth.ts
export const authApi = {
  login: (dto: LoginDto) =>
    api.post<JwtAuthResponse>('/auth/login', dto),

  register: (dto: RegisterDto) =>
    api.post<JwtAuthResponse>('/auth/register', dto),

  validateToken: () =>
    api.post<{ valid: boolean }>('/auth/validate-token'),
};
```

### Clients API
```typescript
// src/lib/api/clients.ts
export interface ClientsQuery extends PaginationParams {
  search?: string;
  minCreditScore?: number;
  minMonthlyIncome?: number;
}

export const clientsApi = {
  findAll: (params?: ClientsQuery) =>
    api.get<PaginatedResponse<Client>>('/clients', { params }),

  findOne: (id: string) =>
    api.get<Client>(`/clients/${id}`),

  create: (dto: CreateClientDto) =>
    api.post<Client>('/clients', dto),

  update: (id: string, dto: UpdateClientDto) =>
    api.patch<Client>(`/clients/${id}`, dto),

  remove: (id: string) =>
    api.delete<void>(`/clients/${id}`),

  getStats: () =>
    api.get<ClientStats>('/clients/stats'),

  getEligible: () =>
    api.get<Client[]>('/clients/eligible'),

  search: (term: string) =>
    api.get<Client[]>('/clients/search', { params: { term } }),

  getRiskProfile: (id: string) =>
    api.get<RiskProfile>(`/clients/${id}/risk-profile`),
};
```

### Loans API
```typescript
// src/lib/api/loans.ts
export interface LoansQuery extends PaginationParams {
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
  findAll: (params?: LoansQuery) =>
    api.get<PaginatedResponse<Loan>>('/api/v1/loans', { params }),

  findOne: (id: string) =>
    api.get<Loan>(`/api/v1/loans/${id}`),

  create: (dto: CreateLoanDto) =>
    api.post<Loan>('/api/v1/loans', dto),

  update: (id: string, dto: UpdateLoanDto) =>
    api.patch<Loan>(`/api/v1/loans/${id}`, dto),

  remove: (id: string) =>
    api.delete<void>(`/api/v1/loans/${id}`),

  getStatistics: (loanOfficerId?: string) =>
    api.get<LoanStatistics>('/api/v1/loans/statistics', {
      params: loanOfficerId ? { loanOfficerId } : undefined,
    }),

  getCurrentBalance: (id: string) =>
    api.get<LoanBalance>(`/api/v1/loans/${id}/balance`),

  approve: (id: string) =>
    api.post<Loan>(`/api/v1/loans/${id}/approve`),

  reject: (id: string, reason: string) =>
    api.post<Loan>(`/api/v1/loans/${id}/reject`, { reason }),

  activate: (id: string) =>
    api.post<Loan>(`/api/v1/loans/${id}/activate`),
};
```

### Calculations API
```typescript
// src/lib/api/calculations.ts
export const calculationsApi = {
  calculate: (dto: LoanCalculationDto) =>
    api.post<LoanCalculationResultDto>('/api/v1/loan-calculations/calculate', dto),

  earlyPayoff: (dto: EarlyPayoffCalculationDto) =>
    api.post<EarlyPayoffResultDto>('/api/v1/loan-calculations/early-payoff', dto),

  previewSchedule: (params: PaymentSchedulePreviewParams) =>
    api.get<PaymentSchedulePreview>('/api/v1/loan-calculations/payment-schedule-preview', { params }),
};
```

### Installments API
```typescript
// src/lib/api/installments.ts
export interface InstallmentsQuery extends PaginationParams {
  loanId?: string;
  clientId?: string;
  status?: InstallmentStatus;
  dueDateFrom?: string;
  dueDateTo?: string;
  overdueDaysMin?: number;
  overdueOnly?: boolean;
}

export const installmentsApi = {
  findAll: (params?: InstallmentsQuery) =>
    api.get<PaginatedResponse<LoanInstallment>>('/api/v1/installments', { params }),

  findOne: (id: string) =>
    api.get<LoanInstallment>(`/api/v1/installments/${id}`),

  findByLoanId: (loanId: string) =>
    api.get<LoanInstallment[]>(`/api/v1/installments/loan/${loanId}`),

  getOverdue: () =>
    api.get<LoanInstallment[]>('/api/v1/installments/overdue'),

  getUpcoming: (days: number) =>
    api.get<LoanInstallment[]>(`/api/v1/installments/upcoming/${days}`),

  getStatistics: (loanId?: string) =>
    api.get<InstallmentStatistics>('/api/v1/installments/statistics', {
      params: loanId ? { loanId } : undefined,
    }),

  getRemainingBalance: (loanId: string) =>
    api.get<RemainingBalance>(`/api/v1/installments/loan/${loanId}/balance`),

  applyLateFee: (id: string, amount: number, reason?: string) =>
    api.post<LoanInstallment>(`/api/v1/installments/${id}/apply-late-fee`, { amount, reason }),

  reschedule: (loanId: string, newSchedule: RescheduleEntry[]) =>
    api.patch<LoanInstallment[]>(`/api/v1/installments/loan/${loanId}/reschedule`, { newSchedule }),

  getPaymentHistory: (id: string) =>
    api.get<PaymentHistoryEntry[]>(`/api/v1/installments/${id}/payment-history`),
};
```

---

## TanStack Query Hooks

```typescript
// src/hooks/useLoans.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const LOANS_QUERY_KEY = 'loans';

export function useLoans(params?: LoansQuery) {
  return useQuery({
    queryKey: [LOANS_QUERY_KEY, params],
    queryFn: () => loansApi.findAll(params),
    staleTime: 30_000,
  });
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: [LOANS_QUERY_KEY, id],
    queryFn: () => loansApi.findOne(id),
    enabled: Boolean(id),
  });
}

export function useLoanStatistics(loanOfficerId?: string) {
  return useQuery({
    queryKey: [LOANS_QUERY_KEY, 'statistics', loanOfficerId],
    queryFn: () => loansApi.getStatistics(loanOfficerId),
    staleTime: 60_000,
  });
}

export function useApproveLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loansApi.approve,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [LOANS_QUERY_KEY] });
    },
  });
}

export function useRejectLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      loansApi.reject(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [LOANS_QUERY_KEY] });
    },
  });
}
```

---

## Auth Store (Zustand)

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  token: string | null;
  user: UserResponse | null;
  setAuth: (token: string, user: UserResponse) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem('access_token', token);
        set({ token, user });
      },
      clearAuth: () => {
        localStorage.removeItem('access_token');
        set({ token: null, user: null });
      },
      isAuthenticated: () => Boolean(get().token && get().user),
      hasRole: (role) => get().user?.role === role,
    }),
    { name: 'auth-storage', partialize: (state) => ({ token: state.token, user: state.user }) },
  ),
);
```

---

## Route Protection (Middleware)

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const isPublic = PUBLIC_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
```

---

## UI Design System

### Color Palette & Theme
```typescript
// tailwind.config.ts
const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Financial brand palette
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a5f',
        },
        success: { light: '#dcfce7', DEFAULT: '#16a34a', dark: '#14532d' },
        warning: { light: '#fef9c3', DEFAULT: '#ca8a04', dark: '#713f12' },
        danger:  { light: '#fee2e2', DEFAULT: '#dc2626', dark: '#7f1d1d' },
        neutral: { 50: '#f8fafc', 100: '#f1f5f9', 800: '#1e293b', 900: '#0f172a' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { lg: '0.75rem', xl: '1rem', '2xl': '1.5rem' },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
};
```

### Loan Status Colors
```typescript
// src/lib/constants.ts
export const LOAN_STATUS_CONFIG: Record<LoanStatus, { label: string; color: string; bg: string }> = {
  pending:      { label: 'Pending',      color: 'text-yellow-700',  bg: 'bg-yellow-100' },
  under_review: { label: 'Under Review', color: 'text-blue-700',    bg: 'bg-blue-100' },
  approved:     { label: 'Approved',     color: 'text-green-700',   bg: 'bg-green-100' },
  rejected:     { label: 'Rejected',     color: 'text-red-700',     bg: 'bg-red-100' },
  active:       { label: 'Active',       color: 'text-emerald-700', bg: 'bg-emerald-100' },
  completed:    { label: 'Completed',    color: 'text-gray-700',    bg: 'bg-gray-100' },
  cancelled:    { label: 'Cancelled',    color: 'text-gray-500',    bg: 'bg-gray-50' },
  defaulted:    { label: 'Defaulted',    color: 'text-red-900',     bg: 'bg-red-200' },
  closed:       { label: 'Closed',       color: 'text-slate-600',   bg: 'bg-slate-100' },
};

export const INSTALLMENT_STATUS_CONFIG: Record<InstallmentStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  paid:    { label: 'Paid',    color: 'text-green-700',  bg: 'bg-green-100' },
  overdue: { label: 'Overdue', color: 'text-red-700',    bg: 'bg-red-100' },
  partial: { label: 'Partial', color: 'text-blue-700',   bg: 'bg-blue-100' },
};
```

---

## Core Components

### Reusable DataTable Component
```typescript
// src/components/shared/DataTable.tsx
interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}
```

### Currency & Date Formatters
```typescript
// src/lib/formatters.ts
export const formatCurrency = (value: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

export const formatPercent = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(value);

export const formatDate = (date: string | Date): string =>
  new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));

export const formatRelativeTime = (date: string | Date): string => {
  // Returns "3 days ago", "in 5 days" etc.
};
```

### Loan Status Badge
```typescript
// src/components/loans/LoanStatusBadge.tsx
export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const config = LOAN_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  );
}
```

### Loan Calculator Component
```typescript
// src/components/calculations/LoanCalculator.tsx
// - Real-time calculation as user types (debounced 500ms)
// - Uses POST /api/v1/api/v1/loan-calculations/calculate
// - Displays: Monthly Payment, Total Interest, Total Amount, Effective Rate
// - Shows amortization chart (Recharts AreaChart)
// - Shows first 12 rows of amortization table with "View All" expand

// Key form fields:
// - principal (number input, $1,000 - $10,000,000)
// - interestRate (number input, 0.1% - 50%)
// - termInMonths (slider + input, 1 - 480 months)
// - loanType (select)
// - downPayment (optional number input)
// - riskAdjustment (optional, 0 - 10%)
// - extraPayment (optional, for early payoff preview)
```

---

## Page Layouts & Features

### Dashboard Page (`/`)
**Data Sources:**
- `GET /api/v1/clients/stats` → Total clients, new this month, avg credit score
- `GET /api/v1/api/v1/loans/statistics` → Loan totals, approval rate, distribution
- `GET /api/v1/api/v1/installments/statistics` → Overdue count, upcoming payments
- `GET /api/v1/api/v1/installments/overdue` → Overdue alert list

**Components:**
- `StatsCard` grid (4 KPI cards: Total Loans, Active Loans, Overdue Installments, Total Portfolio)
- `LoanStatusChart` (Recharts PieChart showing loans by status)
- `LoansByTypeChart` (Recharts BarChart showing loans by type)
- `RecentLoansTable` (last 5 loans)
- `OverdueInstallmentsWidget` (urgent alert list)
- `UpcomingPaymentsWidget` (next 7 days)

### Clients Page (`/clients`)
**Features:**
- Searchable, paginated table with filters (credit score, monthly income)
- `GET /api/v1/clients` with params
- Create client modal / slide-over with `CreateClientForm`
- Inline quick actions: View, Edit, Delete
- CSV export button
- Stats bar: Total, Active, Eligible

**Client Detail (`/clients/[id]`)**
- Header: Name, contact info, risk profile badge
- Tabs: Overview | Loans | Risk Profile
- Overview: address, income, credit score gauge
- Loans tab: list of all client loans with status badges
- Risk Profile: visual breakdown of risk factors
- Actions: Edit, Deactivate

### Loans Page (`/loans`)
**Features:**
- Full-featured data table with multi-filter panel
- Filters: status (multi-select), type, purpose, date range, amount range
- `GET /api/v1/api/v1/loans` with all filter params
- Create loan → step wizard (Select Client → Loan Details → Review & Submit)
- Bulk actions: Approve selected, Export

**Loan Detail (`/loans/[id]`)**
- Header: Loan ID, Status chip, Type badge, Created date
- Financial summary cards: Principal, Monthly Payment, Interest Rate, Term
- Progress bar: Amount paid vs total amount
- Actions panel (role-based):
  - Pending: Approve / Reject / Review
  - Approved: Activate
  - Active: View Balance, Early Payoff Calculator
- Tabs: Details | Amortization Schedule | Payments
- Amortization: full table + AreaChart (principal vs interest over time)

### Loan Calculator Page (`/calculations`)
**Sections:**
1. **Standard Calculator** — real-time PMT calculation with amortization chart
2. **Payment Schedule Preview** — `GET /api/v1/api/v1/loan-calculations/payment-schedule-preview`
3. **Early Payoff Simulator** — `POST /api/v1/api/v1/loan-calculations/early-payoff`
   - Shows: months saved, interest saved, new payoff date

### Installments Page (`/installments`)
**Features:**
- Overdue alert banner (if > 0 overdue)
- Tabs: All | Pending | Overdue | Paid
- Upcoming section: next 7 / 14 / 30 days toggle
- Per-row actions: View payment history, Apply late fee
- Statistics cards at top

### Notifications Page (`/notifications`)
**Features:**
- Notification bell in header with unread count badge
- Full notifications page with category/priority filters
- Mark as read on click
- Filter by: type, category, status, priority
- Stats summary at top

---

## Form Validation (Zod Schemas)

```typescript
// src/lib/schemas/loan.schema.ts
import { z } from 'zod';

export const createLoanSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  principal: z.number().min(1000, 'Minimum $1,000').max(5_000_000, 'Maximum $5,000,000'),
  interestRate: z.number().min(0.01, 'Minimum 1%').max(0.35, 'Maximum 35%'),
  termInMonths: z.number().int().min(6, 'Minimum 6 months').max(480, 'Maximum 480 months'),
  loanType: z.nativeEnum(LoanType),
  loanPurpose: z.nativeEnum(LoanPurpose),
  startDate: z.string().datetime(),
  riskAdjustment: z.number().min(0).max(0.1).optional(),
  downPayment: z.number().min(0).optional(),
  loanOfficerId: z.string().uuid().optional(),
});

export const createClientSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phoneNumber: z.string().min(7),
  dateOfBirth: z.string(),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().optional(),
  }),
  monthlyIncome: z.number().min(0).optional(),
  creditScore: z.number().min(300).max(850).optional(),
  employmentYears: z.number().min(0).optional(),
  notes: z.string().max(200).optional(),
});
```

---

## Sidebar Navigation

```typescript
// src/components/layout/Sidebar.tsx
const NAV_ITEMS = [
  { href: '/',               icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/clients',        icon: Users,           label: 'Clients' },
  { href: '/loans',          icon: CreditCard,      label: 'Loans' },
  { href: '/installments',   icon: Calendar,        label: 'Installments' },
  { href: '/payments',       icon: DollarSign,      label: 'Payments' },
  { href: '/calculations',   icon: Calculator,      label: 'Calculator' },
  { href: '/notifications',  icon: Bell,            label: 'Notifications', badge: true },
];
```

---

## Responsiveness Strategy

| Breakpoint | Layout |
|---|---|
| `< 640px` (mobile) | Single column, bottom tab nav, drawer sidebars |
| `640–1024px` (tablet) | Minified icon-only sidebar, 2-col grids |
| `> 1024px` (desktop) | Full sidebar 260px, 3–4 col grids |

**Rules:**
- All tables must have horizontal scroll on mobile (`overflow-x-auto`)
- Cards stack vertically on mobile, go 2-col on sm, 4-col on lg
- Modals → full-screen sheets on mobile using `<Sheet>` from shadcn/ui
- Charts use `ResponsiveContainer` from Recharts
- Touch-friendly tap targets: minimum 44×44px

---

## Performance Best Practices

1. **Server Components by default** — fetch data server-side where possible
2. **`use client`** only when needed (event handlers, hooks, browser APIs)
3. **TanStack Query** for client-side caching with `staleTime` and `gcTime`
4. **`next/image`** for all images with explicit `width`/`height`
5. **Route prefetching** with `<Link prefetch>` on navigation items
6. **Code splitting** — lazy load heavy components (charts, calculators) with `dynamic()`
7. **Debounce search inputs** — 300–500ms using `useDebounce` hook
8. **Virtualized tables** for installments lists > 100 rows (use `@tanstack/react-virtual`)
9. **Optimistic updates** for status changes (approve/reject loan)

---

## Accessibility (a11y)

- All interactive elements must have `aria-label` or visible text
- Focus management in modals/sheets (use Radix UI primitives)
- Keyboard navigation for all workflows (Tab, Enter, Escape)
- Color is never the only indicator — always pair with text/icon
- Form fields must have associated `<label>` elements
- Status badges must be screen-reader-friendly: `aria-label="Loan status: Active"`
- Error messages linked with `aria-describedby`

---

## Security Best Practices

- **Never store JWT in localStorage** for production — use `httpOnly` cookies via BFF API route
- Validate all forms client-side (Zod) AND rely on server validation
- Sanitize all user-displayed content (avoid `dangerouslySetInnerHTML`)
- **RBAC enforcement in UI** — hide/disable actions based on `user.role`:
  - `admin`: full access (create/delete users, all loan actions)
  - `loan_officer`: manage loans and clients, approve/reject
  - `employee`: read-only access + create clients
- Rate limiting awareness: show user-friendly messages on 429 responses
- Never log tokens/passwords to console
- Use `Content-Security-Policy` headers via `next.config.ts`

---

## Error Handling Patterns

```typescript
// src/components/shared/ErrorBoundary.tsx
// Catches render errors and shows fallback UI

// API errors → Toast notifications
// 400 → Show field-level validation errors from server
// 401 → Redirect to /login
// 403 → Show "Insufficient permissions" message
// 404 → Show empty state with back button
// 409 → Show conflict message (e.g., "Email already exists")
// 500 → Show generic error with retry button

// src/hooks/useErrorHandler.ts
export function useErrorHandler() {
  return (error: unknown) => {
    if (error instanceof ApiError) {
      // Map status to user-friendly message
    }
    toast.error('An unexpected error occurred');
  };
}
```

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME="Loan Management"
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## Code Quality Configuration

### ESLint
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/exhaustive-deps": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Prettier
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Husky
```json
// package.json (scripts)
{
  "prepare": "husky install",
  "lint": "next lint",
  "format": "prettier --write .",
  "type-check": "tsc --noEmit",
  "test": "jest",
  "test:e2e": "playwright test"
}
```

```bash
# .husky/pre-commit
npx lint-staged

# .husky/pre-push
npm run type-check && npm run test
```

```json
// lint-staged.config.js
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md}": ["prettier --write"]
}
```

---

## Testing Strategy

### Unit Tests (Jest + RTL)
```typescript
// src/components/loans/__tests__/LoanStatusBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { LoanStatusBadge } from '../LoanStatusBadge';
import { LoanStatus } from '@/types/loan';

describe('LoanStatusBadge', () => {
  it('renders correct label for active status', () => {
    render(<LoanStatusBadge status={LoanStatus.Active} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

// src/lib/__tests__/formatters.test.ts
describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
});
```

### E2E Tests (Playwright)
```typescript
// tests/loans.spec.ts
test('loan officer can approve pending loan', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=username]', 'officer@test.com');
  await page.fill('[name=password]', 'password123');
  await page.click('button[type=submit]');
  await page.waitForURL('/');

  await page.goto('/loans');
  await page.click('text=Pending');
  await page.click('button:has-text("Approve")');
  await expect(page.locator('.badge')).toContainText('Approved');
});
```

---

## Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3001
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml (add frontend service)
frontend:
  build: ../loan-software-control-front
  ports:
    - "3001:3001"
  environment:
    - NEXT_PUBLIC_API_URL=http://backend:3000/api/v1
  depends_on:
    - backend
```

---

## Quick Start

```bash
# Clone and install
cd loan-software-control-front
npm install

# Set up environment
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_URL to point to your backend

# Run in development
npm run dev   # starts on http://localhost:3001

# Build for production
npm run build && npm start
```

---

## Summary of All API Endpoints Used

| Feature | Method | Endpoint |
|---|---|---|
| Login | POST | `/auth/login` |
| Register | POST | `/auth/register` |
| Validate token | POST | `/auth/validate-token` |
| List clients | GET | `/clients` |
| Client stats | GET | `/clients/stats` |
| Eligible clients | GET | `/clients/eligible` |
| Search clients | GET | `/clients/search?term=` |
| Create client | POST | `/clients` |
| Get client | GET | `/clients/:id` |
| Update client | PATCH | `/clients/:id` |
| Delete client | DELETE | `/clients/:id` |
| Risk profile | GET | `/clients/:id/risk-profile` |
| List loans | GET | `/api/v1/loans` |
| Loan statistics | GET | `/api/v1/loans/statistics` |
| Create loan | POST | `/api/v1/loans` |
| Get loan | GET | `/api/v1/loans/:id` |
| Update loan | PATCH | `/api/v1/loans/:id` |
| Cancel loan | DELETE | `/api/v1/loans/:id` |
| Loan balance | GET | `/api/v1/loans/:id/balance` |
| Approve loan | POST | `/api/v1/loans/:id/approve` |
| Reject loan | POST | `/api/v1/loans/:id/reject` |
| Activate loan | POST | `/api/v1/loans/:id/activate` |
| Calculate loan | POST | `/api/v1/loan-calculations/calculate` |
| Early payoff | POST | `/api/v1/loan-calculations/early-payoff` |
| Schedule preview | GET | `/api/v1/loan-calculations/payment-schedule-preview` |
| List installments | GET | `/api/v1/installments` |
| Overdue installments | GET | `/api/v1/installments/overdue` |
| Upcoming installments | GET | `/api/v1/installments/upcoming/:days` |
| Installment stats | GET | `/api/v1/installments/statistics` |
| Loan installments | GET | `/api/v1/installments/loan/:loanId` |
| Remaining balance | GET | `/api/v1/installments/loan/:loanId/balance` |
| Get installment | GET | `/api/v1/installments/:id` |
| Payment history | GET | `/api/v1/installments/:id/payment-history` |
| Apply late fee | POST | `/api/v1/installments/:id/apply-late-fee` |
| Reschedule | PATCH | `/api/v1/installments/loan/:loanId/reschedule` |
| List notifications | GET | `/api/v1/notifications` |
| Create notification | POST | `/api/v1/notifications` |
| Bulk notifications | POST | `/api/v1/notifications/bulk` |
| Get notification | GET | `/api/v1/notifications/:id` |
| Mark as read | PATCH | `/api/v1/notifications/:id/read` |
| Payment reminders | POST | `/api/v1/notifications/payment-reminders` |
| Loan approval notify | POST | `/api/v1/notifications/loan-approval/:loanId` |
| Notification stats | GET | `/api/v1/notifications/stats/summary` |
