'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createLoanSchema, type CreateLoanFormValues } from '@/lib/schemas/loan.schema';
import { useCreateLoan } from '@/hooks/useLoans';
import { useEligibleClients } from '@/hooks/useClients';
import { LoanType, LoanPurpose } from '@/types/loan';
import { APP_CURRENCY, LOAN_TYPE_LABELS, LOAN_PURPOSE_LABELS } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/I18nProvider';

const inputCls =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring';
const selectCls = inputCls;

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function NewLoanPage() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get('clientId') ?? '';
  const createLoan = useCreateLoan();
  const { data: eligibleClients = [] } = useEligibleClients();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateLoanFormValues>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: { clientId: preselectedClientId },
  });

  const onSubmit = async (data: CreateLoanFormValues) => {
    setServerError(null);
    try {
      const loan = await createLoan.mutateAsync(data);
      router.push(`/loans/${loan.id}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : t('pages.loansNew.failedToCreate'));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/loans" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {t('pages.loansNew.backToLoans')}
      </Link>

      <div>
        <h1 className="text-xl font-bold text-foreground">{t('pages.loansNew.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('pages.loansNew.subtitle')}</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5"
      >
        {serverError && (
          <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{serverError}</div>
        )}

        <Field label={t('pages.loansNew.client')} id="clientId" error={errors.clientId?.message}>
          <select id="clientId" {...register('clientId')} className={selectCls}>
            <option value="">{t('pages.loansNew.selectClient')}</option>
            {eligibleClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.email})
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t('pages.loansNew.loanType')} id="loanType" error={errors.loanType?.message}>
            <select id="loanType" {...register('loanType')} className={selectCls}>
              <option value="">{t('pages.loansNew.selectType')}</option>
              {Object.entries(LoanType).map(([, v]) => (
                <option key={v} value={v}>{LOAN_TYPE_LABELS[v]}</option>
              ))}
            </select>
          </Field>
          <Field label={t('pages.loansNew.loanPurpose')} id="loanPurpose" error={errors.loanPurpose?.message}>
            <select id="loanPurpose" {...register('loanPurpose')} className={selectCls}>
              <option value="">{t('pages.loansNew.selectPurpose')}</option>
              {Object.entries(LoanPurpose).map(([, v]) => (
                <option key={v} value={v}>{LOAN_PURPOSE_LABELS[v]}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={`${t('pages.loansNew.principal')} (${APP_CURRENCY})`} id="principal" error={errors.principal?.message}>
            <input
              id="principal"
              type="number"
              step="0.01"
              {...register('principal', { valueAsNumber: true })}
              className={inputCls}
              placeholder={t('pages.loansNew.principalPlaceholder')}
            />
          </Field>
          <Field label={t('pages.loansNew.interestRate')} id="interestRate" error={errors.interestRate?.message}>
            <input
              id="interestRate"
              type="number"
              step="0.001"
              {...register('interestRate', { valueAsNumber: true })}
              className={inputCls}
              placeholder={t('pages.loansNew.interestRatePlaceholder')}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t('pages.loansNew.termInMonths')} id="termInMonths" error={errors.termInMonths?.message}>
            <input
              id="termInMonths"
              type="number"
              {...register('termInMonths', { valueAsNumber: true })}
              className={inputCls}
              placeholder={t('pages.loansNew.termInMonthsPlaceholder')}
            />
          </Field>
          <Field label={t('pages.loansNew.startDate')} id="startDate" error={errors.startDate?.message}>
            <input
              id="startDate"
              type="date"
              {...register('startDate')}
              className={inputCls}
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={`${t('pages.loansNew.downPaymentOptional')} (${APP_CURRENCY})`} id="downPayment" error={errors.downPayment?.message}>
            <input
              id="downPayment"
              type="number"
              step="0.01"
              {...register('downPayment', { valueAsNumber: true })}
              className={inputCls}
              placeholder={t('pages.loansNew.downPaymentPlaceholder')}
            />
          </Field>
          <Field label={t('pages.loansNew.riskAdjustmentOptional')} id="riskAdjustment" error={errors.riskAdjustment?.message}>
            <input
              id="riskAdjustment"
              type="number"
              step="0.001"
              {...register('riskAdjustment', { valueAsNumber: true })}
              className={inputCls}
              placeholder={t('pages.loansNew.riskAdjustmentPlaceholder')}
            />
          </Field>
        </div>

        <Field label={t('pages.loansNew.notesOptional')} id="notes" error={errors.notes?.message}>
          <textarea
            id="notes"
            {...register('notes')}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            placeholder={t('pages.loansNew.notesPlaceholder')}
          />
        </Field>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Link href="/loans" className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent">
            {t('pages.loansNew.cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('pages.loansNew.createLoan')}
          </button>
        </div>
      </form>
    </div>
  );
}
