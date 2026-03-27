'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface InternalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  somethingWentWrong: string;
  unexpectedError: string;
  tryAgain: string;
}

class InternalErrorBoundary extends React.Component<InternalErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: InternalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div>
            <p className="font-medium text-foreground">{this.props.somethingWentWrong}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {this.state.error?.message ?? this.props.unexpectedError}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {this.props.tryAgain}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <InternalErrorBoundary
      fallback={fallback}
      somethingWentWrong={t('common.somethingWentWrong')}
      unexpectedError={t('common.unexpectedError')}
      tryAgain={t('common.tryAgain')}
    >
      {children}
    </InternalErrorBoundary>
  );
}
