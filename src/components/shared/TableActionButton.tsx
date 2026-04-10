import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TableActionVariant = 'neutral' | 'primary' | 'success' | 'danger';

interface TableActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TableActionVariant;
  icon?: ReactNode;
}

const variantClassMap: Record<TableActionVariant, string> = {
  neutral:
    'border-border text-muted-foreground hover:border-foreground/30 hover:bg-accent hover:text-foreground',
  primary: 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  danger: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100',
};

export function TableActionButton({
  className,
  variant = 'neutral',
  icon,
  type = 'button',
  children,
  ...props
}: TableActionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        variantClassMap[variant],
        className,
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}