import { notFound } from 'next/navigation';
import ChildJourneyClient from './child-journey-client';

export default async function ChildJourneyPage({ params }: { params: Promise<{ locale: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { locale } = await params;
  return <ChildJourneyClient locale={locale} />;
}
