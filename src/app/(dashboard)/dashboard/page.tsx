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
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function DashboardPage() {
  const { t } = useI18n();
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
        <h1 className="text-xl font-bold text-foreground">{t('pages.dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('pages.dashboard.subtitle')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('pages.dashboard.totalLoans')}
          value={loadingLoans ? '—' : totalLoans}
          subtitle={t('pages.dashboard.allTime')}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatsCard
          title={t('pages.dashboard.activeLoans')}
          value={loadingLoans ? '—' : activeLoans}
          subtitle={t('pages.dashboard.currentlyActive')}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatsCard
          title={t('pages.dashboard.overdueInstallments')}
          value={loadingInstallments ? '—' : overdueCount}
          subtitle={
            installmentStats
                ? `${formatCurrency(installmentStats.overdueAmount)} ${t('pages.dashboard.outstanding')}`
              : undefined
          }
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <StatsCard
          title={t('pages.dashboard.totalClients')}
          value={loadingClients ? '—' : (clientStats?.totalClients ?? 0)}
          subtitle={
            clientStats
              ? `${clientStats.newClientsThisMonth} ${t('pages.dashboard.newThisMonth')}`
              : undefined
          }
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t('pages.dashboard.loansByStatus')}</h2>
          <LoanStatusChart statistics={loanStats} isLoading={loadingLoans} />
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-3 text-sm font-semibold text-foreground">{t('pages.dashboard.portfolioSummary')}</h2>
          <dl className="space-y-3">
            {[
              { label: t('pages.dashboard.totalPortfolioValue'), value: formatCurrency(totalPortfolio) },
              {
                label: t('pages.dashboard.averageLoanAmount'),
                value: loanStats ? formatCurrency(loanStats.averageLoanAmount) : '—',
              },
              {
                label: t('pages.dashboard.averageInterestRate'),
                value: loanStats ? formatPercent(loanStats.averageInterestRate) : '—',
              },
              {
                label: t('pages.dashboard.approvalRate'),
                value: loanStats ? formatPercent(loanStats.approvalRate / 100) : '—',
              },
              {
                label: t('pages.dashboard.averageCreditScore'),
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
