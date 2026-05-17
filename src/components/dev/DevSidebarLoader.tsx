'use client';

import dynamic from 'next/dynamic';

const DevSidebar = dynamic(() => import('./DevSidebar'), { ssr: false });

export default function DevSidebarLoader() {
  return <DevSidebar />;
}
