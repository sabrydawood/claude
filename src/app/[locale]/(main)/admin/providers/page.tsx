import { notFound } from 'next/navigation';
import ProvidersClient from './providers-client';

export default async function AdminProvidersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Basic admin check — in production use better-auth session
  if (process.env.NODE_ENV === 'production') {
    // TODO: Add proper admin role check with better-auth
  }
  return <ProvidersClient locale={locale} />;
}
