'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useEarlySettlementPreview, useSettleEarly } from '@/hooks/useLoans';
import { PaymentMethod, PAYMENT_METHOD_LABELS } from '@/types/payment';
import { InterestCalculationMethod } from '@/types/loan';
import { formatCurrency } from '@/lib/formatters';
import { APP_CURRENCY } from '@/lib/constants';
import { ApiError } from '@/lib/api/client';

interface EarlySettlementModalProps {
  loanId: string;
  open: boolean;
  onClose: () => void;
}

const settlementSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentDate: z.string().min(1, 'Payment date is required'),
  referenceNumber: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

type SettlementFormValues = z.infer<typeof settlementSchema>;

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

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${highlight ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
      <span>{label}</span>
      <span className={highlight ? 'text-primary' : ''}>{value}</span>
    </div>
  );
}

export function EarlySettlementModal({ loanId, open, onClose }: EarlySettlementModalProps) {
  const { data: preview, isLoading: previewLoading } = useEarlySettlementPreview(loanId);
  const settleEarly = useSettleEarly();
  const [serverError, setServerError] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettlementFormValues>({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      paymentMethod: PaymentMethod.BankTransfer,
      paymentDate: new Date().toISOString().split('T')[0],
    },
  });

  if (!open) return null;

  const onSubmit = async (data: SettlementFormValues) => {
    setServerError(null);
    try {
      await settleEarly.mutateAsync({ id: loanId, dto: data });
      setSettled(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('Failed to process settlement. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Early Settlement</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Success state */}
          {settled && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <ShieldCheck className="h-12 w-12 text-green-500" />
              <p className="text-base font-semibold text-foreground">Loan fully settled!</p>
              <p className="text-sm text-muted-foreground">
                The early settlement has been processed successfully.
              </p>
              <button
                onClick={onClose}
                className="mt-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          )}

          {!settled && (
            <>
              {/* Preview section */}
              {previewLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {preview && (
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Settlement Preview
                  </p>
                  <SummaryRow label="Method" value={
                    preview.interestCalculationMethod === InterestCalculationMethod.FlatRate
                      ? 'Flat Rate (Add-On)'
                      : 'Declining Balance'
                  } />
                  <SummaryRow label="Paid installments" value={String(preview.paidInstallments)} />
                  <SummaryRow label="Remaining installments" value={String(preview.remainingInstallments)} />
                  <SummaryRow label="Remaining principal" value={formatCurrency(preview.remainingPrincipal, APP_CURRENCY)} />
                  {preview.interestCalculationMethod === InterestCalculationMethod.FlatRate && (
                    <>
                      <SummaryRow label="Scheduled remaining interest" value={formatCurrency(preview.scheduledRemainingInterest, APP_CURRENCY)} />
                      <SummaryRow label={`Rebate (${(preview.rebatePercentage * 100).toFixed(0)}%)`} value={`− ${formatCurrency(preview.rebateAmount, APP_CURRENCY)}`} />
                    </>
                  )}
                  <div className="border-t border-border pt-2 mt-2">
                    <SummaryRow label="Settlement Amount" value={formatCurrency(preview.settlementAmount, APP_CURRENCY)} highlight />
                  </div>
                </div>
              )}

              {/* Settlement form */}
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {serverError && (
                  <div role="alert" className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {serverError}
                  </div>
                )}

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
                    placeholder="Optional notes…"
                  />
                </Field>

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
                    disabled={isSubmitting || previewLoading || !preview}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Confirm Settlement
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
