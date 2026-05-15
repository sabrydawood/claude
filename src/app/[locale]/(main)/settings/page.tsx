import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/server-session';
import { getTranslations } from 'next-intl/server';
import SettingsClient from './settings-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'settings' });
  return { title: t('title') };
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  return (
    <SettingsClient
      initialName={session.user.name ?? ''}
      userEmail={session.user.email}
    />
  );
}
