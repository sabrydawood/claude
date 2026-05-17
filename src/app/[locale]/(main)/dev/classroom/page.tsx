import { notFound } from 'next/navigation';
import ClassroomClient from './classroom-client';

export default async function ClassroomPage({ params }: { params: Promise<{ locale: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { locale } = await params;
  return <ClassroomClient locale={locale} />;
}
