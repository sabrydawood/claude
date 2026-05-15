/**
 * Auth.Client.ts
 * Client-side Better Auth instance.
 */
'use client';
import { createAuthClient } from 'better-auth/react';

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  updateUser,
  changePassword,
} = createAuthClient();
