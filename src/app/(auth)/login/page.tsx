'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/I18nProvider';

type LoginFormValues = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const { t } = useI18n();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const loginSchema = z.object({
    username: z.string().min(1, t('pages.auth.login.usernameRequired')),
    password: z.string().min(1, t('pages.auth.login.passwordRequired')),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      await login(data);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : t('pages.auth.login.invalidCredentials'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white">
            L
          </div>
          <h1 className="text-2xl font-bold text-foreground">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('pages.auth.login.subtitle')}</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="rounded-xl border border-border bg-card p-6 shadow-card"
        >
          {serverError && (
            <div
              role="alert"
              className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
              {serverError}
            </div>
          )}

          {/* Username */}
          <div className="mb-4">
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-foreground">
              {t('pages.auth.login.username')}
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              aria-describedby={errors.username ? 'username-error' : undefined}
              {...register('username')}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              placeholder={t('pages.auth.login.usernamePlaceholder')}
            />
            {errors.username && (
              <p id="username-error" className="mt-1 text-xs text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
              {t('pages.auth.login.password')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
                className="h-10 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                placeholder={t('pages.auth.login.passwordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('pages.auth.login.hidePassword') : t('pages.auth.login.showPassword')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? t('pages.auth.login.signingIn') : t('pages.auth.login.signIn')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t('pages.auth.login.noAccount')}{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            {t('pages.auth.login.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
