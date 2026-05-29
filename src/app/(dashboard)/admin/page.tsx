import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminContent } from '@/components/admin/AdminContent';

export const metadata: Metadata = { title: 'Panel Admin' };

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'admin') {
    redirect('/dashboard');
  }

  return <AdminContent />;
}
