import { notFound } from 'next/navigation';
import AdventureClient from './adventure-client';

export default async function AdventurePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { locale } = await params;
  return <AdventureClient locale={locale} />;
}
