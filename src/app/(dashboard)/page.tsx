import { redirect } from 'next/navigation';

// Dashboard overview moved to (dashboard)/dashboard/page.tsx
export default function DashboardIndexRedirect() {
  redirect('/dashboard');
}
