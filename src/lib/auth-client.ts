'use client';

import { createAuthClient } from 'better-auth/react';
import { APP_URL } from './utils';

export const authClient = createAuthClient({
  baseURL: APP_URL,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  updateUser,
  changePassword,
  resetPassword,
} = authClient;
