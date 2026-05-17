'use client';

import dynamic from 'next/dynamic';

const ClassroomClient = dynamic(() => import('./classroom-client'), { ssr: false });

export default function ClassroomLoader({ locale }: { locale: string }) {
  return <ClassroomClient locale={locale} />;
}
