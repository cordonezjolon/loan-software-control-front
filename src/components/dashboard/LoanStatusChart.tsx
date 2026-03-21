'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { LoanStatistics } from '@/types/loan';
import { LOAN_STATUS_CONFIG } from '@/lib/constants';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const STATUS_COLORS: Record<string, string> = {
  pending: '#eab308',
  under_review: '#3b82f6',
  approved: '#22c55e',
  rejected: '#ef4444',
  active: '#10b981',
  completed: '#6b7280',
  cancelled: '#9ca3af',
  defaulted: '#991b1b',
  closed: '#64748b',
};

interface LoanStatusChartProps {
  statistics?: LoanStatistics;
  isLoading?: boolean;
}

export function LoanStatusChart({ statistics, isLoading }: LoanStatusChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="md" className="text-primary" />
      </div>
    );
  }

  if (!statistics) return null;

  const data = Object.entries(statistics.loansByStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: LOAN_STATUS_CONFIG[status as keyof typeof LOAN_STATUS_CONFIG]?.label ?? status,
      value: count,
      color: STATUS_COLORS[status] ?? '#94a3b8',
    }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [Number(value), '']}
          contentStyle={{ fontSize: 12 }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
