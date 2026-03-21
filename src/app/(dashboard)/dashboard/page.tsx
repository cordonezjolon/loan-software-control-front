'use client';

import React from 'react';
import { Users, CreditCard, AlertCircle, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LoanStatusChart } from '@/components/dashboard/LoanStatusChart';
import { RecentLoansTable } from '@/components/dashboard/RecentLoansTable';
import { OverdueInstallmentsWidget } from '@/components/dashboard/OverdueInstallmentsWidget';
import { useClientStats } from '@/hooks/useClients';
import { useLoanStatistics } from '@/hooks/useLoans';
import { useInstallmentStatistics } from '@/hooks/useInstallments';
import { formatCurrency, formatPercent } from '@/lib/formatters';

export default function DashboardPage() {
  const { data: clientStats, isLoading: loadingClients } = useClientStats();
  const { data: loanStats, isLoading: loadingLoans } = useLoanStatistics();
  const { data: installmentStats, isLoading: loadingInstallments } = useInstallmentStatistics();

  const totalPortfolio = loanStats?.totalPrincipal ?? 0;
  const totalLoans = loanStats?.totalLoans ?? 0;
  const activeLoans = loanStats?.loansByStatus?.active ?? 0;
  const overdueCount = installmentStats?.overdueInstallments ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your loan portfolio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Loans"
          value={loadingLoans ? '—' : totalLoans}
          subtitle="All time"
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatsCard
          title="Active Loans"
          value={loadingLoans ? '—' : activeLoans}
          subtitle="Currently active"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatsCard
          title="Overdue Installments"
          value={loadingInstallments ? '—' : overdueCount}
          subtitle={
            installmentStats
              ? `${formatCurrency(installmentStats.overdueAmount)} outstanding`
              : undefined
          }
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Clients"
          value={loadingClients ? '—' : (clientStats?.totalClients ?? 0)}
          subtitle={
            clientStats
              ? `${clientStats.newClientsThisMonth} new this month`
              : undefined
          }
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Loans by Status</h2>
          <LoanStatusChart statistics={loanStats} isLoading={loadingLoans} />
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Portfolio Summary</h2>
          <dl className="space-y-3">
            {[
              { label: 'Total Portfolio Value', value: formatCurrency(totalPortfolio) },
              {
                label: 'Average Loan Amount',
                value: loanStats ? formatCurrency(loanStats.averageLoanAmount) : '—',
              },
              {
                label: 'Average Interest Rate',
                value: loanStats ? formatPercent(loanStats.averageInterestRate) : '—',
              },
              {
                label: 'Approval Rate',
                value: loanStats ? formatPercent(loanStats.approvalRate / 100) : '—',
              },
              {
                label: 'Average Credit Score',
                value: clientStats?.averageCreditScore
                  ? Math.round(clientStats.averageCreditScore).toString()
                  : '—',
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="text-sm font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentLoansTable />
        </div>
        <OverdueInstallmentsWidget />
      </div>
    </div>
  );
}
