import { notFound } from 'next/navigation';
import ClassroomLoader from './classroom-loader';

export default async function ClassroomPage({ params }: { params: Promise<{ locale: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { locale } = await params;
  return <ClassroomLoader locale={locale} />;
}
