'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X } from 'lucide-react';
import { useCreatePayment } from '@/hooks/usePayments';
import { PaymentMethod } from '@/types/payment';
import type { LoanInstallment } from '@/types/installment';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { APP_CURRENCY } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/I18nProvider';

type PaymentFormValues = {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
};

interface RegisterPaymentModalProps {
  installment: LoanInstallment;
  open: boolean;
  onClose: () => void;
}

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

const inputCls =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring';

export function RegisterPaymentModal({ installment, open, onClose }: RegisterPaymentModalProps) {
  const { t } = useI18n();
  const createPayment = useCreatePayment();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const totalDue = Number(installment.totalAmount) + Number(installment.lateFee);

  const paymentSchema = z.object({
    amount: z
      .number({ error: t('pages.registerPayment.validAmount') })
      .min(0.01, `${t('pages.registerPayment.minAmount')} ${formatCurrency(0.01)}`),
    paymentMethod: z.nativeEnum(PaymentMethod),
    paymentDate: z.string().min(1, t('pages.registerPayment.paymentDateRequired')),
    referenceNumber: z.string().max(100).optional(),
    notes: z.string().max(500).optional(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: totalDue,
      paymentMethod: PaymentMethod.BankTransfer,
      paymentDate: new Date().toISOString().split('T')[0],
    },
  });

  // Reset form when modal opens with updated defaults
  useEffect(() => {
    if (open) {
      reset({
        amount: totalDue,
        paymentMethod: PaymentMethod.BankTransfer,
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNumber: '',
        notes: '',
      });
    }
  }, [open, totalDue, reset]);

  const onSubmit = async (data: PaymentFormValues) => {
    setServerError(null);
    try {
      await createPayment.mutateAsync({
        installmentId: installment.id,
        ...data,
      });
      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : t('pages.registerPayment.failedToRegister'));
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md rounded-xl border border-border bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('pages.registerPayment.title')}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {`${t('pages.dashboard.installment')} #${installment.installmentNumber} — ${t('pages.dashboard.due')} ${formatDate(installment.dueDate)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Installment summary */}
        <div className="mx-6 mt-4 grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3 text-center text-xs">
          <div>
            <p className="text-muted-foreground">{t('pages.registerPayment.principal')}</p>
            <p className="font-semibold text-foreground">{formatCurrency(Number(installment.principalAmount))}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('pages.registerPayment.interest')}</p>
            <p className="font-semibold text-foreground">{formatCurrency(Number(installment.interestAmount))}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('pages.registerPayment.totalDue')}</p>
            <p className="font-semibold text-primary">{formatCurrency(totalDue)}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <Field label={`${t('pages.registerPayment.amount')} (${APP_CURRENCY})`} id="amount" error={errors.amount?.message}>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              className={inputCls}
              {...register('amount', { valueAsNumber: true })}
            />
          </Field>

          <Field label={t('pages.registerPayment.paymentMethod')} id="paymentMethod" error={errors.paymentMethod?.message}>
            <select id="paymentMethod" className={inputCls} {...register('paymentMethod')}>
              {Object.values(PaymentMethod).map((method) => (
                <option key={method} value={method}>
                  {t(`paymentMethods.${method}`)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t('pages.registerPayment.paymentDate')} id="paymentDate" error={errors.paymentDate?.message}>
            <input
              id="paymentDate"
              type="date"
              className={inputCls}
              {...register('paymentDate')}
            />
          </Field>

          <Field label={t('pages.registerPayment.referenceNumberOptional')} id="referenceNumber" error={errors.referenceNumber?.message}>
            <input
              id="referenceNumber"
              type="text"
              placeholder={t('pages.registerPayment.referencePlaceholder')}
              className={inputCls}
              {...register('referenceNumber')}
            />
          </Field>

          <Field label={t('pages.registerPayment.notesOptional')} id="notes" error={errors.notes?.message}>
            <textarea
              id="notes"
              rows={2}
              placeholder={t('pages.registerPayment.notesPlaceholder')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
              {...register('notes')}
            />
          </Field>

          {serverError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              {t('pages.registerPayment.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createPayment.isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {(isSubmitting || createPayment.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('pages.registerPayment.registerPayment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
