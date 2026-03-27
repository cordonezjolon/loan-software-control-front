'use client';

import React, { useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Zap, TrendingDown } from 'lucide-react';
import { useLoan, useApproveLoan, useRejectLoan, useActivateLoan } from '@/hooks/useLoans';
import { useInstallmentsByLoan } from '@/hooks/useInstallments';
import { LoanStatusBadge } from '@/components/loans/LoanStatusBadge';
import { InstallmentStatusBadge } from '@/components/installments/InstallmentStatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { LOAN_TYPE_LABELS, LOAN_PURPOSE_LABELS } from '@/lib/constants';
import { ApiError } from '@/lib/api/client';
import { LoanStatus } from '@/types/loan';

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: loan, isLoading } = useLoan(id);
  const { data: installments = [] } = useInstallmentsByLoan(id);
  const approveLoan = useApproveLoan();
  const rejectLoan = useRejectLoan();
  const activateLoan = useActivateLoan();

  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | 'activate' | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'schedule'>('details');

  if (isLoading) return <PageLoader />;
  if (!loan) return <p className="text-muted-foreground">Loan not found.</p>;

  const paidAmount = installments
    .filter((i) => i.status === 'paid')
    .reduce((acc, i) => acc + Number(i.totalAmount), 0);
  const progressPct = loan.totalAmount > 0 ? Math.min((paidAmount / loan.totalAmount) * 100, 100) : 0;

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
      setConfirmError('Unable to complete this action. Please try again.');
    }
  };

  const actionConfig = {
    approve: { title: 'Approve Loan', description: 'Approve this loan application?', label: 'Approve', variant: 'default' as const },
    reject: { title: 'Reject Loan', description: 'Reject this loan application?', label: 'Reject', variant: 'danger' as const },
    activate: { title: 'Activate Loan', description: 'Activate this approved loan?', label: 'Activate', variant: 'default' as const },
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/loans" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Loans
        </Link>
        <div className="flex items-center gap-2">
          {loan.status === LoanStatus.Pending && (
            <>
              <button
                onClick={() => { setConfirmAction('approve'); setConfirmError(null); }}
                className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Approve
              </button>
              <button
                onClick={() => { setConfirmAction('reject'); setConfirmError(null); }}
                className="flex items-center gap-1.5 rounded-md border border-destructive px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </button>
            </>
          )}
          {loan.status === LoanStatus.Approved && (
            <button
              onClick={() => { setConfirmAction('activate'); setConfirmError(null); }}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
            >
              <Zap className="h-3.5 w-3.5" />
              Activate
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
                {loan.client ? `${loan.client.firstName} ${loan.client.lastName}` : 'Loan'}
              </h1>
              <LoanStatusBadge status={loan.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground font-mono">ID: {loan.id}</p>
          </div>
          {loan.client && (
            <Link href={`/clients/${loan.client.id}`} className="text-xs text-primary hover:underline">
              View Client →
            </Link>
          )}
        </div>

        {/* Financial summary */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Principal', value: <CurrencyDisplay value={loan.principal} /> },
            { label: 'Monthly Payment', value: <CurrencyDisplay value={loan.monthlyPayment} /> },
            { label: 'Interest Rate', value: `${(loan.interestRate * 100).toFixed(2)}%` },
            { label: 'Term', value: `${loan.termInMonths} months` },
            { label: 'Total Interest', value: <CurrencyDisplay value={loan.totalInterest} /> },
            { label: 'Total Amount', value: <CurrencyDisplay value={loan.totalAmount} /> },
            { label: 'Type', value: LOAN_TYPE_LABELS[loan.loanType] ?? loan.loanType },
            { label: 'Purpose', value: LOAN_PURPOSE_LABELS[loan.loanPurpose] ?? loan.loanPurpose },
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
                Repayment Progress
              </span>
              <span>{progressPct.toFixed(1)}% paid</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span><CurrencyDisplay value={paidAmount} /> paid</span>
              <span><CurrencyDisplay value={loan.totalAmount - paidAmount} /> remaining</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-border">
          {(['details', 'schedule'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'schedule' ? 'Amortization Schedule' : 'Details'}
            </button>
          ))}
        </div>

        {activeTab === 'details' && (
          <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Start Date', value: <DateDisplay value={loan.startDate} /> },
                { label: 'End Date', value: <DateDisplay value={loan.endDate} /> },
                { label: 'Created', value: <DateDisplay value={loan.createdAt} withTime /> },
                { label: 'Updated', value: <DateDisplay value={loan.updatedAt} withTime /> },
                ...(loan.riskAdjustment ? [{ label: 'Risk Adjustment', value: `${(loan.riskAdjustment * 100).toFixed(2)}%` }] : []),
                ...(loan.downPayment ? [{ label: 'Down Payment', value: <CurrencyDisplay value={loan.downPayment} /> }] : []),
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-foreground mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>
            {loan.notes && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
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
                  {['#', 'Due Date', 'Principal', 'Interest', 'Total', 'Balance', 'Status'].map((h) => (
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
                      No installment schedule available.
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
    </div>
  );
}
