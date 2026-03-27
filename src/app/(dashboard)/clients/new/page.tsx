'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClientSchema, type CreateClientFormValues } from '@/lib/schemas/client.schema';
import { useCreateClient } from '@/hooks/useClients';
import { APP_CURRENCY } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/I18nProvider';

function Field({
  label,
  error,
  children,
  id,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  id: string;
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
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground';

export default function NewClientPage() {
  const { t } = useI18n();
  const router = useRouter();
  const createClient = useCreateClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateClientFormValues>({ resolver: zodResolver(createClientSchema) });

  const onSubmit = async (data: CreateClientFormValues) => {
    setServerError(null);
    try {
      const client = await createClient.mutateAsync(data);
      router.push(`/clients/${client.id}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : t('pages.clientsNew.failedToCreate'));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/clients"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('pages.clientsNew.backToClients')}
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold text-foreground">{t('pages.clientsNew.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('pages.clientsNew.subtitle')}</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5"
      >
        {serverError && (
          <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label={t('pages.clientsNew.firstName')} id="firstName" error={errors.firstName?.message}>
            <input id="firstName" {...register('firstName')} className={inputCls} placeholder={t('pages.clientsNew.firstNamePlaceholder')} />
          </Field>
          <Field label={t('pages.clientsNew.lastName')} id="lastName" error={errors.lastName?.message}>
            <input id="lastName" {...register('lastName')} className={inputCls} placeholder={t('pages.clientsNew.lastNamePlaceholder')} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t('pages.clientsNew.email')} id="email" error={errors.email?.message}>
            <input id="email" type="email" {...register('email')} className={inputCls} placeholder={t('pages.clientsNew.emailPlaceholder')} />
          </Field>
          <Field label={t('pages.clientsNew.phoneNumber')} id="phoneNumber" error={errors.phoneNumber?.message}>
            <input id="phoneNumber" {...register('phoneNumber')} className={inputCls} placeholder={t('pages.clientsNew.phonePlaceholder')} />
          </Field>
        </div>

        <Field label={t('pages.clientsNew.dateOfBirth')} id="dateOfBirth" error={errors.dateOfBirth?.message}>
          <input id="dateOfBirth" type="date" {...register('dateOfBirth')} className={inputCls} />
        </Field>

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-sm font-semibold text-foreground">{t('pages.clientsNew.address')}</p>
          <div className="space-y-4">
            <Field label={t('pages.clientsNew.street')} id="street" error={errors.address?.street?.message}>
              <input id="street" {...register('address.street')} className={inputCls} placeholder={t('pages.clientsNew.streetPlaceholder')} />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label={t('pages.clientsNew.city')} id="city" error={errors.address?.city?.message}>
                <input id="city" {...register('address.city')} className={inputCls} placeholder={t('pages.clientsNew.cityPlaceholder')} />
              </Field>
              <Field label={t('pages.clientsNew.state')} id="state" error={errors.address?.state?.message}>
                <input id="state" {...register('address.state')} className={inputCls} placeholder={t('pages.clientsNew.statePlaceholder')} />
              </Field>
              <Field label={t('pages.clientsNew.zipCode')} id="zipCode" error={errors.address?.zipCode?.message}>
                <input id="zipCode" {...register('address.zipCode')} className={inputCls} placeholder={t('pages.clientsNew.zipCodePlaceholder')} />
              </Field>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-sm font-semibold text-foreground">{t('pages.clientsNew.financialInformationOptional')}</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label={`${t('pages.clientsNew.monthlyIncome')} (${APP_CURRENCY})`} id="monthlyIncome" error={errors.monthlyIncome?.message}>
              <input
                id="monthlyIncome"
                type="number"
                step="0.01"
                {...register('monthlyIncome', { valueAsNumber: true })}
                className={inputCls}
                placeholder={t('pages.clientsNew.monthlyIncomePlaceholder')}
              />
            </Field>
            <Field label={t('pages.clientsNew.creditScore')} id="creditScore" error={errors.creditScore?.message}>
              <input
                id="creditScore"
                type="number"
                {...register('creditScore', { valueAsNumber: true })}
                className={inputCls}
                placeholder={t('pages.clientsNew.creditScorePlaceholder')}
              />
            </Field>
            <Field label={t('pages.clientsNew.employmentYears')} id="employmentYears" error={errors.employmentYears?.message}>
              <input
                id="employmentYears"
                type="number"
                {...register('employmentYears', { valueAsNumber: true })}
                className={inputCls}
                placeholder={t('pages.clientsNew.employmentYearsPlaceholder')}
              />
            </Field>
            <Field label={t('pages.clientsNew.occupation')} id="occupation" error={errors.occupation?.message}>
              <input id="occupation" {...register('occupation')} className={inputCls} placeholder={t('pages.clientsNew.occupationPlaceholder')} />
            </Field>
          </div>
        </div>

        <Field label={t('pages.clientsNew.notes')} id="notes" error={errors.notes?.message}>
          <textarea
            id="notes"
            {...register('notes')}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            placeholder={t('pages.clientsNew.notesPlaceholder')}
          />
        </Field>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Link
            href="/clients"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            {t('pages.clientsNew.cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('pages.clientsNew.createClient')}
          </button>
        </div>
      </form>
    </div>
  );
}
