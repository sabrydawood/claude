import { notFound } from 'next/navigation';
import DevPreview from './dev-preview';

export default function DevPage() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <DevPreview />;
}
