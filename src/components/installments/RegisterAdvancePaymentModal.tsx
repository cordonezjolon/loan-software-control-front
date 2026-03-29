'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X } from 'lucide-react';
import { useCreateAdvancePayment } from '@/hooks/usePayments';
import { useRemainingBalance } from '@/hooks/useInstallments';
import {
  PaymentMethod,
  PAYMENT_METHOD_LABELS,
  type AdvancePaymentResult,
  type CreateAdvancePaymentDto,
} from '@/types/payment';
import type { LoanInstallment } from '@/types/installment';
import { APP_CURRENCY } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatters';
import { useI18n } from '@/lib/i18n/I18nProvider';

type AdvancePaymentFormValues = CreateAdvancePaymentDto;

interface RegisterAdvancePaymentModalProps {
  installment: LoanInstallment;
  open: boolean;
  onClose: () => void;
}

const inputCls =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring';

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

export function RegisterAdvancePaymentModal({
  installment,
  open,
  onClose,
}: RegisterAdvancePaymentModalProps) {
  const { t } = useI18n();
  const createAdvancePayment = useCreateAdvancePayment();
  const loanId = installment.loan?.id ?? '';
  const { data: remainingBalanceData } = useRemainingBalance(loanId);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<AdvancePaymentResult | null>(null);

  const remainingBalance = remainingBalanceData?.remainingBalance ?? 0;

  const schema = useMemo(
    () =>
      z.object({
        loanId: z.string().uuid(),
        amount: z.number().min(0.01, t('pages.registerPayment.minAmount')),
        paymentMethod: z.nativeEnum(PaymentMethod),
        paymentDate: z.string().min(1, t('pages.registerPayment.paymentDateRequired')),
        referenceNumber: z.string().max(100).optional(),
        notes: z.string().max(500).optional(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AdvancePaymentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      loanId,
      amount: 0,
      paymentMethod: PaymentMethod.BankTransfer,
      paymentDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!open || !loanId) return;

    reset({
      loanId,
      amount: remainingBalance || Number(installment.totalAmount) + Number(installment.lateFee),
      paymentMethod: PaymentMethod.BankTransfer,
      paymentDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      notes: '',
    });
  }, [open, loanId, remainingBalance, installment.totalAmount, installment.lateFee, reset]);

  const amount = useWatch({ control, name: 'amount' });
  const fullyPaidOff = remainingBalance > 0 && (amount || 0) >= remainingBalance;

  const onSubmit = async (data: AdvancePaymentFormValues) => {
    setServerError(null);
    try {
      const response = await createAdvancePayment.mutateAsync(data);
      setResult(response);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t('pages.advancePayment.failed'));
    }
  };

  if (!open || !loanId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('pages.advancePayment.title')}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{t('pages.advancePayment.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 border-b border-border px-6 py-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('pages.advancePayment.client')}</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {installment.loan?.client
                ? `${installment.loan.client.firstName} ${installment.loan.client.lastName}`
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('pages.advancePayment.loanId')}</p>
            <p className="mt-1 truncate text-sm font-medium text-foreground">{loanId}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('pages.advancePayment.outstandingBalance')}</p>
            <p className="mt-1 text-sm font-semibold text-primary">{formatCurrency(remainingBalance)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <p className="text-sm text-muted-foreground">{t('pages.advancePayment.payoffHint')}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={`${t('pages.advancePayment.amount')} (${APP_CURRENCY})`}
              id="amount"
              error={errors.amount?.message}
            >
              <input id="amount" type="number" step="0.01" className={inputCls} {...register('amount', { valueAsNumber: true })} />
            </Field>

            <Field
              label={t('pages.advancePayment.paymentMethod')}
              id="paymentMethod"
              error={errors.paymentMethod?.message}
            >
              <select id="paymentMethod" className={inputCls} {...register('paymentMethod')}>
                {Object.values(PaymentMethod).map((method) => (
                  <option key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label={t('pages.advancePayment.paymentDate')}
              id="paymentDate"
              error={errors.paymentDate?.message}
            >
              <input id="paymentDate" type="date" className={inputCls} {...register('paymentDate')} />
            </Field>

            <Field
              label={t('pages.advancePayment.referenceNumberOptional')}
              id="referenceNumber"
              error={errors.referenceNumber?.message}
            >
              <input id="referenceNumber" type="text" className={inputCls} {...register('referenceNumber')} />
            </Field>
          </div>

          <Field label={t('pages.advancePayment.notesOptional')} id="notes" error={errors.notes?.message}>
            <textarea
              id="notes"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder={t('pages.advancePayment.notesPlaceholder')}
              {...register('notes')}
            />
          </Field>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">{t('pages.advancePayment.preview')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('pages.advancePayment.allocationRule')}</p>
            <p className="mt-3 text-sm font-medium text-primary">
              {fullyPaidOff ? t('pages.advancePayment.fullPayoff') : t('pages.advancePayment.partialPayoff')}
            </p>
          </div>

          {result && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <p className="font-semibold text-emerald-700">{t('pages.advancePayment.successTitle')}</p>
              <p className="mt-1 text-emerald-700">
                {t('pages.advancePayment.resultSummary', {
                  allocated: formatCurrency(result.allocatedAmount),
                  remaining: formatCurrency(result.remainingLoanBalance),
                })}
              </p>
              <div className="mt-3 space-y-1 text-emerald-800">
                <p className="font-medium">{t('pages.advancePayment.affectedInstallments')}</p>
                {result.allocations.map((allocation) => (
                  <p key={allocation.installmentId}>
                    #{allocation.installmentNumber} · {formatCurrency(allocation.allocatedAmount)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {serverError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              {t('pages.advancePayment.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createAdvancePayment.isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {(isSubmitting || createAdvancePayment.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('pages.advancePayment.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
