import { notFound } from 'next/navigation';
import AdventureLoader from './adventure-loader';

export default async function AdventurePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { locale } = await params;
  return <AdventureLoader locale={locale} />;
}
