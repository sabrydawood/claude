'use client';
import { useEffect, useState } from 'react';

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline };
}

export async function RegisterBackgroundSync(tag: 'sync-progress' | 'sync-signals'): Promise<void> {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await (reg as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register(tag);
  } catch { /* not supported */ }
}

export async function PreCacheLesson(url: string): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  reg.active?.postMessage({ type: 'PRECACHE_LESSON', url });
}
