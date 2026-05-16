import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/server-session';
import ParentDashboardClient from './parent-dashboard-client';

export default async function ParentDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  return <ParentDashboardClient locale={locale} userId={session.user.id} />;
}
