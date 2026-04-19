'use client';

import { useUserProfile } from '@/hooks/useUsers';
import { UserProfileForm } from '@/components/users/UserProfileForm';
import { ChangePasswordForm } from '@/components/users/ChangePasswordForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { data: user, isLoading, error } = useUserProfile();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Error loading profile. Please try again later.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
        User profile not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div>
            <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
            <p className="mt-1 text-gray-600">@{user.username}</p>
          </div>
          <div className="mt-4 space-y-1 text-right md:mt-0">
            <p className="text-sm">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="text-sm">
              <span className="font-medium">Role:</span> {user.role}
            </p>
            <p className="text-sm">
              <span className="font-medium">Account Status:</span>{' '}
              <span
                className={`font-medium ${
                  user.status === 'active'
                    ? 'text-green-600'
                    : user.status === 'inactive'
                      ? 'text-gray-600'
                      : 'text-red-600'
                }`}
              >
                {user.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View your account details</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-600">Email Verified</p>
            <p className="mt-1 text-sm">
              {user.emailVerified ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  ✓ Verified
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  Pending Verification
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Last Login</p>
            <p className="mt-1 text-sm text-gray-900">
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Last Password Change</p>
            <p className="mt-1 text-sm text-gray-900">
              {user.lastPasswordChangeAt
                ? new Date(user.lastPasswordChangeAt).toLocaleDateString()
                : 'Never'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Account Created</p>
            <p className="mt-1 text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      <UserProfileForm user={user} />
      <ChangePasswordForm />
    </div>
  );
}