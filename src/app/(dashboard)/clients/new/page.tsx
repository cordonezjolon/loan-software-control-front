'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClientSchema, type CreateClientFormValues } from '@/lib/schemas/client.schema';
import { useCreateClient } from '@/hooks/useClients';

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
      setServerError(err instanceof Error ? err.message : 'Failed to create client');
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
          Back to Clients
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold text-foreground">New Client</h1>
        <p className="text-sm text-muted-foreground">Create a new loan client</p>
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
          <Field label="First Name" id="firstName" error={errors.firstName?.message}>
            <input id="firstName" {...register('firstName')} className={inputCls} placeholder="John" />
          </Field>
          <Field label="Last Name" id="lastName" error={errors.lastName?.message}>
            <input id="lastName" {...register('lastName')} className={inputCls} placeholder="Doe" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" id="email" error={errors.email?.message}>
            <input id="email" type="email" {...register('email')} className={inputCls} placeholder="john@example.com" />
          </Field>
          <Field label="Phone Number" id="phoneNumber" error={errors.phoneNumber?.message}>
            <input id="phoneNumber" {...register('phoneNumber')} className={inputCls} placeholder="+12125550100" />
          </Field>
        </div>

        <Field label="Date of Birth" id="dateOfBirth" error={errors.dateOfBirth?.message}>
          <input id="dateOfBirth" type="date" {...register('dateOfBirth')} className={inputCls} />
        </Field>

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Address</p>
          <div className="space-y-4">
            <Field label="Street" id="street" error={errors.address?.street?.message}>
              <input id="street" {...register('address.street')} className={inputCls} placeholder="123 Main St" />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="City" id="city" error={errors.address?.city?.message}>
                <input id="city" {...register('address.city')} className={inputCls} placeholder="New York" />
              </Field>
              <Field label="State" id="state" error={errors.address?.state?.message}>
                <input id="state" {...register('address.state')} className={inputCls} placeholder="NY" />
              </Field>
              <Field label="Zip Code" id="zipCode" error={errors.address?.zipCode?.message}>
                <input id="zipCode" {...register('address.zipCode')} className={inputCls} placeholder="10001" />
              </Field>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Financial Information (optional)</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Monthly Income ($)" id="monthlyIncome" error={errors.monthlyIncome?.message}>
              <input
                id="monthlyIncome"
                type="number"
                step="0.01"
                {...register('monthlyIncome', { valueAsNumber: true })}
                className={inputCls}
                placeholder="5000"
              />
            </Field>
            <Field label="Credit Score (300–850)" id="creditScore" error={errors.creditScore?.message}>
              <input
                id="creditScore"
                type="number"
                {...register('creditScore', { valueAsNumber: true })}
                className={inputCls}
                placeholder="720"
              />
            </Field>
            <Field label="Employment Years" id="employmentYears" error={errors.employmentYears?.message}>
              <input
                id="employmentYears"
                type="number"
                {...register('employmentYears', { valueAsNumber: true })}
                className={inputCls}
                placeholder="5"
              />
            </Field>
            <Field label="Occupation" id="occupation" error={errors.occupation?.message}>
              <input id="occupation" {...register('occupation')} className={inputCls} placeholder="Engineer" />
            </Field>
          </div>
        </div>

        <Field label="Notes" id="notes" error={errors.notes?.message}>
          <textarea
            id="notes"
            {...register('notes')}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            placeholder="Optional notes about this client…"
          />
        </Field>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Link
            href="/clients"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Client
          </button>
        </div>
      </form>
    </div>
  );
}
