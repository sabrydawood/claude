import { auth } from '@/Features/Auth/Auth.Config';
import { headers } from 'next/headers';

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}
