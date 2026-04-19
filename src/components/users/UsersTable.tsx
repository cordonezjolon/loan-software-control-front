'use client';

import { useState } from 'react';
import { UserListItem, UserRole, UserStatus } from '@/types/user';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

const USER_ROLE_CONFIG: Record<UserRole, { label: string; color: string }> = {
  [UserRole.Admin]: { label: 'Admin', color: 'bg-red-100 text-red-800' },
  [UserRole.LoanOfficer]: { label: 'Loan Officer', color: 'bg-blue-100 text-blue-800' },
  [UserRole.Employee]: { label: 'Employee', color: 'bg-green-100 text-green-800' },
};

const USER_STATUS_CONFIG: Record<UserStatus, { label: string; color: string }> = {
  [UserStatus.Active]: { label: 'Active', color: 'bg-emerald-100 text-emerald-800' },
  [UserStatus.Inactive]: { label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
  [UserStatus.Suspended]: { label: 'Suspended', color: 'bg-red-100 text-red-800' },
  [UserStatus.PendingEmailVerification]: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
};

interface UsersTableProps {
  users: UserListItem[];
  isLoading?: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onSuspend?: (id: string) => void;
}

export function UsersTable({
  users,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onSuspend,
}: UsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                <TableCell>
                  <Badge className={USER_ROLE_CONFIG[user.role].color}>
                    {USER_ROLE_CONFIG[user.role].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={USER_STATUS_CONFIG[user.status].color}>
                    {USER_STATUS_CONFIG[user.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                </TableCell>
                <TableCell className="text-sm text-gray-600">{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(user.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(user.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {user.status === UserStatus.Active && onDeactivate && (
                        <DropdownMenuItem onClick={() => onDeactivate(user.id)}>
                          <Lock className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      )}
                      {user.status === UserStatus.Inactive && onActivate && (
                        <DropdownMenuItem onClick={() => onActivate(user.id)}>
                          <Unlock className="mr-2 h-4 w-4" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      {user.status !== UserStatus.Suspended && onSuspend && (
                        <DropdownMenuItem onClick={() => onSuspend(user.id)} className="text-orange-600">
                          <Lock className="mr-2 h-4 w-4" />
                          Suspend
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem onClick={() => onDelete(user.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
