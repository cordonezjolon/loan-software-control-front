'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useUsers,
  useCreateUser,
  useDeleteUser,
  useActivateUser,
  useDeactivateUser,
  useSuspendUser,
} from '@/hooks/useUsers';
import { UsersTable } from '@/components/users/UsersTable';
import { CreateEditUserForm } from '@/components/users/CreateEditUserForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole, CreateUserPayload } from '@/types/user';
import { Plus, Search } from 'lucide-react';

export default function UsersManagementPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: usersData, isLoading } = useUsers(page, limit, {
    search,
    role: roleFilter,
  });

  const createUserMutation = useCreateUser();
  const deleteUserMutation = useDeleteUser();
  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();
  const suspendUserMutation = useSuspendUser();

  const handleCreateUser = (data: CreateUserPayload) => {
    createUserMutation.mutate(data);
    setShowCreateForm(false);
  };

  const handleViewUser = (id: string) => {
    router.push(`/users/${id}`);
  };

  const handleEditUser = (id: string) => {
    router.push(`/users/${id}/edit`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="mt-1 text-gray-600">Manage system users and permissions</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {showCreateForm && (
        <CreateEditUserForm
          onSubmit={handleCreateUser}
          isLoading={createUserMutation.isPending}
          title="Create New User"
          description="Add a new user to the system"
        />
      )}

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or username..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>
        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value ? (value as UserRole) : undefined)}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value={UserRole.Admin}>Admin</SelectItem>
            <SelectItem value={UserRole.LoanOfficer}>Loan Officer</SelectItem>
            <SelectItem value={UserRole.Employee}>Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <UsersTable
            users={usersData?.data || []}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={(id) => deleteUserMutation.mutate(id)}
            onActivate={(id) => activateUserMutation.mutate(id)}
            onDeactivate={(id) => deactivateUserMutation.mutate(id)}
            onSuspend={(id) => suspendUserMutation.mutate(id)}
          />

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing{' '}
              <span className="font-medium">
                {(page - 1) * limit + 1}-{Math.min(page * limit, usersData?.total || 0)}
              </span>{' '}
              of <span className="font-medium">{usersData?.total || 0}</span> users
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!usersData || page * limit >= usersData.total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}