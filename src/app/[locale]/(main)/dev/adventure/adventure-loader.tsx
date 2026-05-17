'use client';

import dynamic from 'next/dynamic';

const AdventureClient = dynamic(() => import('./adventure-client'), { ssr: false });

export default function AdventureLoader({ locale }: { locale: string }) {
  return <AdventureClient locale={locale} />;
}
