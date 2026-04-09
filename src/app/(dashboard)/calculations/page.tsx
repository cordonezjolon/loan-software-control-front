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
import { InterestCalculationMethod } from '@/types/loan';
import { useI18n } from '@/lib/i18n/I18nProvider';

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
  const { t } = useI18n();
  const calculateMutation = useCalculateLoanMutation();
  const [showAllRows, setShowAllRows] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoanCalculationFormValues>({
    resolver: zodResolver(loanCalculationSchema),
    defaultValues: {
      principal: 50000,
      interestRate: 0.05,
      termInMonths: 60,
      interestCalculationMethod: InterestCalculationMethod.DecliningBalance,
    },
  });

  const watchedValues = watch();
  const debouncedValues = useDebounce(watchedValues, 500);

  useEffect(() => {
    const { principal, interestRate, termInMonths, interestCalculationMethod } = debouncedValues;
    if (principal && interestRate && termInMonths && interestCalculationMethod) {
      handleSubmit((data) => {
        calculateMutation.mutate(data);
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedValues.principal,
    debouncedValues.interestRate,
    debouncedValues.termInMonths,
    debouncedValues.interestCalculationMethod,
  ]);

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
          {t('pages.calculations.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('pages.calculations.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calculator inputs */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-foreground">{t('pages.calculations.loanParameters')}</h2>
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
            <Field label={t('pages.calculations.annualInterestRate')} id="interestRate" error={errors.interestRate?.message}>
              <input
                id="interestRate"
                type="number"
                step="0.001"
                {...register('interestRate', { valueAsNumber: true })}
                className={inputCls}
              />
            </Field>
            <Field label={t('pages.calculations.termMonths')} id="termInMonths" error={errors.termInMonths?.message}>
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

            <Field
              label={t('forms.loan.interestCalculationMethod')}
              id="interestCalculationMethod"
              error={errors.interestCalculationMethod?.message}
            >
              <select id="interestCalculationMethod" {...register('interestCalculationMethod')} className={inputCls}>
                <option value={InterestCalculationMethod.FlatRate}>{t('interestMethods.flat_rate')}</option>
                <option value={InterestCalculationMethod.DecliningBalance}>{t('interestMethods.declining_balance')}</option>
              </select>
            </Field>

            <button
              type="submit"
              disabled={calculateMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {calculateMutation.isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
              {t('pages.calculations.calculate')}
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
                  { label: t('pages.calculations.monthlyPayment'), value: formatCurrency(result.monthlyPayment), highlight: true },
                  { label: t('pages.calculations.totalInterest'), value: formatCurrency(result.totalInterest) },
                  { label: t('pages.calculations.totalAmount'), value: formatCurrency(result.totalAmount) },
                  {
                    label: t('pages.calculations.effectiveRate'),
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
                <h3 className="mb-4 text-sm font-semibold text-foreground">{t('pages.calculations.principalVsInterest')}</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: t('pages.calculations.month'), position: 'insideBottom', offset: -2, fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${formatCurrency(Number(v)).replace(/\.00$/, '')}`}
                    />
                    <Tooltip
                      formatter={(v) => [formatCurrency(Number(v)), '']}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="principal" stackId="1" stroke="#2563eb" fill="#93c5fd" name={t('pages.calculations.principal')} />
                    <Area type="monotone" dataKey="interest" stackId="1" stroke="#dc2626" fill="#fca5a5" name={t('pages.calculations.interest')} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Amortization table */}
              <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">{t('pages.calculations.amortizationSchedule')}</h3>
                  <span className="text-xs text-muted-foreground">
                    {result.amortizationSchedule.length} {t('pages.calculations.paymentsSuffix')}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      {['#', t('pages.calculations.principal'), t('pages.calculations.interest'), t('pages.calculations.totalAmount'), t('pages.calculations.balance')].map((h) => (
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
                      {showAllRows ? t('actions.showLess') : `${t('pages.calculations.showAllRows')} (${result.amortizationSchedule.length})`}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground text-sm">
              {t('pages.calculations.noCalculation')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
