'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calculator, RefreshCw } from 'lucide-react';
import { loanCalculationSchema, type LoanCalculationFormValues } from '@/lib/schemas/loan.schema';
import { useCalculateLoanMutation } from '@/hooks/useCalculations';
import { formatCurrency, formatMonths } from '@/lib/formatters';
import { APP_CURRENCY } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';
import type { AmortizationEntry } from '@/types/loan';

const inputCls =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring';

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function CalculationsPage() {
  const calculateMutation = useCalculateLoanMutation();
  const [showAllRows, setShowAllRows] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoanCalculationFormValues>({
    resolver: zodResolver(loanCalculationSchema),
    defaultValues: { principal: 50000, interestRate: 0.05, termInMonths: 60 },
  });

  const watchedValues = watch();
  const debouncedValues = useDebounce(watchedValues, 500);

  useEffect(() => {
    const { principal, interestRate, termInMonths } = debouncedValues;
    if (principal && interestRate && termInMonths) {
      handleSubmit((data) => {
        calculateMutation.mutate(data);
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValues.principal, debouncedValues.interestRate, debouncedValues.termInMonths]);

  const result = calculateMutation.data;

  const chartData = result?.amortizationSchedule
    ? result.amortizationSchedule.map((entry: AmortizationEntry) => ({
        month: entry.installmentNumber,
        principal: entry.principalAmount,
        interest: entry.interestAmount,
        balance: entry.remainingBalance,
      }))
    : [];

  const tableRows = showAllRows
    ? (result?.amortizationSchedule ?? [])
    : (result?.amortizationSchedule ?? []).slice(0, 12);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Calculator className="h-5 w-5" />
          Loan Calculator
        </h1>
        <p className="text-sm text-muted-foreground">Calculate monthly payments and amortization schedule</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calculator inputs */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Loan Parameters</h2>
          <form onSubmit={handleSubmit((d) => calculateMutation.mutate(d))} noValidate className="space-y-4">
            <Field label={`Principal (${APP_CURRENCY})`} id="principal" error={errors.principal?.message}>
              <input
                id="principal"
                type="number"
                step="100"
                {...register('principal', { valueAsNumber: true })}
                className={inputCls}
              />
            </Field>
            <Field label="Annual Interest Rate (e.g. 0.05 = 5%)" id="interestRate" error={errors.interestRate?.message}>
              <input
                id="interestRate"
                type="number"
                step="0.001"
                {...register('interestRate', { valueAsNumber: true })}
                className={inputCls}
              />
            </Field>
            <Field label="Term (months)" id="termInMonths" error={errors.termInMonths?.message}>
              <input
                id="termInMonths"
                type="number"
                step="1"
                {...register('termInMonths', { valueAsNumber: true })}
                className={inputCls}
              />
              {watchedValues.termInMonths > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  = {formatMonths(watchedValues.termInMonths)}
                </p>
              )}
            </Field>

            <button
              type="submit"
              disabled={calculateMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {calculateMutation.isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
              Calculate
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Monthly Payment', value: formatCurrency(result.monthlyPayment), highlight: true },
                  { label: 'Total Interest', value: formatCurrency(result.totalInterest) },
                  { label: 'Total Amount', value: formatCurrency(result.totalAmount) },
                  {
                    label: 'Effective Rate',
                    value: `${((result.totalInterest / (result.totalAmount - result.totalInterest)) * 100).toFixed(2)}%`,
                  },
                ].map(({ label, value, highlight }) => (
                  <div
                    key={label}
                    className={`rounded-lg border p-3 ${
                      highlight ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
                    }`}
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`mt-0.5 text-lg font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Area chart */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Principal vs Interest Over Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: 'Month', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${formatCurrency(Number(v)).replace(/\.00$/, '')}`}
                    />
                    <Tooltip
                      formatter={(v) => [formatCurrency(Number(v)), '']}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="principal" stackId="1" stroke="#2563eb" fill="#93c5fd" name="Principal" />
                    <Area type="monotone" dataKey="interest" stackId="1" stroke="#dc2626" fill="#fca5a5" name="Interest" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Amortization table */}
              <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Amortization Schedule</h3>
                  <span className="text-xs text-muted-foreground">
                    {result.amortizationSchedule.length} payments
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      {['#', 'Principal', 'Interest', 'Total', 'Balance'].map((h) => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((entry: AmortizationEntry) => (
                      <tr key={entry.installmentNumber} className="border-t border-border hover:bg-muted/20">
                        <td className="px-4 py-2 font-mono text-muted-foreground">{entry.installmentNumber}</td>
                        <td className="px-4 py-2">{formatCurrency(entry.principalAmount)}</td>
                        <td className="px-4 py-2">{formatCurrency(entry.interestAmount)}</td>
                        <td className="px-4 py-2 font-medium">{formatCurrency(entry.totalAmount)}</td>
                        <td className="px-4 py-2">{formatCurrency(entry.remainingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(result.amortizationSchedule?.length ?? 0) > 12 && (
                  <div className="border-t border-border px-5 py-3 text-center">
                    <button
                      onClick={() => setShowAllRows((v) => !v)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {showAllRows ? 'Show less' : `Show all ${result.amortizationSchedule.length} rows`}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground text-sm">
              Enter loan parameters to see the calculation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
