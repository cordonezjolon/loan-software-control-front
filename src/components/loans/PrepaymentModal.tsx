'use client';

import React, { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X, TrendingDown, AlertTriangle } from 'lucide-react';
import { useCreatePrepayment } from '@/hooks/usePayments';
import { useRemainingBalance } from '@/hooks/useInstallments';
import { PaymentMethod, PAYMENT_METHOD_LABELS, type PrepaymentResultDto } from '@/types/payment';
import { PrepaymentAction, type Loan } from '@/types/loan';
import { PREPAYMENT_ACTION_LABELS } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatters';
import { APP_CURRENCY } from '@/lib/constants';
import { ApiError } from '@/lib/api/client';

interface PrepaymentModalProps {
  loan: Loan;
  open: boolean;
  onClose: () => void;
}

const inputCls =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring';
const selectCls = inputCls;

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ResultSummary({ result }: { result: PrepaymentResultDto }) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
      <p className="text-sm font-semibold text-green-800">Prepayment Processed Successfully</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Amount prepaid</span>
          <span className="font-medium text-foreground">{formatCurrency(result.prepaidAmount, APP_CURRENCY)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Previous balance</span>
          <span>{formatCurrency(result.previousBalance, APP_CURRENCY)}</span>
        </div>
        <div className="flex justify-between font-semibold text-foreground">
          <span>New remaining balance</span>
          <span className="text-primary">{formatCurrency(result.newRemainingBalance, APP_CURRENCY)}</span>
        </div>
      </div>
      {result.monthsSaved !== undefined && result.monthsSaved > 0 && (
        <p className="text-xs text-green-700 border-t border-green-200 pt-2">
          🎉 You saved <strong>{result.monthsSaved} months</strong> off the loan term!
        </p>
      )}
      {result.newMonthlyPayment !== undefined && (
        <p className="text-xs text-green-700 border-t border-green-200 pt-2">
          New monthly payment: <strong>{formatCurrency(result.newMonthlyPayment, APP_CURRENCY)}</strong>
        </p>
      )}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          New Installment Schedule ({result.newRemainingInstallments} remaining)
        </p>
        <div className="max-h-48 overflow-y-auto rounded border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 sticky top-0">
              <tr>
                {['#', 'Due Date', 'Principal', 'Interest', 'Total', 'Balance'].map((h) => (
                  <th key={h} className="px-2 py-1.5 text-left font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.newSchedule.map((row) => (
                <tr key={row.installmentNumber} className="border-t border-border">
                  <td className="px-2 py-1.5 font-mono text-muted-foreground">{row.installmentNumber}</td>
                  <td className="px-2 py-1.5">{new Date(row.dueDate).toLocaleDateString()}</td>
                  <td className="px-2 py-1.5">{formatCurrency(row.principalAmount, APP_CURRENCY)}</td>
                  <td className="px-2 py-1.5">{formatCurrency(row.interestAmount, APP_CURRENCY)}</td>
                  <td className="px-2 py-1.5 font-medium">{formatCurrency(row.totalAmount, APP_CURRENCY)}</td>
                  <td className="px-2 py-1.5">{formatCurrency(row.remainingBalance, APP_CURRENCY)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end pt-1">
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export function PrepaymentModal({ loan, open, onClose }: PrepaymentModalProps) {
  const createPrepayment = useCreatePrepayment();
  const { data: balanceData } = useRemainingBalance(loan.id);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<PrepaymentResultDto | null>(null);

  const remainingBalance = balanceData?.remainingBalance ?? 0;

  const schema = useMemo(
    () =>
      z.object({
        loanId: z.string().uuid(),
        amount: z
          .number()
          .min(0.01, 'Amount must be greater than 0')
          .max(remainingBalance || Infinity, `Cannot exceed remaining balance of ${formatCurrency(remainingBalance, APP_CURRENCY)}`),
        paymentMethod: z.nativeEnum(PaymentMethod),
        paymentDate: z.string().min(1, 'Payment date is required'),
        prepaymentAction: z.nativeEnum(PrepaymentAction).optional(),
        referenceNumber: z.string().max(100).optional(),
        notes: z.string().max(500).optional(),
      }),
    [remainingBalance],
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      loanId: loan.id,
      paymentMethod: PaymentMethod.BankTransfer,
      paymentDate: new Date().toISOString().split('T')[0],
      prepaymentAction: loan.prepaymentAction as PrepaymentAction | undefined,
    },
  });

  const amount = useWatch({ control, name: 'amount' });

  if (!open) return null;

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      const res = await createPrepayment.mutateAsync(data);
      setResult(res);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('Failed to process prepayment. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Principal Prepayment</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Balance info */}
          {!result && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Current remaining balance</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(remainingBalance, APP_CURRENCY)}</p>
              {amount > 0 && amount <= remainingBalance && (
                <p className="mt-1 text-xs text-primary">
                  New balance after prepayment: {formatCurrency(remainingBalance - amount, APP_CURRENCY)}
                </p>
              )}
            </div>
          )}

          {/* Result view */}
          {result && <ResultSummary result={result} />}

          {/* Form */}
          {!result && (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <input type="hidden" {...register('loanId')} />

              {serverError && (
                <div role="alert" className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {serverError}
                </div>
              )}

              <Field label={`Prepayment Amount (${APP_CURRENCY})`} id="amount" error={errors.amount?.message}>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min={0.01}
                  max={remainingBalance}
                  {...register('amount', { valueAsNumber: true })}
                  className={inputCls}
                  placeholder={`Max ${formatCurrency(remainingBalance, APP_CURRENCY)}`}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Payment Method" id="paymentMethod" error={errors.paymentMethod?.message}>
                  <select id="paymentMethod" {...register('paymentMethod')} className={selectCls}>
                    {Object.entries(PaymentMethod).map(([, v]) => (
                      <option key={v} value={v}>{PAYMENT_METHOD_LABELS[v]}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Payment Date" id="paymentDate" error={errors.paymentDate?.message}>
                  <input type="date" id="paymentDate" {...register('paymentDate')} className={inputCls} />
                </Field>
              </div>

              <Field label="After Prepayment, Recalculate" id="prepaymentAction" error={errors.prepaymentAction?.message}>
                <select id="prepaymentAction" {...register('prepaymentAction')} className={selectCls}>
                  {Object.entries(PrepaymentAction).map(([, v]) => (
                    <option key={v} value={v}>{PREPAYMENT_ACTION_LABELS[v]}</option>
                  ))}
                </select>
              </Field>

              <Field label="Reference Number (optional)" id="referenceNumber" error={errors.referenceNumber?.message}>
                <input
                  type="text"
                  id="referenceNumber"
                  {...register('referenceNumber')}
                  className={inputCls}
                  placeholder="e.g. TXN-00123"
                />
              </Field>

              <Field label="Notes (optional)" id="notes" error={errors.notes?.message}>
                <textarea
                  id="notes"
                  {...register('notes')}
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  placeholder="Optional notes about this prepayment…"
                />
              </Field>

              <p className="text-xs text-muted-foreground">
                The prepayment will be applied directly to the outstanding principal and the remaining
                installment schedule will be recalculated accordingly.
              </p>

              <div className="flex justify-end gap-3 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Apply Prepayment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
