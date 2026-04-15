'use client';

import React, { useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Zap, TrendingDown, ShieldCheck } from 'lucide-react';
import { useLoan, useApproveLoan, useRejectLoan, useActivateLoan } from '@/hooks/useLoans';
import { useInstallmentsByLoan } from '@/hooks/useInstallments';
import { usePayments } from '@/hooks/usePayments';
import { LoanStatusBadge } from '@/components/loans/LoanStatusBadge';
import { InstallmentStatusBadge } from '@/components/installments/InstallmentStatusBadge';
import { EarlySettlementModal } from '@/components/loans/EarlySettlementModal';
import { PrepaymentModal } from '@/components/loans/PrepaymentModal';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { formatPercent } from '@/lib/formatters';
import { ApiError } from '@/lib/api/client';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { LoanStatus, InterestCalculationMethod } from '@/types/loan';
import { PaymentMethod, PaymentStatus, PaymentType, type LoanPayment } from '@/types/payment';

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: loan, isLoading } = useLoan(id);
  const { t } = useI18n();
  const { data: installments = [] } = useInstallmentsByLoan(id);
  const { data: paymentsResponse } = usePayments({ loanId: id, limit: 500, status: PaymentStatus.Completed });
  const approveLoan = useApproveLoan();
  const rejectLoan = useRejectLoan();
  const activateLoan = useActivateLoan();

  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | 'activate' | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'schedule' | 'payments'>('details');
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showPrepaymentModal, setShowPrepaymentModal] = useState(false);

  if (isLoading) return <PageLoader />;
  if (!loan) return <p className="text-muted-foreground">{t('pages.loans.loanNotFound')}</p>;

  const payments = paymentsResponse?.data ?? [];
  const paidAmount = payments.reduce((acc, payment) => acc + Number(payment.amount), 0);
  const remainingAmount = Math.max(Number(loan.totalAmount) - paidAmount, 0);
  const progressPct = loan.totalAmount > 0 ? Math.min((paidAmount / Number(loan.totalAmount)) * 100, 100) : 0;

  const handleAction = async () => {
    try {
      if (confirmAction === 'approve') await approveLoan.mutateAsync(id);
      if (confirmAction === 'reject') await rejectLoan.mutateAsync({ id, reason: 'Rejected by officer' });
      if (confirmAction === 'activate') await activateLoan.mutateAsync(id);
      setConfirmError(null);
      setConfirmAction(null);
    } catch (error) {
      if (error instanceof ApiError) {
        setConfirmError(error.message);
        return;
      }
      setConfirmError(`${t('common.somethingWentWrong')}. ${t('common.tryAgain')}.`);
    }
  };

  const actionConfig = {
    approve: {
      title: t('pages.loans.approveTitle'),
      description: t('pages.loans.approveDescription'),
      label: t('actions.approve'),
      variant: 'default' as const,
    },
    reject: {
      title: t('pages.loans.rejectTitle'),
      description: t('pages.loans.rejectDescription'),
      label: t('actions.reject'),
      variant: 'danger' as const,
    },
    activate: {
      title: t('pages.loans.activateTitle'),
      description: t('pages.loans.activateDescription'),
      label: t('actions.activate'),
      variant: 'default' as const,
    },
  };

  const interestRateDisplay =
    loan.interestCalculationMethod === InterestCalculationMethod.DecliningBalance
      ? `${formatPercent(loan.interestRate)} (${t('pages.loans.monthlyEquivalent')}: ${formatPercent(loan.interestRate / 12)})`
      : formatPercent(loan.interestRate);

  const paymentTypeLabels: Record<PaymentType, string> = {
    [PaymentType.Installment]: 'Installment',
    [PaymentType.Prepayment]: 'Prepayment',
    [PaymentType.Settlement]: 'Settlement',
  };

  const paymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.Cash]: t('paymentMethods.cash'),
    [PaymentMethod.BankTransfer]: t('paymentMethods.bank_transfer'),
    [PaymentMethod.CreditCard]: t('paymentMethods.credit_card'),
    [PaymentMethod.Check]: t('paymentMethods.check'),
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/loans" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t('pages.loansNew.backToLoans')}
        </Link>
        <div className="flex items-center gap-2">
          {loan.status === LoanStatus.Pending && (
            <>
              <button
                onClick={() => { setConfirmAction('approve'); setConfirmError(null); }}
                className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {t('actions.approve')}
              </button>
              <button
                onClick={() => { setConfirmAction('reject'); setConfirmError(null); }}
                className="flex items-center gap-1.5 rounded-md border border-destructive px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
              >
                <XCircle className="h-3.5 w-3.5" />
                {t('actions.reject')}
              </button>
            </>
          )}
          {loan.status === LoanStatus.Approved && (
            <button
              onClick={() => { setConfirmAction('activate'); setConfirmError(null); }}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
            >
              <Zap className="h-3.5 w-3.5" />
              {t('actions.activate')}
            </button>
          )}
          {loan.status === LoanStatus.Active && (
            <button
              onClick={() => setShowSettlementModal(true)}
              className="flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {t('pages.loans.earlySettlementButton')}
            </button>
          )}
          {loan.status === LoanStatus.Active &&
            loan.interestCalculationMethod === InterestCalculationMethod.DecliningBalance && (
              <button
                onClick={() => setShowPrepaymentModal(true)}
                className="flex items-center gap-1.5 rounded-md border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
              >
                <TrendingDown className="h-3.5 w-3.5" />
                {t('pages.loans.prepaymentButton')}
              </button>
            )}
        </div>
      </div>

      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">
                {loan.client ? `${loan.client.firstName} ${loan.client.lastName}` : t('pages.loans.title')}
              </h1>
              <LoanStatusBadge status={loan.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground font-mono">ID: {loan.id}</p>
          </div>
          {loan.client && (
            <Link href={`/clients/${loan.client.id}`} className="text-xs text-primary hover:underline">
              {t('pages.loans.viewClient')} →
            </Link>
          )}
        </div>

        {/* Financial summary */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: t('pages.loans.principal'), value: <CurrencyDisplay value={loan.principal} /> },
            { label: t('pages.calculations.monthlyPayment'), value: <CurrencyDisplay value={loan.monthlyPayment} /> },
            { label: t('pages.loans.interestRateLabel'), value: interestRateDisplay },
            { label: t('pages.loans.term'), value: `${loan.termInMonths} ${t('pages.loans.months')}` },
            { label: t('pages.calculations.totalInterest'), value: <CurrencyDisplay value={loan.totalInterest} /> },
            { label: t('pages.calculations.totalAmount'), value: <CurrencyDisplay value={loan.totalAmount} /> },
            { label: t('pages.loans.type'), value: t(`loanTypes.${loan.loanType}`) },
            { label: t('pages.loans.purpose'), value: t(`loanPurposes.${loan.loanPurpose}`) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {loan.status === LoanStatus.Active && (
          <div className="mt-5 border-t border-border pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span className="flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5" />
                {t('pages.loans.repaymentProgress')}
              </span>
              <span>{progressPct.toFixed(1)}% {t('status.paid').toLowerCase()}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span><CurrencyDisplay value={paidAmount} /> {t('status.paid').toLowerCase()}</span>
              <span><CurrencyDisplay value={remainingAmount} /> {t('pages.installments.remaining').toLowerCase()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-border">
          {(['details', 'schedule', 'payments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'schedule'
                ? t('pages.calculations.amortizationSchedule')
                : tab === 'payments'
                  ? t('pages.payments.title')
                  : t('common.detail')}
            </button>
          ))}
        </div>

        {activeTab === 'details' && (
          <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: t('pages.loans.startDate'), value: <DateDisplay value={loan.startDate} /> },
                { label: t('pages.loans.endDate'), value: <DateDisplay value={loan.endDate} /> },
                { label: t('pages.loans.createdAt'), value: <DateDisplay value={loan.createdAt} withTime /> },
                { label: t('pages.loans.updatedAt'), value: <DateDisplay value={loan.updatedAt} withTime /> },
                {
                  label: t('pages.loans.interestMethod'),
                  value: t(`interestMethods.${loan.interestCalculationMethod}`),
                },
                ...(loan.earlySettlementRebatePercentage != null
                  ? [{ label: t('pages.loans.settlementRebate'), value: `${(loan.earlySettlementRebatePercentage * 100).toFixed(0)}%` }]
                  : []),
                ...(loan.riskAdjustment ? [{ label: t('pages.loans.riskAdjustment'), value: `${(loan.riskAdjustment * 100).toFixed(2)}%` }] : []),
                ...(loan.downPayment ? [{ label: t('pages.loans.downPayment'), value: <CurrencyDisplay value={loan.downPayment} /> }] : []),
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-foreground mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>
            {loan.notes && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{t('pages.loans.notes')}</p>
                <p className="text-sm text-foreground">{loan.notes}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  {[
                    '#',
                    t('pages.installments.dueDateCol'),
                    t('pages.installments.principal'),
                    t('pages.installments.interest'),
                    t('pages.installments.total'),
                    t('pages.calculations.balance'),
                    t('pages.loans.status'),
                  ].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {installments.map((inst) => (
                  <tr key={inst.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-mono text-muted-foreground">{inst.installmentNumber}</td>
                    <td className="px-4 py-2.5"><DateDisplay value={inst.dueDate} /></td>
                    <td className="px-4 py-2.5"><CurrencyDisplay value={inst.principalAmount} /></td>
                    <td className="px-4 py-2.5"><CurrencyDisplay value={inst.interestAmount} /></td>
                    <td className="px-4 py-2.5 font-medium"><CurrencyDisplay value={inst.totalAmount} /></td>
                    <td className="px-4 py-2.5"><CurrencyDisplay value={inst.remainingBalance} /></td>
                    <td className="px-4 py-2.5">
                      <InstallmentStatusBadge status={inst.status} />
                    </td>
                  </tr>
                ))}
                {!installments.length && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      {t('pages.loans.noInstallmentSchedule')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  {[
                    t('pages.payments.date'),
                    t('pages.payments.amount'),
                    t('pages.payments.method'),
                    t('pages.payments.reference'),
                    t('pages.payments.installmentNumber'),
                    t('pages.payments.status'),
                  ].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: LoanPayment) => (
                  <tr key={payment.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col">
                        <DateDisplay value={payment.paymentDate} />
                        <span className="text-xs text-muted-foreground">{paymentTypeLabels[payment.paymentType]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-medium"><CurrencyDisplay value={payment.amount} /></td>
                    <td className="px-4 py-2.5">{paymentMethodLabels[payment.paymentMethod]}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{payment.referenceNumber ?? '—'}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{payment.installment?.installmentNumber ?? '—'}</td>
                    <td className="px-4 py-2.5">{payment.status}</td>
                  </tr>
                ))}
                {!payments.length && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      {t('pages.payments.noPayments')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmAction && (
        <ConfirmDialog
          open
          title={actionConfig[confirmAction].title}
          description={actionConfig[confirmAction].description}
          errorMessage={confirmError ?? undefined}
          confirmLabel={actionConfig[confirmAction].label}
          variant={actionConfig[confirmAction].variant}
          isLoading={approveLoan.isPending || rejectLoan.isPending || activateLoan.isPending}
          onConfirm={handleAction}
          onCancel={() => {
            setConfirmAction(null);
            setConfirmError(null);
          }}
        />
      )}

      {showSettlementModal && (
        <EarlySettlementModal
          loanId={id}
          open={showSettlementModal}
          onClose={() => setShowSettlementModal(false)}
        />
      )}

      {showPrepaymentModal && loan && (
        <PrepaymentModal
          loan={loan}
          open={showPrepaymentModal}
          onClose={() => setShowPrepaymentModal(false)}
        />
      )}
    </div>
  );
}
