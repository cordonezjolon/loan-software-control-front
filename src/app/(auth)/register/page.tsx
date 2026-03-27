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

type RegisterFormValues = {
  username: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const { t } = useI18n();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const registerSchema = z
    .object({
      username: z.string().min(3, t('pages.auth.register.min3Characters')).max(50),
      password: z.string().min(8, t('pages.auth.register.minimum8Characters')),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t('pages.auth.register.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser({ username: data.username, password: data.password });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : t('pages.auth.register.registrationFailed'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white">
            L
          </div>
          <h1 className="text-2xl font-bold text-foreground">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('pages.auth.register.subtitle')}</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="rounded-xl border border-border bg-card p-6 shadow-card"
        >
          {serverError && (
            <div role="alert" className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-foreground">
              {t('pages.auth.register.username')}
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              {...register('username')}
              aria-describedby={errors.username ? 'username-error' : undefined}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder={t('pages.auth.register.usernamePlaceholder')}
            />
            {errors.username && (
              <p id="username-error" className="mt-1 text-xs text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
              {t('pages.auth.register.password')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password')}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className="h-10 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder={t('pages.auth.register.passwordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('pages.auth.register.hidePassword') : t('pages.auth.register.showPassword')}
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

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-foreground">
              {t('pages.auth.register.confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirmPassword')}
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder={t('pages.auth.register.confirmPasswordPlaceholder')}
            />
            {errors.confirmPassword && (
              <p id="confirm-error" className="mt-1 text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? t('pages.auth.register.creatingAccount') : t('pages.auth.register.createAccount')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t('pages.auth.register.haveAccount')}{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t('pages.auth.register.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
